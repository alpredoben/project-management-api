export const MENU_SORT_FIELDS = [
  "id",
  "name",
  "slug",
  "path",
  "order_number",
  "created_at",
  "updated_at",
] as const;

export type T_MenuSortField = (typeof MENU_SORT_FIELDS)[number];

export interface In_DTO_MenuListQuery {
  page?: number | string;
  limit?: number | string;
  sort_by?: T_MenuSortField | string;
  order_by?: "ASC" | "DESC" | string;
  search?: string;
}

export interface In_DTO_AddRolePermissionMenu {
  role_id: string;
  menu_id: string;
  permissions_ids: string[];
}

export const DEFAULT_SORT_COLUMN: Record<T_MenuSortField, string> = {
  id: "menu.id",
  name: "menu.name",
  slug: "menu.slug",
  path: "menu.path",
  order_number: "menu.order_number",
  created_at: "menu.created_at",
  updated_at: "menu.updated_at",
};