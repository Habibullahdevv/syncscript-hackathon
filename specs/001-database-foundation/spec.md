# Feature Specification: Database Foundation

**Feature Branch**: `001-database-foundation`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "SyncScript Phase 1 - Database Foundation: Complete NeonDB PostgreSQL + Prisma setup with 5 relational models for collaborative research vaults"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Database Schema Initialization (Priority: P1)

As a developer, I need to initialize the database schema with all required models so that the application has a persistent data layer ready for Phase 2 API development.

**Why this priority**: This is the foundational requirement. Without a working database schema, no other features can be built. This directly contributes to the 25% data modeling score in hackathon evaluation.

**Independent Test**: Can be fully tested by running `npx prisma db push` and verifying all 5 tables (User, Vault, VaultUser, Source, AuditLog) appear in NeonDB dashboard with correct relationships and constraints.

**Acceptance Scenarios**:

1. **Given** a fresh Next.js 15 project with Prisma installed, **When** developer runs `npx prisma db push`, **Then** the command completes with 0 errors and all 5 tables are created in NeonDB
2. **Given** the schema is pushed to NeonDB, **When** developer runs `npx prisma studio`, **Then** all 5 tables are visible with correct column types and relationships
3. **Given** the database is initialized, **When** developer runs `npx prisma generate`, **Then** TypeScript types are generated for all models without errors

---

### User Story 2 - Relational Data Integrity (Priority: P2)

As a developer, I need to verify that many-to-many relationships between Users and Vaults work correctly with role-based permissions so that the data model supports collaborative vault access.

**Why this priority**: Relational integrity is critical for the vault collaboration feature. This validates that the junction table (VaultUser) correctly links Users to Vaults with role information.

**Independent Test**: Can be fully tested by creating a User record, creating a Vault record, then creating a VaultUser record linking them with a role, and verifying the relationship persists and can be queried bidirectionally.

**Acceptance Scenarios**:

1. **Given** a User and Vault exist in the database, **When** a VaultUser record is created with role "owner", **Then** the relationship is stored and can be queried from both User and Vault sides
2. **Given** a VaultUser relationship exists, **When** attempting to create a duplicate relationship (same userId and vaultId), **Then** the unique constraint prevents the duplicate and returns an error
3. **Given** a Vault is deleted, **When** the cascade delete triggers, **Then** all associated VaultUser and Source records are automatically deleted

---

### User Story 3 - Audit Trail Validation (Priority: P3)

As a developer, I need to verify that the AuditLog model can record all database mutations so that the system has a complete audit trail for security scoring.

**Why this priority**: Audit logging is required for hackathon security scoring but doesn't block core functionality. It can be validated after the basic schema and relationships are working.

**Independent Test**: Can be fully tested by performing a sample mutation (create vault, add user to vault, change role) and verifying that corresponding AuditLog entries are created with correct action types and metadata.

**Acceptance Scenarios**:

1. **Given** a vault creation operation occurs, **When** the operation completes, **Then** an AuditLog entry is created with action "vault_created" and the userId of the creator
2. **Given** a user's role is changed in a vault, **When** the VaultUser record is updated, **Then** an AuditLog entry captures the action "role_changed" with before/after metadata
3. **Given** multiple audit log entries exist, **When** querying by userId and createdAt, **Then** the indexed query returns results efficiently

---

### Edge Cases

- What happens when DATABASE_URL is missing or invalid? System should fail fast with clear error message during `prisma db push`
- What happens when attempting to create a VaultUser with an invalid role string (not "owner", "contributor", or "viewer")? Application-layer validation should reject it before database insertion
- What happens when a User is deleted? Cascade delete should remove all associated VaultUser records, but Vaults should remain (owned by deleted user scenario needs handling in Phase 3)
- What happens when NeonDB connection pool is exhausted? Prisma should queue requests or timeout gracefully
- What happens when schema migration is interrupted mid-push? NeonDB branching allows rollback; developer should test in branch before main database

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST initialize a Next.js 15 App Router project with TypeScript, Tailwind CSS, App Router, and src directory structure
- **FR-002**: System MUST configure NeonDB PostgreSQL serverless connection via DATABASE_URL environment variable with SSL enabled
- **FR-003**: System MUST define exactly 5 Prisma models: User, Vault, VaultUser, Source, AuditLog with specified fields and relationships
- **FR-004**: System MUST use `@default(cuid())` for all primary key ID fields to ensure globally unique, collision-resistant identifiers
- **FR-005**: System MUST implement many-to-many relationship between User and Vault via VaultUser junction table with role field
- **FR-006**: System MUST enforce unique constraint on VaultUser (userId, vaultId) combination to prevent duplicate memberships
- **FR-007**: System MUST configure cascade delete on VaultUser and Source when parent Vault is deleted
- **FR-008**: System MUST include role field in VaultUser as String type with values "owner", "contributor", or "viewer"
- **FR-009**: System MUST include fileUrl field in Source model to store Cloudinary PDF URLs for Phase 2 integration
- **FR-010**: System MUST create indexes on VaultUser (vaultId), Source (vaultId), and AuditLog (userId, createdAt) for query optimization
- **FR-011**: System MUST support zero-downtime schema evolution using `prisma db push` for development iterations
- **FR-012**: System MUST generate TypeScript types via `npx prisma generate` for type-safe database queries
- **FR-013**: System MUST store Cloudinary configuration (cloud name, API key, API secret) in environment variables for Phase 2 readiness

