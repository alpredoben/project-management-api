import {
  In_API_AttributMeta,
  In_API_PaginationMeta,
} from "./responseApi.interface";

export interface In_DTO_Pagination {
  page?: number | 1;
  limit?: number | 10;
  sort_by: string;
  order_by: "ASC" | "DESC";
  search: string | undefined;
}

export interface In_RESULT_Pagination {
  data: Record<string, string> | [] | any;
  meta: In_API_AttributMeta;
}

export type T_OrderDirection = "ASC" | "DESC";

/** Query list yang sudah dinormalisasi; `S` adalah daftar field sort yang diizinkan. */
export interface In_DTO_ListQuery<S extends string = string> {
  page: number;
  limit: number;
  sort_by: S;
  order_by: T_OrderDirection;
  search: string;
}
