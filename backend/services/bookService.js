import { Book, Donation, User } from "../models/index.js";

export const BookService = {
  // Every book listed alongside how many *available* (not reserved) copies exist.
  getAllBooks: async () => {
    const books = await Book.findAll({
      include: [{ model: Donation, as: "donations", attributes: ["id", "status"] }],
      order: [["id", "ASC"]],
    });

    return books.map((book) => {
      const json = book.toJSON();
      const availableCount = json.donations.filter((d) => d.status === "available").length;
      delete json.donations; // never expose raw donation/donor data in the list
      return { ...json, availableCount };
    });
  },

  getBookById: async (id) => {
    const book = await Book.findByPk(id, {
      include: [{ model: Donation, as: "donations", attributes: ["id", "status"] }],
    });
    if (!book) return null;

    const json = book.toJSON();
    const availableCount = json.donations.filter((d) => d.status === "available").length;
    delete json.donations;
    return { ...json, availableCount };
  },

  // Donating: find-or-create the shared Book catalog entry (by title+author),
  // then create a new Donation row representing this specific physical copy.
  donateBook: async (data, donorId) => {
    const [book] = await Book.findOrCreate({
      where: { title: data.title, author: data.author },
      defaults: {
        genre: data.genre,
        description: data.description,
        image: data.image,
      },
    });

    const donation = await Donation.create({
      bookId: book.id,
      donorId,
      status: "available",
    });

    return { book, donation };
  },

  // Reserves one random available copy of this book, revealing that
  // specific donor's contact details to the borrower. Retries a few times
  // to handle the rare case where two people take the last copy at once.
  takeBook: async (bookId, borrowerId) => {
    const book = await Book.findByPk(bookId);
    if (!book) return { status: "not_found" };

    for (let attempt = 0; attempt < 3; attempt++) {
      const available = await Donation.findAll({
        where: { bookId, status: "available" },
        attributes: ["id"],
      });

      if (available.length === 0) {
        return { status: "out_of_stock" };
      }

      const pick = available[Math.floor(Math.random() * available.length)];

      const [affectedRows] = await Donation.update(
        { status: "reserved", borrowerId },
        { where: { id: pick.id, status: "available" } },
      );

      if (affectedRows > 0) {
        const donation = await Donation.findByPk(pick.id, {
          include: [{ model: User, as: "donor", attributes: ["id", "name", "email", "phone"] }],
        });
        return { status: "ok", donation };
      }
      // someone else grabbed this exact row first - loop and try again
    }

    return { status: "out_of_stock" };
  },

  cancelReservation: async (donationId, borrowerId) => {
    const donation = await Donation.findByPk(donationId);
    if (!donation) return { status: "not_found" };
    if (donation.status !== "reserved" || donation.borrowerId !== borrowerId) {
      return { status: "forbidden" };
    }

    donation.status = "available";
    donation.borrowerId = null;
    await donation.save();
    return { status: "ok", donation };
  },

  // Donor confirms the book was physically handed over - the copy is
  // removed entirely (the Book catalog entry itself stays, even at 0 copies).
  completeDonation: async (donationId, donorId) => {
    const donation = await Donation.findByPk(donationId);
    if (!donation) return { status: "not_found" };
    if (donation.donorId !== donorId) return { status: "forbidden" };

    await donation.destroy();
    return { status: "ok" };
  },

  getMyDonations: (donorId) =>
    Donation.findAll({
      where: { donorId },
      include: [{ model: Book, as: "book" }],
      order: [["id", "DESC"]],
    }),

  getMyReservation: (borrowerId) =>
    Donation.findAll({
      where: { borrowerId, status: "reserved" },
      include: [
        { model: Book, as: "book" },
        { model: User, as: "donor", attributes: ["id", "name", "email", "phone"] },
      ],
      order: [["id", "DESC"]],
    }),
};
