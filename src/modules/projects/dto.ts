import { BaseAuditEntity } from "../../database/entities";
import { In_DTO_ListQuery } from "../../interfaces/dto.interface";

export const PROJECT_SORT_FIELDS = [
  "id",
  "project_code",
  "project_name",
  "max_contributors",
  "start_date",
  "end_date",
  "created_at",
  "updated_at",
] as const;

export const PROJECT_FIELDS = [
  "project_type_id",
  "project_status_id",
  "project_code",
  "project_name",
  "description",
  "owner_id",
  "parent_id",
  "max_contributors",
  "start_date",
  "end_date",
] as const;

export const PROJECT_COLUMNS = [
  "id",
  ...PROJECT_FIELDS,
  "created_at",
  "updated_at",
] as const;

export type T_ProjectSortField = (typeof PROJECT_SORT_FIELDS)[number];
export type T_Audit = Partial<BaseAuditEntity>;
export interface In_DTO_ProjectListQuery extends In_DTO_ListQuery<T_ProjectSortField> {
  project_type_id?: string;
  project_status_id?: string;
}

export interface In_DTO_CreateProject {
  project_type_id?: string | null;
  project_status_id?: string | null;
  project_code: string;
  project_name: string;
  description?: string | null;
  owner_id?: string | null;
  parent_id?: string | null;
  max_contributors?: number;
  start_date?: Date | null;
  end_date?: Date | null;
}

export type In_DTO_UpdateProject = Partial<In_DTO_CreateProject>;

export interface In_DTO_Project extends In_DTO_CreateProject {
  id: string;
  max_contributors: number;
  created_at: Date;
  updated_at: Date;
}

export interface In_DTO_ProjectListItem extends In_DTO_Project {
  no: number;
}
