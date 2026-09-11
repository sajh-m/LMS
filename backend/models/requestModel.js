import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// One row per borrower-request per book. Multiple people can have
// pending requests on the same book simultaneously - the book stays
// visible/available until the donor accepts exactly one of them.
export const Request = sequelize.define("Request", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: {
    // pending   - sent, waiting for donor response
    // accepted  - donor accepted, contact info mutually visible
    // declined  - donor declined, or auto-declined when another was accepted
    // withdrawn - borrower withdrew before donor responded, or cancelled after acceptance
    type: DataTypes.ENUM("pending", "accepted", "declined", "withdrawn"),
    allowNull: false,
    defaultValue: "pending",
  },
});
