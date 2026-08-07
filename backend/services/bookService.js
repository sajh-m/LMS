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
    }),

  updateBook: async (id, data) => {
    const book = await Book.findByPk(id);
    if (!book) return null;
    if (data.title !== undefined) book.title = data.title;
    if (data.author !== undefined) book.author = data.author;
    if (data.genre !== undefined) book.genre = data.genre;
    if (data.description !== undefined) book.description = data.description;
    if (data.image !== undefined) book.image = data.image;
    await book.save();
    return book;
  },

  deleteBook: async (id) => {
    const book = await Book.findByPk(id);
    if (!book) return null;
    await book.destroy();
    return book;
  },
};
