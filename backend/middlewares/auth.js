import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

// Reads "Authorization: Bearer <token>", verifies it, and attaches
// req.userId for downstream controllers. Rejects with 401 if missing/invalid.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
