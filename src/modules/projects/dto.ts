import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const PROJECT_SORT_FIELDS = [
  "name",
  "key",
  "workspace_id",
  "project_type_id",
  "project_status_id",
  "start_date",
  "end_date",
  "created_at",
  "updated_at",
] as const;

export type ProjectSortField = (typeof PROJECT_SORT_FIELDS)[number];
export type ProjectListQuery = In_DTO_ListQuery<ProjectSortField>;

export const PROJECT_MILESTONE_SORT_FIELDS = [
  "title",
  "due_date",
  "status",
  "created_at",
  "updated_at",
] as const;

export type ProjectMilestoneSortField =
  (typeof PROJECT_MILESTONE_SORT_FIELDS)[number];
export type ProjectMilestoneListQuery =
  In_DTO_ListQuery<ProjectMilestoneSortField>;