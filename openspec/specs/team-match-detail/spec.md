## ADDED Requirements

### Requirement: Team match detail page exists
The system SHALL provide a team match detail page at `/team/[code]/matches/[matchId]`.

#### Scenario: Team member views detail
- **WHEN** team member navigates to `/team/[code]/matches/[matchId]`
- **THEN** system displays match information (date, time, location)
- **AND** system displays voting status summary
- **AND** system displays voter list

#### Scenario: Non-member denied access
- **WHEN** non-team-member navigates to `/team/[code]/matches/[matchId]`
- **THEN** system displays access denied or redirects to team detail

### Requirement: Voting status summary displayed
The system SHALL display a summary card showing vote counts.

#### Scenario: Display vote counts
- **WHEN** team match detail page loads
- **THEN** system displays count for each status: 참석, 늦참, 불참, 미응답
- **AND** system displays total member count

#### Scenario: Real-time update after vote
- **WHEN** any team member submits a vote
- **THEN** voting status summary updates without page refresh

### Requirement: Voter list displayed
The system SHALL display a list of all team members with their vote status.

#### Scenario: Display voter information
- **WHEN** team match detail page loads
- **THEN** system displays each member's avatar, nickname, and vote status
- **AND** system groups voters by status (참석/늦참/불참/미응답)

#### Scenario: Withdrawn member display
- **WHEN** a member who voted has left the team
- **THEN** system displays "알 수 없음" for nickname
- **AND** system preserves the vote record

### Requirement: Member can vote on team match
The system SHALL allow team members to submit their attendance vote.

#### Scenario: Submit vote before deadline
- **WHEN** member clicks vote button
- **AND** voting is not closed
- **THEN** system displays vote dialog with options: 참석, 늦참, 불참
- **AND** member can optionally add a reason

#### Scenario: Change vote before deadline
- **WHEN** member has already voted
- **AND** voting is not closed
- **THEN** member can change vote to different status
- **AND** system updates the vote record

#### Scenario: Vote blocked after deadline
- **WHEN** member attempts to vote
- **AND** voting is closed
- **THEN** system displays message that voting is closed
- **AND** vote button is disabled

#### Scenario: Vote cancellation not allowed
- **WHEN** member has voted
- **THEN** member cannot revert to "미응답" status
- **AND** member can only change to another vote status

### Requirement: Admin can close voting
The system SHALL allow Leader/Manager to close voting.

#### Scenario: Leader closes voting
- **WHEN** Leader clicks "투표 마감" button
- **THEN** system updates match status to CLOSED
- **AND** voting is no longer allowed for members

#### Scenario: Manager closes voting
- **WHEN** Manager clicks "투표 마감" button
- **THEN** system updates match status to CLOSED

#### Scenario: Member cannot close voting
- **WHEN** user with Member role views match detail
- **THEN** "투표 마감" button is not displayed

### Requirement: Leader can reopen voting
The system SHALL allow only Leader to reopen closed voting.

#### Scenario: Leader reopens voting
- **WHEN** Leader clicks "투표 재오픈" button on closed match
- **THEN** system updates match status back to RECRUITING
- **AND** members can vote again

#### Scenario: Manager cannot reopen voting
- **WHEN** Manager views closed match detail
- **THEN** "투표 재오픈" button is not displayed

### Requirement: Admin can change member votes after close
The system SHALL allow Leader/Manager to change member votes even after voting is closed.

#### Scenario: Leader changes member vote
- **WHEN** Leader selects a member from voter list
- **AND** clicks "투표 변경" for that member
- **THEN** system displays vote change dialog
- **AND** Leader can set new vote status for the member

#### Scenario: Manager changes member vote
- **WHEN** Manager selects a member from voter list
- **AND** voting is closed
- **THEN** Manager can change that member's vote status

#### Scenario: Member cannot change others' votes
- **WHEN** user with Member role views voter list
- **THEN** no option to change other members' votes is displayed
