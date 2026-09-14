import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// One row = one physical book. Single-request model: only one person
// can have an active request/reservation on a book at a time.
export const Donation = sequelize.define("Donation", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: false },
  genre: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  status: {
    // available - listed, no active request, visible publicly
    // pending   - a request was sent, hidden from public browsing
    // reserved  - donor accepted, borrower is arranging pickup
    type: DataTypes.ENUM("available", "pending", "reserved"),
    allowNull: false,
    defaultValue: "available",
  },
});
