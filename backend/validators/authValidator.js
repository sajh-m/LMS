import { body } from "express-validator";

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").trim().isEmail().withMessage("a valid email is required").normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("phone number is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
];

export const loginValidator = [
  body("email").trim().isEmail().withMessage("a valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("password is required"),
];
