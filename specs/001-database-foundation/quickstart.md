# Quickstart: Database Foundation

**Feature**: Database Foundation (001-database-foundation)
**Date**: 2026-02-15
**Time Estimate**: 20 minutes
**Prerequisites**: Node.js 18+, npm, NeonDB account, Cloudinary credentials

## Overview

This guide walks through setting up the SyncScript Phase 1 database foundation from scratch. Follow steps sequentially for a working NeonDB + Prisma setup with 5 validated models.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn package manager
- [ ] NeonDB account (sign up at neon.tech with GitHub)
- [ ] Cloudinary credentials (cloud name, API key, API secret)
- [ ] Git repository initialized
- [ ] 20 minutes of uninterrupted time

## Phase 1A: Environment Setup (5 minutes)

### Step 1: Create Next.js 15 Project

```bash
npx create-next-app@latest syncscript --typescript --tailwind --app --src-dir
```

**Prompts**:
- ✅ TypeScript: Yes
- ✅ ESLint: Yes (default)
- ✅ Tailwind CSS: Yes
- ✅ `src/` directory: Yes
- ✅ App Router: Yes
- ✅ Import alias: No (default @/*)

**Expected Output**:
```
Creating a new Next.js app in /path/to/syncscript...
✔ Installed dependencies
Success! Created syncscript at /path/to/syncscript
```

**Validation**:
```bash
cd syncscript
ls -la
# Should see: src/, package.json, tsconfig.json, tailwind.config.ts
```

### Step 2: Install Prisma Dependencies

```bash
npm install prisma @prisma/client @neondatabase/serverless
```

**Expected Output**:
```
added 3 packages in 15s
```

**Validation**:
```bash
cat package.json | grep prisma
# Should see: "prisma": "^5.x.x", "@prisma/client": "^5.x.x"
```

### Step 3: Initialize Prisma

```bash
npx prisma init
```

**Expected Output**:
```
✔ Your Prisma schema was created at prisma/schema.prisma
✔ .env was created
```

**Validation**:
```bash
ls prisma/
# Should see: schema.prisma
ls .env
# Should see: .env
```

**⏱️ Checkpoint**: Phase 1A complete (5 minutes elapsed)

---

## Phase 1B: NeonDB Provisioning (3 minutes)

### Step 4: Create NeonDB Project

1. Navigate to [neon.tech](https://neon.tech)
2. Click "Sign in with GitHub"
3. Authorize NeonDB application
4. Click "New Project"
5. Enter project name: **SyncScript Hackathon**
6. Select region: **US East (Ohio)** (or closest to you)
7. Click "Create Project"

**Expected Result**: Project dashboard with connection string visible

### Step 5: Copy DATABASE_URL

1. In NeonDB dashboard, locate "Connection string" section
2. Select "Prisma" tab
3. Copy the connection string (format: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`)

**Important**: Ensure `?sslmode=require` is at the end of the URL

### Step 6: Configure Environment Variables

Create `.env.local` file (Next.js convention for local secrets):

```bash
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
CLOUDINARY_CLOUD_NAME="dwcx1axgj"
CLOUDINARY_API_KEY="272347898467147"
CLOUDINARY_API_SECRET="g1n1EfMgy7yP1Ipx3pjR8BPsL8Y"
EOF
```

**Replace** the DATABASE_URL value with your actual NeonDB connection string.

**Also update** `.env` file for Prisma CLI:

```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
EOF
```

**Validation**:
```bash
cat .env.local | grep DATABASE_URL
# Should see your NeonDB connection string with ?sslmode=require
```

**⏱️ Checkpoint**: Phase 1B complete (8 minutes elapsed)

---

## Phase 1C: Prisma Schema Implementation (7 minutes)

### Step 7: Define Prisma Schema

Replace the contents of `prisma/schema.prisma` with:

```prisma
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

### Step 8: Validate Schema Syntax

```bash
npx prisma validate
```

**Expected Output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
The schema is valid ✔
```

**If errors occur**:
- Check for typos in model names
- Verify `@relation` syntax matches exactly
- Ensure all `@@index` and `@@unique` are correctly formatted

### Step 9: Push Schema to NeonDB

```bash
npx prisma db push
```

**Expected Output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-xxx.us-east-2.aws.neon.tech"

🚀  Your database is now in sync with your Prisma schema. Done in 2.5s

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client in 1.2s
```

**If connection fails**:
- Verify DATABASE_URL in `.env` is correct
- Ensure `?sslmode=require` is present
- Check NeonDB project is active in dashboard

### Step 10: Generate Prisma Client

```bash
npx prisma generate
```

**Expected Output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client in 1.5s
```

**Validation**:
```bash
ls node_modules/.prisma/client/
# Should see: index.d.ts, index.js, schema.prisma
```

**⏱️ Checkpoint**: Phase 1C complete (15 minutes elapsed)

---

## Phase 1D: Validation & Handoff (5 minutes)

### Step 11: Visual Verification (Prisma Studio)

```bash
npx prisma studio
```

**Expected Output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Prisma Studio is up on http://localhost:5555
```

**Browser opens automatically** at http://localhost:5555

**Verify**:
- ✅ Left sidebar shows 5 models: User, Vault, VaultUser, Source, AuditLog
- ✅ Click each model → Empty table with correct columns visible
- ✅ Relationships visible (e.g., VaultUser shows User and Vault links)

**Leave Prisma Studio running** for Step 13.

### Step 12: NeonDB Dashboard Verification

1. Navigate to [neon.tech](https://neon.tech) → Your project
2. Click "Tables" tab in left sidebar

**Verify**:
- ✅ 5 tables visible: User, Vault, VaultUser, Source, AuditLog
- ✅ Click "User" → Columns: id, email, name, createdAt
- ✅ Click "VaultUser" → Indexes: VaultUser_userId_vaultId_key (unique), VaultUser_vaultId_idx
- ✅ Click "Source" → Indexes: Source_vaultId_idx
- ✅ Click "AuditLog" → Indexes: AuditLog_userId_createdAt_idx

### Step 13: Manual Test Data (Optional)

**In Prisma Studio** (http://localhost:5555):

1. **Create User**:
   - Click "User" model
   - Click "Add record"
   - Fill: `email: "owner@test.com"`, `name: "Owner"`
   - Click "Save 1 change"
   - Copy the generated `id` (starts with "cl...")

2. **Create Vault**:
   - Click "Vault" model
   - Click "Add record"
   - Fill: `name: "Test Vault"`, `ownerId: "<paste-user-id>"`
   - Click "Save 1 change"
   - Copy the generated `id`

3. **Create VaultUser**:
   - Click "VaultUser" model
   - Click "Add record"
   - Fill: `userId: "<user-id>"`, `vaultId: "<vault-id>"`, `role: "owner"`
   - Click "Save 1 change"

4. **Verify Relationships**:
   - Click "User" → Click the user record → Scroll to "vaultUsers" → Should show 1 related record
   - Click "Vault" → Click the vault record → Scroll to "vaultUsers" → Should show 1 related record

5. **Test Unique Constraint**:
   - Try creating another VaultUser with same userId + vaultId
   - Should fail with: "Unique constraint failed on the fields: (`userId`,`vaultId`)"

6. **Test Cascade Delete**:
   - Click "Vault" → Delete the vault record
   - Click "VaultUser" → Should be empty (cascade deleted)

**⏱️ Checkpoint**: Phase 1D complete (20 minutes elapsed)

---

## Quality Gates Checklist

Before proceeding to Phase 2, verify all gates pass:

- [ ] **Next.js 15 App Router structure confirmed**: `src/app/` directory exists
- [ ] **NeonDB DATABASE_URL active**: No connection errors during `prisma db push`
- [ ] **5 tables created with correct foreign keys**: Verified in NeonDB dashboard
- [ ] **Prisma client generated without TypeScript errors**: `node_modules/.prisma/client/` exists
- [ ] **Prisma Studio loads with full relationship graph**: All 5 models visible with relationships

## Success Criteria Validation

Map to spec.md success criteria:

- [ ] **SC-001**: `npx prisma validate` exits with code 0 ✅
- [ ] **SC-002**: `npx prisma db push` exits with code 0 ✅
- [ ] **SC-003**: Prisma Studio shows 5 tables with relationships ✅
- [ ] **SC-004**: NeonDB dashboard confirms live tables ✅
- [ ] **SC-005**: Prisma Client generated with TypeScript types ✅
- [ ] **SC-006**: Test data creation and persistence works ✅ (if Step 13 completed)
- [ ] **SC-007**: Bidirectional relationship queries work ✅ (if Step 13 completed)
- [ ] **SC-008**: Unique constraints enforced ✅ (if Step 13 completed)
- [ ] **SC-009**: Cascade deletes work correctly ✅ (if Step 13 completed)
- [ ] **SC-010**: Setup completes within 20 minutes ✅

## Troubleshooting

### Issue: `npx prisma db push` fails with SSL error

**Error**: `Error: P1011: Error opening a TLS connection: error:1416F086:SSL routines:tls_process_server_certificate:certificate verify failed`

**Solution**:
1. Verify DATABASE_URL ends with `?sslmode=require`
2. If still failing, try `?sslmode=require&sslaccept=strict`
3. Check NeonDB project is active (not suspended)

### Issue: `npx prisma generate` fails with "Cannot find module"

**Error**: `Error: Cannot find module '@prisma/client'`

**Solution**:
1. Delete `node_modules/` and `package-lock.json`
2. Run `npm install` again
3. Run `npx prisma generate`

### Issue: Prisma Studio shows empty relationships

**Symptom**: VaultUser model doesn't show User/Vault links

**Solution**:
1. Verify `@relation` syntax in schema.prisma
2. Run `npx prisma db push --force-reset` (WARNING: deletes all data)
3. Restart Prisma Studio

### Issue: NeonDB connection pool exhausted

**Error**: `Error: P1001: Can't reach database server`

**Solution**:
1. NeonDB serverless auto-scales, this shouldn't happen in Phase 1
2. Check NeonDB dashboard for project status
3. Verify no other processes are holding connections

## Next Steps

Phase 1 complete! You now have:

✅ Next.js 15 project with TypeScript and Tailwind CSS
✅ Prisma schema with 5 validated models
✅ NeonDB PostgreSQL database with live tables
✅ Generated Prisma Client for type-safe queries
✅ Cloudinary credentials configured for Phase 2

**Ready for Phase 2**: Backend API development
- Create Next.js API routes in `src/app/api/`
- Implement CRUD endpoints for Vault, Source, VaultUser
- Add role-based access control middleware
- Integrate Cloudinary PDF uploads

**Command to proceed**:
```bash
/sp.tasks  # Generate implementation tasks for Phase 2
```

## Quick Reference

### Useful Commands

```bash
# Validate schema syntax
npx prisma validate

# Push schema to database (development)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# View Prisma Client types
cat node_modules/.prisma/client/index.d.ts
```

### File Locations

- **Prisma schema**: `prisma/schema.prisma`
- **Environment variables**: `.env.local` (local), `.env` (Prisma CLI)
- **Generated client**: `node_modules/.prisma/client/`
- **Next.js app**: `src/app/`

### NeonDB Dashboard

- **URL**: https://console.neon.tech
- **Tables**: Left sidebar → Tables
- **Connection string**: Project settings → Connection string → Prisma

### Prisma Studio

- **URL**: http://localhost:5555
- **Start**: `npx prisma studio`
- **Stop**: Ctrl+C in terminal
