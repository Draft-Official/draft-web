## ADDED Requirements

### Requirement: Non-member can request to join team
The system SHALL allow non-members to submit a join request from the team detail page.

#### Scenario: Submit join request
- **WHEN** logged-in non-member views team detail page
- **AND** clicks "팀 가입 신청" button
- **THEN** system creates team_members record with status='PENDING'
- **AND** system displays confirmation message

#### Scenario: Anonymous user cannot join
- **WHEN** anonymous user views team detail page
- **THEN** system displays login prompt instead of join button

#### Scenario: Existing member sees member view
- **WHEN** existing team member views team detail page
- **THEN** "팀 가입 신청" button is not displayed
- **AND** full team information is shown

#### Scenario: Pending request shows status
- **WHEN** user with pending join request views team detail
- **THEN** system displays "승인 대기 중" status
- **AND** join button is disabled

### Requirement: Join request notifies team leader
The system SHALL notify the team leader when a new join request is submitted.

#### Scenario: Leader receives notification
- **WHEN** new join request is submitted
- **THEN** team Leader receives in-app notification
- **AND** notification links to pending members page

### Requirement: Duplicate join requests prevented
The system SHALL prevent duplicate join requests from the same user.

#### Scenario: Prevent duplicate request
- **WHEN** user has pending join request for team
- **AND** attempts to submit another request
- **THEN** system displays error message
- **AND** no new record is created
