import express from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import {
  createBookValidator,
  updateBookValidator,
  idParamValidator,
} from "../validators/bookValidator.js";
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/", asyncHandler(getBooks));
router.get("/:id", idParamValidator, validate, asyncHandler(getBookById));
router.post("/", createBookValidator, validate, asyncHandler(createBook));
router.put("/:id", updateBookValidator, validate, asyncHandler(updateBook));
router.delete("/:id", idParamValidator, validate, asyncHandler(deleteBook));

export default router;
