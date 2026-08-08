import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// One row = one physical copy donated by one specific person.
export const Donation = sequelize.define("Donation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM("available", "reserved"),
    allowNull: false,
    defaultValue: "available",
  },
});
