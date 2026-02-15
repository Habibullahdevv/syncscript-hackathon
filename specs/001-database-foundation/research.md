# Research: Database Foundation

**Feature**: Database Foundation (001-database-foundation)
**Date**: 2026-02-15
**Purpose**: Document architecture decisions and technology research for Phase 1 database setup

## Overview

Phase 1 establishes the database foundation for SyncScript collaborative research vault system. All technical decisions were predetermined by constitution requirements and hackathon constraints. No open research questions remain.

## Architecture Decisions Summary

### Decision 1: Database Provider - NeonDB PostgreSQL

**Decision**: NeonDB PostgreSQL serverless

**Research Conducted**:
- Evaluated serverless PostgreSQL providers for hackathon demo requirements
- Compared NeonDB, Supabase, PlanetScale for 20-minute setup constraint
- Analyzed branching capabilities for safe schema testing

**Rationale**:
- **Serverless scaling**: Automatic scaling for national-scale demo without manual configuration
- **Branching**: Test schema changes in isolated branches before main database
- **Zero-downtime migrations**: `prisma db push` works seamlessly with NeonDB
- **PostgreSQL compatibility**: Full PostgreSQL feature set (JSON, indexes, CASCADE)
- **Hackathon scoring**: Production-grade database demonstrates technical competency for 25% data modeling score

**Alternatives Evaluated**:

| Provider | Pros | Cons | Decision |
|----------|------|------|----------|
| **NeonDB** | Serverless, branching, PostgreSQL, fast setup | Requires account signup | ✅ **SELECTED** |
| **Supabase** | Includes auth/storage/realtime | Too many features for Phase 1; adds complexity | ❌ Rejected |
| **PlanetScale** | Serverless MySQL, branching | MySQL incompatible with PostgreSQL Prisma features | ❌ Rejected |
| **SQLite** | Zero setup, local file | Violates constitution; not suitable for national scale | ❌ Rejected |

**Implementation Impact**:
- Requires NeonDB account creation (3 minutes in Phase 1B)
- DATABASE_URL must include `?sslmode=require` parameter
- Connection pooling handled automatically by NeonDB serverless

### Decision 2: ORM Selection - Prisma

**Decision**: Prisma 5.x+

**Research Conducted**:
- Compared TypeScript-first ORMs for Next.js 15 integration
- Evaluated type safety, migration tools, and developer experience
- Analyzed contribution to hackathon data modeling score

**Rationale**:
- **TypeScript-first**: Generated types provide compile-time safety
- **SQL injection prevention**: Parameterized queries by default
- **Prisma Studio**: Visual database browser critical for demo/judging
- **Declarative schema**: Readable by non-technical judges
- **Next.js integration**: Official Next.js documentation recommends Prisma
- **Hackathon scoring**: Prisma schema directly demonstrates data modeling competency

**Alternatives Evaluated**:

| ORM | Pros | Cons | Decision |
|-----|------|------|----------|
| **Prisma** | TypeScript-first, Studio GUI, excellent docs | Slightly heavier than alternatives | ✅ **SELECTED** |
| **Drizzle ORM** | Lightweight, fast | Less mature; no visual Studio tool | ❌ Rejected |
| **TypeORM** | Mature, decorator-based | Weaker TypeScript inference; verbose | ❌ Rejected |
| **Raw SQL** | Maximum control | No type safety; violates constitution | ❌ Rejected |

**Implementation Impact**:
- Requires `prisma`, `@prisma/client`, `@neondatabase/serverless` packages
- Schema defined in `prisma/schema.prisma`
- Must run `npx prisma generate` after schema changes

### Decision 3: ID Generation Strategy - cuid()

**Decision**: cuid() (Collision-resistant Unique IDs)

**Research Conducted**:
- Compared unique identifier strategies for distributed systems
- Evaluated sortability, URL-safety, and collision resistance
- Analyzed security implications (enumeration attacks)

**Rationale**:
- **Global uniqueness**: No coordination needed across distributed systems
- **Time-ordered**: Sortable by creation time (useful for debugging)
- **URL-safe**: No special characters requiring encoding
- **Shorter than UUIDs**: Better for URLs and user-facing identifiers
- **Enumeration protection**: Non-sequential prevents ID guessing attacks

**Alternatives Evaluated**:

| Strategy | Pros | Cons | Decision |
|----------|------|------|----------|
| **cuid()** | Time-ordered, URL-safe, shorter than UUID | Requires `@paralleldrive/cuid2` package | ✅ **SELECTED** |
| **UUID v4** | Standard, widely supported | Not time-ordered; longer strings | ❌ Rejected |
| **Auto-increment** | Simple, sequential | Violates constitution; enumeration risk | ❌ Rejected |
| **Snowflake IDs** | Time-ordered, numeric | Requires coordination service; overkill | ❌ Rejected |

**Implementation Impact**:
- All Prisma models use `@default(cuid())` for `id` field
- Prisma automatically generates cuids on record creation
- No manual ID generation required in application code

