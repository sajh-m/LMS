import express from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { registerValidator, loginValidator } from "../validators/authValidator.js";
import { register, login, getMe } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerValidator, validate, asyncHandler(register));
router.post("/login", loginValidator, validate, asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(getMe));

export default router;
