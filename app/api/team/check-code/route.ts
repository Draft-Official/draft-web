import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';

/**
 * GET /api/team/check-code?code=xxx
 * 팀 코드 중복 체크
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'code is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { count, error } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('code', code);

    if (error) {
      console.error('[API] Team code check error:', error);
      return NextResponse.json(
        { error: 'Failed to check team code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      available: (count ?? 0) === 0,
      code
    });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
