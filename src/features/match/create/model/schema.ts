import { z } from 'zod';

// Location schema - Phase 2 compatible
export const locationSchema = z.object({
  name: z.string().min(1, '장소명을 입력하세요'),
  address: z.string().min(1, '주소를 입력하세요'),
  latitude: z.number(),
  longitude: z.number(),
});

// Position recruitment schema
export const positionRecruitmentSchema = z.object({
  type: z.literal('position'),
  guard: z.number().min(0).max(10),
  forward: z.number().min(0).max(10),
  center: z.number().min(0).max(10),
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

// Facilities schema - Phase 2 compatible (JSONB style)
export const facilitiesSchema = z.object({
  parking: z.string().optional(),
  water: z.boolean().default(false),
  acHeat: z.boolean().default(false),
  shower: z.enum(['none', 'free', 'paid']).default('none'),
  courtSize: z.enum(['half', 'full']).default('full'),
});

// Age range schema
export const ageRangeSchema = z.object({
  min: z.number().min(10, '최소 연령은 10세 이상이어야 합니다').max(99),
  max: z.number().min(10).max(99, '최대 연령은 99세 이하여야 합니다'),
}).refine(
  (data) => data.max >= data.min,
  {
    message: '최대 연령은 최소 연령보다 크거나 같아야 합니다',
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
  level: z.enum(['beginner', 'intermediate', 'advanced', 'pro'], {
    message: '레벨을 선택하세요',
  }),

  ageRange: ageRangeSchema.optional(),

  gender: z.enum(['men', 'women', 'mixed'], {
    message: '성별을 선택하세요',
  }),

  // Game Format
  gameFormat: z.enum(['3vs3', '4vs4', '5vs5'], {
    message: '경기 형식을 선택하세요',
  }),

  matchType: z.enum(['game', 'scrimmage', 'practice'], {
    message: '경기 유형을 선택하세요',
  }),

  facilities: facilitiesSchema.optional(),

  // Admin Info
  price: z.number()
    .min(0, '가격은 0원 이상이어야 합니다')
    .max(1000000, '가격은 100만원 이하여야 합니다'),

  accountHolder: z.string()
    .min(1, '예금주를 입력하세요')
    .max(50, '예금주는 50자 이내로 입력하세요'),

  accountNumber: z.string()
    .min(1, '계좌번호를 입력하세요')
    .regex(/^[\d-]+$/, '계좌번호는 숫자와 하이픈(-)만 입력 가능합니다'),

  bank: z.string()
    .min(1, '은행을 선택하세요'),

  refundPolicy: z.string()
    .min(10, '환불 정책은 최소 10자 이상 입력하세요')
    .max(500, '환불 정책은 500자 이내로 입력하세요'),

  notice: z.string()
    .max(1000, '공지사항은 1000자 이내로 입력하세요')
    .optional(),
}).refine(
  (data) => {
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
  (data) => {
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
  matchType: true,
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
