import { BookService } from "../services/bookService.js";
import { AuditService } from "../services/auditService.js";
import { User } from "../models/index.js";

export async function adminGetBooks(req, res) {
  const { title, author, genre, location } = req.query;
  res.json(await BookService.adminGetAllBooks({ title, author, genre, location }));
}

export async function adminDeleteBook(req, res) {
  const adminUser = await User.findByPk(req.userId, { attributes: ["id", "name", "email"] });
  const result = await BookService.adminDeleteBook(req.params.id, adminUser);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  res.json({ message: "Listing removed" });
}

export async function adminCancelReservation(req, res) {
  const adminUser = await User.findByPk(req.userId, { attributes: ["id", "name", "email"] });
  const result = await BookService.adminCancelReservation(req.params.id, adminUser);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "not_active") return res.status(409).json({ message: "This book has no active request or reservation" });
  res.json({ message: "Reservation cancelled" });
}

export async function adminGetAuditLog(req, res) {
  const { event, donorName, borrowerName, bookTitle } = req.query;
  res.json(await AuditService.getAll({ event, donorName, borrowerName, bookTitle }));
}
