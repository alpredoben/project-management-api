import { BaseAuditEntity } from "../../database/entities";
import { In_DTO_ListQuery } from "../../interfaces/dto.interface";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";

export const USER_SORT_FIELDS = [
  "id",
  "name",
  "email",
  "phone",
  "is_active",
  "created_at",
  "updated_at",
] as const;

export const USER_UPDATABLE_FIELDS = ["name", "email", "phone"] as const;

export type T_UserSortField = (typeof USER_SORT_FIELDS)[number];
export type T_Audit = Partial<BaseAuditEntity>;

/** Query list user yang sudah dinormalisasi (lihat `parseListQuery`). */
export type In_DTO_UserListQuery = In_DTO_ListQuery<T_UserSortField>;

export interface In_DTO_CreateUser {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  role_ids?: string[];
}

export interface In_DTO_UpdateUser {
  name?: string | null;
  email?: string;
  phone?: string | null;
}

export interface In_DTO_UserRole {
  id: string;
  name: string;
  slug: string | null;
}

export interface In_DTO_UserListItem {
  no: number;
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  is_active: boolean;
  status: "active" | "not active";
  roles: In_DTO_UserRole[];
  created_at: Date;
  updated_at: Date;
}

/** Hasil query detail user: `avatar` berisi object path di MinIO. */
export interface In_DTO_UserRecord extends Omit<In_DTO_UserListItem, "no"> {
  avatar: string | null;
}

/** Response detail user: `avatar_url` adalah presigned URL dari `avatar`. */
export interface In_DTO_UserDetails extends In_DTO_UserRecord {
  avatar_url: string | null;
}

export interface In_DTO_UserListResult {
  data: In_DTO_UserListItem[];
  meta: In_API_AttributMeta;
}

/** Baris export Excel; seluruh kolom sudah berupa teks yang aman untuk spreadsheet. */
export interface In_DTO_UserExportRow {
  no: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  roles: string;
}
