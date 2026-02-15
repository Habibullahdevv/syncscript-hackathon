# Data Model: Database Foundation

**Feature**: Database Foundation (001-database-foundation)
**Date**: 2026-02-15
**Purpose**: Define entities, relationships, and validation rules for SyncScript Phase 1 database schema

## Overview

SyncScript Phase 1 implements 5 Prisma models supporting collaborative research vaults with role-based permissions. The data model uses many-to-many relationships via junction tables, cuid identifiers, and cascade deletes for referential integrity.

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│             │
│ id (PK)     │◄─────┐
│ email       │      │
│ name        │      │
│ createdAt   │      │
└─────────────┘      │
                     │
                     │ userId (FK)
                     │
              ┌──────┴──────┐
              │  VaultUser  │ (Junction Table)
              │             │
              │ id (PK)     │
              │ userId (FK) │
              │ vaultId(FK) │
              │ role        │
              └──────┬──────┘
                     │
                     │ vaultId (FK)
                     │
┌─────────────┐      │
│    Vault    │◄─────┘
│             │
│ id (PK)     │
│ name        │
│ ownerId     │
│ createdAt   │
│ updatedAt   │
└──────┬──────┘
       │
       │ vaultId (FK)
       │
       ▼
┌─────────────┐
│   Source    │
│             │
│ id (PK)     │
│ vaultId(FK) │
│ title       │
│ url         │
│ annotation  │
│ fileUrl     │
│ fileKey     │
│ fileSize    │
│ mimeType    │
│ createdAt   │
└─────────────┘

