import { BookService } from "../services/bookService.js";
import { deleteUploadedFile } from "../utils/deleteUploadedFile.js";
import { getUploadedImagePath } from "../middlewares/upload.js";
import { User } from "../models/index.js";

async function getRequesterRole(req) {
  if (!req.userId) return null;
  const user = await User.findByPk(req.userId, { attributes: ["role"] });
  return user?.role || null;
}

function applyVisibilityRules(book, requesterId, requesterRole) {
  const isOwnBook = book.donorId === requesterId;
  const isAdmin = requesterRole === "admin";

  if (!isAdmin && book.donor) {
    book.donor = { id: book.donor.id, name: book.donor.name };
  }

  // borrower info is only for the donor of THIS book or an admin -
  // random users never see it, even a name
  if (book.borrower && !isOwnBook && !isAdmin) {
    delete book.borrower;
  }

  return book;
}

export async function getBooks(req, res) {
  const { title, author, genre, location, donorName } = req.query;
  const books = await BookService.getAllBooks({ title, author, genre, location, donorName });
  const requesterRole = await getRequesterRole(req);
  res.json(books.map((b) => applyVisibilityRules(b.toJSON ? b.toJSON() : b, req.userId, requesterRole)));
}

export async function getBookById(req, res) {
  const book = await BookService.getBookById(req.params.id);
  if (!book) return res.status(404).json({ message: "not found" });
  const requesterRole = await getRequesterRole(req);
  res.json(applyVisibilityRules(book, req.userId, requesterRole));
}

export async function donateBook(req, res) {
  const { title, author, genre, description, location } = req.body;
  if (!title || !author) return res.status(400).json({ error: "Title and author are required" });
  if (!location) return res.status(400).json({ error: "Location is required" });
  if (!req.file) return res.status(400).json({ error: "A photo of the book is required" });

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
  if (result.status === "has_active_request") {
    return res.status(409).json({
      message: "This book has an active request or reservation. Decline, withdraw, or resolve it first.",
    });
  }
  res.status(200).json({ message: "Listing removed" });
}

export async function sendRequest(req, res) {
  const result = await BookService.sendRequest(req.params.id, req.userId);
  if (result.status === "forbidden_admin") return res.status(403).json({ message: "Admins cannot request books" });
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "own_book") return res.status(403).json({ message: "You cannot request your own book" });
  if (result.status === "not_available") return res.status(409).json({ message: "This book already has an active request" });
  res.status(200).json({ message: "Request sent" });
}

export async function withdrawRequest(req, res) {
  const result = await BookService.withdrawRequest(req.params.id, req.userId);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your request" });
  res.status(200).json({ message: "Request withdrawn" });
}

export async function acceptRequest(req, res) {
  const result = await BookService.acceptRequest(req.params.id, req.userId);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your listing" });
  if (result.status === "not_pending") return res.status(409).json({ message: "No pending request on this book" });
  res.status(200).json({ donor: result.donor, borrower: result.borrower });
}

export async function declineRequest(req, res) {
  const result = await BookService.declineRequest(req.params.id, req.userId);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your listing" });
  if (result.status === "not_pending") return res.status(409).json({ message: "No pending request on this book" });
  res.status(200).json({ message: "Request declined" });
}

// Borrower only - donor is never allowed to cancel an active reservation
export async function cancelReservation(req, res) {
  const result = await BookService.cancelReservation(req.params.id, req.userId);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your reservation" });
  res.status(200).json({ message: "Reservation cancelled" });
}

// Borrower confirms physical handoff happened - completes and deletes
export async function receiveBook(req, res) {
  const result = await BookService.receiveBook(req.params.id, req.userId);
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your reservation" });
  res.status(200).json({ message: "Marked as received" });
}

export async function getMyDonations(req, res) {
  const { title, author, genre, location } = req.query;
  res.json(await BookService.getMyDonations(req.userId, { title, author, genre, location }));
}

export async function getMyReservation(req, res) {
  const { title, author, genre, location, donorName } = req.query;
  res.json(await BookService.getMyReservation(req.userId, { title, author, genre, location, donorName }));
}
