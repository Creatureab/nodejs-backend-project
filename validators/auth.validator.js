import { body, validationResult } from "express-validator";

export const registerValidation = [
  body("email")
    .isEmail()
    .withMessage((value, { req }) => req.t("enterValidEmail")),
  body("password").isLength({ min: 6 }),
  body("role").optional().isIn(["admin", "user"]),
  body("userName")
    .notEmpty()
    .withMessage((value, { req }) => req.t("userNameRequired")),
  body("city")
    .notEmpty()
    .withMessage((value, { req }) => req.t("cityRequired")),
  body("postalCode")
    .notEmpty()
    .withMessage((value, { req }) => req.t("postalCodeRequired")),
  body("addressLine1").notEmpty(),
  body("addressLine2").optional(),
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage("Phone number must contain 10 to 15 digits"),
];
export const loginValidation = [
  body("email")
    .isEmail()
    .withMessage((value, { req }) => req.t("enterValidEmail")),
  body("password").isLength({ min: 6 }),
];

export const updateValidation = [
  body("email")
    .optional()
    .isEmail()
    .withMessage((value, { req }) => req.t("enterValidEmail")),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage((value, { req }) => req.t("passwordMinLength")),
  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage((value, { req }) => req.t("invalidRole")),
  body("userName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage((value, { req }) => req.t("userNameRequired")),
  body("city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage((value, { req }) => req.t("cityRequired")),
  body("postalCode").optional().trim().notEmpty(),
  body("addressLine1").optional().trim().notEmpty(),
  body("addressLine2").optional().trim(),
  body("phoneNumber")
    .optional()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage("Phone number must contain 10 to 15 digits"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
