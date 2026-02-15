import { AppError, ValidationError } from '@/shared/lib/errors';

export interface KakaoPlace {
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

export interface KakaoSearchResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export async function searchKakaoPlaces(keyword: string): Promise<KakaoSearchResponse> {
  if (!keyword || !keyword.trim()) {
    throw new ValidationError('Keyword parameter is required');
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    throw new AppError('Server configuration error', 'KAKAO_API_KEY_MISSING', 500);
  }

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
    throw new AppError(`Kakao API returned ${response.status}`, 'KAKAO_API_ERROR', 502);
  }

  return response.json();
}
