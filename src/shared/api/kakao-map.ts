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

interface KakaoSearchResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
    same_name: {
      region: string[];
      keyword: string;
      selected_region: string;
    };
  };
}

export const searchPlaces = async (keyword: string): Promise<KakaoPlace[]> => {
  if (!keyword.trim()) return [];

  const apiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

  if (!apiKey) {
    console.error('Kakao API Key is missing');
    return [];
  }

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&size=15`,
      {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Kakao API request failed');
    }

    const data: KakaoSearchResponse = await response.json();
    return data.documents;
  } catch (error) {
    console.error('Failed to search places:', error);
    return [];
  }
};
