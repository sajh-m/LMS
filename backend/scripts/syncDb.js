import { sequelize } from "../config/database.js";
import "../models/index.js"; // registers Book

const run = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");
    process.exit(0);
  } catch (err) {
    console.error("Failed to sync database:", err);
    process.exit(1);
  }
};
run();
