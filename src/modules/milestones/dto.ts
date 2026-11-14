import { Milestone } from "../../database/entities/milestone.entity";
import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const MILESTONE_SORT_FIELDS = [
  "project_id",
  "title",
  "due_date",
  "status",
  "created_at",
  "updated_at",
] as const;

export type MilestoneSortField = (typeof MILESTONE_SORT_FIELDS)[number];
export type MilestoneListQuery = In_DTO_ListQuery<MilestoneSortField>;
export type CreateMilestoneInput = Pick<
  Milestone,
  "project_id" | "title"
> &
  Partial<Milestone>;