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
