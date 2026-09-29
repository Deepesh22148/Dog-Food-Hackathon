# DOGFOOD 2026 — Hackathon Submission & Judging Platform

An open-source, self-hostable hackathon submission and judging platform built for DOGFOOD 2026.

## What this repository provides

The application covers the main event lifecycle:

**Organizer creates an event → participants form teams → teams submit projects → organizers invite and assign judges → judges review projects → weighted scores are calculated → review data can be exported as CSV.**

The repository currently claims **T1 and T2** in `.dogfood.toml`.

## Acceptance status

The committed `acceptance-report.txt` records:

```text
T1  gallery is public ................. PASS
T1  project from fixtures shown ....... PASS
T1  closed event refuses submissions .. PASS
T2  judge sees own scores ............. PASS
T2  judge cannot see peer scores ...... PASS
T2  participant blocked ............... PASS
T2  csv export works .................. PASS

claimed T1 T2, verified T1 T2
```

The official checker verifies these seven HTTP behaviors. It does not independently test every item in the DOGFOOD T2 specification. In particular, this repository should **not** claim a separate cross-judge normalization algorithm unless one is added and documented.

## Tiers

### T1 — Core

- authentication and sessions;
- participant, organizer, judge and admin application areas;
- hackathon creation;
- configurable dates;
- tracks and prizes;
- team creation and invite-link joining;
- project draft and edit flow;
- server-side submission deadline enforcement;
- public project gallery;
- gallery search/filter support.

### T2 — Judging

- judge invitations;
- judge invitation acceptance/rejection;
- judge-to-track assignment;
- configurable weighted judging criteria;
- 1–5 criterion scoring;
- backend judge authorization;
- prevention of a judge reading another judge's scores;
- judge review submission;
- weighted leaderboard calculation;
- organizer CSV export.

The DOGFOOD brief also describes a live organizer judging-progress dashboard and cross-judge normalization as T2 requirements. The acceptance checker does not test those items, and the current code does not contain a separate normalization procedure. Documentation therefore treats those as gaps rather than inventing an implementation.

## Technology

- Next.js 16
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- Zod
- Tailwind CSS
- Docker Compose

## Documentation map

| File | Purpose |
|---|---|
| `README.md` | Project overview, setup, current status and limitations |
| `ARCHITECTURE.md` | System structure, request flow, authentication and service boundaries |
| `DATA-MODEL.md` | Prisma entities, relationships and integrity rules |
| `JUDGING.md` | Judge assignment, scoring, weighted calculation, isolation and normalization status |

## Repository layout

```text
.
├── .dogfood.toml
├── acceptance-report.txt
├── docker-compose.yml
├── fixtures.json
├── run.py
├── LICENSE
├── README.md
├── ARCHITECTURE.md
├── DATA-MODEL.md
├── JUDGING.md
└── src/
    ├── app/
    ├── components/
    ├── data/
    ├── lib/
    ├── prisma/
    ├── service/
    ├── Dockerfile
    └── package.json
```

## Run locally

```bash
docker compose up --build --no-cache
```

The application listens on:

```text
http://localhost:3000
```

For direct development from `src/`:

```bash
npm install
npm run dev
```

Other available scripts:

```bash
npm run build
npm run start
npm run lint
npm run seed
```

## DOGFOOD acceptance checker

Run:

```bash
python3 run.py .dogfood.toml > acceptance-report.txt
```

The checker reads `.dogfood.toml` and `fixtures.json` and performs the official HTTP checks.

## Current limitations

The repository does not claim T3 or T4.

Not currently claimed:

- community voting;
- comments;
- hidden voting-window results;
- randomized ballot ordering;
- voting abuse prevention;
- REST API/OpenAPI as a claimed T4 deliverable;
- certificates;
- signed judge records;
- embeddable gallery;
- bulk import/export.

For T2, judging, score isolation, weighted scoring and CSV export are implemented and the committed acceptance report verifies the tested T2 checks. A separate cross-judge normalization algorithm is not documented in the current implementation.

## Deployment note

The root Compose file references environment-file paths that should be reconciled with the supplied `src/.env.production` before a fresh clone is treated as fully one-command self-hostable.

## License

See `LICENSE`.
