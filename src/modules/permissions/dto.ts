import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const PERMISSION_SORT_FIELDS = [
  "name",
  "module",
  "createdAt",
  "updatedAt",
] as const;

export type PermissionSortField = (typeof PERMISSION_SORT_FIELDS)[number];
export type PermissionListQuery = In_DTO_ListQuery<PermissionSortField>;

export interface CreatePermissionDto {
  name: string;
  module: string;
  description?: string | null;
}

export type UpdatePermissionDto = Partial<CreatePermissionDto>;