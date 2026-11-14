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
import { MILESTONE_SORT_FIELDS } from "./dto";

const projectIdValidation = (optional = false) => {
  const validation = body("project_id");
  if (optional) validation.optional();
  else validation.exists().withMessage(required("project_id")).bail();
  return validation.isUUID().withMessage(mustUUID("project_id"));
};

const titleValidation = (optional = false) => {
  const validation = body("title");
  if (optional) validation.optional();
  else validation.exists().withMessage(required("title")).bail();
  return validation
    .isString()
    .withMessage(mustText("title"))
    .bail()
    .trim()
    .notEmpty()
    .withMessage(required("title"))
    .bail()
    .isLength({ max: 150 })
    .withMessage(maxLength("title", 150));
};

const descriptionValidation = () =>
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage(mustText("description"));

const dueDateValidation = () =>
  body("dueDate")
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage(t("error.default.invalidFormat", { m: "dueDate" }))
    .bail()
    .isISO8601({ strict: true })
    .withMessage(t("error.default.invalidFormat", { m: "dueDate" }));

const statusValidation = () =>
  body("status")
    .optional()
    .isString()
    .withMessage(mustText("status"))
    .bail()
    .trim()
    .notEmpty()
    .withMessage(required("status"))
    .bail()
    .isLength({ max: 50 })
    .withMessage(maxLength("status", 50));

export const milestoneListValidation = listQueryValidation(
  MILESTONE_SORT_FIELDS,
);

export const milestoneIdValidation = [
  param("id").isUUID().withMessage(mustUUID("id")),
];

export const milestoneCreateValidation = [
  projectIdValidation(),
  titleValidation(),
  descriptionValidation(),
  dueDateValidation(),
  statusValidation(),
];

export const milestoneUpdateValidation = [
  projectIdValidation(true),
  titleValidation(true),
  descriptionValidation(),
  dueDateValidation(),
  statusValidation(),
  atLeastOneOf(
    ["project_id", "title", "description", "dueDate", "status"],
    t("error.default.required", {
      m: "project_id, title, description, dueDate, atau status",
    }),
  ),
];