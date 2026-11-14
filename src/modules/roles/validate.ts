import { body, param } from "express-validator";
import { ROLE_SORT_FIELDS } from "./dto";
import {
  atLeastOneOf,
  listQueryValidation,
  maxLength,
  mustText,
  mustUUID,
  required,
  t,
} from "../../shared/utils/validation.util";

const nameValidation = (optional = false) => {
  const validation = body("name");
  if (optional) validation.optional();
  else validation.exists().withMessage(required("name")).bail();
  return validation
    .isString()
    .withMessage(mustText("name"))
    .bail()
    .trim()
    .notEmpty()
    .withMessage(required("name"))
    .isLength({ max: 150 })
    .withMessage(maxLength("name", 150));
};

const descriptionValidation = () =>
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage(mustText("description"));

export const roleListValidation = listQueryValidation(ROLE_SORT_FIELDS);

export const roleIdValidation = [
  param("id").isUUID().withMessage(mustUUID("id")),
];

export const roleCreateValidation = [
  nameValidation(),
  descriptionValidation(),
];

export const roleUpdateValidation = [
  nameValidation(true),
  descriptionValidation(),
  atLeastOneOf(
    ["name","description"],
    t("error.default.required", { m: "name atau description" }),
  ),
];

export const roleSetPermissionsValidation = [
  body().custom((value) =>
    Array.isArray(value) ||
    (typeof value === "object" &&
      value !== null &&
      Array.isArray(value.permissions)),
  ).withMessage(t("error.default.is_array", { m: "permissions" })),
  body().custom((value) => {
    const ids: unknown[] = Array.isArray(value) ? value : value?.permissions;
    return Array.isArray(ids) && ids.every((id) => typeof id === "string");
  }).withMessage(t("error.default.mustUUID", { m: "permissions" })),
  body().custom((value) => {
    const ids: string[] = Array.isArray(value) ? value : value?.permissions;
    return Array.isArray(ids) && ids.every((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id,
      ),
    );
  }).withMessage(t("error.default.mustUUID", { m: "permissions" })),
  body().custom((value) => {
    const ids: string[] = Array.isArray(value) ? value : value?.permissions;
    return Array.isArray(ids) && new Set(ids).size === ids.length;
  }).withMessage(t("error.default.bad_request")),
];