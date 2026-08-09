import app from "./app.js";
import { config } from "./config/index.js";
import { ensureAdminAccount } from "./services/adminSeedService.js";

// Runs on every boot, not just once - safe because it's a no-op once an
// admin already exists. No more remembering to run a separate command.
await ensureAdminAccount();

app.listen(config.port, () => {
  console.log(`server running on ${config.port}`);
});
