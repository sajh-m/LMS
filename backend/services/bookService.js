import { Op, fn, col, where as sqlWhere } from "sequelize";
import { Donation, User } from "../models/index.js";
import { NotificationService } from "./notificationService.js";
import { deleteUploadedFile } from "../utils/deleteUploadedFile.js";
import { AuditService } from "./auditService.js";

const PUBLIC_ATTRIBUTES = [
  "id", "title", "author", "genre", "description",
  "image", "location", "donorId", "borrowerId", "status", "createdAt",
];

function likeCondition(field, value) {
  return sqlWhere(fn("lower", col(field)), { [Op.like]: `%${value.trim().toLowerCase()}%` });
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

// A pending borrower's contact stays hidden until the donor accepts -
// used everywhere a borrower association is returned.
function shapeBorrower(book) {
  if (book.borrower && book.status === "pending") {
    book.borrower = { id: book.borrower.id, name: book.borrower.name };
  }
  return book;
}
function shapeDonorForBorrowerView(book) {
  if (book.donor && book.status === "pending") {
    book.donor = { id: book.donor.id, name: book.donor.name };
  }
  return book;
}

export const BookService = {
  // Only "available" books are ever publicly browsable - a book with an
  // active request/reservation disappears from this list entirely.
  getAllBooks: (filters = {}) => {
    const where = { status: "available" };
    const conditions = buildTextConditions(filters);
    if (conditions.length > 0) where[Op.and] = conditions;

    const donorInclude = { model: User, as: "donor", attributes: ["id", "name", "email", "phone"] };
    if (filters.donorName) {
      donorInclude.required = true;
      donorInclude.where = likeAssocCondition("donor", "name", filters.donorName);
    }

    return Donation.findAll({
      where,
      include: [donorInclude],
      attributes: PUBLIC_ATTRIBUTES,
      order: [["id", "DESC"]],
    });
  },

  getBookById: async (id) => {
    const book = await Donation.findByPk(id, {
      attributes: PUBLIC_ATTRIBUTES,
      include: [
        { model: User, as: "donor", attributes: ["id", "name", "email", "phone"] },
        { model: User, as: "borrower", attributes: ["id", "name", "email", "phone"] },
      ],
    });
    if (!book) return null;
    return shapeBorrower(book.toJSON());
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

  // Donor can only remove an UNCLAIMED listing - once someone has an
  // active request/reservation on it, this is blocked (decline/withdraw/
  // cancel has to resolve that first).
  deleteBook: async (id, requesterId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.donorId !== requesterId) return { status: "forbidden" };
    if (entry.status !== "available") return { status: "has_active_request" };

    const donorUser = await User.findByPk(entry.donorId, { attributes: ["id", "name", "email"] });
    await AuditService.log("donation_removed_by_donor", { donation: entry, donorUser });

    const { image } = entry;
    await entry.destroy();
    await deleteUploadedFile(image);
    return { status: "ok" };
  },

  // Borrower sends the ONE request this book can have at a time. Atomic
  // update guards against two people requesting at the exact same moment.
  sendRequest: async (id, borrowerId) => {
    const borrower = await User.findByPk(borrowerId);
    if (borrower?.role === "admin") return { status: "forbidden_admin" };

    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.donorId === borrowerId) return { status: "own_book" };

    const [affectedRows] = await Donation.update(
      { status: "pending", borrowerId },
      { where: { id, status: "available" } },
    );
    if (affectedRows === 0) return { status: "not_available" };

    const donorUser = await User.findByPk(entry.donorId, { attributes: ["id", "name", "email"] });
    await AuditService.log("request_sent", { donation: entry, donorUser, borrowerUser: borrower });

    await NotificationService.create(
      entry.donorId,
      `${borrower.name} has requested to borrow "${entry.title}". Check My Donations to respond.`,
    );

    return { status: "ok" };
  },

  withdrawRequest: async (id, borrowerId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.status !== "pending" || entry.borrowerId !== borrowerId) return { status: "forbidden" };

    const donorUser = await User.findByPk(entry.donorId, { attributes: ["id", "name", "email"] });
    const borrowerUser = await User.findByPk(borrowerId, { attributes: ["id", "name", "email"] });
    await AuditService.log("request_withdrawn", { donation: entry, donorUser, borrowerUser });

    entry.status = "available";
    entry.borrowerId = null;
    await entry.save();

    await NotificationService.create(
      entry.donorId,
      `${borrowerUser.name} withdrew their request for "${entry.title}".`,
    );

    return { status: "ok" };
  },

  acceptRequest: async (id, donorId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.donorId !== donorId) return { status: "forbidden" };
    if (entry.status !== "pending") return { status: "not_pending" };

    entry.status = "reserved";
    await entry.save();

    const donorUser = await User.findByPk(donorId, { attributes: ["id", "name", "email", "phone"] });
    const borrowerUser = await User.findByPk(entry.borrowerId, { attributes: ["id", "name", "email", "phone"] });

    await AuditService.log("request_accepted", { donation: entry, donorUser, borrowerUser });

    await NotificationService.create(
      entry.borrowerId,
      `${donorUser.name} accepted your request for "${entry.title}". Check My Reservations for their contact details.`,
    );

    return { status: "ok", donor: donorUser, borrower: borrowerUser };
  },

  declineRequest: async (id, donorId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.donorId !== donorId) return { status: "forbidden" };
    if (entry.status !== "pending") return { status: "not_pending" };

    const donorUser = await User.findByPk(donorId, { attributes: ["id", "name", "email"] });
    const borrowerUser = await User.findByPk(entry.borrowerId, { attributes: ["id", "name", "email"] });
    await AuditService.log("request_declined", { donation: entry, donorUser, borrowerUser });

    const borrowerId = entry.borrowerId;
    entry.status = "available";
    entry.borrowerId = null;
    await entry.save();

    await NotificationService.create(
      borrowerId,
      `Your request for "${entry.title}" was declined. The book is available again.`,
    );

    return { status: "ok" };
  },

  // Once RESERVED, the donor cannot back out unilaterally - only the
  // borrower (this function) or an admin (adminCancelReservation) can
  // end it. This function is only ever reachable via the borrower's own
  // route, so ownership doubles as the enforcement.
  cancelReservation: async (id, borrowerId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.status !== "reserved" || entry.borrowerId !== borrowerId) return { status: "forbidden" };

    const donorUser = await User.findByPk(entry.donorId, { attributes: ["id", "name", "email"] });
    const borrowerUser = await User.findByPk(borrowerId, { attributes: ["id", "name", "email"] });
    await AuditService.log("reservation_cancelled_by_borrower", { donation: entry, donorUser, borrowerUser });

    entry.status = "available";
    entry.borrowerId = null;
    await entry.save();

    await NotificationService.create(
      entry.donorId,
      `${borrowerUser.name} cancelled their reservation for "${entry.title}". It's available again.`,
    );

    return { status: "ok" };
  },

  // The BORROWER confirms the book was physically handed over - this is
  // what actually completes the transaction and removes the listing.
  receiveBook: async (id, borrowerId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.status !== "reserved" || entry.borrowerId !== borrowerId) return { status: "forbidden" };

    const donorUser = await User.findByPk(entry.donorId, { attributes: ["id", "name", "email"] });
    const borrowerUser = await User.findByPk(borrowerId, { attributes: ["id", "name", "email"] });
    await AuditService.log("donation_received", { donation: entry, donorUser, borrowerUser });

    await NotificationService.create(
      entry.donorId,
      `${borrowerUser.name} confirmed they received "${entry.title}". Thanks for donating!`,
    );

    const { image } = entry;
    await entry.destroy();
    await deleteUploadedFile(image);
    return { status: "ok" };
  },

  // Donor's own dashboard - sees every status of their own listings.
  // Borrower contact stays hidden until they've actually accepted.
  getMyDonations: async (donorId, filters = {}) => {
    const where = { donorId };
    const conditions = buildTextConditions(filters);
    if (conditions.length > 0) where[Op.and] = conditions;

    const donations = await Donation.findAll({
      where,
      include: [{ model: User, as: "borrower", attributes: ["id", "name", "email", "phone"] }],
      order: [["id", "DESC"]],
    });

    return donations.map((d) => shapeBorrower(d.toJSON()));
  },

  // Borrower's own dashboard. Donor contact stays hidden until accepted.
  getMyReservation: async (borrowerId, filters = {}) => {
    const where = { borrowerId, status: ["pending", "reserved"] };
    const conditions = buildTextConditions(filters);

    const include = [
      { model: User, as: "donor", attributes: ["id", "name", "email", "phone"] },
    ];
    if (filters.donorName) {
      include[0].required = true;
      include[0].where = likeAssocCondition("donor", "name", filters.donorName);
    }

    const donations = await Donation.findAll({
      where: conditions.length > 0 ? { ...where, [Op.and]: conditions } : where,
      include,
      order: [["id", "DESC"]],
    });

    return donations.map((d) => shapeDonorForBorrowerView(d.toJSON()));
  },

  // ---- Admin only ----

  adminGetAllBooks: async (filters = {}) => {
    const where = {};
    const conditions = buildTextConditions(filters);
    if (conditions.length > 0) where[Op.and] = conditions;

    const donations = await Donation.findAll({
      where,
      include: [
        { model: User, as: "donor", attributes: ["id", "name", "email", "phone"] },
        { model: User, as: "borrower", attributes: ["id", "name", "email", "phone"] },
      ],
      order: [["id", "DESC"]],
    });

    // admin always sees full donor contact; borrower contact still
    // stays hidden until accepted, same rule as everywhere else
    return donations.map((d) => shapeBorrower(d.toJSON()));
  },

  adminDeleteBook: async (id, adminUser) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };

    const { title, donorId, borrowerId, status, image } = entry;
    const donorUser = await User.findByPk(donorId, { attributes: ["id", "name", "email"] });

    await AuditService.log("donation_removed_by_admin", {
      donation: entry, donorUser,
      notes: `Admin: ${adminUser.name} (${adminUser.email})`,
    });

    if (borrowerId && (status === "pending" || status === "reserved")) {
      await NotificationService.create(borrowerId, `An admin removed "${title}" from the system.`);
    }
    await NotificationService.create(donorId, `An admin removed your donated book "${title}".`);

    await entry.destroy();
    await deleteUploadedFile(image);
    return { status: "ok" };
  },

  adminCancelReservation: async (id, adminUser) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.status !== "reserved" && entry.status !== "pending") {
      return { status: "not_active" };
    }

    const wasReserved = entry.status === "reserved";
    const donorUser = await User.findByPk(entry.donorId, { attributes: ["id", "name", "email"] });
    const borrowerUser = entry.borrowerId
      ? await User.findByPk(entry.borrowerId, { attributes: ["id", "name", "email"] })
      : null;

    await AuditService.log(
      wasReserved ? "reservation_cancelled_by_admin" : "request_declined",
      {
        donation: entry, donorUser, borrowerUser,
        notes: `Admin: ${adminUser.name} (${adminUser.email})`,
      },
    );

    const borrowerId = entry.borrowerId;
    entry.status = "available";
    entry.borrowerId = null;
    await entry.save();

    await NotificationService.create(
      entry.donorId,
      wasReserved
        ? `An admin cancelled the reservation on your book "${entry.title}". It's available again.`
        : `An admin declined the pending request on your book "${entry.title}". It's available again.`,
    );
    if (borrowerId) {
      await NotificationService.create(
        borrowerId,
        wasReserved
          ? `An admin cancelled your reservation for "${entry.title}".`
          : `An admin declined your request for "${entry.title}".`,
      );
    }

    return { status: "ok" };
  },
};
