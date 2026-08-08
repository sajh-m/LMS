import { BookService } from "../services/bookService.js";

export async function getBooks(req, res) {
  res.json(await BookService.getAllBooks());
}

export async function getBookById(req, res) {
  const book = await BookService.getBookById(req.params.id);
  if (!book) return res.status(404).json({ message: "not found" });
  res.json(book);
}

// requires auth (req.userId = donor) and a multer-parsed image (req.file)
export async function donateBook(req, res) {
  const { title, author, genre, description } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: "Title and author are required" });
  }

  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const { book, donation } = await BookService.donateBook(
    { title, author, genre, description, image },
    req.userId,
  );

  res.status(201).json({ book, donationId: donation.id });
}

// requires auth (req.userId = borrower)
export async function takeBook(req, res) {
  const result = await BookService.takeBook(req.params.id, req.userId);

  if (result.status === "not_found") {
    return res.status(404).json({ message: "not found" });
  }
  if (result.status === "out_of_stock") {
    return res.status(409).json({ message: "out of stock" });
  }

  const { donation } = result;
  res.status(200).json({
    donationId: donation.id,
    donor: donation.donor,
  });
}

// requires auth (req.userId = the borrower who made the reservation)
export async function cancelReservation(req, res) {
  const result = await BookService.cancelReservation(req.params.donationId, req.userId);

  if (result.status === "not_found") {
    return res.status(404).json({ message: "reservation not found" });
  }
  if (result.status === "forbidden") {
    return res.status(403).json({ message: "not your reservation" });
  }

  res.status(200).json({ message: "Reservation cancelled" });
}

// requires auth (req.userId = the donor who owns this donation)
export async function completeDonation(req, res) {
  const result = await BookService.completeDonation(req.params.donationId, req.userId);

  if (result.status === "not_found") {
    return res.status(404).json({ message: "donation not found" });
  }
  if (result.status === "forbidden") {
    return res.status(403).json({ message: "not your donation" });
  }

  res.status(200).json({ message: "Donation marked as given" });
}

export async function getMyDonations(req, res) {
  res.json(await BookService.getMyDonations(req.userId));
}

export async function getMyReservation(req, res) {
  res.json(await BookService.getMyReservation(req.userId));
}
