import { body, param, query } from "express-validator";
import i18next from "i18next";

export const permissionIdValidation = [
  param("id")
    .isUUID()
    .withMessage(
      i18next.t("error.default.mustUUID", { m: "ID permission" }),
    ),
];

export const createPermissionValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(i18next.t("error.default.required", { m: "Nama permission" }))
    .isLength({ max: 100 })
    .withMessage(
      i18next.t("error.default.maxLength", {
        m: "nama permission",
        max: "100",
      }),
    ),
];

export const updatePermissionValidation = [
  ...permissionIdValidation,
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(i18next.t("error.default.required", { m: "Nama permission" }))
    .isLength({ max: 100 })
    .withMessage(
      i18next.t("error.default.maxLength", {
        m: "nama permission",
        max: "100",
      }),
    ),
];

export const permissionListValidation = [
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
    .isIn(["id", "name", "slug", "created_at", "updated_at"])
    .withMessage(
      i18next.t("error.default.not_supported", {
        m: "pencarian/sort_by",
      }),
    ),
  query("order_by")
    .optional()
    .isIn(["ASC", "DESC", "asc", "desc"])
    .withMessage("order_by harus ASC atau DESC."),
  query("search").optional(),
];