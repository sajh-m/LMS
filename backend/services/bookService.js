import { Op, fn, col, where as sqlWhere } from "sequelize";
import { Donation, Request, User } from "../models/index.js";
import { NotificationService } from "./notificationService.js";
import { deleteUploadedFile } from "../utils/deleteUploadedFile.js";
import { AuditService } from "./auditService.js";

// Only these fields are shown publicly - no contact info
const PUBLIC_ATTRIBUTES = [
  "id", "title", "author", "genre", "description",
  "image", "location", "donorId", "status", "createdAt",
];

function likeCondition(field, value) {
  return sqlWhere(fn("lower", col(field)), {
    [Op.like]: `%${value.trim().toLowerCase()}%`,
  });
}
function likeAssocCondition(alias, field, value) {
  return sqlWhere(fn("lower", col(`${alias}.${field}`)), {
    [Op.like]: `%${value.trim().toLowerCase()}%`,
  });
}
function buildTextConditions(filters) {
  const conditions = [];
  if (filters.title) conditions.push(likeCondition("title", filters.title));
  if (filters.author) conditions.push(likeCondition("author", filters.author));
  if (filters.location) conditions.push(likeCondition("location", filters.location));
  if (filters.genre) conditions.push(likeCondition("genre", filters.genre));
  return conditions;
}

