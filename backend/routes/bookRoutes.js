import express from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import {
  donateBookValidator,
  idParamValidator,
  donationIdParamValidator,
} from "../validators/bookValidator.js";
import {
  getBooks,
  getBookById,
  donateBook,
  takeBook,
  cancelReservation,
  completeDonation,
  getMyDonations,
  getMyReservation,
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/", asyncHandler(getBooks));
router.get("/mine/donated", requireAuth, asyncHandler(getMyDonations));
router.get("/mine/reserved", requireAuth, asyncHandler(getMyReservation));
router.get("/:id", idParamValidator, validate, asyncHandler(getBookById));

router.post(
  "/",
  requireAuth,
  upload.single("image"),
  donateBookValidator,
  validate,
  asyncHandler(donateBook),
);

router.post("/:id/take", requireAuth, idParamValidator, validate, asyncHandler(takeBook));

router.post(
  "/donations/:donationId/cancel",
  requireAuth,
  donationIdParamValidator,
  validate,
  asyncHandler(cancelReservation),
);

router.post(
  "/donations/:donationId/complete",
  requireAuth,
  donationIdParamValidator,
  validate,
  asyncHandler(completeDonation),
);

export default router;
