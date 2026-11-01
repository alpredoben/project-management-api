import { BaseAuditEntity } from "../../database/entities";

export const ROLE_SORT_FIELDS = [
  "id",
  "name",
  "slug",
  "created_at",
  "updated_at",
] as const;

export type T_RoleSortField = (typeof ROLE_SORT_FIELDS)[number];

export interface In_DTO_RoleListQuery {
  page?: number | string;
  limit?: number | string;
  sort_by?: T_RoleSortField | string;
  order_by?: "ASC" | "DESC" | string;
  search?: string;
}

export const DEFAULT_SORT_COLUMN: Record<T_RoleSortField, string> = {
  id: "role.id",
  name: "role.name",
  slug: "role.slug",
  created_at: "role.created_at",
  updated_at: "role.updated_at",
};

export interface In_DTO_Assignment {
  role_id: string;
  permissions_ids: string[];
}
