import { body } from 'express-validator';

export const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('email wajib diisi.')
    .isString()
    .withMessage('email harus berupa teks.')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Format email tidak valid.'),

  body('password')
    .notEmpty()
    .withMessage('Password wajib diisi.')
    .isString()
    .withMessage('Password harus berupa teks.'),

    body('remember_me')
      .optional()
    .isBoolean()
      .withMessage('Nilai remember_me harus berupa boolean (true/false).')
      .toBoolean(),
];

export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token wajib diisi.')
    .isString()
    .withMessage('Refresh token harus berupa string.'),
];
