import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const PROJECT_STATUS_SORT_FIELDS = [
  "name",
  "color_code",
  "sequence_order",
  "created_at",
  "updated_at",
] as const;

export type ProjectStatusSortField =
  (typeof PROJECT_STATUS_SORT_FIELDS)[number];
export type ProjectStatusListQuery =
  In_DTO_ListQuery<ProjectStatusSortField>;
