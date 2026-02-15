# Implementation Plan: Database Foundation

**Branch**: `001-database-foundation` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-database-foundation/spec.md`

## Summary

Establish NeonDB PostgreSQL + Prisma ORM foundation with 5 relational models (User, Vault, VaultUser, Source, AuditLog) for collaborative research vault system. Implements many-to-many relationships with role-based permissions, cuid identifiers, and Cloudinary-ready schema. Target: 20-minute setup from project init to validated schema, contributing to 25% hackathon data modeling score.

## Technical Context

**Language/Version**: TypeScript 5.x+ (Next.js 15 App Router)
**Primary Dependencies**: Prisma 5.x+, @prisma/client, @neondatabase/serverless
**Storage**: NeonDB PostgreSQL serverless (DATABASE_URL via environment variable)
**Testing**: Manual validation via `npx prisma studio`, `npx prisma validate`, NeonDB dashboard
**Target Platform**: Next.js 15 App Router (Node.js 18+ runtime)
**Project Type**: Web application (Next.js monolith with future backend/frontend separation in Phase 2-5)
**Performance Goals**: Schema migration < 5s, Prisma Client generation < 10s, Studio startup < 3s
**Constraints**: 20-minute total execution, NeonDB serverless only, exactly 5 models, cuid IDs only
**Scale/Scope**: 5 Prisma models, 4 relationships, 4 indexes, zero API endpoints (Phase 1 scope)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Serverless PostgreSQL Only (NeonDB)
- ✅ **PASS**: Plan uses NeonDB PostgreSQL serverless exclusively
- ✅ **PASS**: DATABASE_URL configured via environment variable with SSL
- ✅ **PASS**: No alternative databases (SQLite, MySQL, MongoDB) in scope

### Principle II: Prisma ORM Exclusively
- ✅ **PASS**: Prisma 5.x+ specified as sole ORM
- ✅ **PASS**: Schema defined in `prisma/schema.prisma` as single source of truth
- ✅ **PASS**: Using `prisma db push` for development migrations
- ✅ **PASS**: Type-safe queries via generated Prisma Client

### Principle III: ACID Transactions for Vault Operations
- ✅ **PASS**: Schema supports transactional operations (validated in Phase 1D)
- ⚠️ **DEFERRED**: Actual transaction implementation in Phase 2 (API layer)

### Principle IV: Zero-Downtime Schema Evolution
- ✅ **PASS**: Using `prisma db push` for iterative development
- ✅ **PASS**: Additive-only changes in Phase 1 (no breaking changes)
- ✅ **PASS**: NeonDB branching available for testing (documented in risk mitigation)

### Principle V: Five-Model Architecture (IMMUTABLE)
- ✅ **PASS**: Exactly 5 models specified: User, Vault, VaultUser, Source, AuditLog
- ✅ **PASS**: No additional models in Phase 1 scope

### Principle VI: Role-Based Access Control Format
- ✅ **PASS**: VaultUser.role field uses String type with "owner" | "contributor" | "viewer" values
- ✅ **PASS**: Default value "viewer" specified
- ⚠️ **DEFERRED**: Application-layer validation in Phase 2

### Principle VII: Global Unique Identifiers
- ✅ **PASS**: All models use `@default(cuid())` for primary keys
- ✅ **PASS**: No auto-increment integers or UUIDs

### Principle VIII: Cloudinary Integration Ready
- ✅ **PASS**: Source model includes fileUrl, fileKey, fileSize, mimeType fields
- ✅ **PASS**: Cloudinary credentials stored in environment variables

**Constitution Compliance**: 8/8 principles satisfied (2 deferred to Phase 2 as expected)

## Project Structure

### Documentation (this feature)

```text
specs/001-database-foundation/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (next)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Spec validation (completed)
```

### Source Code (repository root)

```text
syncscript/                    # Next.js 15 project root
├── prisma/
│   └── schema.prisma         # 5 Prisma models (Phase 1C output)
├── src/                      # Next.js App Router structure
│   └── app/                  # (Phase 2+ - not in Phase 1 scope)
├── .env.local                # DATABASE_URL + Cloudinary credentials
├── package.json              # Dependencies: prisma, @prisma/client, @neondatabase/serverless
└── node_modules/
    └── .prisma/client/       # Generated TypeScript types (Phase 1C output)
