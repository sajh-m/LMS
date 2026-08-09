import { Donation, User } from "../models/index.js";

// Fields safe to show on the public browsing list - location is a general
// area (e.g. "Kathmandu"), not an exact address, so it's fine to show
// upfront; the donor's name/contact stay hidden until someone takes it.
const PUBLIC_ATTRIBUTES = [
  "id",
  "title",
  "author",
  "genre",
  "description",
  "image",
  "location",
  "createdAt",
];

export const BookService = {
  // Only ever shows AVAILABLE copies - once reserved, a listing is
  // effectively claimed and disappears from public browsing.
  getAllBooks: () =>
    Donation.findAll({
      where: { status: "available" },
      attributes: PUBLIC_ATTRIBUTES,
      order: [["id", "DESC"]],
    }),

  getBookById: (id) => Donation.findByPk(id, { attributes: PUBLIC_ATTRIBUTES }),

  // Every donation is a brand new, fully independent entry - no matching
  // against existing books, even if title+author are identical.
  donateBook: (data, donorId) =>
    Donation.create({
      title: data.title,
      author: data.author,
      genre: data.genre || null,
      description: data.description || null,
      location: data.location,
      image: data.image,
      donorId,
      status: "available",
    }),

  updateBook: async (id, data, requesterId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.donorId !== requesterId) return { status: "forbidden" };

    if (data.title !== undefined) entry.title = data.title;
    if (data.author !== undefined) entry.author = data.author;
    if (data.genre !== undefined) entry.genre = data.genre;
    if (data.description !== undefined) entry.description = data.description;
    if (data.location !== undefined) entry.location = data.location;
    if (data.image !== undefined) entry.image = data.image;
    await entry.save();

    return { status: "ok", entry };
  },

  // This IS the "mark as given" action - deleting the row is the whole
  // point, whether the donor is withdrawing an unclaimed listing or
  // confirming a reserved one was physically handed over.
  deleteBook: async (id, requesterId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.donorId !== requesterId) return { status: "forbidden" };

    await entry.destroy();
    return { status: "ok" };
  },

  // Atomic: only succeeds if the row is STILL available at the moment of
  // the update, so two people can't both claim the same single copy.
  takeBook: async (id, borrowerId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };

    const [affectedRows] = await Donation.update(
      { status: "reserved", borrowerId },
      { where: { id, status: "available" } },
    );

    if (affectedRows === 0) return { status: "out_of_stock" };

    const updated = await Donation.findByPk(id, {
      include: [{ model: User, as: "donor", attributes: ["id", "name", "email", "phone"] }],
    });
    return { status: "ok", entry: updated };
  },

  cancelReservation: async (id, borrowerId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.status !== "reserved" || entry.borrowerId !== borrowerId) {
      return { status: "forbidden" };
    }

    entry.status = "available";
    entry.borrowerId = null;
    await entry.save();
    return { status: "ok" };
  },

  // The donor's own dashboard - includes the borrower's contact details
  // once someone has reserved it, so the donor can reach out too.
  getMyDonations: (donorId) =>
    Donation.findAll({
      where: { donorId },
      include: [{ model: User, as: "borrower", attributes: ["id", "name", "email", "phone"] }],
      order: [["id", "DESC"]],
    }),

  getMyReservation: (borrowerId) =>
    Donation.findAll({
      where: { borrowerId, status: "reserved" },
      include: [{ model: User, as: "donor", attributes: ["id", "name", "email", "phone"] }],
      order: [["id", "DESC"]],
    }),
};
