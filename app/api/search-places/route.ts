import { NextRequest } from 'next/server';
import { AppError } from '@/shared/lib/errors';
import { searchKakaoPlaces } from '@/shared/server/kakao/search-places';
import { appError, internalError, ok } from '@/shared/server/http/route-response';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  try {
    const data = await searchKakaoPlaces(keyword ?? '');
    return ok(data);
  } catch (error) {
    if (error instanceof AppError) {
      return appError(error);
    }
    return internalError('[Server] Failed to search places:', error, 'Failed to search places');
  }
}
