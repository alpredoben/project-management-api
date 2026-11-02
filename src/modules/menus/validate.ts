import { body, param } from "express-validator";
import {
  listQueryValidation,
  maxLength,
  mustText,
  mustUUID,
  required,
} from "../../shared/utils/validation.util";
import { MENU_SORT_FIELDS } from "./dto";

type T_Presence = "required" | "optional" | "nullable";

export const menuIdValidation = [
  param("id").isUUID().withMessage(mustUUID("ID menu")),
];

/** Field teks; `nullable` boleh `null`/kosong dan disimpan sebagai `null`. */
const textField = (
  field: string,
  label: string,
  max: number,
  presence: T_Presence,
) => {
  const chain = body(field);
  if (presence === "optional") chain.optional();
  if (presence === "nullable") chain.optional({ values: "null" });
  chain.isString().withMessage(mustText(label)).bail().trim();
  if (presence !== "nullable") {
    chain.notEmpty().withMessage(required(label)).bail();
  }
  return chain
    .isLength({ max })
    .withMessage(maxLength(label.toLowerCase(), max))
    .customSanitizer((value: string) => value || null);
};

const parentIdField = () =>
  body("parent_id")
    .optional({ values: "null" })
    .isUUID()
    .withMessage(mustUUID("ID parent menu"));

const orderNumberField = () =>
  body("order_number")
    .optional()
    .isInt({ min: 0 })
    .withMessage("order_number harus berupa bilangan bulat non-negatif.")
    .toInt();

const menuFields = (presence: Exclude<T_Presence, "nullable">) => [
  textField("name", "Nama menu", 100, presence),
  textField("path", "Path menu", 255, presence),
  textField("icon", "Icon menu", 50, "nullable"),
  parentIdField(),
  orderNumberField(),
];

export const createMenuValidation = menuFields("required");

export const updateMenuValidation = [
  ...menuIdValidation,
  ...menuFields("optional"),
];

export const addRolePermissionMenuValidation = [
  body("role_id").isUUID().withMessage(mustUUID("ID role")),
  body("menu_id").isUUID().withMessage(mustUUID("ID menu")),
  body("permissions_ids")
    .isArray({ min: 1 })
    .withMessage(required("Daftar permission")),
  body("permissions_ids.*").isUUID().withMessage(mustUUID("ID permission")),
];

export const menuListValidation = listQueryValidation(MENU_SORT_FIELDS);
