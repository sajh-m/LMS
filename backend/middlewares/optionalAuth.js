import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

// Like requireAuth, but never rejects - if there's no token or it's
// invalid, just proceeds as an anonymous request. Lets a route serve
// both logged-out and logged-in users while still knowing who's asking.
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length);
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.userId = decoded.id;
    } catch {
      // invalid/expired token on an optional route - just treat as anonymous
    }
  }
  next();
}
