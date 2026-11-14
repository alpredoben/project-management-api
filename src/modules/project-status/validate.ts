import { body, param } from "express-validator";
import { PROJECT_STATUS_SORT_FIELDS } from "./dto";
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
    .isLength({ max: 100 })
    .withMessage(maxLength("name", 100));
};

const colorCodeValidation = (optional = false) => {
  const validation = body("color_code");
  if (optional) validation.optional();
  return validation
    .isString()
    .withMessage(t("error.default.invalidFormat", { m: "color_code" }))
    .bail()
    .matches(/^#[0-9a-fA-F]{6}$/)
    .withMessage(t("error.default.invalidFormat", { m: "color_code" }));
};

const sequenceOrderValidation = (optional = false) => {
  const validation = body("sequence_order");
  if (optional) validation.optional();
  return validation
    .isInt({ min: 0 })
    .withMessage(t("error.default.minValue", { m: "sequence_order", min: "0" }))
    .toInt();
};

export const projectStatusListValidation = listQueryValidation(
  PROJECT_STATUS_SORT_FIELDS,
);

export const projectStatusIdValidation = [
  param("id").isUUID().withMessage(mustUUID("id")),
];

export const projectStatusCreateValidation = [
  nameValidation(),
  colorCodeValidation(true),
  sequenceOrderValidation(true),
];

export const projectStatusUpdateValidation = [
  nameValidation(true),
  colorCodeValidation(true),
  sequenceOrderValidation(true),
  atLeastOneOf(
    ["name", "color_code", "sequence_order"],
    t("error.default.required", {
      m: "name, color_code, atau sequence_order",
    }),
  ),
];