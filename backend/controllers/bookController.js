import { BookService } from "../services/bookService.js";
import { deleteUploadedFile } from "../utils/deleteUploadedFile.js";

export async function getBooks(req, res) {
  const { title, author, genre, location, donorName } = req.query;
  res.json(await BookService.getAllBooks({ title, author, genre, location, donorName }));
}

export async function getBookById(req, res) {
  const book = await BookService.getBookById(req.params.id);
  if (!book) return res.status(404).json({ message: "not found" });
  res.json(book);
}

// requires auth (req.userId = donor). Every submission creates a brand
// new independent listing - a photo and a location are both mandatory.
// Admin accounts cannot donate - they only moderate listings.
export async function donateBook(req, res) {
  const { title, author, genre, description, location } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: "Title and author are required" });
  }
  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "A photo of the book is required" });
  }

  // Cloudinary gives us the full URL directly in req.file.path
  const image = req.file.path;

  const result = await BookService.donateBook(
    { title, author, genre, description, location, image },
    req.userId,
  );

  if (result.status === "forbidden_admin") {
    await deleteUploadedFile(image);
    return res.status(403).json({ error: "Admin accounts cannot donate books" });
  }

  res.status(201).json(result.entry);
}

// requires auth; only the original donor can edit their own listing
export async function updateBook(req, res) {
  const { title, author, genre, description, location } = req.body;
  // Cloudinary URL comes in req.file.path, not req.file.filename
  const image = req.file ? req.file.path : undefined;

  const result = await BookService.updateBook(
    req.params.id,
    { title, author, genre, description, location, image },
    req.userId,
  );

  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your listing" });

  res.json(result.entry);
}

// this is the "Book Given" button - deletes the listing entirely
export async function deleteBook(req, res) {
  const result = await BookService.deleteBook(req.params.id, req.userId);

  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your listing" });

  res.status(200).json({ message: "Listing removed" });
}

// requires auth (req.userId = borrower). Reveals the donor's contact
// details AND location together, since both are needed to arrange pickup.
export async function takeBook(req, res) {
  const result = await BookService.takeBook(req.params.id, req.userId);

  if (result.status === "forbidden_admin") {
    return res.status(403).json({ message: "Admin accounts cannot take books" });
  }
  if (result.status === "not_found") return res.status(404).json({ message: "not found" });
  if (result.status === "out_of_stock") {
    return res.status(409).json({ message: "This book has already been taken" });
  }

  const { entry } = result;
  res.status(200).json({
    donationId: entry.id,
    image: entry.image,
    location: entry.location,
    donor: entry.donor,
  });
}

export async function cancelReservation(req, res) {
  const result = await BookService.cancelReservation(req.params.id, req.userId);

  if (result.status === "not_found") return res.status(404).json({ message: "reservation not found" });
  if (result.status === "forbidden") return res.status(403).json({ message: "not your reservation" });

  res.status(200).json({ message: "Reservation cancelled" });
}

export async function getMyDonations(req, res) {
  const { title, author, genre, location } = req.query;
  res.json(await BookService.getMyDonations(req.userId, { title, author, genre, location }));
}

export async function getMyReservation(req, res) {
  const { title, author, genre, location, donorName } = req.query;
  res.json(
    await BookService.getMyReservation(req.userId, { title, author, genre, location, donorName }),
  );
}
