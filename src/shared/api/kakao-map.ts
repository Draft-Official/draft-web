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

  try {
    // Call server-side API route instead of Kakao API directly
    const response = await fetch(
      `/api/search-places?keyword=${encodeURIComponent(keyword)}`
    );

    if (!response.ok) {
      throw new Error('Failed to search places');
    }

    const data: KakaoSearchResponse = await response.json();
    return data.documents;
  } catch (error) {
    console.error('[Client] Failed to search places:', error);
    return [];
  }
};
