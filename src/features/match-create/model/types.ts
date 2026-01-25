/**
 * Match Create Feature Types
 */

/**
 * Kakao Map에서 가져온 장소 정보
 * Gym 조회 및 location 표시에 사용
 */
export interface LocationData {
  address: string; // 도로명 주소 또는 지번 주소
  buildingName?: string; // 건물명 (예: "서초종합체육관")
  bname?: string; // 동 이름 (지역 필터링용)
  placeUrl?: string; // Kakao Map URL
  x?: string; // Longitude (경도)
  y?: string; // Latitude (위도)
  kakaoPlaceId?: string; // 카카오 place_id (Gym 중복 방지용)
}
