import express from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { upload } from "../middlewares/upload.js";
import { donateBookValidator, updateBookValidator, idParamValidator } from "../validators/bookValidator.js";
import {
  getBooks, getBookById, donateBook, updateBook, deleteBook,
  sendRequest, withdrawRequest, acceptRequest, declineRequest,
  cancelReservation, receiveBook, getMyDonations, getMyReservation,
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/", optionalAuth, asyncHandler(getBooks));
router.get("/mine/donated", requireAuth, asyncHandler(getMyDonations));
router.get("/mine/reserved", requireAuth, asyncHandler(getMyReservation));
router.get("/:id", optionalAuth, idParamValidator, validate, asyncHandler(getBookById));

router.post("/", requireAuth, upload.single("image"), donateBookValidator, validate, asyncHandler(donateBook));
router.put("/:id", requireAuth, upload.single("image"), updateBookValidator, validate, asyncHandler(updateBook));
router.delete("/:id", requireAuth, idParamValidator, validate, asyncHandler(deleteBook));

// Single-request model: all of these act on the Donation itself (:id),
// there's no separate Request entity anymore.
router.post("/:id/request", requireAuth, idParamValidator, validate, asyncHandler(sendRequest));
router.post("/:id/withdraw", requireAuth, idParamValidator, validate, asyncHandler(withdrawRequest));
router.post("/:id/accept", requireAuth, idParamValidator, validate, asyncHandler(acceptRequest));
router.post("/:id/decline", requireAuth, idParamValidator, validate, asyncHandler(declineRequest));
router.post("/:id/cancel", requireAuth, idParamValidator, validate, asyncHandler(cancelReservation));
router.post("/:id/receive", requireAuth, idParamValidator, validate, asyncHandler(receiveBook));

export default router;
