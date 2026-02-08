## REMOVED Requirements

### Requirement: 매치 생성 시 준비물 입력

**Reason**: MVP 범위 축소로 준비물 기능 비활성화
**Migration**: 기존 데이터는 DB에 보존, UI에서만 제거

#### Scenario: 준비물 입력 필드 제거
- **WHEN** 호스트가 매치 생성 페이지에 접근
- **THEN** 실내화/유니폼 체크박스가 표시되지 않음

#### Scenario: 새 매치 생성 시 빈 배열 저장
- **WHEN** 호스트가 새 매치를 생성
- **THEN** `requirements` 필드는 빈 배열 `[]`로 저장됨

---

### Requirement: 매치 상세에서 준비물 표시

**Reason**: 입력을 받지 않으므로 표시도 불필요
**Migration**: 기존 매치의 준비물 데이터는 DB에 유지

#### Scenario: 준비물 섹션 미표시
- **WHEN** 사용자가 매치 상세 페이지를 조회
- **THEN** 준비물 정보가 UI에 표시되지 않음

---

### Requirement: 최근 매치 프리필에서 준비물 제외

**Reason**: 준비물 입력 UI가 없으므로 프리필도 불필요
**Migration**: 없음

#### Scenario: 프리필 시 준비물 무시
- **WHEN** 호스트가 최근 매치 기반으로 새 매치 생성
- **THEN** 준비물 관련 상태가 설정되지 않음
