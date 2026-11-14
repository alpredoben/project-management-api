import { ProjectMember } from "../../database/entities/project_members.entity";
import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const PROJECT_MEMBER_SORT_FIELDS = [
  "project_id",
  "user_id",
  "position_id",
  "created_at",
  "updated_at",
] as const;

export type ProjectMemberSortField =
  (typeof PROJECT_MEMBER_SORT_FIELDS)[number];
export type ProjectMemberListQuery =
  In_DTO_ListQuery<ProjectMemberSortField>;
export type CreateProjectMemberInput = Pick<
  ProjectMember,
  "project_id" | "user_id"
> &
  Partial<ProjectMember>;