┌─────────────┐
│  AuditLog   │ (Standalone - references via strings)
│             │
│ id (PK)     │
│ userId      │
│ vaultId     │
│ action      │
│ details     │
│ createdAt   │
└─────────────┘
```

## Entities

### User

**Purpose**: Represents an authenticated user account in the system.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, `@default(cuid())` | Globally unique user identifier |
| `email` | String | `@unique`, NOT NULL | User email address (unique across system) |
| `name` | String | Nullable | User display name (optional) |
| `createdAt` | DateTime | `@default(now())` | Account creation timestamp |

**Relationships**:
- **Has many** VaultUser (via `vaultUsers` relation)
- Indirect: **Has many** Vaults through VaultUser junction table

**Validation Rules**:
- `email` must be unique (enforced by database constraint)
- `email` format validation deferred to Phase 3 (authentication layer)
- `name` is optional (nullable) for flexibility

**Indexes**:
- Primary key index on `id` (automatic)
- Unique index on `email` (automatic via `@unique`)

**Cascade Behavior**:
- When User deleted → All associated VaultUser records CASCADE delete
- Vaults remain (orphaned vault scenario handled in Phase 3)

**Notes**:
- No password field (authentication in Phase 3 via NextAuth.js)
- No role field on User (roles are vault-specific via VaultUser)

---

### Vault

**Purpose**: Represents a collaborative research vault containing sources.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, `@default(cuid())` | Globally unique vault identifier |
| `name` | String | NOT NULL | Vault display name |
| `ownerId` | String | NOT NULL | User ID of vault creator/owner |
| `createdAt` | DateTime | `@default(now())` | Vault creation timestamp |
| `updatedAt` | DateTime | `@updatedAt` | Last modification timestamp (auto-updated) |

**Relationships**:
- **Has many** VaultUser (via `vaultUsers` relation)
- **Has many** Source (via `sources` relation)
- Indirect: **Has many** Users through VaultUser junction table

**Validation Rules**:
- `name` must not be empty (enforced at application layer in Phase 2)
- `ownerId` must reference valid User (enforced via foreign key in Phase 3)
- `ownerId` is stored but not enforced as foreign key in Phase 1 (simplifies schema)

**Indexes**:
- Primary key index on `id` (automatic)
- No additional indexes needed (queries typically by `id`)

**Cascade Behavior**:
- When Vault deleted → All associated VaultUser records CASCADE delete
- When Vault deleted → All associated Source records CASCADE delete

**Notes**:
- `ownerId` stored as String (not foreign key) to avoid circular dependency
- Owner relationship enforced via VaultUser with role="owner" in Phase 2

---

### VaultUser

**Purpose**: Junction table implementing many-to-many relationship between Users and Vaults with role-based permissions.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, `@default(cuid())` | Globally unique relationship identifier |
| `userId` | String | FK → User.id, NOT NULL | User in this vault |
| `vaultId` | String | FK → Vault.id, NOT NULL | Vault this user has access to |
| `role` | String | `@default("viewer")`, NOT NULL | Permission level: "owner" \| "contributor" \| "viewer" |

**Relationships**:
- **Belongs to** User (via `user` relation, `userId` foreign key)
- **Belongs to** Vault (via `vault` relation, `vaultId` foreign key)

**Validation Rules**:
- `role` must be one of: "owner", "contributor", "viewer" (enforced at application layer in Phase 2)
- Each (userId, vaultId) pair must be unique (enforced by `@@unique` constraint)
- At least one "owner" per vault (enforced at application layer in Phase 2)

**Indexes**:
- Primary key index on `id` (automatic)
- Unique composite index on `[userId, vaultId]` (via `@@unique`)
- Index on `vaultId` for fast vault member lookups (via `@@index([vaultId])`)

**Cascade Behavior**:
- When User deleted → VaultUser CASCADE deletes (via `onDelete: Cascade` on user relation)
- When Vault deleted → VaultUser CASCADE deletes (via `onDelete: Cascade` on vault relation)

**Role Hierarchy**:
- **owner**: Full control (create/read/update/delete vault, manage members, delete vault)
- **contributor**: Can add/edit sources, cannot manage members or delete vault
- **viewer**: Read-only access to vault and sources

**Notes**:
- Explicit junction table (not implicit Prisma relation) allows `role` field
- `@@unique([userId, vaultId])` prevents duplicate memberships
- Role validation deferred to Phase 2 API middleware

---

### Source

**Purpose**: Represents a research source (PDF, URL, or annotation) within a vault.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, `@default(cuid())` | Globally unique source identifier |
| `vaultId` | String | FK → Vault.id, NOT NULL | Vault containing this source |
| `title` | String | NOT NULL | Source display name |
| `url` | String | Nullable | External URL (for web sources) |
| `annotation` | String | Nullable | User notes/comments on source |
| `fileUrl` | String | Nullable | Cloudinary URL for uploaded PDF |
| `fileKey` | String | Nullable | Cloudinary public_id (for deletion) |
| `fileSize` | Int | Nullable | File size in bytes (for quota tracking) |
| `mimeType` | String | `@default("application/pdf")` | File MIME type |
| `createdAt` | DateTime | `@default(now())` | Source creation timestamp |

**Relationships**:
- **Belongs to** Vault (via `vault` relation, `vaultId` foreign key)

**Validation Rules**:
- `title` must not be empty (enforced at application layer in Phase 2)
- At least one of `url`, `annotation`, or `fileUrl` must be present (enforced at application layer)
- `fileUrl` format validated by Cloudinary in Phase 2
- `mimeType` defaults to "application/pdf" but can be overridden

**Indexes**:
- Primary key index on `id` (automatic)
- Index on `vaultId` for fast vault source queries (via `@@index([vaultId])`)

**Cascade Behavior**:
- When Vault deleted → Source CASCADE deletes (via `onDelete: Cascade`)

**Cloudinary Integration** (Phase 2):
- `fileUrl`: Public URL returned by Cloudinary after upload
- `fileKey`: Cloudinary `public_id` used for deletion via API
- `fileSize`: Tracked for storage quota enforcement
- `mimeType`: Validated to ensure PDF uploads only

**Notes**:
- Supports three source types: URL-only, annotation-only, or uploaded PDF
- Cloudinary fields prepared but unused in Phase 1
- No foreign key to User (creator tracked via AuditLog)

---

### AuditLog

**Purpose**: Immutable event log recording all database mutations for security and compliance.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, `@default(cuid())` | Globally unique log entry identifier |
| `userId` | String | NOT NULL | User who performed the action |
| `vaultId` | String | Nullable | Vault affected by action (if applicable) |
| `action` | String | NOT NULL | Action type (e.g., "vault_created", "role_changed") |
| `details` | Json | Nullable | Additional context (before/after values, metadata) |
| `createdAt` | DateTime | `@default(now())` | Event timestamp |

**Relationships**:
- **None** (standalone table, references via strings not foreign keys)

**Validation Rules**:
- `action` should follow naming convention: `{entity}_{verb}` (e.g., "vault_created", "source_added")
- `details` JSON structure varies by action type (documented in Phase 2)
- Records are immutable (no updates or deletes)

**Indexes**:
- Primary key index on `id` (automatic)
- Composite index on `[userId, createdAt]` for user activity timeline (via `@@index([userId, createdAt])`)

**Cascade Behavior**:
- **None** (AuditLog entries persist even if User or Vault deleted)
- Preserves audit trail for compliance

**Action Types** (Phase 2 implementation):
- `vault_created`: User creates new vault
- `vault_deleted`: User deletes vault
- `vault_updated`: User renames vault
- `source_added`: User adds source to vault
- `source_deleted`: User removes source from vault
- `role_changed`: User changes another user's role in vault
- `member_added`: User invites another user to vault
- `member_removed`: User removes another user from vault

**Details JSON Examples**:
```json
// vault_created
{ "vaultName": "Research Papers", "ownerId": "clx..." }