```

**Structure Decision**: Next.js 15 monolith with App Router. Database layer (Prisma schema) established in Phase 1. Backend API routes (Phase 2) and frontend components (Phase 5) will be added to `src/app/` structure in future phases.

## Complexity Tracking

> No constitution violations requiring justification. All 8 principles satisfied within Phase 1 scope.

## Architecture Decisions

### Decision 1: Database Provider

**Decision**: NeonDB PostgreSQL serverless

**Rationale**:
- Serverless scaling for national-scale hackathon demo
- Branching capabilities for safe schema testing
- Zero-downtime migrations via `prisma db push`
- Direct PostgreSQL compatibility (no vendor lock-in)
- 25% data modeling score requires production-grade database

**Alternatives Considered**:
- **Supabase**: Rejected - extra features (auth, storage, realtime) add complexity; Phase 1 needs database only
- **PlanetScale**: Rejected - MySQL incompatible with PostgreSQL-specific Prisma features
- **SQLite**: Rejected - violates Constitution Principle I; not suitable for national scale

### Decision 2: ORM Selection

**Decision**: Prisma 5.x+

**Rationale**:
- TypeScript-first design with generated types
- Prevents SQL injection via type-safe queries
- Excellent Next.js integration
- Directly contributes to 25% data modeling hackathon score
- Declarative schema syntax (readable by judges)

**Alternatives Considered**:
- **Drizzle ORM**: Rejected - lightweight but less mature; Prisma Studio visualization critical for demo
- **TypeORM**: Rejected - decorator-based syntax less readable; weaker TypeScript inference
- **Raw SQL**: Rejected - violates Constitution Principle II; no type safety

### Decision 3: ID Generation Strategy

**Decision**: cuid() (Collision-resistant Unique IDs)

**Rationale**:
- Globally unique across distributed systems
- Time-ordered (sortable) for debugging
- URL-safe characters
- Avoids integer enumeration attacks
- Shorter than UUIDs (better for URLs)

**Alternatives Considered**:
- **UUID v4**: Rejected - not time-ordered; longer strings
- **Auto-increment integers**: Rejected - violates Constitution Principle VII; enumeration risk
- **Snowflake IDs**: Rejected - overkill for hackathon; requires coordination service

### Decision 4: Connection Strategy

**Decision**: Direct DATABASE_URL connection

**Rationale**:
- Simplest setup for 20-minute timeline
- NeonDB serverless handles connection pooling
- No additional infrastructure required
- Sufficient for hackathon demo scale

**Alternatives Considered**:
- **Prisma Accelerate**: Rejected - adds complexity; connection pooling not needed for demo
- **PgBouncer**: Rejected - requires separate deployment; overkill for Phase 1

## Technical Execution Plan

### Phase 1A: Environment Setup (5 minutes)

**Objective**: Initialize Next.js 15 project with Prisma dependencies

**Commands**:
```bash
npx create-next-app@latest syncscript --typescript --tailwind --app --src-dir
cd syncscript
npm install prisma @prisma/client @neondatabase/serverless
npx prisma init
```

**Outputs**:
- Next.js 15 project structure with TypeScript, Tailwind CSS, App Router, src directory
- `prisma/` directory with placeholder `schema.prisma`
- `.env` file with placeholder `DATABASE_URL`

**Validation**:
- ✅ `package.json` contains prisma, @prisma/client, @neondatabase/serverless
- ✅ `prisma/schema.prisma` exists
- ✅ `.env` file exists

### Phase 1B: NeonDB Provisioning (3 minutes)

**Objective**: Create NeonDB project and configure connection

**Steps**:
1. Navigate to neon.tech
2. Sign in with GitHub
3. Create new project: "SyncScript Hackathon"
4. Copy DATABASE_URL from project dashboard
5. Create `.env.local` file (Next.js convention)
6. Add environment variables:
   ```
   DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname?sslmode=require"
   CLOUDINARY_CLOUD_NAME="dwcx1axgj"
   CLOUDINARY_API_KEY="272347898467147"
   CLOUDINARY_API_SECRET="g1n1EfMgy7yP1Ipx3pjR8BPsL8Y"
   ```

**Validation**:
- ✅ NeonDB project visible in dashboard
- ✅ `.env.local` contains valid DATABASE_URL with `?sslmode=require`
- ✅ Cloudinary credentials present (Phase 2 readiness)

**Risk Mitigation**:
- If SSL connection fails: Verify `?sslmode=require` parameter in DATABASE_URL
- If DATABASE_URL missing: `npx prisma db push` will fail fast with clear error

### Phase 1C: Prisma Schema Implementation (7 minutes)

**Objective**: Define 5 Prisma models with relationships, constraints, and indexes

**Schema Structure** (see `data-model.md` for full details):

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id         String      @id @default(cuid())
  email      String      @unique
  name       String?
  vaultUsers VaultUser[]
  createdAt  DateTime    @default(now())
}

model Vault {
  id         String      @id @default(cuid())
  name       String
  ownerId    String
  vaultUsers VaultUser[]
  sources    Source[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model VaultUser {
  id      String @id @default(cuid())
  userId  String
  vaultId String
  role    String @default("viewer")
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  vault   Vault  @relation(fields: [vaultId], references: [id], onDelete: Cascade)

  @@unique([userId, vaultId])
  @@index([vaultId])
}

model Source {
  id         String   @id @default(cuid())
  vaultId    String
  title      String
  url        String?
  annotation String?
  fileUrl    String?
  fileKey    String?
  fileSize   Int?
  mimeType   String   @default("application/pdf")
  vault      Vault    @relation(fields: [vaultId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())

  @@index([vaultId])
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  vaultId   String?
  action    String
  details   Json?
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```

