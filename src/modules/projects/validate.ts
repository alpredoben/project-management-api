import { body, param } from "express-validator";
import {
  atLeastOneOf,
  listQueryValidation,
  maxLength,
  mustText,
  mustUUID,
  required,
  t,
} from "../../shared/utils/validation.util";
import { PROJECT_MILESTONE_SORT_FIELDS, PROJECT_SORT_FIELDS } from "./dto";

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
    .bail()
    .isLength({ max: 150 })
    .withMessage(maxLength("name", 150));
};

const keyValidation = (optional = false) => {
  const validation = body("key");
  if (optional) validation.optional();
  else validation.exists().withMessage(required("key")).bail();
  return validation
    .isString()
    .withMessage(mustText("key"))
    .bail()
    .trim()
    .notEmpty()
    .withMessage(required("key"))
    .bail()
    .isLength({ max: 20 })
    .withMessage(maxLength("key", 20));
};

const workspaceIdBodyValidation = (optional = false) => {
  const validation = body("workspace_id");
  if (optional) validation.optional();
  else validation.exists().withMessage(required("workspace_id")).bail();
  return validation.isUUID().withMessage(mustUUID("workspace_id"));
};

const nullableUuidBodyValidation = (
  field: "project_type_id" | "project_status_id",
) =>
  body(field)
    .optional({ nullable: true })
    .isUUID()
    .withMessage(mustUUID(field));

const descriptionValidation = () =>
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage(mustText("description"));

const dateValidation = (field: "start_date" | "end_date") =>
  body(field)
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage(t("error.default.invalidFormat", { m: field }))
    .bail()
    .isISO8601({ strict: true })
    .withMessage(t("error.default.invalidFormat", { m: field }));

const dateRangeValidation = body().custom((_value, { req }) => {
  const { start_date, end_date } = req.body ?? {};
  return !start_date || !end_date || end_date >= start_date;
}).withMessage(
  t("error.default.afterOrEqual", {
    m: "end_date",
    target: "start_date",
  }),
);

const nullableRequiredUuidValidation = (
  field: "project_type_id" | "project_status_id",
) =>
  body(field)
    .exists()
    .withMessage(required(field))
    .bail()
    .if((value) => value !== null)
    .isUUID()
    .withMessage(mustUUID(field));

export const projectListValidation = listQueryValidation(PROJECT_SORT_FIELDS);
export const projectMilestoneListValidation = listQueryValidation(
  PROJECT_MILESTONE_SORT_FIELDS,
);
export const projectIdValidation = [
  param("id").isUUID().withMessage(mustUUID("id")),
];

export const projectCreateValidation = [
  workspaceIdBodyValidation(),
  nullableUuidBodyValidation("project_type_id"),
  nullableUuidBodyValidation("project_status_id"),
  nameValidation(),
  keyValidation(),
  descriptionValidation(),
  dateValidation("start_date"),
  dateValidation("end_date"),
  dateRangeValidation,
];

export const projectUpdateValidation = [
  workspaceIdBodyValidation(true),
  nullableUuidBodyValidation("project_type_id"),
  nullableUuidBodyValidation("project_status_id"),
  nameValidation(true),
  keyValidation(true),
  descriptionValidation(),
  dateValidation("start_date"),
  dateValidation("end_date"),
  dateRangeValidation,
  atLeastOneOf(
    [
      "workspace_id",
      "project_type_id",
      "project_status_id",
      "name",
      "key",
      "description",
      "start_date",
      "end_date",
    ],
    t("error.default.required", {
      m: "workspace_id, project_type_id, project_status_id, name, key, description, start_date, atau end_date",
    }),
  ),
];

export const projectChangeStatusValidation = [
  nullableRequiredUuidValidation("project_status_id"),
];

export const projectChangeTypeValidation = [
  nullableRequiredUuidValidation("project_type_id"),
];