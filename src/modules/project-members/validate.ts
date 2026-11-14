import { body, param } from "express-validator";
import {
  atLeastOneOf,
  listQueryValidation,
  mustUUID,
  required,
  t,
} from "../../shared/utils/validation.util";
import { PROJECT_MEMBER_SORT_FIELDS } from "./dto";

const uuidBodyValidation = (
  field: "project_id" | "user_id",
  optional = false,
) => {
  const validation = body(field);
  if (optional) validation.optional();
  else validation.exists().withMessage(required(field)).bail();
  return validation.isUUID().withMessage(mustUUID(field));
};

const positionIdValidation = () =>
  body("position_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage(mustUUID("position_id"));

export const projectMemberListValidation = listQueryValidation(
  PROJECT_MEMBER_SORT_FIELDS,
);

export const projectMemberIdValidation = [
  param("id").isUUID().withMessage(mustUUID("id")),
];

export const projectMemberCreateValidation = [
  uuidBodyValidation("project_id"),
  uuidBodyValidation("user_id"),
  positionIdValidation(),
];

export const projectMemberUpdateValidation = [
  uuidBodyValidation("project_id", true),
  uuidBodyValidation("user_id", true),
  positionIdValidation(),
  atLeastOneOf(
    ["project_id", "user_id", "position_id"],
    t("error.default.required", {
      m: "project_id, user_id, atau position_id",
    }),
  ),
];