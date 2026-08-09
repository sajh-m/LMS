import bcrypt from "bcryptjs";
import { User } from "../models/index.js";

// Called on every server startup. Idempotent: if an admin already exists,
// this does nothing. Credentials still come from .env, never hardcoded -
// this just removes the need to remember to run a separate seed command.
export async function ensureAdminAccount() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";
  const phone = process.env.ADMIN_PHONE || "0000000000";

  if (!email || !password) {
    console.warn(
      "ADMIN_EMAIL / ADMIN_PASSWORD not set in .env - skipping admin account setup.",
    );
    return;
  }

  const existing = await User.findOne({ where: { role: "admin" } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, phone, passwordHash, role: "admin" });
  console.log(`Admin account ready: ${email}`);
}
