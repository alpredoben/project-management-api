import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const ROLE_SORT_FIELDS = ["name", "slug", "created_at", "updated_at"] as const;

export type RoleSortField = (typeof ROLE_SORT_FIELDS)[number];
export type RoleListQuery = In_DTO_ListQuery<RoleSortField>;
