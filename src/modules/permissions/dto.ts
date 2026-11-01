export const PERMISSION_SORT_FIELDS = [
  "id",
  "name",
  "slug",
  "created_at",
  "updated_at",
] as const;

export type T_PermissionSortField = (typeof PERMISSION_SORT_FIELDS)[number];

export interface In_DTO_PermissionListQuery {
  page?: number | string;
  limit?: number | string;
  sort_by?: T_PermissionSortField | string;
  order_by?: "ASC" | "DESC" | string;
  search?: string;
}

export const DEFAULT_SORT_COLUMN: Record<T_PermissionSortField, string> = {
  id: "permission.id",
  name: "permission.name",
  slug: "permission.slug",
  created_at: "permission.created_at",
  updated_at: "permission.updated_at",
};