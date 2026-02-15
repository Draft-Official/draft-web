import { NextResponse } from 'next/server';
import { AppError } from '@/shared/lib/errors';

export interface ApiErrorBody {
  error: string;
  code: string;
}

export function ok<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

export function apiError(message: string, status: number, code: string) {
  return NextResponse.json<ApiErrorBody>(
    { error: message, code },
    { status }
  );
}

export function unauthorized(message: string = '로그인이 필요합니다.') {
  return apiError(message, 401, 'AUTH_REQUIRED');
}

export function appError(error: AppError) {
  return apiError(error.message, error.statusCode, error.code);
}

export function internalError(context: string, error: unknown, message: string) {
  console.error(context, error);
  return apiError(message, 500, 'INTERNAL_ERROR');
}
