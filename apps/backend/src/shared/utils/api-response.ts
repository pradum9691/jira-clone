import { Response } from 'express';

/**
 * Standardized success response shape (matches PROJECT_PLAN.md §15):
 *
 * {
 *   "success": true,
 *   "data": ...,
 *   "pagination": { ... },   // only present for paginated list endpoints
 *   "message": "..."
 * }
 *
 * Error responses use the same `success` flag and are produced by
 * the global error handler (middlewares/error-handler.middleware.ts):
 *
 * {
 *   "success": false,
 *   "message": "...",
 *   "errors": []
 * }
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SendResponseOptions<T> {
  statusCode?: number;
  data?: T;
  message?: string;
  pagination?: PaginationMeta;
}

export function sendResponse<T>(res: Response, options: SendResponseOptions<T> = {}): Response {
  const { statusCode = 200, data = null, message = 'Success', pagination } = options;

  const body: Record<string, unknown> = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    body.pagination = pagination;
  }

  return res.status(statusCode).json(body);
}

/**
 * Builds a pagination meta object from raw query/result numbers.
 * Use together with sendResponse() for list endpoints.
 */
export function buildPagination(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
