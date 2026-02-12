## MODIFIED Requirements

### Requirement: Non-member tabs are restricted
The system SHALL restrict tab access for non-members and ignore URL query parameters for restricted tabs.

#### Scenario: Non-member tab restriction
- **WHEN** non-member views team detail page
- **THEN** only 홈 tab is visible
- **AND** 일정 and 멤버 tabs are hidden or disabled

#### Scenario: Member tabs are accessible
- **WHEN** team member views team detail page
- **THEN** all three tabs (홈, 일정, 멤버) are visible and accessible

#### Scenario: Non-member attempts to access restricted tab via URL
- **WHEN** non-member navigates to `/team/[code]?view=schedule` or `/team/[code]?view=members`
- **THEN** system displays 홈 tab content
- **AND** restricted tabs remain hidden
- **AND** URL query param is ignored for access control

## ADDED Requirements

### Requirement: Team detail tabs sync with URL
The system SHALL synchronize team detail tab state with URL query parameters for members.

#### Scenario: Default tab has clean URL
- **WHEN** member views team detail page without query param
- **THEN** 홈 tab is active
- **AND** URL is `/team/[code]` (no query param)

#### Scenario: Tab change updates URL
- **WHEN** member clicks 일정 or 멤버 tab
- **THEN** URL updates to `/team/[code]?view=schedule` or `/team/[code]?view=members`
- **AND** browser history is replaced (not added)

#### Scenario: URL query param selects tab on load
- **WHEN** member navigates to `/team/[code]?view=schedule`
- **THEN** 일정 tab is pre-selected and displayed

#### Scenario: Refresh preserves tab state
- **WHEN** member is on 일정 tab at `/team/[code]?view=schedule`
- **AND** refreshes the page
- **THEN** 일정 tab remains active after reload
