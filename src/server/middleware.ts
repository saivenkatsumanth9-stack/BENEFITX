import type { ApiResponse } from './types';

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(code: string, message: string, details?: string): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  };
}

export function validateSchemeExists(schemeId: string, schemes: Array<{ id: string }>): boolean {
  return schemes.some(s => s.id === schemeId);
}
