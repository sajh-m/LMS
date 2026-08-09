import { BookService } from "../services/bookService.js";

export async function adminGetBooks(req, res) {
  const { title, author, genre, location } = req.query;
  res.json(await BookService.adminGetAllBooks({ title, author, genre, location }));
}

export async function adminDeleteBook(req, res) {
  const result = await BookService.adminDeleteBook(req.params.id);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  res.json({ message: "Listing removed" });
}

export async function adminCancelReservation(req, res) {
  const result = await BookService.adminCancelReservation(req.params.id);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "not_reserved") {
    return res.status(409).json({ message: "This book is not currently reserved" });
  }
  res.json({ message: "Reservation cancelled" });
}