export const BookService = {
  // Public list - both available AND reserved shown (reserved still
  // worth seeing so people know the title exists in the community)
  getAllBooks: async (filters = {}) => {
    const where = { status: "available" }; // reserved books are spoken for - hide from public browsing
    const conditions = buildTextConditions(filters);
    if (conditions.length > 0) where[Op.and] = conditions;

    const donorInclude = { model: User, as: "donor", attributes: ["id", "name"] };
    if (filters.donorName) {
      donorInclude.required = true;
      donorInclude.where = likeAssocCondition("donor", "name", filters.donorName);
    }

    const books = await Donation.findAll({
      where,
      include: [
        donorInclude,
        { model: Request, as: "requests", where: { status: "pending" }, required: false, attributes: ["id"] },
      ],
      attributes: PUBLIC_ATTRIBUTES,
      order: [["id", "DESC"]],
    });

    // attach a raw count here; the controller decides who's allowed to see it
    return books.map((b) => {
      const json = b.toJSON();
      json.pendingRequestCount = json.requests ? json.requests.length : 0;
      delete json.requests;
      return json;
    });
  },

  getBookById: async (id) => {
    const book = await Donation.findByPk(id, {
      attributes: PUBLIC_ATTRIBUTES,
      include: [
        { model: User, as: "donor", attributes: ["id", "name"] },
        { model: Request, as: "requests", where: { status: "pending" }, required: false, attributes: ["id"] },
      ],
    });
    if (!book) return null;

    const json = book.toJSON();
    json.pendingRequestCount = json.requests ? json.requests.length : 0;
    delete json.requests;
    return json;
  },

  donateBook: async (data, donorId) => {
    const donor = await User.findByPk(donorId);
    if (donor?.role === "admin") return { status: "forbidden_admin" };

    const entry = await Donation.create({
      title: data.title, author: data.author,
      genre: data.genre || null, description: data.description || null,
      location: data.location, image: data.image,
      donorId, status: "available",
    });

    await AuditService.log("donation_created", { donation: entry, donorUser: donor });
    return { status: "ok", entry };
  },

  updateBook: async (id, data, requesterId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.donorId !== requesterId) return { status: "forbidden" };

    const oldImage = entry.image;
    if (data.title !== undefined) entry.title = data.title;
    if (data.author !== undefined) entry.author = data.author;
    if (data.genre !== undefined) entry.genre = data.genre;
    if (data.description !== undefined) entry.description = data.description;
    if (data.location !== undefined) entry.location = data.location;
    if (data.image !== undefined) entry.image = data.image;
    await entry.save();

    if (data.image !== undefined && data.image !== oldImage) {
      await deleteUploadedFile(oldImage);
    }
    return { status: "ok", entry };
  },

  deleteBook: async (id, requesterId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.donorId !== requesterId) return { status: "forbidden" };

    const donorUser = await User.findByPk(entry.donorId, { attributes: ["id", "name", "email"] });

    const activeRequests = await Request.findAll({
      where: { donationId: id, status: ["pending", "accepted"] },
      include: [{ model: User, as: "borrower", attributes: ["id", "name", "email"] }],
    });

    await AuditService.log(
      entry.status === "reserved" ? "donation_completed" : "donation_removed_by_donor",
      { donation: entry, donorUser },
    );

    for (const req of activeRequests) {
      await NotificationService.create(req.borrowerId, `The donor removed "${entry.title}" from the system.`);
    }

    const { image } = entry;
    await entry.destroy(); // cascades to Request rows
    await deleteUploadedFile(image);
    return { status: "ok" };
  },

  // Borrower sends a request - book stays available/public, multiple
  // simultaneous requests from different people are allowed.
  sendRequest: async (donationId, borrowerId) => {
    const borrower = await User.findByPk(borrowerId);
    if (borrower?.role === "admin") return { status: "forbidden_admin" };

    const entry = await Donation.findByPk(donationId);
    if (!entry) return { status: "not_found" };
    if (entry.status === "reserved") return { status: "already_reserved" };
    if (entry.donorId === borrowerId) return { status: "own_book" };

    const existing = await Request.findOne({
      where: { donationId, borrowerId, status: ["pending", "accepted"] },
    });
    if (existing) return { status: "already_requested" };

    const req = await Request.create({ donationId, borrowerId, status: "pending" });

    const donorUser = await User.findByPk(entry.donorId, { attributes: ["id", "name", "email"] });
    await AuditService.log("request_sent", { donation: entry, donorUser, borrowerUser: borrower });

    await NotificationService.create(
      entry.donorId,
      `${borrower.name} has requested to borrow "${entry.title}". Check My Donations to respond.`,
    );

    return { status: "ok", requestId: req.id };
  },

  withdrawRequest: async (requestId, borrowerId) => {
    const req = await Request.findByPk(requestId, { include: [{ model: Donation, as: "donation" }] });
    if (!req) return { status: "not_found" };
    if (req.borrowerId !== borrowerId) return { status: "forbidden" };
    if (req.status !== "pending") return { status: "not_pending" };

    const donorUser = await User.findByPk(req.donation.donorId, { attributes: ["id", "name", "email"] });
    const borrowerUser = await User.findByPk(borrowerId, { attributes: ["id", "name", "email"] });

    await AuditService.log("request_withdrawn", { donation: req.donation, donorUser, borrowerUser });

    req.status = "withdrawn";
    await req.save();

    await NotificationService.create(
      req.donation.donorId,
      `${borrowerUser.name} withdrew their request for "${req.donation.title}".`,
    );

    return { status: "ok" };
  },

  // Donor accepts ONE request -> book reserved, ALL other pending
  // requests on the same book auto-declined with notification.
  acceptRequest: async (requestId, donorId) => {
    const req = await Request.findByPk(requestId, {
      include: [
        { model: Donation, as: "donation" },
        { model: User, as: "borrower", attributes: ["id", "name", "email", "phone"] },
      ],
    });
    if (!req) return { status: "not_found" };
    if (req.donation.donorId !== donorId) return { status: "forbidden" };
    if (req.status !== "pending") return { status: "not_pending" };

    const donorUser = await User.findByPk(donorId, { attributes: ["id", "name", "email", "phone"] });

    req.status = "accepted";
    await req.save();

    req.donation.status = "reserved";
    await req.donation.save();

    await AuditService.log("request_accepted", { donation: req.donation, donorUser, borrowerUser: req.borrower });

    const otherRequests = await Request.findAll({
      where: { donationId: req.donationId, status: "pending", id: { [Op.ne]: requestId } },
    });
    for (const other of otherRequests) {
      other.status = "declined";
      await other.save();
      await NotificationService.create(
        other.borrowerId,
        `Your request for "${req.donation.title}" was declined — another borrower was selected.`,
      );
    }

    await NotificationService.create(
      req.borrowerId,
      `${donorUser.name} accepted your request for "${req.donation.title}". Check My Reservations for their contact details.`,
    );

    return { status: "ok", donor: donorUser, borrower: req.borrower };
  },

  declineRequest: async (requestId, donorId) => {
    const req = await Request.findByPk(requestId, { include: [{ model: Donation, as: "donation" }] });
    if (!req) return { status: "not_found" };
    if (req.donation.donorId !== donorId) return { status: "forbidden" };
    if (req.status !== "pending") return { status: "not_pending" };

    const donorUser = await User.findByPk(donorId, { attributes: ["id", "name", "email"] });
    const borrowerUser = await User.findByPk(req.borrowerId, { attributes: ["id", "name", "email"] });

    await AuditService.log("request_declined", { donation: req.donation, donorUser, borrowerUser });

    req.status = "declined";
    await req.save();

    await NotificationService.create(
      req.borrowerId,
      `Your request for "${req.donation.title}" was declined. The book is still available.`,
    );

    return { status: "ok" };
  },

  cancelReservation: async (requestId, borrowerId) => {
    const req = await Request.findByPk(requestId, { include: [{ model: Donation, as: "donation" }] });
    if (!req) return { status: "not_found" };
    if (req.borrowerId !== borrowerId) return { status: "forbidden" };
    if (req.status !== "accepted") return { status: "not_accepted" };

    const donorUser = await User.findByPk(req.donation.donorId, { attributes: ["id", "name", "email"] });
    const borrowerUser = await User.findByPk(borrowerId, { attributes: ["id", "name", "email"] });

    await AuditService.log("reservation_cancelled_by_borrower", { donation: req.donation, donorUser, borrowerUser });

    req.status = "withdrawn";
    await req.save();

    req.donation.status = "available";
    await req.donation.save();

    await NotificationService.create(
      req.donation.donorId,
      `${borrowerUser.name} cancelled their reservation for "${req.donation.title}". It's available again.`,
    );

    return { status: "ok" };
  },

  // My Donations - shows pending/accepted requests per listing, borrower NAME only
  getMyDonations: (donorId, filters = {}) => {
    const where = { donorId };
    const conditions = buildTextConditions(filters);
    if (conditions.length > 0) where[Op.and] = conditions;

    return Donation.findAll({
      where,
      include: [
        {
          model: Request,
          as: "requests",
          where: { status: ["pending", "accepted"] },
          required: false,
          include: [{ model: User, as: "borrower", attributes: ["id", "name"] }],
        },
      ],
      order: [["id", "DESC"]],
    });
  },

  // My Reservations - borrower's own pending/accepted requests
  getMyReservation: (borrowerId, filters = {}) => {
    const where = { borrowerId, status: ["pending", "accepted"] };
    const conditions = buildTextConditions(filters);

    return Request.findAll({
      where,
      include: [
        {
          model: Donation,
          as: "donation",
          required: true,
          where: conditions.length > 0 ? { [Op.and]: conditions } : undefined,
          include: [{ model: User, as: "donor", attributes: ["id", "name", "email", "phone"] }],
        },
      ],
      order: [["id", "DESC"]],
    });
  },

  // ---- Admin only ----
  adminGetAllBooks: (filters = {}) => {
    const where = {};
    const conditions = buildTextConditions(filters);
    if (conditions.length > 0) where[Op.and] = conditions;

    return Donation.findAll({
      where,
      include: [
        { model: User, as: "donor", attributes: ["id", "name", "email", "phone"] },
        {
          model: Request, as: "requests",
          where: { status: ["pending", "accepted"] },
          required: false,
          include: [{ model: User, as: "borrower", attributes: ["id", "name", "email", "phone"] }],
        },
      ],
      order: [["id", "DESC"]],
    });
  },

  adminDeleteBook: async (id, adminUser) => {
    const entry = await Donation.findByPk(id, {
      include: [{
        model: Request, as: "requests",
        where: { status: ["pending", "accepted"] },
        required: false,
      }],
    });
    if (!entry) return { status: "not_found" };

    const donorUser = await User.findByPk(entry.donorId, { attributes: ["id", "name", "email"] });

    await AuditService.log("donation_removed_by_admin", {
      donation: entry, donorUser,
      notes: `Admin: ${adminUser.name} (${adminUser.email})`,
    });

    for (const req of entry.requests || []) {
      await NotificationService.create(req.borrowerId, `An admin removed "${entry.title}" from the system.`);
    }
    await NotificationService.create(entry.donorId, `An admin removed your donated book "${entry.title}".`);

    const { image } = entry;
    await entry.destroy();
    await deleteUploadedFile(image);
    return { status: "ok" };
  },

  adminCancelReservation: async (id, adminUser) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.status !== "reserved") return { status: "not_reserved" };

    const acceptedReq = await Request.findOne({ where: { donationId: id, status: "accepted" } });

    const donorUser = await User.findByPk(entry.donorId, { attributes: ["id", "name", "email"] });
    const borrowerUser = acceptedReq
      ? await User.findByPk(acceptedReq.borrowerId, { attributes: ["id", "name", "email"] })
      : null;

    await AuditService.log("reservation_cancelled_by_admin", {
      donation: entry, donorUser, borrowerUser,
      notes: `Admin: ${adminUser.name} (${adminUser.email})`,
    });

    if (acceptedReq) {
      acceptedReq.status = "declined";
      await acceptedReq.save();
      await NotificationService.create(acceptedReq.borrowerId, `An admin cancelled your reservation for "${entry.title}".`);
    }

    entry.status = "available";
    await entry.save();

    await NotificationService.create(
      entry.donorId,
      `An admin cancelled the reservation on your book "${entry.title}". It's available again.`,
    );

    return { status: "ok" };
  },
};
