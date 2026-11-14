import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const WORKSPACE_MEMBER_SORT_FIELDS = [
  "workspace_id",
  "user_id",
  "position_id",
  "joined_at",
  "created_at",
  "updated_at",
] as const;

export type WorkspaceMemberSortField =
  (typeof WORKSPACE_MEMBER_SORT_FIELDS)[number];
export type WorkspaceMemberListQuery =
  In_DTO_ListQuery<WorkspaceMemberSortField>;