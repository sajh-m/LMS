import { BookService } from "../services/bookService.js";

export async function getBooks(req, res) {
  res.json(await BookService.getAllBooks());
}

export async function getBookById(req, res) {
  const book = await BookService.getBookById(req.params.id);
  if (!book) return res.status(404).json({ message: "not found" });
  res.json(book);
}

export async function createBook(req, res) {
  const book = await BookService.createBook(req.body);
  res.status(201).json(book);
}

export async function updateBook(req, res) {
  const updated = await BookService.updateBook(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "not found" });
  res.json(updated);
}

export async function deleteBook(req, res) {
  const deleted = await BookService.deleteBook(req.params.id);
  if (!deleted) return res.status(404).json({ message: "not found" });
  res.status(200).json({ message: "Book deleted", book: deleted });
}
