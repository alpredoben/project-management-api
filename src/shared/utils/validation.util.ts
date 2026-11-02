import { body, Meta, query } from "express-validator";
import i18next from "i18next";

/**
 * Pesan diterjemahkan saat request diproses (bukan saat module di-import),
 * karena i18next belum tentu selesai memuat resource pada waktu import.
 */
export const t =
  (key: string, params?: Record<string, string>) =>
  (_value: unknown, { req }: Meta): string =>
    String(req["t"]?.(key, params) ?? i18next.t(key, params));

export const mustText = (label: string) =>
  t("error.default.mustText", { m: label });
export const required = (label: string) =>
  t("error.default.required", { m: label });
export const maxLength = (label: string, max: number) =>
  t("error.default.maxLength", { m: label, max: String(max) });
export const mustUUID = (label: string) =>
  t("error.default.mustUUID", { m: label });

/** Validasi query string standar untuk endpoint list (page, limit, sort, order, search). */
export const listQueryValidation = (
  sortFields: readonly string[],
  searchMax = 100,
) => [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("sort_by")
    .optional()
    .isIn([...sortFields])
    .withMessage(t("error.default.not_supported", { m: "sort_by" })),
  query("order_by")
    .optional()
    .isIn(["ASC", "DESC", "asc", "desc"])
    .withMessage("order_by harus ASC atau DESC."),
  query("search")
    .optional()
    .isString()
    .isLength({ max: searchMax })
    .withMessage(maxLength("pencarian", searchMax)),
];

/** Memastikan body request memuat minimal satu dari `fields` (untuk endpoint update parsial). */
export const atLeastOneOf = (fields: readonly string[], message: string) =>
  body()
    .custom((_value, { req }) =>
      fields.some((field) => req.body?.[field] !== undefined),
    )
    .withMessage(message);
