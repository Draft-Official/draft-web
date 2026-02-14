import { z } from 'zod';
import { PLAY_STYLE_VALUES, REFEREE_TYPE_VALUES, COURT_SIZE_VALUES, MATCH_FORMAT_VALUES } from '@/shared/config/match-constants';

// Location schema - Kakao API를 통해 선택된 장소 (모든 필드 필수)
export const locationSchema = z.object({
  name: z.string().min(1, '장소명을 입력하세요'),
  address: z.string().min(1, '주소를 입력하세요'),
  latitude: z.number(),
  longitude: z.number(),
  kakaoPlaceId: z.string().min(1, '장소를 선택하세요'), // 카카오맵 place_id (필수)
});

// Position recruitment schema
export const positionRecruitmentSchema = z.object({
  type: z.literal('position'),
  guard: z.number().min(0).max(10),
  forward: z.number().min(0).max(10),
  center: z.number().min(0).max(10),
  bigman: z.number().min(0).max(10).default(0), // 빅맨 통합 시 사용
  isFlexBigman: z.boolean(),
});

// Any recruitment schema
export const anyRecruitmentSchema = z.object({
  type: z.literal('any'),
  count: z.number().min(1, '최소 1명 이상 모집해야 합니다').max(20, '최대 20명까지 모집 가능합니다'),
});

// Recruitment schema (union of position and any)
export const recruitmentSchema = z.union([
  positionRecruitmentSchema,
  anyRecruitmentSchema,
]);

// Facilities schema - Phase 2 compatible (JSONB style, Gym에 귀속)
export const facilitiesSchema = z.object({
  parking: z.string().regex(/^\d*$/, '주차비는 숫자만 입력 가능합니다').optional(), // 주차비 (양의 정수 문자열, "0"=무료, ""=없음)
  parkingDetail: z.string().optional(), // 주차 상세 (예: "3시간 무료")
  water: z.boolean().default(false),    // 정수기
  acHeat: z.boolean().default(false),   // 냉난방
  shower: z.boolean().default(false),     // 샤워실
  courtSize: z.enum(COURT_SIZE_VALUES).optional(), // 선택사항 - default 제거
  ball: z.boolean().default(false),     // 농구공 제공
  beverage: z.boolean().default(false), // 음료 제공
});

// Age range schema
// max가 null이면 "이상" (예: { min: 30, max: null } → "30대 이상")
export const ageRangeSchema = z.object({
  min: z.number().min(20, '최소 연령대는 20대입니다').max(50),
  max: z.number().min(20).max(50).nullable(), // null = "이상"
}).refine(
  (data: { min: number; max: number | null }) => data.max === null || data.max >= data.min,
  {
    message: '최대 연령대는 최소 연령대보다 크거나 같아야 합니다',
    path: ['max'],
  }
);

