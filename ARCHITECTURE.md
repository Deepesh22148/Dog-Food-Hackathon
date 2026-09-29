# ARCHITECTURE

## 1. System overview

The platform is a full-stack Next.js application backed by PostgreSQL through Prisma.

```text
Browser
  ↓
Next.js / React UI
  ↓
Next.js API routes
  ↓
Service layer
  ↓
Prisma Client
  ↓
PostgreSQL
```

Authentication is session based. Protected API routes resolve the current user and then apply authorization before invoking business services.

## 2. Application areas

The application separates the main user experiences into:

```text
/participant
/organizer
/judge
/admin
/projects
```

The UI is not the authoritative security boundary. Backend route and service checks enforce access.

## 3. API layer

API route handlers are under:

```text
src/app/api/
```

Important routes include:

```text
/api/login-user
/api/register-user
/api/projects
/api/user/create-project
/api/user/hackathon/[hackathon_id]/submit-project
/api/user/hackathon/[hackathon_id]/leaderboard
/api/user/judge-invitation-reply
/api/judge/scores
/api/judge/submit-review
/api/organizer/hackathon/create
/api/organizer/hackathon/invite-judge
/api/organizer/hackathon/export-csv
```

Routes authenticate requests and delegate business operations to the service layer.

## 4. Authentication

The application uses a session cookie:

```text
session_token
```

The persisted `Session` record stores a hash of the token.

Request flow:

```text
session_token
      ↓
getCurrentUser()
      ↓
Session lookup
      ↓
Authenticated User
```

Missing or expired sessions are rejected by protected endpoints.

## 5. Authorization

Authorization is performed on the backend.

Examples:

- organizer endpoints require organizer ownership/access;
- judge endpoints require an accepted judge entry;
- participant endpoints verify participation/team relationships;
- score retrieval is restricted to the authenticated judge.

## 6. Judge isolation

`GET /api/judge/scores` checks the authenticated user.

If a `judge` query parameter is supplied, it must match the authenticated user's ID. A judge therefore cannot change the parameter to retrieve another judge's score set.

The DOGFOOD acceptance checker tests this directly and the committed report records PASS.

## 7. Project lifecycle

Projects have two persistence states:

```text
DRAFT
SUBMITTED
```

Lifecycle:

```text
Create → DRAFT → Edit → Submit → SUBMITTED
```

Submission is checked server-side against the hackathon deadline.

The public gallery exposes submitted projects rather than drafts.

## 8. Judging flow

```text
Organizer
  ↓
Invite Judge
  ↓
PENDING
  ↓
Accept
  ↓
ACCEPTED
  ↓
Assign Track
  ↓
Judge Eligible Projects
  ↓
Create/Submit Review
  ↓
Scores Persisted
  ↓
Weighted Leaderboard / CSV
```

## 9. Leaderboard calculation

For submitted reviews, the service:

1. loads configured criteria;
2. collects submitted project reviews;
3. calculates criterion averages;
4. applies criterion weights;
5. calculates a final weighted score;
6. sorts descending;
7. assigns competition ranks.

Equal scores can therefore produce:

```text
1, 2, 2, 4
```

## 10. CSV export

Organizer export is:

```text
GET /api/organizer/hackathon/export-csv
```

The route first restricts the selected hackathon to the authenticated organizer and then exports review-score data.

## 11. Persistence

PostgreSQL stores users, sessions, hackathons, tracks, participants, teams, judge relationships, projects, prizes, criteria, reviews, scores and audit records.

The Prisma schema is the authoritative database model.

## 12. Docker

The root Compose file defines:

```text
postgres → migrate → seed → nextjs
```

The database health check gates migration. Seed and application startup depend on migration completion.

Environment-file paths in the current Compose file should be reconciled before claiming a completely fresh-clone, one-command deployment.

## 13. Architecture boundary

The current system implements weighted aggregation. It does **not** contain a separate cross-judge normalization pipeline. Weighted averaging and normalization are therefore documented as separate concepts.
