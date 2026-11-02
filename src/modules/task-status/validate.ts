import { body, param } from "express-validator";
import {
  atLeastOneOf,
  listQueryValidation,
  maxLength,
  mustText,
  mustUUID,
  required,
} from "../../shared/utils/validation.util";
import { TASK_STATUS_FIELDS, TASK_STATUS_SORT_FIELDS } from "./dto";

const STATUS_NAME_MAX = 100;

export const primaryKeyValidation = [
  param("id").isUUID().withMessage(mustUUID("ID status task")),
];

const statusNameField = (isRequired: boolean) => {
  const chain = body("status_name");
  if (!isRequired) chain.optional();
  return chain
    .isString()
    .withMessage(mustText("Nama status task"))
    .bail()
    .trim()
    .notEmpty()
    .withMessage(required("Nama status task"))
    .bail()
    .isLength({ max: STATUS_NAME_MAX })
    .withMessage(maxLength("nama status task", STATUS_NAME_MAX));
};

const sortOrderField = (isRequired: boolean) => {
  const chain = body("sort_order");
  if (!isRequired) chain.optional();
  return chain
    .isInt({ min: 0 })
    .withMessage("sort_order harus berupa bilangan bulat non-negatif.")
    .toInt();
};

export const createValidation = [statusNameField(true), sortOrderField(true)];

export const updateValidation = [
  ...primaryKeyValidation,
  atLeastOneOf(
    TASK_STATUS_FIELDS,
    "Minimal satu field status task harus diubah.",
  ),
  statusNameField(false),
  sortOrderField(false),
];

export const queryListValidation = listQueryValidation(TASK_STATUS_SORT_FIELDS);
