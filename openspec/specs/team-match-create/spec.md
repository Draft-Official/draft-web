## ADDED Requirements

### Requirement: Team match creation page exists
The system SHALL provide a team match creation page at `/team/[code]/match/create`.

#### Scenario: Leader accesses create page
- **WHEN** user with Leader role navigates to `/team/[code]/match/create`
- **THEN** system displays the team match creation form

#### Scenario: Manager accesses create page
- **WHEN** user with Manager role navigates to `/team/[code]/match/create`
- **THEN** system displays the team match creation form

#### Scenario: Member denied access
- **WHEN** user with Member role navigates to `/team/[code]/match/create`
- **THEN** system displays access denied message or redirects to team detail

#### Scenario: Non-member denied access
- **WHEN** user who is not a team member navigates to `/team/[code]/match/create`
- **THEN** system displays access denied message or redirects to team detail

### Requirement: Form auto-fills team defaults
The system SHALL auto-fill the creation form with team's regular schedule information.

#### Scenario: Auto-fill regular day
- **WHEN** team has regularDay set to "TUE"
- **THEN** form pre-selects the next Tuesday as the match date

#### Scenario: Auto-fill time range
- **WHEN** team has regularStartTime "20:00" and regularEndTime "22:00"
- **THEN** form pre-fills start time as "20:00" and end time as "22:00"

#### Scenario: Auto-fill home gym
- **WHEN** team has homeGymId set
- **THEN** form pre-selects the home gym as the location

#### Scenario: No defaults available
- **WHEN** team has no regular schedule configured
- **THEN** form displays empty fields for user input

### Requirement: Match creation saves to database
The system SHALL create a match record with match_type='TEAM_MATCH' and team_id set.

#### Scenario: Successful creation
- **WHEN** user submits valid form data
- **THEN** system creates match in database with status='RECRUITING', match_type='TEAM_MATCH'
- **AND** system creates PENDING vote applications for all team members
- **AND** system redirects to team match detail page

#### Scenario: Validation failure
- **WHEN** user submits form without required fields (date, time, location)
- **THEN** system displays validation errors
- **AND** system does not create match

### Requirement: Votes created for all members on match creation
The system SHALL create application records for all team members when a team match is created.

#### Scenario: Applications created for members
- **WHEN** team match is created
- **AND** team has 10 members
- **THEN** system creates 10 application records with source='TEAM_VOTE' and status='PENDING'

#### Scenario: New member joins after creation
- **WHEN** new member is approved to join team
- **AND** there are upcoming team matches
- **THEN** system creates PENDING vote applications for the new member for all upcoming matches