// role_changed
{ "targetUserId": "cly...", "oldRole": "viewer", "newRole": "contributor" }

// source_added
{ "sourceId": "clz...", "title": "Paper.pdf", "fileUrl": "https://..." }
```

**Notes**:
- No foreign keys to User/Vault (preserves history after deletions)
- `userId` and `vaultId` stored as strings for historical reference
- Indexed by `[userId, createdAt]` for efficient user activity queries
- Immutable records (application layer prevents updates/deletes)

## Relationship Summary

### Many-to-Many: User ↔ Vault (via VaultUser)

**Cardinality**: User has many Vaults, Vault has many Users

**Implementation**: Explicit junction table (VaultUser) with additional `role` field

**Queries**:
```typescript
// Get all vaults for a user
const userVaults = await prisma.user.findUnique({
  where: { id: userId },
  include: { vaultUsers: { include: { vault: true } } }
});

// Get all users in a vault
const vaultMembers = await prisma.vault.findUnique({
  where: { id: vaultId },
  include: { vaultUsers: { include: { user: true } } }
});
```

### One-to-Many: Vault → Source

**Cardinality**: Vault has many Sources, Source belongs to one Vault

**Implementation**: Foreign key `vaultId` on Source table

**Queries**:
```typescript
// Get all sources in a vault
const vaultSources = await prisma.vault.findUnique({
  where: { id: vaultId },
  include: { sources: true }
});

// Get vault for a source
const sourceVault = await prisma.source.findUnique({
  where: { id: sourceId },
  include: { vault: true }
});
```

### Standalone: AuditLog

**Cardinality**: No foreign key relationships (references via strings)

**Implementation**: String fields `userId` and `vaultId` without foreign key constraints

**Queries**:
```typescript
// Get user activity timeline
const userActivity = await prisma.auditLog.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' }
});

