import express from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", asyncHandler(getMyNotifications));
router.post("/:id/read", asyncHandler(markNotificationRead));
router.post("/read-all", asyncHandler(markAllNotificationsRead));

export default router;
