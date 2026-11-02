import { BaseAuditEntity } from "../../database/entities";
import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

/** Kolom yang dikembalikan API; seluruhnya juga boleh dipakai sebagai `sort_by`. */
export const PROJECT_TYPE_COLUMNS = [
  "id",
  "type_name",
  "sort_order",
  "created_at",
  "updated_at",
] as const;

/** Field yang boleh dikirim client saat create/update. */
export const PROJECT_TYPE_FIELDS = ["type_name", "sort_order"] as const;

export type T_ProjectTypeSortField = (typeof PROJECT_TYPE_COLUMNS)[number];
export type T_Audit = Partial<BaseAuditEntity>;
export type In_DTO_ProjectTypeListQuery =
  In_DTO_ListQuery<T_ProjectTypeSortField>;

export interface In_DTO_CreateProjectType {
  type_name: string;
  sort_order: number;
}

export type In_DTO_UpdateProjectType = Partial<In_DTO_CreateProjectType>;

export interface In_DTO_ProjectType extends In_DTO_CreateProjectType {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface In_DTO_ProjectTypeListItem extends In_DTO_ProjectType {
  no: number;
}

export interface In_DTO_ProjectTypeConflict {
  name_taken: boolean;
  sort_order_taken: boolean;
}
