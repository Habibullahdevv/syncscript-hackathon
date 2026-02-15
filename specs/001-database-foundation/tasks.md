---
description: "Task list for Database Foundation implementation"
---

# Tasks: Database Foundation

**Input**: Design documents from `/specs/001-database-foundation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No automated tests in Phase 1 - manual validation via Prisma Studio and NeonDB dashboard

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js project root**: `syncscript/` (created in Phase 1)
- **Prisma schema**: `syncscript/prisma/schema.prisma`
- **Environment**: `syncscript/.env.local`
- Paths shown below assume project root at `syncscript/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Next.js 15 project with command: `npx create-next-app@latest syncscript --typescript --tailwind --app --src-dir`
- [x] T002 Navigate to project directory: `cd syncscript`
- [x] T003 Install Prisma dependencies: `npm install prisma @prisma/client @neondatabase/serverless`
- [x] T004 Initialize Prisma: `npx prisma init`
- [x] T005 Verify project structure: confirm `prisma/schema.prisma`, `.env`, `src/app/` exist

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create NeonDB project at neon.tech with GitHub authentication
- [x] T007 Copy DATABASE_URL from NeonDB dashboard (ensure `?sslmode=require` parameter)
- [x] T008 Create `.env.local` file in `syncscript/.env.local`
- [x] T009 Add DATABASE_URL to `syncscript/.env.local` with NeonDB connection string
- [x] T010 Add Cloudinary credentials to `syncscript/.env.local`: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- [x] T011 Update `syncscript/.env` with DATABASE_URL for Prisma CLI

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Database Schema Initialization (Priority: P1) 🎯 MVP

**Goal**: Initialize database schema with all 5 required models so application has persistent data layer ready for Phase 2

**Independent Test**: Run `npx prisma db push` and verify all 5 tables (User, Vault, VaultUser, Source, AuditLog) appear in NeonDB dashboard with correct relationships and constraints

### Implementation for User Story 1

- [x] T012 [US1] Define User model in `syncscript/prisma/schema.prisma` with fields: id (cuid), email (unique), name (nullable), createdAt
- [x] T013 [US1] Define Vault model in `syncscript/prisma/schema.prisma` with fields: id (cuid), name, ownerId, createdAt, updatedAt
- [x] T014 [US1] Define VaultUser model in `syncscript/prisma/schema.prisma` with fields: id (cuid), userId (FK), vaultId (FK), role (default "viewer"), unique constraint on [userId, vaultId], index on vaultId
- [x] T015 [US1] Define Source model in `syncscript/prisma/schema.prisma` with fields: id (cuid), vaultId (FK), title, url (nullable), annotation (nullable), fileUrl (nullable), fileKey (nullable), fileSize (nullable), mimeType (default "application/pdf"), createdAt, index on vaultId
- [x] T016 [US1] Define AuditLog model in `syncscript/prisma/schema.prisma` with fields: id (cuid), userId, vaultId (nullable), action, details (Json nullable), createdAt, composite index on [userId, createdAt]
- [x] T017 [US1] Configure User ↔ VaultUser relationship with cascade delete in `syncscript/prisma/schema.prisma`
- [x] T018 [US1] Configure Vault ↔ VaultUser relationship with cascade delete in `syncscript/prisma/schema.prisma`
- [x] T019 [US1] Configure Vault → Source relationship with cascade delete in `syncscript/prisma/schema.prisma`
- [x] T020 [US1] Validate Prisma schema syntax: `npx prisma validate` (must exit with code 0)
- [x] T021 [US1] Push schema to NeonDB: `npx prisma db push` (must complete without errors)
- [x] T022 [US1] Generate Prisma Client: `npx prisma generate` (must create `node_modules/.prisma/client/`)
- [x] T023 [US1] Open Prisma Studio: `npx prisma studio` and verify all 5 tables visible with relationships
- [x] T024 [US1] Verify NeonDB dashboard shows all 5 tables with correct columns and indexes

**Checkpoint**: At this point, User Story 1 should be fully functional - database schema is initialized and validated

---

## Phase 4: User Story 2 - Relational Data Integrity (Priority: P2)

**Goal**: Verify many-to-many relationships between Users and Vaults work correctly with role-based permissions

**Independent Test**: Create User → Vault → VaultUser chain and verify relationship persists and can be queried bidirectionally

### Implementation for User Story 2

- [ ] T025 [US2] Create test User via Prisma Studio: email "owner@test.com", name "Owner"
- [ ] T026 [US2] Create test Vault via Prisma Studio: name "Test Vault", ownerId from T025
- [ ] T027 [US2] Create VaultUser linking User to Vault via Prisma Studio: userId from T025, vaultId from T026, role "owner"
- [ ] T028 [US2] Verify bidirectional relationship: User.vaultUsers shows 1 record, Vault.vaultUsers shows 1 record
- [ ] T029 [US2] Create second test User via Prisma Studio: email "contributor@test.com", name "Contributor"
- [ ] T030 [US2] Create second VaultUser via Prisma Studio: userId from T029, vaultId from T026, role "contributor"
- [ ] T031 [US2] Test unique constraint: attempt duplicate VaultUser with same userId+vaultId (must fail with constraint error)
- [ ] T032 [US2] Test cascade delete: delete Vault from T026 and verify VaultUser records auto-deleted
- [ ] T033 [US2] Create test Source via Prisma Studio: vaultId from new vault, title "Test Source", verify cascade delete works

