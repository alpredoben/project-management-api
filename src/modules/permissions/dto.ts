import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const PERMISSION_SORT_FIELDS = [
  "name",
  "module",
  "created_at",
  "updated_at",
] as const;

export type PermissionSortField = (typeof PERMISSION_SORT_FIELDS)[number];
export type PermissionListQuery = In_DTO_ListQuery<PermissionSortField>;

