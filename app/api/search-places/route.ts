import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/shared/lib/errors';
import { searchKakaoPlaces } from '@/shared/server/kakao/search-places';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  try {
    const data = await searchKakaoPlaces(keyword ?? '');
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[Server] Failed to search places:', error);
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    );
  }
}