### Decision 4: Connection Strategy - Direct DATABASE_URL

**Decision**: Direct DATABASE_URL connection (no connection pooler)

**Research Conducted**:
- Evaluated connection pooling strategies for serverless environments
- Compared Prisma Accelerate, PgBouncer, and direct connections
- Analyzed 20-minute setup constraint

**Rationale**:
- **Simplest setup**: Single environment variable, no additional infrastructure
- **NeonDB handles pooling**: Serverless platform manages connections automatically
- **Sufficient for demo**: Hackathon demo won't exceed connection limits
- **20-minute constraint**: No time for additional infrastructure setup

**Alternatives Evaluated**:

| Strategy | Pros | Cons | Decision |
|----------|------|------|----------|
| **Direct DATABASE_URL** | Zero setup, NeonDB handles pooling | None for Phase 1 scale | ✅ **SELECTED** |
| **Prisma Accelerate** | Global caching, connection pooling | Adds complexity; requires separate service | ❌ Rejected |
| **PgBouncer** | Efficient pooling | Requires deployment; overkill for demo | ❌ Rejected |

**Implementation Impact**:
- Single `DATABASE_URL` in `.env.local`
- No additional connection configuration required
- NeonDB serverless auto-scales connections

## Technology Stack Finalized

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| TypeScript | 5.x+ | Type system for Prisma Client |
| Prisma | 5.x+ | ORM and database toolkit |
| @prisma/client | 5.x+ | Generated database client |
| @neondatabase/serverless | Latest | NeonDB serverless driver |
| Tailwind CSS | 3.x | Utility-first CSS (Next.js default) |

### Development Tools

| Tool | Purpose |
|------|---------|
| `npx prisma studio` | Visual database browser |
| `npx prisma validate` | Schema syntax validation |
| `npx prisma db push` | Push schema to database |
| `npx prisma generate` | Generate TypeScript client |
| NeonDB Dashboard | Live table/index verification |

## Best Practices Applied

### Prisma Schema Design

**Many-to-Many Relationships**:
- Use explicit junction table (VaultUser) instead of implicit `@relation`
- Allows additional fields (role) on relationship
- Enables unique constraints on relationship pairs

**Cascade Deletes**:
- `onDelete: Cascade` on VaultUser → User relationship
- `onDelete: Cascade` on VaultUser → Vault relationship
- `onDelete: Cascade` on Source → Vault relationship
- Prevents orphaned records when parent deleted

**Indexing Strategy**:
- Index foreign keys for join performance (`@@index([vaultId])`)
- Composite index for common queries (`@@index([userId, createdAt])`)
- Unique constraints prevent duplicates (`@@unique([userId, vaultId])`)

**Field Defaults**:
- `@default(cuid())` for all IDs
- `@default(now())` for timestamps
- `@default("viewer")` for role field
- `@default("application/pdf")` for mimeType

### Next.js 15 Integration

**Environment Variables**:
- Use `.env.local` for local development (gitignored by default)
- Use `.env` for Prisma CLI (committed to repo)
- DATABASE_URL must be in both files

**Prisma Client Instantiation**:
- Singleton pattern to avoid connection exhaustion
- Hot reload support in development mode
- Edge runtime compatibility with `@neondatabase/serverless`

## Risk Assessment

### Technical Risks Identified

| Risk | Mitigation | Status |
|------|------------|--------|
| NeonDB SSL connection issues | Use `?sslmode=require` in DATABASE_URL | Documented in plan.md |
| Prisma schema syntax errors | Run `npx prisma validate` before `db push` | Documented in Phase 1C |
| Missing indexes | Add `@@index` on foreign keys | Included in schema |
| Invalid role strings | Document enum in data-model.md | Deferred to Phase 2 validation |
| Connection pool exhaustion | NeonDB serverless auto-scales | No action needed |

### Timeline Risks

| Risk | Mitigation | Status |
|------|------------|--------|
| NeonDB account signup delays | Use GitHub OAuth for fast signup | Documented in Phase 1B |
| Prisma installation slow | Use npm (faster than yarn for fresh installs) | Documented in Phase 1A |
| Schema iteration time | Use `prisma db push` (faster than migrations) | Constitution requirement |
| Exceeding 20-minute limit | Phases 1A-1D timed at 5+3+7+5 minutes | Built into plan |

## Open Questions

**None**. All technical decisions finalized and documented above.

## Next Steps

1. ✅ Research complete - All architecture decisions documented
2. ⏭️ Phase 1: Create `data-model.md` with entity definitions
3. ⏭️ Phase 1: Create `quickstart.md` with step-by-step execution guide
4. ⏭️ Phase 1: Update agent context with new technologies
5. ⏭️ Phase 2: Generate `tasks.md` with implementation tasks (via `/sp.tasks`)

## References

- [NeonDB Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [cuid Specification](https://github.com/paralleldrive/cuid2)
- SyncScript Constitution v1.0.0 (`.specify/memory/constitution.md`)
