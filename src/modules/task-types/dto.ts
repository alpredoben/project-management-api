import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const TASK_TYPE_SORT_FIELDS = [
  "name",
  "icon",
  "created_at",
  "updated_at",
] as const;

export type TaskTypeSortField = (typeof TASK_TYPE_SORT_FIELDS)[number];
export type TaskTypeListQuery = In_DTO_ListQuery<TaskTypeSortField>;