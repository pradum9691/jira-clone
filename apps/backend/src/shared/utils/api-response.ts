import { Response } from 'express';


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

 
export function buildPagination(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
