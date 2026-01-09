import { z } from 'zod';

/**
 * Match Create Form Validation Schema
 * 매치 개설 폼 검증 스키마
 */

export const matchCreateSchema = z.object({
  // 날짜 및 시간
  selectedDate: z.string().min(1, '경기 날짜를 선택해주세요'),

  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식을 입력해주세요 (예: 14:00)'),

  duration: z.string().min(1, '경기 시간을 선택해주세요'),

  // 장소
  location: z.string().min(2, '장소명은 최소 2자 이상이어야 합니다')
    .max(100, '장소명은 100자를 초과할 수 없습니다'),
  
  locationData: z.object({
    address: z.string(),
    buildingName: z.string().optional(),
    bname: z.string().optional(),
    placeUrl: z.string().optional(),
  }).nullable().refine((val) => val !== null, {
    message: '장소를 검색하여 선택해주세요',
  }),

  // 가격
  price: z.string().refine((val) => {
    const num = parseInt(val.replace(/,/g, ''), 10);
    return !isNaN(num) && num >= 0;
  }, {
    message: '올바른 금액을 입력해주세요',
  }).refine((val) => {
    const num = parseInt(val.replace(/,/g, ''), 10);
    return num <= 1000000;
  }, {
    message: '참가비는 100만원을 초과할 수 없습니다',
  }),

  // 호스트 유형
  hostType: z.string().min(1, '호스트 유형을 선택해주세요'),

  // 포지션
  positions: z.object({
    guard: z.number().int().min(0).max(10),
    forward: z.number().int().min(0).max(10),
    center: z.number().int().min(0).max(10),
    bigman: z.number().int().min(0).max(10),
  }).refine((positions) => {
    const total = positions.guard + positions.forward + positions.center + positions.bigman;
    return total > 0;
  }, {
    message: '최소 1명 이상의 포지션을 선택해주세요',
    path: ['guard'], // 에러 표시 위치
  }).refine((positions) => {
    const total = positions.guard + positions.forward + positions.center + positions.bigman;
    return total <= 20;
  }, {
    message: '최대 20명까지 모집할 수 있습니다',
    path: ['guard'],
  }),

  isFlexBigman: z.boolean(),

  // 관리 정보 (선택)
  bankName: z.string().max(50, '은행명은 50자를 초과할 수 없습니다').optional(),
  accountNumber: z.string().max(50, '계좌번호는 50자를 초과할 수 없습니다').optional(),
  contactInfo: z.string().max(100, '연락처는 100자를 초과할 수 없습니다').optional(),

  // 경기 스펙
  matchType: z.enum(['5vs5', '3vs3']),

  gender: z.enum(['남성', '혼성', '여성']),

  level: z.enum(['초보(C)', '중수(B)', '고수(A)']),

  facilities: z.array(z.string()).default([]),

  // 공지사항 (선택)
  announcements: z.string().max(1000, '공지사항은 1000자를 초과할 수 없습니다').optional(),
});

export type MatchCreateFormData = z.infer<typeof matchCreateSchema>;