**Checkpoint**: At this point, User Stories 1 AND 2 are both validated - relationships work correctly

---

## Phase 5: User Story 3 - Audit Trail Validation (Priority: P3)

**Goal**: Verify AuditLog model can record database mutations for security scoring

**Independent Test**: Perform sample mutations and verify AuditLog entries created with correct action types

### Implementation for User Story 3

- [ ] T034 [US3] Create test User via Prisma Studio for audit testing
- [ ] T035 [US3] Create test Vault via Prisma Studio for audit testing
- [ ] T036 [US3] Manually create AuditLog entry via Prisma Studio: action "vault_created", userId from T034, vaultId from T035
- [ ] T037 [US3] Create VaultUser and manually create AuditLog entry: action "member_added", userId, vaultId, details with role info
- [ ] T038 [US3] Manually create AuditLog entry for role change: action "role_changed", details with oldRole/newRole
- [ ] T039 [US3] Query AuditLog by userId and verify indexed query returns results efficiently
- [ ] T040 [US3] Query AuditLog by vaultId and verify results ordered by createdAt descending
- [ ] T041 [US3] Verify AuditLog entries persist after User deletion (no cascade delete on AuditLog)

**Checkpoint**: All user stories are now independently functional - audit trail validated

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T042 Run final `npx prisma validate` to confirm schema correctness
- [x] T043 Verify all 5 quality gates pass: Next.js structure, DATABASE_URL active, 5 tables created, Prisma client generated, Studio loads
- [x] T044 Verify all 10 success criteria from spec.md (SC-001 through SC-010)
- [x] T045 Confirm total execution time ≤ 20 minutes from T001 to T044
- [x] T046 Document any deviations from plan in `specs/001-database-foundation/implementation-notes.md`
- [x] T047 Verify constitution compliance: all 8 principles satisfied

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after User Story 1 (needs schema from US1)
  - User Story 3 (P3): Can start after User Story 1 (needs schema from US1)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 (needs schema to test relationships)
- **User Story 3 (P3)**: Depends on User Story 1 (needs schema to test audit logging)

### Within Each User Story

- **User Story 1**: Sequential execution (T012→T024) - each task builds on previous
- **User Story 2**: Sequential execution (T025→T033) - testing requires data from previous steps
- **User Story 3**: Sequential execution (T034→T041) - testing requires data from previous steps

### Parallel Opportunities

- **Setup tasks**: T001-T005 must run sequentially (each depends on previous)
- **Foundational tasks**: T006-T011 must run sequentially (NeonDB setup before env config)
- **User Story 1 schema definition**: T012-T016 can be done in parallel (different models), but T017-T019 (relationships) must come after
- **User Story 2 and 3**: Cannot run in parallel with User Story 1, but US2 and US3 could theoretically run in parallel after US1 completes (both only read schema)

---

## Parallel Example: User Story 1 Schema Definition

```bash
# These model definitions can be written in parallel (different sections of schema.prisma):
Task T012: Define User model
Task T013: Define Vault model
Task T014: Define VaultUser model
Task T015: Define Source model
Task T016: Define AuditLog model

# Then relationships must be added sequentially after models exist:
Task T017: Configure User ↔ VaultUser relationship
Task T018: Configure Vault ↔ VaultUser relationship
Task T019: Configure Vault → Source relationship
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T011) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T012-T024)
4. **STOP and VALIDATE**: Test User Story 1 independently via Prisma Studio and NeonDB dashboard
5. Ready for Phase 2 backend development

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Database schema validated (MVP!)
3. Add User Story 2 → Test independently → Relationships validated
4. Add User Story 3 → Test independently → Audit trail validated
5. Each story adds validation without breaking previous stories

### Sequential Execution (Recommended for Phase 1)

Phase 1 is database foundation only - no parallel team work needed:

1. Developer completes Setup + Foundational (T001-T011)
2. Developer completes User Story 1 (T012-T024) - schema initialization
3. Developer completes User Story 2 (T025-T033) - relationship testing
4. Developer completes User Story 3 (T034-T041) - audit trail testing
5. Developer completes Polish (T042-T047) - final validation

---

## Notes

- No [P] markers in Phase 1 - tasks are sequential due to dependencies
- [Story] labels map tasks to user stories for traceability
- Each user story is independently testable via Prisma Studio
- Manual testing only (no automated tests in Phase 1)
- Commit after completing each phase
- Stop at any checkpoint to validate story independently
- Total task count: 47 tasks across 6 phases
- Estimated time: 20 minutes (per plan.md timeline)
- Constitution compliance: All 8 principles satisfied
