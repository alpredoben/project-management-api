import { BaseAuditEntity } from "../../database/entities";
import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const PROJECT_STATUS_SORT_FIELDS = [
  "id",
  "status_name",
  "sort_order",
  "created_at",
  "updated_at",
] as const;

export const PROJECT_STATUS_FIELDS = ["status_name", "sort_order"] as const;

export type T_ProjectStatusSortField =
  (typeof PROJECT_STATUS_SORT_FIELDS)[number];
export type T_Audit = Partial<BaseAuditEntity>;
export type In_DTO_ProjectStatusListQuery =
  In_DTO_ListQuery<T_ProjectStatusSortField>;

export interface In_DTO_CreateProjectStatus {
  status_name: string;
  sort_order: number;
}

export type In_DTO_UpdateProjectStatus = Partial<In_DTO_CreateProjectStatus>;

export interface In_DTO_ProjectStatus extends In_DTO_CreateProjectStatus {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface In_DTO_ProjectStatusListItem extends In_DTO_ProjectStatus {
  no: number;
}
