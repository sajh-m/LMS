import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// One row = one physical book donated by one specific person.
// No shared catalog entries - every donation is fully independent.
export const Donation = sequelize.define("Donation", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: false },
  genre: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  status: {
    // available - listed, accepting requests (stays this way until donor accepts one)
    // reserved  - donor accepted a request, book is being arranged for handoff
    type: DataTypes.ENUM("available", "reserved"),
    allowNull: false,
    defaultValue: "available",
  },
});