### Key Entities

- **User**: Represents an authenticated user account with email, name, and timestamps. Has many vaults through VaultUser junction table. Has many audit log entries tracking their actions.

- **Vault**: Represents a collaborative research vault containing sources. Has an owner (User), many sources, many users through VaultUser junction table, and associated audit logs. Tracks creation and update timestamps.

- **VaultUser**: Junction table implementing many-to-many relationship between Users and Vaults. Includes role field ("owner", "contributor", "viewer") for permission management. Enforces unique constraint to prevent duplicate memberships.

- **Source**: Represents a research source (PDF, URL, or annotation) within a vault. Contains title, optional URL, optional annotation text, and Cloudinary fileUrl for uploaded PDFs. Belongs to exactly one Vault.

- **AuditLog**: Immutable event log recording all database mutations for security and compliance. Captures userId (actor), vaultId (target), action type, optional JSON metadata, and timestamp. Indexed for efficient user activity timeline queries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Database schema validation completes successfully (command `npx prisma validate` exits with code 0)
- **SC-002**: Database migration completes without errors (command `npx prisma db push` exits with code 0 and reports "Database synchronized")
- **SC-003**: All 5 tables are visible in Prisma Studio with correct relationships (visual verification in `npx prisma studio` shows User, Vault, VaultUser, Source, AuditLog with foreign key links)
- **SC-004**: NeonDB dashboard confirms live tables with correct schema (manual verification in NeonDB console shows all tables, columns, indexes, and constraints)
- **SC-005**: Prisma Client generation succeeds and produces TypeScript types (command `npx prisma generate` completes and creates `node_modules/.prisma/client` with type definitions)
- **SC-006**: Test data can be created and persisted (developer can execute: create User → create Vault → create VaultUser linking them → create Source in Vault → create AuditLog entry, and all records persist)
- **SC-007**: Relationship queries work bidirectionally (can query User.vaults to get all vaults for a user, and Vault.users to get all users in a vault)
- **SC-008**: Unique constraints are enforced (attempting to create duplicate VaultUser with same userId+vaultId combination fails with constraint violation error)
- **SC-009**: Cascade deletes work correctly (deleting a Vault automatically removes all associated VaultUser and Source records)
- **SC-010**: Database setup completes within 20 minutes from project initialization to validated schema

## Assumptions *(optional)*

- NeonDB account is already created and DATABASE_URL is available
- Developer has Node.js 18+ installed locally
- Developer has npm or yarn package manager installed
- Cloudinary account credentials are provided and valid
- Internet connection is available for NeonDB serverless access
- Git repository is initialized for version control
- Developer has basic familiarity with Prisma CLI commands

## Dependencies *(optional)*

### External Dependencies

- **NeonDB**: PostgreSQL serverless database service (external SaaS)
- **Cloudinary**: Media storage service for Phase 2 PDF uploads (credentials required)
- **Next.js 15**: React framework with App Router
- **Prisma 5.x+**: ORM and database toolkit
- **TypeScript 5.x+**: Type system for generated Prisma Client

### Phase Dependencies

- **Blocks Phase 2**: Backend APIs cannot be developed until database schema is complete and Prisma Client is generated
- **Blocks Phase 3**: Authentication system requires User model to be defined
- **Blocks Phase 4**: Real-time updates require Vault and Source models to exist
- **Blocks Phase 5**: Frontend UI requires all models and relationships to be defined

## Out of Scope *(optional)*

- API endpoints or backend route handlers (Phase 2)
- User authentication or login system (Phase 3)
- Frontend components or UI pages (Phase 5)
- Real-time Socket.io integration (Phase 4)
- PDF upload functionality or Cloudinary integration logic (Phase 2)
- Rate limiting or security middleware (Phase 6)
- Data seeding or sample data generation
- Database backup or disaster recovery procedures
- Performance testing or load testing
- Production deployment configuration
- Database migration rollback procedures (using NeonDB branching instead)

## Technical Constraints *(optional)*

- **Database**: NeonDB PostgreSQL serverless ONLY (no SQLite, MySQL, MongoDB, or local databases)
- **ORM**: Prisma ONLY (no TypeORM, Sequelize, or raw SQL)
- **ID Generation**: cuid() ONLY (no auto-increment integers, no UUIDs)
- **Role Format**: String enum "owner" | "contributor" | "viewer" ONLY (no numeric codes, no booleans)
- **Schema Evolution**: `prisma db push` for development (no manual SQL migrations in Phase 1)
- **Timeline**: 20 minutes maximum execution time
- **Model Count**: Exactly 5 models (no more, no less in Phase 1)
- **Node Version**: Node.js 18+ required for Prisma compatibility
- **TypeScript**: TypeScript 5.x+ required for Prisma Client types
