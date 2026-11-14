import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const TASK_STATUS_SORT_FIELDS = [
  "name",
  "color_code",
  "sequence_order",
  "is_closed",
  "created_at",
  "updated_at",
] as const;

export type TaskStatusSortField = (typeof TASK_STATUS_SORT_FIELDS)[number];
export type TaskStatusListQuery = In_DTO_ListQuery<TaskStatusSortField>;