// Main match create form schema
export const matchCreateSchema = z.object({
  // Basic Info
  title: z.string()
    .min(1, '제목을 입력하세요')
    .max(100, '제목은 100자 이내로 입력하세요'),

  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다'),

  startTime: z.string()
    .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, '올바른 시간 형식이 아닙니다 (HH:mm)'),

  endTime: z.string()
    .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, '올바른 시간 형식이 아닙니다 (HH:mm)'),

  location: locationSchema,

  // Recruitment
  recruitment: recruitmentSchema,

  // Match Specs
  level: z.number().or(z.string()),
  levelMin: z.number().min(1).max(7).optional(), // 실력 범위 최소값
  levelMax: z.number().min(1).max(7).optional(), // 실력 범위 최대값

  // matchFormat: 5vs5, 3vs3
  matchFormat: z.enum(MATCH_FORMAT_VALUES, {
    message: '경기 인원을 선택하세요',
  }),

  ageRange: ageRangeSchema.optional(),

  gender: z.enum(['MALE', 'FEMALE', 'MIXED'], {
    message: '성별을 선택하세요',
  }),

  // Game Format
  // gameFormat: INTERNAL_2WAY, EXCHANGE, etc.
  gameFormat: z.enum(PLAY_STYLE_VALUES).optional(),

  // Optional detailed rules (gameFormat은 별도 필드로 관리, rules에 저장 시 포함)
  rules: z.object({
    quarterTime: z.number().min(1).max(20).optional(),
    quarterCount: z.number().min(1).max(10).optional(),
    fullGames: z.number().min(0).max(10).optional(),
    referee: z.enum(REFEREE_TYPE_VALUES).optional(), // 심판 유형
  }).optional(),

  // Bigman 옵션 (포지션 모집 시 센터/포워드 유동적 배치)
  isFlexBigman: z.boolean().default(false),

  // 준비물 (실내화, 흰/검 상의 등)
  requirements: z.array(z.string()).default([]),

  facilities: facilitiesSchema.optional(),

  // 참가비 타입 (현금/음료 구분)
  costInputType: z.enum(['money', 'beverage']).default('money'),

  // 참가비 (현금: 0 이상, 음료: 1 이상)
  fee: z.string()
    .regex(/^\d+$/, '참가비는 양의 정수만 입력 가능합니다')
    .optional(),

  // 연락처 타입 및 내용
  contactType: z.enum(['PHONE', 'KAKAO_OPEN_CHAT']).default('KAKAO_OPEN_CHAT'),
  contactContent: z.string().optional(),

  // 전화번호 (PHONE 선택 시 사용)
  phoneNumber: z.string()
    .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, '올바른 전화번호 형식으로 입력해주세요 (예: 010-1234-5678)')
    .optional(),

  // Admin Info
  price: z.number()
    .min(0, '가격은 0원 이상이어야 합니다')
    .max(1000000, '가격은 100만원 이하여야 합니다'),

  accountHolder: z.string()
    .min(1, '예금주를 입력하세요')
    .regex(/^[가-힣]{2,10}$/, '예금주는 한글 2-10자로 입력해주세요'),

  accountNumber: z.string()
    .min(1, '계좌번호를 입력하세요')
    .regex(/^\d{10,16}$/, '계좌번호는 숫자 10-16자리로 입력해주세요'),

  bank: z.string()
    .min(1, '은행을 선택하세요'),

  refundPolicy: z.string()
    .min(10, '환불 정책은 최소 10자 이상 입력하세요')
    .max(500, '환불 정책은 500자 이내로 입력하세요'),

  notice: z.string()
    .max(1000, '공지사항은 1000자 이내로 입력하세요')
    .optional(),

  // Team Info (V3)
  selectedTeamId: z.string().optional().nullable(),
  manualTeamName: z.string().optional(), // 개인 주최 시 필수 입력
}).refine(
  (data: any) => {
    // 개인 주최 시 (selectedTeamId가 없거나 'me'일 때) 팀이름 필수
    if (!data.selectedTeamId || data.selectedTeamId === 'me') {
      return data.manualTeamName && data.manualTeamName.trim().length > 0;
    }
    return true;
  },
  {
    message: '개인 주최 시 팀 이름을 입력해주세요',
    path: ['manualTeamName'],
  }
).refine(
  (data: any) => {
    // Validate that end time is after start time
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  },
  {
    message: '종료 시간은 시작 시간보다 늦어야 합니다',
    path: ['endTime'],
  }
).refine(
  (data: any) => {
    // Validate position recruitment totals
    if (data.recruitment.type === 'position') {
      const total = data.recruitment.guard + data.recruitment.forward + data.recruitment.center;
      return total > 0 && total <= 20;
    }
    return true;
  },
  {
    message: '포지션별 모집 인원의 합은 1명 이상 20명 이하여야 합니다',
    path: ['recruitment'],
  }
);

// Type inference
export type MatchCreateFormData = z.infer<typeof matchCreateSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type RecruitmentFormData = z.infer<typeof recruitmentSchema>;
export type FacilitiesFormData = z.infer<typeof facilitiesSchema>;
export type AgeRangeFormData = z.infer<typeof ageRangeSchema>;

// Partial schema for step-by-step validation
export const basicInfoSchema = matchCreateSchema.pick({
  title: true,
  date: true,
  startTime: true,
  endTime: true,
  location: true,
});

export const recruitmentStepSchema = matchCreateSchema.pick({
  recruitment: true,
});

export const matchSpecsSchema = matchCreateSchema.pick({
  level: true,
  ageRange: true,
  gender: true,
});

export const gameFormatSchema = matchCreateSchema.pick({
  gameFormat: true,
  matchFormat: true,
  facilities: true,
});

export const adminInfoSchema = matchCreateSchema.pick({
  price: true,
  accountHolder: true,
  accountNumber: true,
  bank: true,
  refundPolicy: true,
  notice: true,
});
