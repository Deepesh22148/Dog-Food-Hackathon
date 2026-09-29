# JUDGING

## 1. Judging scope

The current implementation covers:

- judge invitation;
- invitation acceptance/rejection;
- judge-track assignment;
- project eligibility;
- criterion-based scoring;
- review submission;
- backend score isolation;
- weighted leaderboard calculation;
- organizer CSV export.

The committed DOGFOOD acceptance report records the official T1/T2 checks as PASS.

## 2. Judge invitation

Organizer invites create a `HackathonJudge` record.

Initial state:

```text
PENDING
```

The invited user can accept or reject the invitation.

Final states:

```text
ACCEPTED
REJECTED
```

Only an accepted judge can use judge scoring endpoints.

## 3. Judge-track assignment

Judge eligibility is linked to tracks through:

```text
HackathonJudgeTrack
```

This allows judges to be restricted to assigned hackathon tracks.

## 4. Rubric

Each hackathon has configurable criteria containing:

```text
name
description
weight
position
```

The organizer flow validates rubric weights when creating the hackathon.

## 5. Scoring scale

Each criterion is scored from:

```text
1 to 5
```

`ReviewScore.value` stores the integer score.

## 6. Review lifecycle

A review has:

```text
DRAFT
SUBMITTED
```

states.

One review belongs to:

```text
one judge
one project
```

The database enforces uniqueness for:

```text
(judge_id, project_id)
```

## 7. Review submission

Endpoint:

```text
POST /api/judge/submit-review
```

The backend:

1. authenticates the user;
2. verifies an accepted judge entry;
3. delegates review validation/persistence to the judge service;
4. stores the review and criterion scores.

## 8. Judge score retrieval

Endpoint:

```text
GET /api/judge/scores
```

The route:

1. resolves the current user;
2. rejects unauthenticated requests;
3. requires an accepted judge entry;
4. rejects a `judge` query parameter referring to another user;
5. returns the authenticated judge's score data.

This is backend isolation rather than frontend-only hiding.

## 9. Weighted scoring

The leaderboard calculates criterion averages across submitted reviews.

Formula:

```text
Final Score =
    Σ (Criterion Average × Criterion Weight)
    -----------------------------------------
              Σ Criterion Weights
```

Example:

```text
A = 4.0 with weight 50
B = 3.0 with weight 30
C = 5.0 with weight 20

Final =
(4×50 + 3×30 + 5×20) / 100
= 3.90
```

The final score is rounded to two decimal places.

Projects are sorted by final score descending.

Competition ranking is used:

```text
1, 2, 2, 4
```

## 10. Missing reviews

Projects without submitted reviews are not assigned a leaderboard score.

For a criterion with no available score values, the current leaderboard implementation uses `0` as that criterion's average. This is an implementation detail that should be reconsidered if the judging model is extended.

## 11. CSV export

Endpoint:

```text
GET /api/organizer/hackathon/export-csv
```

The organizer must own the selected hackathon.

Export columns:

```text
project_title
team_name
track
judge_name
judge_email
review_status
criterion_name
criterion_weight
score
comment
submitted_at
```

The official acceptance checker confirms that the organizer receives a successful CSV response.

## 12. Peer-score isolation acceptance test

The official checker verifies:

```text
judge_a → own scores → 200
judge_b → judge_a's score URL → 401/403
participant → judge scores → 401/403
```

The committed acceptance report records all three as PASS.

## 13. Cross-judge normalization

The DOGFOOD specification asks for cross-judge normalization with a documented method.

The current implementation performs weighted score aggregation, but it does **not** contain a separate judge-level normalization algorithm.

Therefore:

```text
Weighted scoring: IMPLEMENTED
Separate cross-judge normalization: NOT IMPLEMENTED/DOCUMENTED
```

Do not describe the weighted average as z-score, min-max, percentile or other normalization.

## 14. Organizer progress

The application contains organizer dashboard pages, but the official acceptance checker does not verify a live judging-progress dashboard.

Therefore the existence of an organizer dashboard should not by itself be presented as proof that the full DOGFOOD T2 progress-dashboard requirement has been independently verified.

## 15. Audit trail

The schema includes an append-oriented `AuditLog` with:

```text
action
entity_type
entity_id
actor_id
actor_name
hackathon_id
meta
created_at
```

This provides the persistence model for recording judging and organizer actions.

## 16. T2 status

| Area | Status |
|---|---|
| Judge invitation | Implemented |
| Judge-track assignment | Implemented |
| Weighted rubric | Implemented |
| Judge review submission | Implemented |
| Own-score access | Acceptance PASS |
| Peer-score isolation | Acceptance PASS |
| Participant blocking | Acceptance PASS |
| Weighted leaderboard | Implemented |
| CSV export | Acceptance PASS |
| Separate cross-judge normalization | Not implemented/documented |
| Live progress dashboard | Not independently verified by checker |

The acceptance report is authoritative for the official automated checks.
