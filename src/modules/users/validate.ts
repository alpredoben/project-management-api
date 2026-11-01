import { body, Meta, param, query } from "express-validator";
import i18next from "i18next";
import { USER_SORT_FIELDS, USER_UPDATABLE_FIELDS } from "./dto";

const LIMITS = {
  name: 100,
  email: 100,
  phone: 50,
  search: 100,
  passwordMin: 8,
  passwordMax: 72,
} as const;

const t =
  (key: string, params?: Record<string, string>) =>
  (_value: unknown, { req }: Meta): string =>
    String(req["t"]?.(key, params) ?? i18next.t(key, params));

const mustText = (label: string) => t("error.default.mustText", { m: label });
const required = (label: string) => t("error.default.required", { m: label });
const maxLength = (label: string, max: number) =>
  t("error.default.maxLength", { m: label, max: String(max) });
const mustUUID = (label: string) => t("error.default.mustUUID", { m: label });

export const userIdValidation = [
  param("id").isUUID().withMessage(mustUUID("ID user")),
];

const nameField = (isRequired: boolean) => {
  const chain = body("name");
  if (!isRequired) chain.optional({ values: "null" });
  return chain
    .isString()
    .withMessage(mustText("Nama user"))
    .bail()
    .trim()
    .notEmpty()
    .withMessage(required("Nama user"))
    .bail()
    .isLength({ max: LIMITS.name })
    .withMessage(maxLength("nama user", LIMITS.name));
};

const emailField = (isRequired: boolean) => {
  const chain = body("email");
  if (!isRequired) chain.optional();
  return chain
    .isString()
    .withMessage(mustText("Email"))
    .bail()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Format email tidak valid.")
    .bail()
    .isLength({ max: LIMITS.email })
    .withMessage(maxLength("email", LIMITS.email));
};

/** Nomor telepon bersifat opsional; string kosong disimpan sebagai `null`. */
const phoneField = () =>
  body("phone")
    .optional({ values: "null" })
    .isString()
    .withMessage(mustText("Nomor telepon"))
    .bail()
    .trim()
    .isLength({ max: LIMITS.phone })
    .withMessage(maxLength("nomor telepon", LIMITS.phone))
    .customSanitizer((value: string) => value || null);

const passwordField = (field: string) =>
  body(field)
    .isString()
    .withMessage(mustText("Password"))
    .bail()
    .isLength({ min: LIMITS.passwordMin, max: LIMITS.passwordMax })
    .withMessage(
      `Password harus memiliki panjang ${LIMITS.passwordMin} sampai ${LIMITS.passwordMax} karakter.`,
    )
    .bail()
    .custom(
      (value: string) => Buffer.byteLength(value, "utf8") <= LIMITS.passwordMax,
    )
    .withMessage(`Password tidak boleh melebihi ${LIMITS.passwordMax} byte.`);

const roleIdsField = (isRequired: boolean) => [
  isRequired
    ? body("role_ids").isArray({ min: 1 }).withMessage(required("Daftar role"))
    : body("role_ids")
        .optional()
        .isArray()
        .withMessage(t("error.default.is_array")),
  body("role_ids.*").isUUID().withMessage(mustUUID("ID role")),
];

export const createUserValidation = [
  nameField(true),
  emailField(true),
  passwordField("password"),
  phoneField(),
  ...roleIdsField(false),
];

export const updateUserValidation = [
  ...userIdValidation,
  body()
    .custom((_value, { req }) =>
      USER_UPDATABLE_FIELDS.some((field) => req.body?.[field] !== undefined),
    )
    .withMessage("Minimal satu field user harus diubah."),
  nameField(false),
  emailField(false),
  phoneField(),
];

export const changePasswordValidation = [
  ...userIdValidation,
  passwordField("new_password"),
  body("confirm_password")
    .isString()
    .withMessage(mustText("Konfirmasi password"))
    .bail()
    .custom((value, { req }) => value === req.body.new_password)
    .withMessage("Konfirmasi password tidak sama dengan password baru."),
];

export const addUserRoleValidation = [
  ...userIdValidation,
  ...roleIdsField(true),
];

export const userListValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("sort_by")
    .optional()
    .isIn([...USER_SORT_FIELDS])
    .withMessage(t("error.default.not_supported", { m: "sort_by" })),
  query("order_by")
    .optional()
    .isIn(["ASC", "DESC", "asc", "desc"])
    .withMessage("order_by harus ASC atau DESC."),
  query("search")
    .optional()
    .isString()
    .isLength({ max: LIMITS.search })
    .withMessage(maxLength("pencarian", LIMITS.search)),
];
