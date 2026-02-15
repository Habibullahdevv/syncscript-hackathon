# Data Model: Phase 3 - Authentication & Role-Based Access Control

**Date**: 2026-02-15
**Feature**: 003-auth-rbac
**Purpose**: Document data structures for authentication and session management

## Overview

Phase 3 does not introduce new database models. It leverages the existing User model from Phase 1 and adds session management via JWT tokens (no database storage).

## Existing Models (No Changes)

### User Model

**Purpose**: Stores user authentication credentials and profile information.

**Schema** (from Phase 1 - `prisma/schema.prisma`):
```prisma
model User {
  id           String      @id @default(cuid())
  email        String      @unique
  name         String?
  passwordHash String
  role         String      @default("viewer")
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  vaultUsers   VaultUser[]
  auditLogs    AuditLog[]
}
```

**Fields**:
- `id`: Unique identifier (cuid)
- `email`: User's email address (unique, used for login)
- `name`: Optional display name
- `passwordHash`: Bcrypt-hashed password (10 rounds)
- `role`: User's global role ("owner" | "contributor" | "viewer")
- `createdAt`: Account creation timestamp
- `updatedAt`: Last modification timestamp
- `vaultUsers`: Relationship to vault memberships
- `auditLogs`: Relationship to audit trail

**Phase 3 Usage**:
- `email`: Used as username in NextAuth.js credentials provider
- `passwordHash`: Validated against user input during login
- `role`: Included in JWT session for role-based access control
- `id`: Included in JWT session for user identification

**No Schema Changes Required**: User model already has all necessary fields for authentication.

---

## Session Structure (JWT)

### JWT Token Payload

**Purpose**: Stateless session token containing user identity and role.

**Structure**:
```typescript
interface JWTToken {
  // Standard JWT claims
  iat: number;        // Issued at (Unix timestamp)
  exp: number;        // Expiry (Unix timestamp, 24 hours from iat)
  jti: string;        // JWT ID (unique identifier)

  // NextAuth.js standard claims
  name?: string;      // User's display name
  email: string;      // User's email address
  picture?: string;   // User's profile picture (unused in Phase 3)
  sub: string;        // Subject (user ID)

  // Custom claims (added via jwt callback)
  id: string;         // User ID (cuid)
  role: string;       // User role ("owner" | "contributor" | "viewer")
}
```

**Example JWT Payload**:
```json
{
  "iat": 1708012800,
  "exp": 1708099200,
  "jti": "clrx1y2z3000008l5a1b2c3d4",
  "name": "Demo Owner",
  "email": "owner@demo.com",
  "sub": "clrx1y2z3000008l5a1b2c3d4",
  "id": "clrx1y2z3000008l5a1b2c3d4",
  "role": "owner"
}
```

**Token Lifecycle**:
1. **Creation**: Generated on successful login via NextAuth.js credentials provider
2. **Storage**: Stored in HTTP-only cookie (`next-auth.session-token`)
3. **Validation**: Verified on every API request via `getServerSession()`
4. **Expiry**: 24 hours from creation (86400 seconds)
5. **Destruction**: Removed on logout via `signOut()`

**Security Properties**:
- Signed with NEXTAUTH_SECRET (prevents tampering)
- HTTP-only cookie (prevents XSS attacks)
- Secure flag in production (HTTPS only)
- SameSite=Lax (CSRF protection)

---

### Session Object (Server-Side)

**Purpose**: Typed session object available in API routes and server components.

**Structure**:
```typescript
interface Session {
  user: {
    id: string;         // User ID (from JWT token.id)
    email: string;      // User email (from JWT token.email)
    name?: string;      // User display name (from JWT token.name)
    role: string;       // User role (from JWT token.role)
  };
  expires: string;      // ISO 8601 expiry timestamp
}
```

**Example Session Object**:
```typescript
{
  user: {
    id: "clrx1y2z3000008l5a1b2c3d4",
    email: "owner@demo.com",
    name: "Demo Owner",
    role: "owner"
  },
  expires: "2026-02-16T12:00:00.000Z"
}
```

