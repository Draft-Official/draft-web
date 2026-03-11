import type { Metadata } from 'next';

export const SITE_BRAND_NAME = 'DRAFT Match';
export const DEFAULT_SITE_URL = 'https://draftmatch.kr';
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_BRAND_NAME}`;
export const SITE_DEFAULT_TITLE = `농구 게스트 모집·팀 운동 관리 | ${SITE_BRAND_NAME}`;
export const SITE_DEFAULT_DESCRIPTION =
  '지역·날짜·포지션 필터로 농구 경기를 찾고 신청하세요. 호스트는 모집글 작성부터 신청자 승인·입금 확인까지 한 번에 관리할 수 있습니다.';

function parseSiteUrl(rawSiteUrl: string) {
  try {
    return new URL(rawSiteUrl);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function getSiteUrl() {
  return parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL);
}

export function getMetadataBase() {
  return getSiteUrl();
}

function toAbsoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

interface IndexedMetadataInput {
  title: string;
  description: string;
  canonical: string;
}

export function createIndexedMetadata({
  title,
  description,
  canonical,
}: IndexedMetadataInput): Metadata {
  const fullTitle = `${title} | ${SITE_BRAND_NAME}`;
  const canonicalUrl = toAbsoluteUrl(canonical);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      siteName: SITE_BRAND_NAME,
      title: fullTitle,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
      description,
    },
  };
}
