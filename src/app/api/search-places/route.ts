import { NextRequest, NextResponse } from 'next/server';

interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance: string;
}

interface KakaoSearchResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword || !keyword.trim()) {
    return NextResponse.json(
      { error: 'Keyword parameter is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    console.error('[Server] Kakao API Key is missing');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const encodedKeyword = encodeURIComponent(keyword);
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodedKeyword}&size=15`,
      {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Kakao API returned ${response.status}`);
    }

    const data: KakaoSearchResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Server] Failed to search places:', error);
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    );
  }
}
