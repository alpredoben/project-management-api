import { body, param } from "express-validator";
import {
  atLeastOneOf,
  listQueryValidation,
  mustUUID,
  required,
  t,
} from "../../shared/utils/validation.util";
import { WORKSPACE_MEMBER_SORT_FIELDS } from "./dto";

const uuidValidation = (
  field: "workspace_id" | "user_id",
  optional = false,
) => {
  const validation = body(field);
  if (optional) validation.optional();
  else validation.exists().withMessage(required(field)).bail();
  return validation.isUUID().withMessage(mustUUID(field));
};

const roleIdValidation = () =>
  body("role_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage(mustUUID("role_id"));

const joinedAtValidation = () =>
  body("joined_at")
    .optional()
    .isISO8601()
    .withMessage(t("error.default.invalidFormat", { m: "joined_at" }));

export const workspaceMemberListValidation = listQueryValidation(
  WORKSPACE_MEMBER_SORT_FIELDS,
);

export const workspaceMemberIdValidation = [
  param("id").isUUID().withMessage(mustUUID("id")),
];

export const workspaceMemberCreateValidation = [
  uuidValidation("workspace_id"),
  uuidValidation("user_id"),
  roleIdValidation(),
  joinedAtValidation(),
];

export const workspaceMemberUpdateValidation = [
  uuidValidation("workspace_id", true),
  uuidValidation("user_id", true),
  roleIdValidation(),
  joinedAtValidation(),
  atLeastOneOf(
    ["workspace_id", "user_id", "role_id", "joined_at"],
    t("error.default.required", {
      m: "workspace_id, user_id, role_id, atau joined_at",
    }),
  ),
];