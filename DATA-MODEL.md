# DATA-MODEL

The authoritative schema is:

```text
src/prisma/schema.prisma
```

## Core entities

### User

Stores account and profile data.

Key fields:

```text
id
name
email
password_hash
phone
role
is_organizer
```

The current `UserRole` enum contains `PARTICIPANT` and `ADMIN`; organizer and judge access are additionally represented through application relationships/flags.

### Session

Stores authenticated sessions:

```text
user_id
token_hash
expires_at
created_at
```

### Hackathon

Central event entity:

```text
title
description
phase
registration_start
registration_end
submission_deadline
judging_start
judging_end
min_team_size
max_team_size
organizer_id
```

A hackathon owns tracks, participants, judges, teams, projects, prizes and criteria.

### HackathonTrack

A track belongs to one hackathon:

```text
hackathon_id
name
```

Track names are unique within a hackathon.

### HackathonParticipant

Connects users to hackathons:

```text
user_id
hackathon_id
team_id
is_team_leader
```

`user_id + hackathon_id` is unique.

### Team

Represents a participant team:

```text
hackathon_id
name
invite_token
```

A team has participants and at most one project.

### HackathonJudge

Represents a judge invitation/relationship:

```text
user_id
hackathon_id
status
responded_at
```

Status:

```text
PENDING
ACCEPTED
REJECTED
```

### HackathonJudgeTrack

Many-to-many judge/track assignment:

```text
judge_id
track_id
```

The pair is the composite primary key.

### Project

Represents a team's submission:

```text
hackathon_id
team_id
track_id
title
description
repository_url
demo_url
status
submitted_at
```

Status:

```text
DRAFT
SUBMITTED
```

A team can have only one project.

### Prize

Stores hackathon prizes:

```text
hackathon_id
track_id
title
description
amount_usd
position
```

A null track means the prize is overall rather than track-specific.

### Criterion

Stores the judging rubric:

```text
hackathon_id
name
description
weight
position
```

Criterion names are unique within a hackathon.

### Review

Represents one judge reviewing one project:

```text
judge_id
project_id
comment
status
submitted_at
```

Status:

```text
DRAFT
SUBMITTED
```

`judge_id + project_id` is unique.

### ReviewScore

Stores one criterion score within a review:

```text
review_id
criterion_id
value
```

The score uses the five-point scale:

```text
1–5
```

`review_id + criterion_id` is the composite primary key.

### AuditLog

Stores application audit events:

```text
hackathon_id
actor_id
actor_name
action
entity_type
entity_id
meta
created_at
```

The schema comments define the log as append-oriented from application code.

### ElevationRequest

Stores access-elevation requests:

```text
user_id
status
created_at
updated_at
```

Status:

```text
PENDING
APPROVED
BLOCKED
```

### TeamJoinRequest

Stores team join requests:

```text
team_id
user_id
created_at
```

`team_id + user_id` is unique.

### Skill / UserSkill

`Skill` stores reusable skill names. `UserSkill` is the many-to-many join between users and skills.

## Relationships

| Relationship | Cardinality |
|---|---|
| User → Sessions | 1:N |
| User → Hackathon participation | 1:N |
| Hackathon → Participants | 1:N |
| Hackathon → Tracks | 1:N |
| Hackathon → Judges | 1:N |
| Judge → Tracks | N:M |
| Hackathon → Teams | 1:N |
| Team → Participants | 1:N |
| Team → Project | 1:1 |
| Hackathon → Projects | 1:N |
| Hackathon → Criteria | 1:N |
| Project → Reviews | 1:N |
| Review → Scores | 1:N |
| Criterion → Scores | 1:N |
| Hackathon → Prizes | 1:N |
| Hackathon → Audit logs | 1:N |

## Integrity rules

The schema/application enforce important uniqueness constraints for:

- user email;
- session token hash;
- user/hackathon participation;
- user/hackathon judge entry;
- judge/track assignment;
- team invite token;
- team name within a hackathon;
- project per team;
- criterion name within a hackathon;
- review per judge/project;
- score per review/criterion.

This structure makes judging ownership explicit and supports backend isolation.
