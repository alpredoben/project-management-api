import { BaseAuditEntity } from "../../database/entities";
import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

/** Kolom yang dikembalikan API; seluruhnya juga boleh dipakai sebagai `sort_by`. */
export const TASK_TYPE_COLUMNS = [
  "id",
  "type_name",
  "sort_order",
  "created_at",
  "updated_at",
] as const;

/** Field yang boleh dikirim client saat create/update. */
export const TASK_TYPE_FIELDS = ["type_name", "sort_order"] as const;

export type T_TaskTypeSortField = (typeof TASK_TYPE_COLUMNS)[number];
export type T_Audit = Partial<BaseAuditEntity>;
export type In_DTO_TaskTypeListQuery = In_DTO_ListQuery<T_TaskTypeSortField>;

export interface In_DTO_CreateTaskType {
  type_name: string;
  sort_order: number;
}

export type In_DTO_UpdateTaskType = Partial<In_DTO_CreateTaskType>;

export interface In_DTO_TaskType extends In_DTO_CreateTaskType {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface In_DTO_TaskTypeListItem extends In_DTO_TaskType {
  no: number;
}

export interface In_DTO_TaskTypeConflict {
  name_taken: boolean;
  sort_order_taken: boolean;
}
