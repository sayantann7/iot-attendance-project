# Copilot / AI Agent Instructions — attendance-system-backend

These notes help an AI agent contribute code changes quickly and safely. They are intentionally focused on concrete, discoverable patterns in this repository.

1) Quick project snapshot
- TypeScript + Express server using Prisma (PostgreSQL). See `package.json`, `tsconfig.json`, and `prisma/schema.prisma`.
- Entry source directory: `src/` (compiled to `dist/` by `tsc -b`). Expected runtime entry: `dist/index.js`.

2) Key files and what they mean
- `prisma/schema.prisma` — canonical data models. Important details:
  - `Schedule` uses batch as primary key (`batch = "B1"/"B2"/"B3"/"B4"`) and stores weekly schedule in `data: Json`.
  - `Student` has a `batch` field (B1, B2, B3, or B4) which determines which schedule to use.
  - `Student.attendancePerSubjects` is a Json map: `{ "Math": { total, present, attendance } }`.
  - `Student.lastChecked` is Json and holds the last tap action (checkin/checkout) with timestamps.
- `src/index.ts` — server bootstrap (currently empty in workspace). Implementations should wire Express, middleware, controllers, and Prisma client here.
- `src/controllers/*` — controllers for `attendance` and `student` endpoints (files exist but are currently empty/placeholders).
- `.env` — runtime configuration. Important keys discovered: `DATABASE_URL`, `PORT`, `LATE_WINDOW_MINUTES`, `DEVICE_SHARED_API_KEY` (project historically has open endpoints; preserve existing behavior unless asked to add auth).

3) How to build & run (developer workflows)
- Install deps:
  ```cmd
  npm ci
  ```
- Generate Prisma client and apply migrations (developer / local):
  ```cmd
  npx prisma generate
  npx prisma migrate dev --name init
  ```
- Build & run:
  ```cmd
  npm run build    # tsc -b -> dist/
  npm start        # node dist/index.js
  npm run dev      # dev script runs tsc -b && node dist/index.js
  ```

4) Concrete patterns to follow when editing code
- JSON fields: treat `attendancePerSubjects` and `lastChecked` as typed JSON structures. Prefer defining small TypeScript interfaces in `src/types` or adjacent files and use Prisma-generated types as much as possible.
- Schedule lookup: each batch (B1, B2, B3, B4) has its own schedule. Use `prisma.schedule.findUnique({ where: { batch: student.batch } })` to load the correct schedule for a student.
- Attendance flow (as described in README/PROMPT):
  - First tap during class window -> record `lastChecked.action = 'checkin'` with subject/class times.
  - Second tap after class end -> compute subject present/total and update `overallAttendance`.
  - Use `LATE_WINDOW_MINUTES` from `process.env` when validating checkins.
- DB updates: make minimal, atomic updates using Prisma client calls. Read-modify-write the JSON fields server-side and persist a single `prisma.student.update()` per logical change when possible.

5) Repo-specific gotchas & discrepancies
- README and PROMPT mention a `seed` script but `package.json` has no `seed` script — don't assume a seed exists; instead run Prisma migrations and create seeders manually if needed.
- `src/index.ts` and controller files are empty. Expect to implement server wiring and controller logic there — follow repo conventions (Express controllers under `src/controllers`, keep handlers small and testable).
- README says "no device authentication" but `.env` contains `DEVICE_SHARED_API_KEY`. Preserve current open-by-default behavior unless an explicit task asks to enforce the API key.

6) Testing & linting
- No test framework or linter configured. When adding tests, prefer lightweight Node test runner (Jest or vitest) and add scripts to `package.json`.

7) Example snippets / references
- Load schedule for a student's batch (example):
  - `const schedule = await prisma.schedule.findUnique({ where: { batch: student.batch } });`
- Update student's attendance JSON (example approach):
  - read the student, mutate `attendancePerSubjects` object in memory, then `prisma.student.update({ where: { id }, data: { attendancePerSubjects: updatedObj, overallAttendance } })`.
- Valid batches: B1, B2, B3, B4 (each has its own schedule).
8) When to ask for clarification
- If work requires adding authentication, seeding, or changing DB schema: ask before modifying `prisma/schema.prisma` or adding migrations.
- If a task touches deployment (PM2, EC2), confirm environment expectations (ports, reverse proxy) — README mentions multiple deployment options.

If any section is unclear or you want this file to be stricter (for example, include coding style rules or preferred helper utilities), tell me what to add and I will iterate.
