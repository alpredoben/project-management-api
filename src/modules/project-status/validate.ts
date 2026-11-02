import { body, param } from "express-validator";
import {
  atLeastOneOf,
  listQueryValidation,
  maxLength,
  mustText,
  mustUUID,
  required,
} from "../../shared/utils/validation.util";
import { PROJECT_STATUS_FIELDS, PROJECT_STATUS_SORT_FIELDS } from "./dto";

const STATUS_NAME_MAX = 100;

export const projectStatusIdValidation = [
  param("id").isUUID().withMessage(mustUUID("ID status project")),
];

const statusNameField = (isRequired: boolean) => {
  const chain = body("status_name");
  if (!isRequired) chain.optional();
  return chain
    .isString()
    .withMessage(mustText("Nama status project"))
    .bail()
    .trim()
    .notEmpty()
    .withMessage(required("Nama status project"))
    .bail()
    .isLength({ max: STATUS_NAME_MAX })
    .withMessage(maxLength("nama status project", STATUS_NAME_MAX));
};

const sortOrderField = (isRequired: boolean) => {
  const chain = body("sort_order");
  if (!isRequired) chain.optional();
  return chain
    .isInt({ min: 0 })
    .withMessage("sort_order harus berupa bilangan bulat non-negatif.")
    .toInt();
};

export const createProjectStatusValidation = [
  statusNameField(true),
  sortOrderField(true),
];

export const updateProjectStatusValidation = [
  ...projectStatusIdValidation,
  atLeastOneOf(
    PROJECT_STATUS_FIELDS,
    "Minimal satu field status project harus diubah.",
  ),
  statusNameField(false),
  sortOrderField(false),
];

export const projectStatusListValidation = listQueryValidation(
  PROJECT_STATUS_SORT_FIELDS,
);
