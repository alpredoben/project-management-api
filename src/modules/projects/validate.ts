import { body, param, query } from "express-validator";
import {
  atLeastOneOf,
  listQueryValidation,
  maxLength,
  mustText,
  mustUUID,
  required,
} from "../../shared/utils/validation.util";
import { PROJECT_FIELDS, PROJECT_SORT_FIELDS } from "./dto";

const projectCodeField = (isRequired: boolean) => {
  const chain = body("project_code");
  if (!isRequired) chain.optional();
  return chain
    .isString()
    .withMessage(mustText("Kode project"))
    .bail()
    .trim()
    .notEmpty()
    .withMessage(required("Kode project"))
    .bail()
    .isLength({ max: 50 })
    .withMessage(maxLength("kode project", 50));
};

const projectNameField = (isRequired: boolean) => {
  const chain = body("project_name");
  if (!isRequired) chain.optional();
  return chain
    .isString()
    .withMessage(mustText("Nama project"))
    .bail()
    .trim()
    .notEmpty()
    .withMessage(required("Nama project"))
    .bail()
    .isLength({ max: 200 })
    .withMessage(maxLength("nama project", 200));
};

const nullableUUIDField = (field: string, label: string) =>
  body(field)
    .optional({ nullable: true })
    .isUUID()
    .withMessage(mustUUID(label));

const optionalDateField = (field: string) =>
  body(field)
    .optional({ nullable: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage(`${field} harus menggunakan format tanggal YYYY-MM-DD.`)
    .bail()
    .toDate();

const optionalFields = [
  nullableUUIDField("project_type_id", "Tipe project"),
  nullableUUIDField("project_status_id", "Status project"),
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage(mustText("Deskripsi project")),
  nullableUUIDField("owner_id", "Owner project"),
  nullableUUIDField("parent_id", "Parent project"),
  body("max_contributors")
    .optional()
    .isInt({ min: 0 })
    .withMessage("max_contributors harus berupa bilangan bulat non-negatif.")
    .toInt(),
  optionalDateField("start_date"),
  optionalDateField("end_date"),
];

export const primaryKeyValidation = [
  param("id").isUUID().withMessage(mustUUID("ID project")),
];

export const createValidation = [
  projectCodeField(true),
  projectNameField(true),
  ...optionalFields,
];

export const updateValidation = [
  ...primaryKeyValidation,
  atLeastOneOf(PROJECT_FIELDS, "Minimal satu field project harus diubah."),
  projectCodeField(false),
  projectNameField(false),
  ...optionalFields,
];

export const queryListValidation = [
  ...listQueryValidation(PROJECT_SORT_FIELDS),
  query("project_type").optional().isUUID().withMessage(mustUUID("Tipe project")),
  query("project_status")
    .optional()
    .isUUID()
    .withMessage(mustUUID("Status project")),
];