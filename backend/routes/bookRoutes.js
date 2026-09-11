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
  cancelReservation, getMyDonations, getMyReservation,
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/", optionalAuth, asyncHandler(getBooks));
router.get("/mine/donated", requireAuth, asyncHandler(getMyDonations));
router.get("/mine/reserved", requireAuth, asyncHandler(getMyReservation));
router.get("/:id", optionalAuth, idParamValidator, validate, asyncHandler(getBookById));

router.post("/", requireAuth, upload.single("image"), donateBookValidator, validate, asyncHandler(donateBook));
router.put("/:id", requireAuth, upload.single("image"), updateBookValidator, validate, asyncHandler(updateBook));
router.delete("/:id", requireAuth, idParamValidator, validate, asyncHandler(deleteBook));

// donationId-based - borrower initiates
router.post("/:id/request", requireAuth, idParamValidator, validate, asyncHandler(sendRequest));

// requestId-based - borrower acts on their own request
router.post("/requests/:requestId/withdraw", requireAuth, asyncHandler(withdrawRequest));
router.post("/requests/:requestId/cancel", requireAuth, asyncHandler(cancelReservation));

// requestId-based - donor acts on an incoming request
router.post("/requests/:requestId/accept", requireAuth, asyncHandler(acceptRequest));
router.post("/requests/:requestId/decline", requireAuth, asyncHandler(declineRequest));

export default router;