**Commands**:
```bash
npx prisma validate          # Syntax validation
npx prisma db push           # Push schema to NeonDB
npx prisma generate          # Generate TypeScript client
```

**Validation**:
- ✅ `npx prisma validate` exits with code 0
- ✅ `npx prisma db push` completes without errors, reports "Database synchronized"
- ✅ `npx prisma generate` creates `node_modules/.prisma/client/` with TypeScript types

**Risk Mitigation**:
- If `prisma db push` fails: Check DATABASE_URL validity, verify NeonDB project active
- If relation errors: Verify `@relation` syntax matches Prisma documentation
- If missing indexes: Add `@@index([vaultId])` on Source, VaultUser tables

### Phase 1D: Validation & Handoff (5 minutes)

**Objective**: Verify schema correctness and prepare for Phase 2

**Validation Steps**:

1. **Visual Verification** (Prisma Studio):
   ```bash
   npx prisma studio
   ```
   - ✅ All 5 tables visible: User, Vault, VaultUser, Source, AuditLog
   - ✅ Relationships displayed correctly (User ↔ VaultUser ↔ Vault, Vault → Source)
   - ✅ Foreign key constraints visible

2. **NeonDB Dashboard Verification**:
   - Navigate to neon.tech project dashboard
   - ✅ Tables tab shows all 5 tables
   - ✅ Indexes visible: VaultUser(userId, vaultId) unique, VaultUser(vaultId), Source(vaultId), AuditLog(userId, createdAt)
   - ✅ Constraints visible: CASCADE deletes on VaultUser, Source

3. **Manual Test Data** (optional, via Prisma Studio):
   - Create User: `{ email: "owner@test.com", name: "Owner" }`
   - Create Vault: `{ name: "Test Vault", ownerId: "<user-id>" }`
   - Create VaultUser: `{ userId: "<user-id>", vaultId: "<vault-id>", role: "owner" }`
   - Create User: `{ email: "contributor@test.com", name: "Contributor" }`
   - Create VaultUser: `{ userId: "<contributor-id>", vaultId: "<vault-id>", role: "contributor" }`
   - ✅ Verify bidirectional queries work (User.vaultUsers, Vault.vaultUsers)
   - ✅ Attempt duplicate VaultUser → Unique constraint error
   - Delete Vault → ✅ VaultUser records cascade delete

**Quality Gates** (all must pass):
- ✅ Next.js 15 App Router structure confirmed (`src/app/` directory exists)
- ✅ NeonDB DATABASE_URL active (no connection errors during `prisma db push`)
- ✅ 5 tables created with correct foreign keys (verified in NeonDB dashboard)
- ✅ Prisma client generated without TypeScript errors (`node_modules/.prisma/client/` exists)
- ✅ `npx prisma studio` loads with full relationship graph

**Handoff to Phase 2**:
- ✅ Working DATABASE_URL in `.env.local`
- ✅ Generated Prisma client ready for API routes (`import { PrismaClient } from '@prisma/client'`)
- ✅ Schema validated for vault CRUD operations
- ✅ AuditLog table ready for mutation tracking

**Timeline Checkpoint**: Total elapsed ≤ 20 minutes (5 + 3 + 7 + 5)

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| NeonDB SSL connection issues | Medium | High | Use `?sslmode=require` in DATABASE_URL; verify NeonDB project SSL enabled |
| Prisma push failures due to syntax errors | Medium | High | Run `npx prisma validate` before `db push`; verify relation syntax against Prisma docs |
| Missing indexes causing slow queries | Low | Medium | Add `@@index([vaultId])` on Source, VaultUser; verify in NeonDB dashboard |
| NeonDB connection pool exhaustion | Low | Low | NeonDB serverless auto-scales; no action needed for Phase 1 |
| Schema migration interrupted mid-push | Low | Medium | Use NeonDB branching for testing; rollback via branch if needed |
| Invalid role strings in VaultUser | Medium | Low | Document role enum in `data-model.md`; defer validation to Phase 2 API layer |
| Cloudinary credentials invalid | Low | Low | Verify credentials in `.env.local`; Phase 2 will validate on first upload |

## Testing Strategy

### Phase 1 Testing (Database Layer Only)

