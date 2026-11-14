import { body, param } from "express-validator";
import { createSlug } from "../../shared/utils/helper";
import { WORKSPACE_SORT_FIELDS } from "./dto";
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
    .bail()
    .isLength({ max: 150 })
    .withMessage(maxLength("name", 150))
    .bail()
    .custom((name: string) => Boolean(createSlug(name)))
    .withMessage(t("error.default.invalid_workspace_name"));
};

const logoUrlValidation = () =>
  body("logo_url")
    .optional({ nullable: true })
    .isString()
    .withMessage(mustText("logo_url"));

export const workspaceListValidation = listQueryValidation(
  WORKSPACE_SORT_FIELDS,
);

export const workspaceIdValidation = [
  param("id").isUUID().withMessage(mustUUID("id")),
];

export const workspaceMembersListValidation = listQueryValidation([
  "workspace_id",
  "user_id",
  "position_id",
  "joined_at",
  "created_at",
  "updated_at",
]);

export const workspaceAddMembersValidation = [
  body("user_ids")
    .exists()
    .withMessage(required("user_ids"))
    .bail()
    .isArray({ min: 1 })
    .withMessage(t("error.default.minArray", { m: "user_ids", min: "1" })),
  body("user_ids.*").isUUID().withMessage(mustUUID("user_ids")),
];

export const workspaceCreateValidation = [
  nameValidation(),
  logoUrlValidation(),
];

export const workspaceUpdateValidation = [
  nameValidation(true),
  logoUrlValidation(),
  atLeastOneOf(
    ["name", "logo_url"],
    t("error.default.required", { m: "name atau logo_url" }),
  ),
];