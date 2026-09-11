import app from "./app.js";
import { config } from "./config/index.js";
import { ensureAdminAccount } from "./services/adminSeedService.js";

await ensureAdminAccount();

app.listen(config.port, () => {
  console.log(`server running on ${config.port}`);
});
