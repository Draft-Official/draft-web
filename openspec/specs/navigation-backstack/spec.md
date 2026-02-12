## ADDED Requirements

### Requirement: Safe back navigation with fallback
The system SHALL provide safe back navigation that falls back to a parent route when browser history is empty.

#### Scenario: Back navigation with history
- **WHEN** user clicks back button and browser history exists (history.state.idx > 0)
- **THEN** system navigates to previous page using browser back

#### Scenario: Back navigation without history (deep link)
- **WHEN** user clicks back button and browser history is empty (history.state.idx = 0)
- **THEN** system navigates to specified fallback route using router.replace
- **AND** fallback route does NOT add to browser history

#### Scenario: Deep link from external source
- **WHEN** user opens shared link from KakaoTalk to `/team/ABC/settings`
- **AND** clicks back button
- **THEN** system navigates to `/team/ABC` (parent route)
- **AND** does NOT navigate to external site

### Requirement: Team detail tab state in URL
The system SHALL persist team detail tab state in URL query parameters.

#### Scenario: Default tab (홈) has no query param
- **WHEN** user navigates to `/team/ABC`
- **THEN** system displays 홈 tab
- **AND** URL remains `/team/ABC` (no ?view= param)

#### Scenario: Schedule tab adds query param
- **WHEN** user clicks 일정 tab
- **THEN** system displays 일정 tab content
- **AND** URL changes to `/team/ABC?view=schedule`
- **AND** browser history is NOT modified (router.replace)

#### Scenario: Members tab adds query param
- **WHEN** user clicks 멤버 tab
- **THEN** system displays 멤버 tab content
- **AND** URL changes to `/team/ABC?view=members`

#### Scenario: Direct navigation to specific tab
- **WHEN** user opens shared link `/team/ABC?view=schedule`
- **THEN** system displays 일정 tab
- **AND** tab state persists on page refresh

#### Scenario: Invalid view param defaults to 홈
- **WHEN** user navigates to `/team/ABC?view=invalid`
- **THEN** system displays 홈 tab
- **AND** URL remains unchanged

### Requirement: Smart bottom navigation behavior
The system SHALL implement smart bottom navigation that handles same-tab clicks intelligently.

#### Scenario: Same tab click scrolls to top
- **WHEN** user is on `/team` page
- **AND** clicks 팀 icon in bottom nav
- **THEN** page scrolls to top with smooth animation
- **AND** browser history is NOT modified

#### Scenario: Different tab click navigates normally
- **WHEN** user is on `/my` page
- **AND** clicks 팀 icon in bottom nav
- **THEN** system navigates to `/team`
- **AND** adds entry to browser history

#### Scenario: Sub-page to parent navigation
- **WHEN** user is on `/team/ABC/settings` page
- **AND** clicks 팀 icon in bottom nav
- **THEN** system navigates to `/team`
- **AND** adds entry to browser history

### Requirement: Share team with tab state
The system SHALL allow sharing team detail page with current tab state.

#### Scenario: Share with Web Share API
- **WHEN** user clicks share button on team detail page
- **AND** browser supports Web Share API
- **THEN** system opens native share sheet with URL including current tab state
- **AND** shared URL includes ?view= param if not on 홈 tab

#### Scenario: Share with clipboard fallback
- **WHEN** user clicks share button
- **AND** browser does NOT support Web Share API
- **THEN** system copies URL to clipboard
- **AND** displays toast notification "링크가 복사되었습니다"

#### Scenario: Share from 일정 tab
- **WHEN** user is on 일정 tab
- **AND** clicks share button
- **THEN** shared URL is `/team/ABC?view=schedule`

#### Scenario: Share from 홈 tab
- **WHEN** user is on 홈 tab
- **AND** clicks share button
- **THEN** shared URL is `/team/ABC` (no query param)

### Requirement: Non-member tab restriction with URL state
The system SHALL restrict non-member access to protected tabs even when URL query param is present.

#### Scenario: Non-member accesses restricted tab via URL
- **WHEN** non-member navigates to `/team/ABC?view=schedule`
- **THEN** system displays 홈 tab content
- **AND** 일정 tab is NOT visible in tab list
- **AND** URL query param is ignored

#### Scenario: Non-member tab validation
- **WHEN** non-member navigates to `/team/ABC?view=members`
- **THEN** system displays 홈 tab content
- **AND** does NOT throw error or redirect
