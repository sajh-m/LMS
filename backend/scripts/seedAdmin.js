// Manual/optional now - server.js calls ensureAdminAccount() automatically
// on every startup. This script is kept for CI or one-off admin setup
// without starting the whole server.
import "dotenv/config";
import { sequelize } from "../config/database.js";
import "../models/index.js";
import { ensureAdminAccount } from "../services/adminSeedService.js";

const run = async () => {
  await sequelize.sync();
  await ensureAdminAccount();
  process.exit(0);
};

run();
