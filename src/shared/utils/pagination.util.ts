import { In_API_PaginationMeta } from "../../interfaces/responseApi.interface";

export interface In_PaginationQuery {
  page?: number | string;
  limit?: number | string;
}

export interface In_PaginationComposite {
  skip: number;
  take: number;
  currentPage: number;
  perPage: number;
}

export const getPageAndLimit = (
  query: In_PaginationQuery,
): { currentPage: number; perPage: number } => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));

  return {
    currentPage: page,
    perPage: limit,
  };
};

export const getPaginationParams = (
  query: In_PaginationQuery,
): In_PaginationComposite => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    currentPage: page,
    perPage: limit,
  };
};

export const generatePaginationMeta = (
  currentPage: number,
  perPage: number,
  totalItems: number,
): In_API_PaginationMeta => {
  const totalPages =
    totalItems > 0 && perPage > 0 ? Math.ceil(totalItems / perPage) : 1;

  return {
    current_page: currentPage,
    per_page: perPage,
    total_items: totalItems,
    total_pages: totalPages,
    has_next_page: currentPage < totalPages,
    has_previous_page: currentPage > 1,
  };
};
