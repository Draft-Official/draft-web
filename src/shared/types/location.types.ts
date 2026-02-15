/**
 * Kakao Map에서 가져온 장소 정보
 * Gym 조회 및 location 표시에 사용
 */
export interface LocationData {
  address: string;
  buildingName?: string;
  bname?: string;
  placeUrl?: string;
  x?: string;
  y?: string;
  kakaoPlaceId?: string;
}