**Usage in API Routes**:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const session = await getServerSession(authOptions);
// session.user.id → "clrx1y2z3000008l5a1b2c3d4"
// session.user.role → "owner"
```

---

## Demo User Seed Data

### Demo Users

**Purpose**: Pre-configured users for testing and demonstration.

**Owner Demo User**:
```typescript
{
  email: "owner@demo.com",
  name: "Demo Owner",
  passwordHash: "$2a$10$...", // bcrypt hash of "owner123"
  role: "owner"
}
```

**Contributor Demo User**:
```typescript
{
  email: "contributor@demo.com",
  name: "Demo Contributor",
  passwordHash: "$2a$10$...", // bcrypt hash of "contributor123"
  role: "contributor"
}
```

**Seed Script** (`prisma/seed.ts`):
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create owner demo user
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {},
    create: {
      email: 'owner@demo.com',
      name: 'Demo Owner',
      passwordHash: ownerPassword,
      role: 'owner',
    },
  });

  // Create contributor demo user
  const contributorPassword = await bcrypt.hash('contributor123', 10);
  const contributor = await prisma.user.upsert({
    where: { email: 'contributor@demo.com' },
    update: {},
    create: {
      email: 'contributor@demo.com',
      name: 'Demo Contributor',
      passwordHash: contributorPassword,
      role: 'contributor',
    },
  });

  console.log({ owner, contributor });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Execution**:
```bash
npx prisma db seed
```

**Idempotency**: Uses `upsert()` to avoid duplicate users on repeated runs.

---

## Data Flow

### Authentication Flow

```
1. User submits credentials (email, password)
   ↓
2. NextAuth.js credentials provider validates
   ↓
3. Prisma queries User table by email
   ↓
4. Bcrypt compares password with passwordHash
   ↓
5. If valid: Create JWT with user.id and user.role
   ↓
6. Store JWT in HTTP-only cookie
   ↓
7. Return session to client
```

### API Request Flow

```
1. Client sends request with session cookie
   ↓
2. API route calls getServerSession(authOptions)
   ↓
3. NextAuth.js verifies JWT signature
   ↓
4. NextAuth.js checks expiry
   ↓
5. If valid: Return session object with user.id and user.role
   ↓
6. API route checks permissions via checkPermission(role, permission)
   ↓
7. If authorized: Process request
```

---

## Type Definitions

### TypeScript Types

```typescript
// User role enum
type Role = "owner" | "contributor" | "viewer";

// Permission enum (from Phase 2)
type Permission =
  | "vault:create"
  | "vault:read"
  | "vault:update"
  | "vault:delete"
  | "source:create"
  | "source:read"
  | "source:delete";

// Session user
interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

// NextAuth.js session
interface Session {
  user: SessionUser;
  expires: string;
}

// Demo user credentials
interface DemoUser {
  email: string;
  password: string;
  role: Role;
}
```

---

## Validation Rules

### Email Validation
- Must be valid email format
- Must be unique in User table
- Case-insensitive comparison

### Password Validation
- Minimum length: 8 characters (enforced in seed script)
- Hashed with bcrypt (10 rounds)
- Never stored in plaintext

### Role Validation
- Must be one of: "owner", "contributor", "viewer"
- Enforced at application layer (Zod schema)
- Default: "viewer" (if not specified)

### Session Validation
- JWT signature must be valid (signed with NEXTAUTH_SECRET)
- JWT must not be expired (< 24 hours old)
- User ID must exist in database (optional check)

---

## Performance Considerations

### Database Queries
- **Login**: 1 query (User lookup by email)
- **Session Validation**: 0 queries (JWT verification only)
- **API Requests**: 0 additional queries for auth (session already validated)

### Caching
- JWT tokens are self-contained (no database lookup needed)
- Session validation is O(1) (signature verification)

### Scalability
- Stateless sessions enable horizontal scaling
- No session storage in database (no bottleneck)
- Cookie-based authentication (no server-side state)

---

## Security Considerations

### Password Security
- Bcrypt hashing with 10 rounds (industry standard)
- Salts automatically generated and stored with hash
- Constant-time comparison (prevents timing attacks)

### Session Security
- HTTP-only cookies (prevents XSS)
- Secure flag in production (HTTPS only)
- SameSite=Lax (CSRF protection)
- 24-hour expiry (limits exposure window)

### Token Security
- Signed with NEXTAUTH_SECRET (prevents tampering)
- No sensitive data in JWT (only user ID and role)
- Expiry enforced (cannot be extended without re-authentication)

---

## Migration Notes

### From Phase 2 Mock Headers

**Before (Phase 2)**:
```typescript
const userId = headers.get('x-user-id');
const userRole = headers.get('x-user-role');
```

**After (Phase 3)**:
```typescript
const session = await getServerSession(authOptions);
const userId = session.user.id;
const userRole = session.user.role;
```

**Changes Required**:
- Replace `extractAuthHeaders()` with `requireAuth()` helper
- Update error handling (401 for no session, 403 for insufficient permissions)
- Keep existing `checkPermission()` logic unchanged

**No Database Changes**: User table schema remains identical.

---

## Summary

- **No new models**: Phase 3 uses existing User model from Phase 1
- **JWT sessions**: Stateless, no database storage required
- **Demo users**: 2 pre-seeded users (owner, contributor) with bcrypt-hashed passwords
- **Type-safe**: Full TypeScript support for session and user objects
- **Secure**: HTTP-only cookies, bcrypt hashing, JWT signing
- **Performant**: No database queries for session validation (JWT verification only)
