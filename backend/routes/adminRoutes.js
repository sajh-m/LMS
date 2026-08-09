import express from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import {
  adminGetBooks,
  adminDeleteBook,
  adminCancelReservation,
} from "../controllers/adminController.js";

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get("/books", asyncHandler(adminGetBooks));
router.delete("/books/:id", asyncHandler(adminDeleteBook));
router.post("/books/:id/cancel", asyncHandler(adminCancelReservation));

export default router;
