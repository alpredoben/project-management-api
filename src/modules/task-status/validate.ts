import { body, param } from "express-validator";
import { TASK_STATUS_SORT_FIELDS } from "./dto";
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
    .withMessage(t("error.default.invalid_task_status_color"))
    .bail()
    .matches(/^#[0-9a-fA-F]{6}$/)
    .withMessage(t("error.default.invalid_task_status_color"));
};

const sequenceOrderValidation = (optional = false) => {
  const validation = body("sequence_order");
  if (optional) validation.optional();
  return validation
    .isInt({ min: 0 })
    .withMessage(t("error.default.invalid_task_status_sequence"))
    .toInt();
};

const isClosedValidation = (optional = false) => {
  const validation = body("is_closed");
  if (optional) validation.optional();
  return validation
    .isBoolean()
    .withMessage(t("error.default.invalid_task_status_closed"))
    .toBoolean();
};

export const taskStatusListValidation = listQueryValidation(
  TASK_STATUS_SORT_FIELDS,
);

export const taskStatusIdValidation = [
  param("id").isUUID().withMessage(mustUUID("id")),
];

export const taskStatusCreateValidation = [
  nameValidation(),
  colorCodeValidation(true),
  sequenceOrderValidation(true),
  isClosedValidation(true),
];

export const taskStatusUpdateValidation = [
  nameValidation(true),
  colorCodeValidation(true),
  sequenceOrderValidation(true),
  isClosedValidation(true),
  atLeastOneOf(
    ["name", "color_code", "sequence_order", "is_closed"],
    t("error.default.required", {
      m: "name, color_code, sequence_order, atau is_closed",
    }),
  ),
];