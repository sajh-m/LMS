import { param, body } from "express-validator";

export const createBookValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required")
    .isLength({ min: 1 })
    .withMessage("title must not be empty"),

  body("author").trim().notEmpty().withMessage("author is required"),

  body("genre").optional().trim(),

  body("description").optional().trim(),

  body("image").optional().trim().isURL().withMessage("image must be a valid URL"),
];

export const updateBookValidator = [
  param("id").isInt().withMessage("id must be an integer").toInt(),

  body("title").optional().trim().notEmpty().withMessage("title must not be empty"),

  body("author").optional().trim().notEmpty().withMessage("author must not be empty"),

  body("genre").optional().trim(),

  body("description").optional().trim(),

  body("image").optional().trim().isURL().withMessage("image must be a valid URL"),
];

export const idParamValidator = [
  param("id").isInt().withMessage("id must be an integer").toInt(),
];
