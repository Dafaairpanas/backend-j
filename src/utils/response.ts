import type { ApiResponse, PaginationMeta } from '../models/types';

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: PaginationMeta
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  code?: string
): ApiResponse<null> {
  return {
    success: false,
    error: {
      message,
      code,
    },
  };
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): ApiResponse<T[]> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_previous: page > 1,
    },
  };
}
