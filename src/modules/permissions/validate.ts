import { body, param } from "express-validator";
import { PERMISSION_SORT_FIELDS } from "./dto";
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

const moduleValidation = (optional = false) => {
  const validation = body("module");
  if (optional) validation.optional();
  else validation.exists().withMessage(required("module")).bail();
  return validation
    .isString()
    .withMessage(mustText("module"))
    .bail()
    .trim()
    .notEmpty()
    .withMessage(required("module"))
    .isLength({ max: 50 })
    .withMessage(maxLength("module", 50));
};

const descriptionValidation = () =>
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage(mustText("description"));

export const permissionListValidation = listQueryValidation(
  PERMISSION_SORT_FIELDS,
);

export const permissionIdValidation = [
  param("id").isUUID().withMessage(mustUUID("id")),
];

export const permissionCreateValidation = [
  nameValidation(),
  moduleValidation(),
  descriptionValidation(),
];

export const permissionUpdateValidation = [
  nameValidation(true),
  moduleValidation(true),
  descriptionValidation(),
  atLeastOneOf(
    ["name", "module", "description"],
    t("error.default.required", { m: "name, module, atau description" }),
  ),
];