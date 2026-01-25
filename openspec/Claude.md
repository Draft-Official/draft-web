# Interface/Type 중복 생성 방지 가이드

## 🎯 핵심 규칙

**새로운 interface/type을 만들기 전에 반드시 검색하세요!**

```bash
# 타입명 검색
rg "interface TypeName|type TypeName" src/

# 키워드 검색 (예: Match 관련)
rg "interface.*Match|type.*Match" src/
```

## 📍 타입 위치 규칙

### Shared Types → `src/shared/types/`
- 2개 이상 feature에서 사용
- 도메인 공통 개념 (Gender, SkillLevel 등)
- Database schema 타입

```typescript
// src/shared/types/domain.ts
export type Gender = 'male' | 'female' | 'mixed';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
```

### Feature Types → `src/features/[name]/model/types.ts`
- 해당 feature에서만 사용
- UI state, form data

```typescript
// src/features/match-create/model/types.ts
export interface MatchCreateFormData {
  basicInfo: BasicInfoData;
  facilities: FacilitiesData;
}
```

### API Types → `src/features/[name]/api/types.ts`
- API request/response

```typescript
// src/features/match/api/types.ts
export interface CreateMatchRequest { ... }
export interface CreateMatchResponse { ... }
```

## ✅ 작업 순서

1. **검색** - 기존 타입 있는지 확인
2. **재사용** - 있으면 import 사용
3. **위치 결정** - 없으면 위 규칙에 따라 위치 선택
4. **생성** - 한 곳에만 정의
5. **검증** - 중복 없는지 재확인

## ❌ 하지 말 것

```typescript
// ❌ 같은 타입을 여러 파일에 정의
// File 1
export type Gender = 'male' | 'female';

// File 2
export type Gender = 'male' | 'female';

// ✅ 한 곳에만 정의하고 import
// src/shared/types/domain.ts
export type Gender = 'male' | 'female' | 'mixed';

// 다른 파일들
import { Gender } from '@/shared/types/domain';
```

## 🔍 빠른 참조

```bash
# 검색
rg "interface TypeName|type TypeName" src/

# 검증 (결과가 1개만 나와야 함)
rg "interface MyNewType" src/
```

**황금률**: "Create it once, import it everywhere"
