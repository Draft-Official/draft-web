/**
 * 주소에서 지역 정보 파싱
 * 예: "서울특별시 강남구 대치동" → { depth1: "서울", depth2: "강남구" }
 */

import { REGIONS, type RegionKey } from '@/shared/config/region-constants';

export interface ParsedRegion {
  depth1: string | null;
  depth2: string | null;
}

/**
 * 광역시/도 이름 정규화
 * "서울특별시" → "서울", "경기도" → "경기" 등
 */
const REGION_NORMALIZATION: Record<string, RegionKey> = {
  서울특별시: '서울',
  서울시: '서울',
  서울: '서울',
  경기도: '경기',
  경기: '경기',
  인천광역시: '인천',
  인천시: '인천',
  인천: '인천',
  강원도: '강원',
  강원특별자치도: '강원',
  강원: '강원',
  대전광역시: '대전',
  대전시: '대전',
  대전: '대전',
  세종특별자치시: '세종',
  세종시: '세종',
  세종: '세종',
  충청남도: '충남',
  충남: '충남',
  충청북도: '충북',
  충북: '충북',
  부산광역시: '부산',
  부산시: '부산',
  부산: '부산',
  울산광역시: '울산',
  울산시: '울산',
  울산: '울산',
  경상남도: '경남',
  경남: '경남',
  경상북도: '경북',
  경북: '경북',
  대구광역시: '대구',
  대구시: '대구',
  대구: '대구',
  광주광역시: '광주',
  광주시: '광주',
  광주: '광주',
  전라남도: '전남',
  전남: '전남',
  전라북도: '전북',
  전북특별자치도: '전북',
  전북: '전북',
  제주특별자치도: '제주',
  제주도: '제주',
  제주: '제주',
};

/**
 * 주소 문자열에서 지역 정보 파싱
 */
export function parseRegionFromAddress(address: string): ParsedRegion {
  if (!address) {
    return { depth1: null, depth2: null };
  }

  // 공백으로 분리
  const parts = address.trim().split(/\s+/);
  if (parts.length < 2) {
    return { depth1: null, depth2: null };
  }

  // 1. 첫 번째 부분에서 시/도 찾기
  const firstPart = parts[0];
  const depth1 = REGION_NORMALIZATION[firstPart] || null;

  if (!depth1) {
    return { depth1: null, depth2: null };
  }

  // 2. 두 번째 부분에서 구/군/시 찾기
  const secondPart = parts[1];
  const validDistricts = REGIONS[depth1] as readonly string[];

  // 정확히 일치하는 경우
  if (validDistricts.includes(secondPart)) {
    return { depth1, depth2: secondPart };
  }

  // 부분 일치 시도 (예: "고양시덕양구" → "고양시")
  const matchedDistrict = validDistricts.find(
    (district) => secondPart.startsWith(district) || district.startsWith(secondPart.replace(/구$|군$|시$/, ''))
  );

  return {
    depth1,
    depth2: matchedDistrict || null,
  };
}
