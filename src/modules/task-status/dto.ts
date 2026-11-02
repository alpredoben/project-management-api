import { BaseAuditEntity } from "../../database/entities";
import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const TASK_STATUS_SORT_FIELDS = [
  "id",
  "status_name",
  "sort_order",
  "created_at",
  "updated_at",
] as const;

export const TASK_STATUS_FIELDS = ["status_name", "sort_order"] as const;

export type T_TaskStatusSortField = (typeof TASK_STATUS_SORT_FIELDS)[number];
export type T_Audit = Partial<BaseAuditEntity>;
export type In_DTO_TaskStatusListQuery =
  In_DTO_ListQuery<T_TaskStatusSortField>;

export interface In_DTO_CreateTaskStatus {
  status_name: string;
  sort_order: number;
}

export type In_DTO_UpdateTaskStatus = Partial<In_DTO_CreateTaskStatus>;

export interface In_DTO_TaskStatus extends In_DTO_CreateTaskStatus {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface In_DTO_TaskStatusListItem extends In_DTO_TaskStatus {
  no: number;
}
