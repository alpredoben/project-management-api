import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const WORKSPACE_SORT_FIELDS = [
  "name",
  "slug",
  "logo_url",
  "created_at",
  "updated_at",
] as const;

export type WorkspaceSortField = (typeof WORKSPACE_SORT_FIELDS)[number];
export type WorkspaceListQuery = In_DTO_ListQuery<WorkspaceSortField>;