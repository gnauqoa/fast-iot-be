import { IPaginationOptions } from './types/pagination-options';
import { InfinityPaginationResponseDto } from './dto/infinity-pagination-response.dto';

export const infinityPagination = <T>(
  data: T[],
  options: IPaginationOptions,
): InfinityPaginationResponseDto<T> => {
  return {
    data,
    count: data.length,
    total: data.length,
    pageCount: Math.ceil(data.length / options.limit),
  };
};

/**
 * Creates a paginated result object
 * @param data - The array of items
 * @param total - Total count of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Paginated result object
 */
export const createPaginatedResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) => {
  return {
    data,
    count: data.length,
    total,
    page,
    pageCount: Math.ceil(total / limit),
  };
};
