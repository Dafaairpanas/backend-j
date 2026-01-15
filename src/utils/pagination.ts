import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants';

/**
 * Parse and validate pagination parameters
 */
export function parsePagination(page?: string | number, limit?: string | number) {
  let parsedPage = typeof page === 'string' ? parseInt(page, 10) : (page || 1);
  let parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : (limit || DEFAULT_PAGE_SIZE);

  // Ensure valid values
  if (isNaN(parsedPage) || parsedPage < 1) parsedPage = 1;
  if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = DEFAULT_PAGE_SIZE;
  if (parsedLimit > MAX_PAGE_SIZE) parsedLimit = MAX_PAGE_SIZE;

  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset,
  };
}

/**
 * Calculate pagination metadata from Supabase count
 */
export function getPaginationMeta(
  page: number,
  limit: number,
  total: number | null
) {
  const totalCount = total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    page,
    limit,
    total: totalCount,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_previous: page > 1,
  };
}
