import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const PROJECT_TYPE_SORT_FIELDS = [
  "name",
  "created_at",
  "updated_at",
] as const;

export type ProjectTypeSortField = (typeof PROJECT_TYPE_SORT_FIELDS)[number];
export type ProjectTypeListQuery = In_DTO_ListQuery<ProjectTypeSortField>;