import { Op, literal } from "sequelize";
import { Book } from "../models/bookModel.js";

export const BookService = {
  getAllBooks: () => Book.findAll(),

  getBookById: (id) => Book.findByPk(id),

  createBook: (data) =>
    Book.create({
      title: data.title,
      author: data.author,
      genre: data.genre,
      description: data.description,
      image: data.image,
      stock: data.stock !== undefined ? data.stock : 1,
    }),

  updateBook: async (id, data) => {
    const book = await Book.findByPk(id);
    if (!book) return null;
    if (data.title !== undefined) book.title = data.title;
    if (data.author !== undefined) book.author = data.author;
    if (data.genre !== undefined) book.genre = data.genre;
    if (data.description !== undefined) book.description = data.description;
    if (data.image !== undefined) book.image = data.image;
    if (data.stock !== undefined) book.stock = data.stock;
    await book.save();
    return book;
  },

  deleteBook: async (id) => {
    const book = await Book.findByPk(id);
    if (!book) return null;
    await book.destroy();
    return book;
  },

  // Atomically decrements stock by 1, only if stock is currently > 0.
  // Using a conditional UPDATE (not read-then-write) avoids a race where
  // two simultaneous "take" requests both succeed on the last copy.
  takeBook: async (id) => {
    const book = await Book.findByPk(id);
    if (!book) return { status: "not_found" };

    const [affectedRows] = await Book.update(
      { stock: literal("stock - 1") },
      { where: { id, stock: { [Op.gt]: 0 } } },
    );

    if (affectedRows === 0) {
      // Book exists but stock was already 0 by the time we tried to decrement
      return { status: "out_of_stock", book };
    }

    const updated = await Book.findByPk(id);
    return { status: "ok", book: updated };
  },
};
