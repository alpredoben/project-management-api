import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const MENU_SORT_FIELDS = [
  "id",
  "name",
  "slug",
  "path",
  "order_number",
  "created_at",
  "updated_at",
] as const;

export const MENU_FIELDS = [
  "name",
  "path",
  "icon",
  "parent_id",
  "order_number",
] as const;

export type T_MenuSortField = (typeof MENU_SORT_FIELDS)[number];
export type In_DTO_MenuListQuery = In_DTO_ListQuery<T_MenuSortField>;

export interface In_DTO_CreateMenu {
  name: string;
  path: string;
  icon?: string | null;
  parent_id?: string | null;
  order_number?: number;
}

export type In_DTO_UpdateMenu = Partial<In_DTO_CreateMenu>;

export interface In_DTO_AddRolePermissionMenu {
  role_id: string;
  menu_id: string;
  permissions_ids: string[];
}
