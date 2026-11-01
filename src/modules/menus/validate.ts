import { body, param, query } from "express-validator";
import i18next from "i18next";

export const menuIdValidation = [
  param("id")
    .isUUID()
    .withMessage(i18next.t("error.default.mustUUID", { m: "ID menu" })),
];

export const createMenuValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(i18next.t("error.default.required", { m: "Nama menu" }))
    .isLength({ max: 100 })
    .withMessage(
      i18next.t("error.default.maxLength", { m: "nama menu", max: "100" }),
    ),
  body("path")
    .trim()
    .notEmpty()
    .withMessage(i18next.t("error.default.required", { m: "Path menu" }))
    .isLength({ max: 255 })
    .withMessage(
      i18next.t("error.default.maxLength", { m: "path menu", max: "255" }),
    ),
  body("icon")
    .optional({ values: "null" })
    .isString()
    .withMessage(i18next.t("error.default.mustText", { m: "Icon menu" }))
    .isLength({ max: 50 })
    .withMessage(
      i18next.t("error.default.maxLength", { m: "icon menu", max: "50" }),
    ),
  body("parent_id")
    .optional({ values: "null" })
    .isUUID()
    .withMessage(i18next.t("error.default.mustUUID", { m: "ID parent menu" })),
  body("order_number")
    .optional()
    .isInt({ min: 0 })
    .withMessage("order_number harus berupa bilangan bulat non-negatif.")
    .toInt(),
];

export const updateMenuValidation = [
  ...menuIdValidation,
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(i18next.t("error.default.required", { m: "Nama menu" }))
    .isLength({ max: 100 })
    .withMessage(
      i18next.t("error.default.maxLength", { m: "nama menu", max: "100" }),
    ),
  body("path")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(i18next.t("error.default.required", { m: "Path menu" }))
    .isLength({ max: 255 })
    .withMessage(
      i18next.t("error.default.maxLength", { m: "path menu", max: "255" }),
    ),
  body("icon")
    .optional({ values: "null" })
    .isString()
    .withMessage(i18next.t("error.default.mustText", { m: "Icon menu" }))
    .isLength({ max: 50 })
    .withMessage(
      i18next.t("error.default.maxLength", { m: "icon menu", max: "50" }),
    ),
  body("parent_id")
    .optional({ values: "null" })
    .isUUID()
    .withMessage(i18next.t("error.default.mustUUID", { m: "ID parent menu" })),
  body("order_number")
    .optional()
    .isInt({ min: 0 })
    .withMessage("order_number harus berupa bilangan bulat non-negatif.")
    .toInt(),
];

export const addRolePermissionMenuValidation = [
  body("role_id")
    .isUUID()
    .withMessage(i18next.t("error.default.mustUUID", { m: "ID role" })),
  body("menu_id")
    .isUUID()
    .withMessage(i18next.t("error.default.mustUUID", { m: "ID menu" })),
  body("permissions_ids")
    .isArray({ min: 1 })
    .withMessage(
      i18next.t("error.default.required", { m: "Daftar permission" }),
    ),
  body("permissions_ids.*")
    .isUUID()
    .withMessage(
      i18next.t("error.default.mustUUID", { m: "ID permission" }),
    ),
];

export const menuListValidation = [
  query("page")
    .optional()
    .notEmpty()
    .withMessage(i18next.t("error.default.required", { m: "Nilai page" })),
  query("limit")
    .optional()
    .notEmpty()
    .withMessage(i18next.t("error.default.required", { m: "Nilai limit" })),
  query("sort_by")
    .optional()
    .isIn([
      "id",
      "name",
      "slug",
      "path",
      "order_number",
      "created_at",
      "updated_at",
    ])
    .withMessage(
      i18next.t("error.default.not_supported", { m: "pencarian/sort_by" }),
    ),
  query("order_by")
    .optional()
    .isIn(["ASC", "DESC", "asc", "desc"])
    .withMessage("order_by harus ASC atau DESC."),
  query("search").optional(),
];