**Validation Type**: Manual verification via Prisma tooling and NeonDB dashboard

**Test Cases**:

1. **Schema Validation**:
   - Command: `npx prisma validate`
   - Expected: Exit code 0, no syntax errors
   - Validates: Prisma schema syntax correctness

2. **Migration Success**:
   - Command: `npx prisma db push`
   - Expected: "Database synchronized" message, exit code 0
   - Validates: NeonDB connection, schema application

3. **Visual Relationship Verification**:
   - Command: `npx prisma studio`
   - Expected: All 5 tables visible with relationship links
   - Validates: Foreign key constraints, relationship definitions

4. **NeonDB Dashboard Confirmation**:
   - Action: Navigate to neon.tech project → Tables tab
   - Expected: 5 tables, 4 indexes, CASCADE constraints visible
   - Validates: Schema applied to live database

5. **Foreign Key Constraint Testing**:
   - Action: Create User → Vault → VaultUser chain via Prisma Studio
   - Expected: Records persist, relationships queryable bidirectionally
   - Validates: Many-to-many relationship integrity

6. **Unique Constraint Testing**:
   - Action: Attempt duplicate VaultUser (same userId + vaultId)
   - Expected: Unique constraint violation error
   - Validates: `@@unique([userId, vaultId])` enforcement

7. **Cascade Delete Testing**:
   - Action: Delete Vault record via Prisma Studio
   - Expected: Associated VaultUser and Source records auto-deleted
   - Validates: `onDelete: Cascade` configuration

**No Automated Tests in Phase 1**: API layer tests (contract, integration, unit) deferred to Phase 2 when endpoints exist.

## Phase 2+ Handoff

### Ready for Phase 2 (Backend APIs)

**Artifacts Delivered**:
- ✅ `prisma/schema.prisma` with 5 validated models
- ✅ Generated Prisma Client in `node_modules/.prisma/client/`
- ✅ `.env.local` with DATABASE_URL and Cloudinary credentials
- ✅ NeonDB project with live tables, indexes, constraints

**Next Phase Requirements**:
- Create Next.js API routes in `src/app/api/`
- Implement CRUD endpoints for Vault, Source, VaultUser
- Add role-based access control middleware
- Implement AuditLog creation on mutations
- Add Cloudinary PDF upload integration

**Blockers Removed**:
- ✅ Database schema defined (was blocking API development)
- ✅ Prisma Client generated (was blocking type-safe queries)
- ✅ User model exists (was blocking authentication in Phase 3)
- ✅ Vault/Source models exist (was blocking frontend in Phase 5)

### Constitution Re-Check (Post-Design)

**All 8 principles remain satisfied**:
- ✅ Principle I: NeonDB PostgreSQL serverless confirmed in `.env.local`
- ✅ Principle II: Prisma ORM schema validated in `prisma/schema.prisma`
- ✅ Principle III: Schema supports transactions (implementation in Phase 2)
- ✅ Principle IV: Zero-downtime schema evolution via `prisma db push`
- ✅ Principle V: Exactly 5 models in schema (User, Vault, VaultUser, Source, AuditLog)
- ✅ Principle VI: VaultUser.role field uses String with "owner"|"contributor"|"viewer"
- ✅ Principle VII: All models use `@default(cuid())` for IDs
- ✅ Principle VIII: Source model includes fileUrl, fileKey, fileSize, mimeType

**No constitution violations introduced during planning.**

## Success Metrics

**Phase 1 Complete When**:
- [ ] All Phase 1A-1D steps executed successfully
- [ ] All 7 test cases pass (schema validation through cascade delete)
- [ ] All 5 quality gates pass (Next.js structure through Prisma Studio)
- [ ] Total execution time ≤ 20 minutes
- [ ] Constitution re-check passes (8/8 principles)

**Measurement**:
- Timeline: Track start time at `npx create-next-app`, end time at final Prisma Studio verification
- Quality: Binary pass/fail for each quality gate
- Compliance: Constitution checklist (8 principles × pass/fail)

**Acceptance Criteria** (from spec.md):
- ✅ SC-001: `npx prisma validate` exits 0
- ✅ SC-002: `npx prisma db push` exits 0
- ✅ SC-003: Prisma Studio shows 5 tables with relationships
- ✅ SC-004: NeonDB dashboard confirms live tables
- ✅ SC-005: Prisma Client generated with TypeScript types
- ✅ SC-006: Test data creation and persistence works
- ✅ SC-007: Bidirectional relationship queries work
- ✅ SC-008: Unique constraints enforced
- ✅ SC-009: Cascade deletes work correctly
- ✅ SC-010: Setup completes within 20 minutes

**All 10 success criteria mapped to validation steps in Phase 1D.**
