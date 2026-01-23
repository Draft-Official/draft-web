import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';

/**
 * GET /api/gyms?kakaoPlaceId=xxx
 * 카카오 place_id로 기존 gym 조회
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kakaoPlaceId = searchParams.get('kakaoPlaceId');

  if (!kakaoPlaceId) {
    return NextResponse.json(
      { error: 'kakaoPlaceId is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data: gym, error } = await supabase
      .from('gyms')
      .select('id, name, address, facilities, kakao_place_id')
      .eq('kakao_place_id', kakaoPlaceId)
      .maybeSingle();

    if (error) {
      console.error('[API] Gym lookup error:', error);
      return NextResponse.json(
        { error: 'Failed to lookup gym' },
        { status: 500 }
      );
    }

    // gym이 없으면 null 반환 (신규 체육관)
    return NextResponse.json({ gym });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
