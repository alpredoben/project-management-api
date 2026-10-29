export interface In_API_ErrorFormat {
  field?: string;
  message: string;
}

export interface In_API_PaginationMeta {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}


// Success Response Interface
export interface In_RESPONSE_Success{
  success: boolean;
  message: string;
  data: object | Record<string, any> | any;
  timestamp: string;
}

// Error Response Interface
export interface In_RESPONSE_Error {
  success: boolean;
  message: string;
  errors?: In_API_ErrorFormat[];
  timestamp: string;
}

// Pagination Response
export interface In_RESPONSE_Pagination {
  success: boolean;
  message: string;
  data: Record<string, any>[];
  timestamp: string;
  meta: {
    pagination: In_API_PaginationMeta;
    total_rows?: number | 0;
  };
}





