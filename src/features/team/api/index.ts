/**
 * Team Feature API - Barrel Export
 *
 * 구조:
 * - keys.ts: 공유 React Query 키
 * - mapper.ts: 공유 DB→Client 매퍼
 * - core/: 팀 CRUD (생성, 수정, 삭제, 조회)
 * - membership/: 팀원 관리 (가입, 탈퇴, 역할 변경)
 * - match/: 팀 운동 및 투표
 * - fees/: 회비 관리
 */

// Shared
export * from './keys';
export * from './mapper';

// Core team
export * from './core';

// Team membership
export * from './membership';

// Team match & voting
export * from './match';

// Team fees
export * from './fees';
