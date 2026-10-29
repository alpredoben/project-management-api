export interface In_DTO_Pagination {
  page?: number | 1;
  limit?: number | 10;
  sort_by: string;
  order_by: 'ASC' | 'DESC';
  search: string | undefined;
}