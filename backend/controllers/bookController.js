import { BookService } from "../services/bookService.js";
import { deleteUploadedFile } from "../utils/deleteUploadedFile.js";
import { getUploadedImagePath } from "../middlewares/upload.js";
import { User } from "../models/index.js";

async function getRequesterRole(req) {
  if (!req.userId) return null;
  const user = await User.findByPk(req.userId, { attributes: ["role"] });
  return user?.role || null;
}

function stripCountIfNotAllowed(book, requesterId, requesterRole) {
  const allowed = requesterRole === "admin" || book.donorId === requesterId;
  if (!allowed) delete book.pendingRequestCount;
  return book;
}

export async function getBooks(req, res) {
  const { title, author, genre, location, donorName } = req.query;
  const books = await BookService.getAllBooks({ title, author, genre, location, donorName });
  const requesterRole = await getRequesterRole(req);
  res.json(books.map((b) => stripCountIfNotAllowed(b, req.userId, requesterRole)));
}

export async function getBookById(req, res) {
  const book = await BookService.getBookById(req.params.id);
  if (!book) return res.status(404).json({ message: "not found" });
  const requesterRole = await getRequesterRole(req);
  res.json(stripCountIfNotAllowed(book, req.userId, requesterRole));
}

export async function donateBook(req, res) {
  const { title, author, genre, description, location } = req.body;
  if (!title || !author) return res.status(400).json({ error: "Title and author are required" });
  if (!location) return res.status(400).json({ error: "Location is required" });
  if (!req.file) return res.status(400).json({ error: "A photo of the book is required" });

  // Works for either storage driver - see getUploadedImagePath
  const image = getUploadedImagePath(req);
  const result = await BookService.donateBook({ title, author, genre, description, location, image }, req.userId);

  if (result.status === "forbidden_admin") {
    await deleteUploadedFile(image);
    return res.status(403).json({ error: "Admin accounts cannot donate books" });
  }
  res.status(201).json(result.entry);
}

export async function updateBook(req, res) {
  const { title, author, genre, description, location } = req.body;
  const image = req.file ? getUploadedImagePath(req) : undefined;
  const result = await BookService.updateBook(req.params.id, { title, author, genre, description, location, image }, req.userId);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your listing" });
  res.json(result.entry);
}

export async function deleteBook(req, res) {
  const result = await BookService.deleteBook(req.params.id, req.userId);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your listing" });
  res.status(200).json({ message: "Listing removed" });
}

export async function sendRequest(req, res) {
  const result = await BookService.sendRequest(req.params.id, req.userId);
  if (result.status === "forbidden_admin") return res.status(403).json({ message: "Admins cannot request books" });
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "already_reserved") return res.status(409).json({ message: "This book has already been reserved" });
  if (result.status === "own_book") return res.status(403).json({ message: "You cannot request your own book" });
  if (result.status === "already_requested") return res.status(409).json({ message: "You already have a request for this book" });
  res.status(200).json({ message: "Request sent", requestId: result.requestId });
}

export async function withdrawRequest(req, res) {
  const result = await BookService.withdrawRequest(req.params.requestId, req.userId);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your request" });
  if (result.status === "not_pending") return res.status(409).json({ message: "Request is not pending" });
  res.status(200).json({ message: "Request withdrawn" });
}

export async function acceptRequest(req, res) {
  const result = await BookService.acceptRequest(req.params.requestId, req.userId);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your listing" });
  if (result.status === "not_pending") return res.status(409).json({ message: "Request is not pending" });
  res.status(200).json({ donor: result.donor, borrower: result.borrower });
}

export async function declineRequest(req, res) {
  const result = await BookService.declineRequest(req.params.requestId, req.userId);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your listing" });
  if (result.status === "not_pending") return res.status(409).json({ message: "Request is not pending" });
  res.status(200).json({ message: "Request declined" });
}

export async function cancelReservation(req, res) {
  const result = await BookService.cancelReservation(req.params.requestId, req.userId);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your reservation" });
  if (result.status === "not_accepted") return res.status(409).json({ message: "No active reservation" });
  res.status(200).json({ message: "Reservation cancelled" });
}

export async function getMyDonations(req, res) {
  const { title, author, genre, location } = req.query;
  res.json(await BookService.getMyDonations(req.userId, { title, author, genre, location }));
}

export async function getMyReservation(req, res) {
  const { title, author, genre, location } = req.query;
  res.json(await BookService.getMyReservation(req.userId, { title, author, genre, location }));
}
