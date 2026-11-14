import { body, param } from "express-validator";
import { PROJECT_TYPE_SORT_FIELDS } from "./dto";
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

const descriptionValidation = () =>
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage(mustText("description"));

export const projectTypeListValidation = listQueryValidation(
  PROJECT_TYPE_SORT_FIELDS,
);

export const projectTypeIdValidation = [
  param("id").isUUID().withMessage(mustUUID("id")),
];

export const projectTypeCreateValidation = [
  nameValidation(),
  descriptionValidation(),
];

export const projectTypeUpdateValidation = [
  nameValidation(true),
  descriptionValidation(),
  atLeastOneOf(
    ["name", "description"],
    t("error.default.required", { m: "name atau description" }),
  ),
];