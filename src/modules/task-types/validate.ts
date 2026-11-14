import { body, param } from "express-validator";
import { TASK_TYPE_SORT_FIELDS } from "./dto";
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

const iconValidation = (optional = false) => {
  const validation = body("icon");
  if (optional) validation.optional({ nullable: true });
  return validation
    .isString()
    .withMessage(mustText("icon"))
    .bail()
    .isLength({ max: 50 })
    .withMessage(maxLength("icon", 50));
};

export const taskTypeListValidation = listQueryValidation(TASK_TYPE_SORT_FIELDS);

export const taskTypeIdValidation = [
  param("id").isUUID().withMessage(mustUUID("id")),
];

export const taskTypeCreateValidation = [
  nameValidation(),
  iconValidation(true),
];

export const taskTypeUpdateValidation = [
  nameValidation(true),
  iconValidation(true),
  atLeastOneOf(
    ["name", "icon"],
    t("error.default.required", { m: "name atau icon" }),
  ),
];