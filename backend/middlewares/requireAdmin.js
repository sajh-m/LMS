import { User } from "../models/userModel.js";

// Must run AFTER requireAuth (needs req.userId already set).
export async function requireAdmin(req, res, next) {
  const user = await User.findByPk(req.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
