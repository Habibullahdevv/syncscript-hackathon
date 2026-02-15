import { NextResponse } from 'next/server';

/**
 * Standardized success response format
 * @param data - Response payload
 * @param status - HTTP status code (default: 200)
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
    },
    { status }
  );
}

/**
 * Error codes for API responses
 */
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'SERVER_ERROR';

/**
 * Standardized error response format
 * @param code - Error code
 * @param message - Human-readable error message
 * @param status - HTTP status code
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

/**
 * Map error codes to HTTP status codes
 */
export const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_INPUT: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};
