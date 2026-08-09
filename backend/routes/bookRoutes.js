import express from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import {
  donateBookValidator,
  updateBookValidator,
  idParamValidator,
} from "../validators/bookValidator.js";
import {
  getBooks,
  getBookById,
  donateBook,
  updateBook,
  deleteBook,
  takeBook,
  cancelReservation,
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

router.put(
  "/:id",
  requireAuth,
  upload.single("image"),
  updateBookValidator,
  validate,
  asyncHandler(updateBook),
);

// "Book Given" button calls this directly - deletes the listing
router.delete("/:id", requireAuth, idParamValidator, validate, asyncHandler(deleteBook));

router.post("/:id/take", requireAuth, idParamValidator, validate, asyncHandler(takeBook));
router.post("/:id/cancel", requireAuth, idParamValidator, validate, asyncHandler(cancelReservation));

export default router;
