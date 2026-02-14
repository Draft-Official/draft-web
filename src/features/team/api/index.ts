/**
 * Team Feature API - Barrel Export
 *
 * 구조:
 * - keys.ts: 공유 React Query 키
 * - mapper.ts: 공유 DB→Client 매퍼
 * - team-info/: 팀 CRUD (생성, 수정, 삭제, 조회)
 * - membership/: 팀원 관리 (가입, 탈퇴, 역할 변경)
 * - match/: 팀 운동 및 투표
 */

// Shared
export * from './keys';
export * from './mapper';

// Team info
export * from './team-info';

// Team membership
export * from './membership';

// Team match & voting
export * from './match';