// Get vault activity log
const vaultActivity = await prisma.auditLog.findMany({
  where: { vaultId },
  orderBy: { createdAt: 'desc' }
});
```

## Validation Rules Summary

### Database-Level Constraints (Enforced in Phase 1)

| Entity | Constraint | Type | Purpose |
|--------|------------|------|---------|
| User | `email` unique | Unique | Prevent duplicate accounts |
| VaultUser | `[userId, vaultId]` unique | Composite Unique | Prevent duplicate memberships |
| VaultUser | `userId` → User.id | Foreign Key | Referential integrity |
| VaultUser | `vaultId` → Vault.id | Foreign Key | Referential integrity |
| Source | `vaultId` → Vault.id | Foreign Key | Referential integrity |

### Application-Level Validation (Deferred to Phase 2)

| Entity | Field | Rule | Enforcement |
|--------|-------|------|-------------|
| User | `email` | Valid email format | Phase 3 (NextAuth.js) |
| Vault | `name` | Non-empty string | Phase 2 API validation |
| VaultUser | `role` | Enum: "owner" \| "contributor" \| "viewer" | Phase 2 middleware |
| VaultUser | - | At least one owner per vault | Phase 2 business logic |
| Source | `title` | Non-empty string | Phase 2 API validation |
| Source | - | At least one of url/annotation/fileUrl | Phase 2 API validation |
| AuditLog | `action` | Naming convention | Phase 2 audit service |

## State Transitions

### VaultUser Role Changes

```
viewer → contributor → owner (promotion)
owner → contributor → viewer (demotion)
```

**Rules**:
- Cannot demote last owner (enforced in Phase 2)
- Role changes must create AuditLog entry
- Role changes must be atomic (transaction)

### Source Lifecycle

```
Created → Updated (title/annotation) → Deleted
         ↓
    PDF Uploaded (fileUrl added)
```

**Rules**:
- Source creation must create AuditLog entry
- PDF upload updates existing Source (doesn't create new)
- Source deletion must create AuditLog entry

### Vault Lifecycle

```
Created → Members Added → Sources Added → Deleted
```

**Rules**:
- Vault creation must create AuditLog entry
- Vault deletion CASCADE deletes VaultUser and Source records
- Vault deletion must create AuditLog entry before deletion

## Performance Considerations

### Indexes

| Table | Index | Purpose | Query Pattern |
|-------|-------|---------|---------------|
| User | `email` (unique) | Fast login lookup | `WHERE email = ?` |
| VaultUser | `[userId, vaultId]` (unique) | Prevent duplicates, fast membership check | `WHERE userId = ? AND vaultId = ?` |
| VaultUser | `vaultId` | Fast vault member list | `WHERE vaultId = ?` |
| Source | `vaultId` | Fast vault source list | `WHERE vaultId = ?` |
| AuditLog | `[userId, createdAt]` | User activity timeline | `WHERE userId = ? ORDER BY createdAt DESC` |

### Query Optimization

**N+1 Query Prevention**:
- Use `include` for eager loading relationships
- Example: `include: { vaultUsers: { include: { user: true } } }`

**Pagination**:
- Use `take` and `skip` for large result sets
- Example: `findMany({ take: 20, skip: page * 20 })`

**Selective Fields**:
- Use `select` to fetch only needed fields
- Example: `select: { id: true, name: true }`

## Schema Evolution Strategy

### Phase 1 → Phase 2 (Additive Changes)

**Potential Additions**:
- User: `image` field for profile photo (NextAuth.js)
- Vault: `description` field for vault details
- Source: `extractedText` field for PDF text content

**Migration Strategy**:
- Use `prisma db push` for development
- All new fields nullable or with defaults
- No breaking changes to existing fields

### Phase 2 → Phase 3 (Authentication)

**Potential Additions**:
- User: NextAuth.js session tables (Account, Session, VerificationToken)
- Separate schema file or same schema.prisma

**Migration Strategy**:
- Add NextAuth.js models to existing schema
- No changes to existing User model
- Use `prisma migrate dev` for production migrations

## Next Steps

1. ✅ Data model documented
2. ⏭️ Create `quickstart.md` with implementation guide
3. ⏭️ Update agent context with new technologies
4. ⏭️ Generate `tasks.md` with implementation tasks (via `/sp.tasks`)
