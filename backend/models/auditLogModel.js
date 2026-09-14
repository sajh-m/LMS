import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// Immutable record of every significant event. Written at the moment
// the event happens and never deleted, so admins can see history even
// after the underlying donation/request rows are removed.
export const AuditLog = sequelize.define("AuditLog", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  event: {
    type: DataTypes.ENUM(
      "donation_created",
      "donation_removed_by_donor",
      "donation_removed_by_admin",
      "donation_received",
      "request_sent",
      "request_withdrawn",
      "request_accepted",
      "request_declined",
      "reservation_cancelled_by_borrower",
      "reservation_cancelled_by_admin",
    ),
    allowNull: false,
  },
  bookTitle: { type: DataTypes.STRING, allowNull: false },
  bookAuthor: { type: DataTypes.STRING, allowNull: false },
  bookLocation: { type: DataTypes.STRING, allowNull: true },
  donorId: { type: DataTypes.INTEGER, allowNull: true },
  donorName: { type: DataTypes.STRING, allowNull: true },
  donorEmail: { type: DataTypes.STRING, allowNull: true },
  borrowerId: { type: DataTypes.INTEGER, allowNull: true },
  borrowerName: { type: DataTypes.STRING, allowNull: true },
  borrowerEmail: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.STRING, allowNull: true },
}, { updatedAt: false });
