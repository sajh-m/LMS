import { param, body } from "express-validator";

export const donateBookValidator = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("author").trim().notEmpty().withMessage("author is required"),
  body("genre").optional().trim(),
  body("description").optional().trim(),
];

export const idParamValidator = [
  param("id").isInt().withMessage("id must be an integer").toInt(),
];

export const donationIdParamValidator = [
  param("donationId").isInt().withMessage("donationId must be an integer").toInt(),
];
