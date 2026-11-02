import { body, param } from "express-validator";
import {
  atLeastOneOf,
  listQueryValidation,
  maxLength,
  mustText,
  mustUUID,
  required,
} from "../../shared/utils/validation.util";
import { PROJECT_TYPE_COLUMNS, PROJECT_TYPE_FIELDS } from "./dto";

const TYPE_NAME_MAX = 100;

export const projectTypeIdValidation = [
  param("id").isUUID().withMessage(mustUUID("ID tipe project")),
];

const typeNameField = (isRequired: boolean) => {
  const chain = body("type_name");
  if (!isRequired) chain.optional();
  return chain
    .isString()
    .withMessage(mustText("Nama tipe project"))
    .bail()
    .trim()
    .notEmpty()
    .withMessage(required("Nama tipe project"))
    .bail()
    .isLength({ max: TYPE_NAME_MAX })
    .withMessage(maxLength("nama tipe project", TYPE_NAME_MAX));
};

const sortOrderField = (isRequired: boolean) => {
  const chain = body("sort_order");
  if (!isRequired) chain.optional();
  return chain
    .isInt({ min: 0 })
    .withMessage("sort_order harus berupa bilangan bulat non-negatif.")
    .toInt();
};

export const createProjectTypeValidation = [
  typeNameField(true),
  sortOrderField(true),
];

export const updateProjectTypeValidation = [
  ...projectTypeIdValidation,
  atLeastOneOf(
    PROJECT_TYPE_FIELDS,
    "Minimal satu field tipe project harus diubah.",
  ),
  typeNameField(false),
  sortOrderField(false),
];

export const projectTypeListValidation =
  listQueryValidation(PROJECT_TYPE_COLUMNS);
