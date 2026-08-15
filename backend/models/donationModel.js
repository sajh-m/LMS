import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// One row = one physical book, donated by one specific person.
// No shared "Book" catalog entry anymore - every donation is fully
// independent, even if two people donate the exact same title/author.
export const Donation = sequelize.define("Donation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    // where the donor is based / where pickup happens - only revealed
    // to a borrower once they take this specific copy
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("available", "reserved"),
    allowNull: false,
    defaultValue: "available",
  },
});
