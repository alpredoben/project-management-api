import { body, query, ValidationChain } from "express-validator";

const passwordRules = (field: string): ValidationChain =>
  body(field)
    .isString()
    .withMessage("Kata sandi harus berupa teks.")
    .isLength({ min: 8, max: 72 })
    .withMessage("Kata sandi harus terdiri dari 8 hingga 72 karakter.")
    .bail()
    .custom((value: string) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Kata sandi tidak boleh melebihi 72 byte.");

export const registerValidation: ValidationChain[] = [
  body("name").isString().trim().notEmpty().withMessage("Nama wajib diisi."),
  body("nip")
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("NIP wajib diisi dan maksimal 50 karakter."),
  body("email").isEmail().normalizeEmail().withMessage("Email tidak valid."),
  passwordRules("password"),
  body("confirm_password")
    .isString()
    .custom((value, { req }) => value === req.body?.password)
    .withMessage("Konfirmasi kata sandi tidak cocok."),
];

export const loginValidation: ValidationChain[] = [
  body("email").isEmail().normalizeEmail().withMessage("Email tidak valid."),
  body("password").isString().notEmpty().withMessage("Kata sandi wajib diisi."),
  body("remember_password")
    .optional()
    .isBoolean()
    .toBoolean()
    .withMessage("remember_password harus bernilai boolean."),
];

export const verifiedEmailValidation: ValidationChain[] = [
  query("token").isString().trim().notEmpty().withMessage("Token wajib diisi."),
];

export const forgotPasswordValidation: ValidationChain[] = [
  body("email").isEmail().normalizeEmail().withMessage("Email tidak valid."),
];

export const resetPasswordValidation: ValidationChain[] = [
  query("token").optional().isString().trim().notEmpty(),
  body("token").optional().isString().trim().notEmpty(),
  body("new_password")
    .isString()
    .isLength({ min: 8, max: 72 })
    .withMessage("Kata sandi harus terdiri dari 8 hingga 72 karakter.")
    .bail()
    .custom((value: string) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Kata sandi tidak boleh melebihi 72 byte."),
  body("confirm_password")
    .isString()
    .custom((value, { req }) => value === req.body?.new_password)
    .withMessage("Konfirmasi kata sandi tidak cocok."),
  body("token")
    .custom((value, { req }) => Boolean(value || req.query?.["token"]))
    .withMessage("Token reset wajib diisi melalui query atau body."),
];

export const refreshTokenValidation: ValidationChain[] = [
  body("access_token")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("access_token tidak valid."),
  body("refresh_token").optional().isString().trim().notEmpty(),
  body("access_token")
    .custom((value, { req }) =>
      Boolean(value || (req.body ?? {}).refresh_token),
    )
    .withMessage("Token refresh wajib diisi."),
];