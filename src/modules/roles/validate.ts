import { body, param, query } from "express-validator";
import i18next from "i18next";

export const roleIdValidation = [
  param("id")
    .isUUID()
    .withMessage(i18next.t("error.default.mustUUID", { m: "ID role" })),
];

const roleDescription = body("description")
  .optional({ values: "null" })
  .isString()
  .withMessage(i18next.t("error.default.mustText", { m: "Deskripsi role" }));

export const createRoleValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(i18next.t("error.default.required", { m: "Nama role" }))
    .isLength({ max: 100 })
    .withMessage(
      i18next.t("error.default.maxLength", { m: "nama role", max: "100" }),
    ),
  roleDescription,
];

export const updateRoleValidation = [
  ...roleIdValidation,
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(i18next.t("error.default.required", { m: "Nama role" }))
    .isLength({ max: 100 })
    .withMessage(
      i18next.t("error.default.maxLength", { m: "nama role", max: "100" }),
    ),
  roleDescription,
];

export const assignPermissionValidation = [
  ...roleIdValidation,
  body("permission_ids")
    .isArray({ min: 1 })
    .withMessage(
      i18next.t("error.default.required", { m: "Daftar permission" }),
    ),
  body("permission_ids.*")
    .isUUID()
    .withMessage(
      i18next.t("error.default.mustUUID", { m: "ID permission" }),
    ),
];

export const roleListValidation = [
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
      i18next.t("error.default.not_supported", { m: "pencarian/sort_by" }),
    ),
  query("order_by")
    .optional()
    .isIn(["ASC", "DESC", "asc", "desc"])
    .withMessage("order_by harus ASC atau DESC."),
  query("search").optional(),
];
