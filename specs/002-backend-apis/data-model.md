# Data Model: Backend APIs

**Feature**: 002-backend-apis
**Date**: 2026-02-15
**Status**: Complete

## Overview

Phase 2 Backend APIs reuse the existing Prisma schema from Phase 1 Database Foundation. No schema changes are required. This document describes how Phase 2 APIs interact with the existing models.

---

## Prisma Schema (Phase 1 - No Changes)

```prisma
// This is your Prisma schema file
// Phase 1 schema - NO MODIFICATIONS in Phase 2

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// User model - Authentication identity and profile data
model User {
  id         String      @id @default(cuid())
  email      String      @unique
  name       String?
  vaultUsers VaultUser[]
  createdAt  DateTime    @default(now())
}

// Vault model - Container for sources, owned by users
model Vault {
  id         String      @id @default(cuid())
  name       String
  ownerId    String
  vaultUsers VaultUser[]
  sources    Source[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

// VaultUser model - Junction table for many-to-many User ↔ Vault with roles
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

// Source model - Research source (PDF, URL, or annotation) within a vault
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

// AuditLog model - Immutable event log for all database mutations
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

---

## Models Used in Phase 2

### User Model

**Purpose**: Represents authenticated users who own and access vaults.

**Fields**:
- `id` (String, cuid): Unique identifier for user
- `email` (String, unique): User email address
- `name` (String?, optional): User display name
- `createdAt` (DateTime): Account creation timestamp

**Phase 2 Usage**:
- User ID passed via x-user-id header
- APIs do not create or modify users (authentication is Phase 3)
- User records must exist in database for foreign key constraints

**Relationships**:
- One user can own many vaults (via Vault.ownerId)
- One user can have many vault memberships (via VaultUser, not used in Phase 2)

---

### Vault Model

**Purpose**: Container for organizing research sources with ownership tracking.

**Fields**:
- `id` (String, cuid): Unique identifier for vault
- `name` (String, required): Vault display name
- `ownerId` (String, required): Foreign key to User.id
- `createdAt` (DateTime): Vault creation timestamp
- `updatedAt` (DateTime): Last modification timestamp (auto-updated)

**Phase 2 Usage**:
- Primary resource managed by Vault CRUD APIs
- ownerId determines who can update/delete vault
- name is the only user-modifiable field in Phase 2

**Validation Rules**:
- name: Required, non-empty string, max 255 characters
- ownerId: Must reference existing User.id

**Relationships**:
- Belongs to one user (owner)
- Has many sources (one-to-many)
- Has many vault users (via VaultUser, not used in Phase 2)

**Cascade Behavior**:
- Deleting vault cascades to all sources (onDelete: Cascade)
- Deleting vault cascades to all VaultUser records (onDelete: Cascade)

---

### Source Model

**Purpose**: Represents research materials (PDFs, URLs, annotations) within vaults.

**Fields**:
- `id` (String, cuid): Unique identifier for source
- `vaultId` (String, required): Foreign key to Vault.id
- `title` (String, required): Source display name
- `url` (String?, optional): External URL reference
- `annotation` (String?, optional): User notes/comments
- `fileUrl` (String?, optional): Cloudinary URL for uploaded PDF
- `fileKey` (String?, optional): Cloudinary public_id for file management
- `fileSize` (Int?, optional): File size in bytes
- `mimeType` (String, default "application/pdf"): File MIME type
- `createdAt` (DateTime): Source creation timestamp

**Phase 2 Usage**:
- Managed by Source CRUD APIs (nested under vaults)
- fileUrl populated by upload API
- At least one of url, annotation, or fileUrl must be present

**Validation Rules**:
- title: Required, non-empty string, max 255 characters
- vaultId: Must reference existing Vault.id
- url: Optional, valid URL format if provided
- fileUrl: Optional, Cloudinary URL format if provided
- fileSize: Optional, positive integer if provided

**Relationships**:
- Belongs to one vault (many-to-one)

**Cascade Behavior**:
- Deleting vault cascades to all sources (onDelete: Cascade)
- Deleting source does not affect vault

---

### VaultUser Model (Not Used in Phase 2)

**Purpose**: Junction table for many-to-many relationship between users and vaults with role assignment.

**Phase 2 Status**: Model exists in schema but is NOT utilized by Phase 2 APIs.

**Future Usage**: Phase 5 will introduce member management APIs that create/update VaultUser records for collaboration features.

---

### AuditLog Model (Not Used in Phase 2)

**Purpose**: Immutable event log for tracking all database mutations.

**Phase 2 Status**: Model exists in schema but is NOT utilized by Phase 2 APIs.

**Future Usage**: Phase 6 will introduce audit logging for compliance and security tracking.

---

## Database Queries by Endpoint

### POST /api/vaults

```typescript
const vault = await prisma.vault.create({
  data: {
    name: validatedData.name,
    ownerId: userId // from x-user-id header
  }
});
```

### GET /api/vaults

```typescript
const vaults = await prisma.vault.findMany({
  where: { ownerId: userId },
  orderBy: { createdAt: 'desc' }
});
```

### GET /api/vaults/[id]

```typescript
const vault = await prisma.vault.findUnique({
  where: { id: vaultId },
  include: { sources: true }
});
```

### PATCH /api/vaults/[id]

```typescript
const vault = await prisma.vault.update({
  where: { id: vaultId },
  data: { name: validatedData.name }
});
```

### DELETE /api/vaults/[id]

```typescript
const vault = await prisma.vault.delete({
  where: { id: vaultId }
  // Cascade delete automatically removes sources
});
```

### POST /api/vaults/[id]/sources

```typescript
const source = await prisma.source.create({
  data: {
    vaultId: vaultId,
    title: validatedData.title,
    url: validatedData.url,
    annotation: validatedData.annotation,
    fileUrl: validatedData.fileUrl,
    fileKey: validatedData.fileKey,
    fileSize: validatedData.fileSize
  }
});
```

### GET /api/vaults/[id]/sources

```typescript
const sources = await prisma.source.findMany({
  where: { vaultId: vaultId },
  orderBy: { createdAt: 'desc' }
});
```

### DELETE /api/vaults/[id]/sources/[sourceId]

```typescript
const source = await prisma.source.delete({
  where: { id: sourceId }
});
```

---

## Indexes and Performance

**Existing Indexes** (from Phase 1):
- `User.email` - Unique index for email lookups
- `VaultUser.@@unique([userId, vaultId])` - Prevent duplicate memberships
- `VaultUser.@@index([vaultId])` - Fast vault member lookups
- `Source.@@index([vaultId])` - Fast vault source queries
- `AuditLog.@@index([userId, createdAt])` - User activity timeline

**Phase 2 Query Performance**:
- GET /api/vaults: Uses Vault.ownerId (no index, acceptable for Phase 2 scale)
- GET /api/vaults/[id]: Uses Vault.id primary key (indexed)
- GET /api/vaults/[id]/sources: Uses Source.vaultId index (optimized)

**Future Optimization**: If GET /api/vaults becomes slow, add index on Vault.ownerId in Phase 3+.

---

## Data Integrity Constraints

**Foreign Key Constraints**:
- Vault.ownerId → User.id (enforced by Prisma)
- Source.vaultId → Vault.id (enforced by Prisma)
- VaultUser.userId → User.id (enforced by Prisma)
- VaultUser.vaultId → Vault.id (enforced by Prisma)

**Unique Constraints**:
- User.email (enforced by Prisma)
- VaultUser.[userId, vaultId] (enforced by Prisma)

**Cascade Delete Rules**:
- Deleting Vault → cascades to Source (onDelete: Cascade)
- Deleting Vault → cascades to VaultUser (onDelete: Cascade)
- Deleting User → cascades to VaultUser (onDelete: Cascade)

**Non-Nullable Fields**:
- Vault.name, Vault.ownerId
- Source.vaultId, Source.title
- User.email

---

## Migration Status

**Phase 1 Migration**: Complete (schema deployed to NeonDB)

**Phase 2 Migration**: None required (no schema changes)

**Future Migrations**: Phase 3+ may add fields for authentication (User.password, User.emailVerified, etc.)
