import { param, body } from "express-validator";

export const donateBookValidator = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("author").trim().notEmpty().withMessage("author is required"),
  body("location").trim().notEmpty().withMessage("location is required"),
  body("genre").optional().trim(),
  body("description").optional().trim(),
];

export const updateBookValidator = [
  param("id").isInt().withMessage("id must be an integer").toInt(),
  body("title").optional().trim().notEmpty().withMessage("title must not be empty"),
  body("author").optional().trim().notEmpty().withMessage("author must not be empty"),
  body("location").optional().trim().notEmpty().withMessage("location must not be empty"),
  body("genre").optional().trim(),
  body("description").optional().trim(),
];

export const idParamValidator = [
  param("id").isInt().withMessage("id must be an integer").toInt(),
];
