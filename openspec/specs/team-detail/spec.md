## ADDED Requirements

### Requirement: Non-member sees limited team information
The system SHALL display limited information to non-members viewing a team detail page.

#### Scenario: Non-member views team detail
- **WHEN** non-member navigates to `/team/[code]`
- **THEN** system displays team name, logo, and short introduction
- **AND** system displays region information
- **AND** system does NOT display detailed team info (meeting time, members list, schedule)

#### Scenario: Member sees full information
- **WHEN** team member navigates to `/team/[code]`
- **THEN** system displays all team information
- **AND** system displays all three tabs (홈, 일정, 멤버)

### Requirement: Non-member header shows join button
The system SHALL display a join button instead of settings buttons for non-members.

#### Scenario: Display join button for non-member
- **WHEN** non-member views team detail header
- **THEN** "팀 가입 신청" button is displayed
- **AND** "팀 설정" and "..." buttons are NOT displayed

#### Scenario: Display settings for member
- **WHEN** team member views team detail header
- **THEN** "팀 설정" and "..." buttons are displayed
- **AND** "팀 가입 신청" button is NOT displayed

### Requirement: Non-member tabs are restricted
The system SHALL restrict tab access for non-members.

#### Scenario: Non-member tab restriction
- **WHEN** non-member views team detail page
- **THEN** only 홈 tab is visible
- **AND** 일정 and 멤버 tabs are hidden or disabled

#### Scenario: Member tabs are accessible
- **WHEN** team member views team detail page
- **THEN** all three tabs (홈, 일정, 멤버) are visible and accessible
