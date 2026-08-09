import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// In-app messages for things that happen to a user's listings/reservations
// without them directly doing it - currently only admin actions generate these.
export const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});
