import { Book } from "./bookModel.js";
import { User } from "./userModel.js";
import { Donation } from "./donationModel.js";

// A book has many donated copies; each copy belongs to one donor,
// and (once reserved) to one borrower.
Book.hasMany(Donation, { foreignKey: "bookId", as: "donations" });
Donation.belongsTo(Book, { foreignKey: "bookId", as: "book" });

User.hasMany(Donation, { foreignKey: "donorId", as: "donatedCopies" });
Donation.belongsTo(User, { foreignKey: "donorId", as: "donor" });

User.hasMany(Donation, { foreignKey: "borrowerId", as: "reservedCopies" });
Donation.belongsTo(User, { foreignKey: "borrowerId", as: "borrower" });

export { Book, User, Donation };
