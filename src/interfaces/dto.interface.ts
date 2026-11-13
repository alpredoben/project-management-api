import {
  In_API_AttributMeta,
} from "./responseApi.interface";



export interface  In_DTO_SmtpMailProperties {
  type: 'verify-email'|'reset-password'| 'invite-workspace';
  data: Record<string, any> | any
}


export interface In_DTO_Pagination {
  page?: number | 1;
  limit?: number | 10;
  sortBy: string;
  orderBy: "ASC" | "DESC";
  search: string | undefined;
}

export interface In_RESULT_Pagination {
  data: Record<string, string> | [] | any;
  meta: In_API_AttributMeta;
}

export type T_OrderDirection = "ASC" | "DESC";

export interface In_DTO_ListQuery<S extends string = string> {
  page: number;
  limit: number;
  sortBy: S;
  orderBy: T_OrderDirection;
  search: string;
}
