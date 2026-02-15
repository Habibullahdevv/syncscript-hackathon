---
name: prisma-neon-setup
description: Configure NeonDB PostgreSQL + Prisma schema for SyncScript relational models
use for: Phase 1 database foundation
---

# NeonDB + Prisma Setup
## Instructions
1. **NeonDB Connection**
   - Extract `DATABASE_URL` from neon.tech dashboard
   - SSL configuration for serverless PostgreSQL
   - Connection pooling for hackathon concurrency

2. **Prisma Schema Structure**
   - 5 models: User/Vault/VaultUser/Source/AuditLog
   - Many-to-many junction table (VaultUser with roles)
   - Index optimization for vault queries

3. **Validation Steps**
   - `npx prisma db push`
   - `npx prisma generate`
   - `npx prisma studio` → Verify relationships

## Best Practices
- Use `@default(cuid())` for IDs
- Role field: "owner" | "contributor" | "viewer"
- AuditLog with JSON details field
- Unique constraint on VaultUser[vaultId, userId]

## Example Schema Snippet
```prisma
model VaultUser {
  id        String @id @default(cuid())
  vaultId   String
  userId    String
  role      String // owner/contributor/viewer
  @@unique([vaultId, userId])
}
