# Implementation Plan: Phase 3 - Authentication & Role-Based Access Control

**Branch**: `003-auth-rbac` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-auth-rbac/spec.md`

## Summary

Phase 3 implements secure authentication and session management to replace Phase 2's mock-header authentication. The system integrates NextAuth.js v5 with the existing Vault and Source APIs, enabling demo users (owner@demo.com, contributor@demo.com) to authenticate via a minimal login page, maintain JWT-based sessions, and enforce role-based access control on all backend endpoints. This phase delivers production-ready security while preserving Phase 2's API logic and permission matrix.

**Technical Approach**: Implement NextAuth.js credentials provider with bcrypt-hashed demo users, replace mock header extraction with `getServerSession()` in all API routes, create minimal login UI with Tailwind CSS, and update Postman collection for session-based testing.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15/16 App Router
**Primary Dependencies**: NextAuth.js v5 (next-auth@beta), bcryptjs, Prisma Client, Zod
**Storage**: NeonDB PostgreSQL (existing Phase 1 User table with email, passwordHash, role fields)
**Testing**: Postman for API testing, manual browser testing for login page
**Target Platform**: Next.js serverless functions on Vercel-compatible platform
**Project Type**: Web application (Next.js App Router with API routes + minimal frontend)
**Performance Goals**: Login < 5 seconds, session validation < 50ms p95, API requests with session < 250ms p95
**Constraints**: 24-hour session expiry, JWT session strategy (stateless), bcrypt rounds = 10, no OAuth providers
**Scale/Scope**: 2 demo users, 11 API endpoints to migrate, 1 login page, 1 optional role badge component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase 3 Principles (XV-XX) Compliance

- ✅ **Principle XV (NextAuth.js Exclusively)**: NextAuth.js v5 will be used for all authentication. Configuration in `src/app/api/auth/[...nextauth]/route.ts` with credentials provider.
- ✅ **Principle XVI (Demo User Mandate)**: Exactly 2 demo users (owner@demo.com, contributor@demo.com) will be seeded via Prisma seed script with bcrypt-hashed passwords.
- ✅ **Principle XVII (Session-Based API Protection)**: All 11 Phase 2 API endpoints will be updated to use `getServerSession()` instead of mock headers. Existing `checkPermission()` logic will be reused.
- ✅ **Principle XVIII (Login Page Requirement)**: Minimal login page at `/login` route with email/password inputs, NextAuth.js `signIn()` function, Tailwind CSS styling.
- ✅ **Principle XIX (Role Badge Display)**: Optional role badge component will be implemented for testing purposes.
- ✅ **Principle XX (Postman Authentication Testing)**: Phase 2 Postman collection will be updated with login endpoint, session token extraction, and authentication test cases.

### Phase 1-2 Principles Preservation

- ✅ **Principle I-VIII (Database Foundation)**: No schema changes required. Existing User table has email, passwordHash, role fields.
- ✅ **Principle IX-XIV (Backend APIs)**: Phase 2 API logic (Zod validation, Prisma queries, permission matrix) remains unchanged. Only authentication mechanism changes from mock headers to sessions.

### Performance Targets Compliance

- ✅ **Phase 3 Performance Targets**: Login < 300ms p95 (target: < 5s), session creation < 100ms p95, session validation < 50ms p95, API requests with session < 250ms p95
- ✅ **Password Hashing**: bcrypt rounds = 10 (constitution requirement)

**Gate Status**: ✅ PASSED - All Phase 3 principles satisfied, no violations

## Project Structure

### Documentation (this feature)

```text
specs/003-auth-rbac/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification (completed)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created - no new models)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   └── auth-api.yaml    # NextAuth.js endpoints contract
├── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
└── checklists/
    └── requirements.md  # Spec quality checklist (completed)
```

### Source Code (repository root)

```text
syncscript/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts          # NEW: NextAuth.js configuration
│   │   │   ├── vaults/
│   │   │   │   ├── route.ts              # MODIFIED: Replace mock headers with session
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts          # MODIFIED: Replace mock headers with session
│   │   │   │       └── sources/
│   │   │   │           ├── route.ts      # MODIFIED: Replace mock headers with session
│   │   │   │           └── [sourceId]/
│   │   │   │               └── route.ts  # MODIFIED: Replace mock headers with session
│   │   │   └── upload/
│   │   │       └── route.ts              # MODIFIED: Replace mock headers with session
│   │   ├── login/
│   │   │   └── page.tsx                  # NEW: Login page component
│   │   └── (authenticated)/
│   │       └── dashboard/
│   │           └── page.tsx              # NEW: Simple dashboard with role badge
│   ├── lib/
│   │   ├── auth.ts                       # MODIFIED: Add getServerSession wrapper, keep checkPermission()
│   │   ├── responses.ts                  # EXISTING: No changes
│   │   ├── validators.ts                 # EXISTING: No changes
│   │   └── cloudinary.ts                 # EXISTING: No changes
│   └── components/
│       └── RoleBadge.tsx                 # NEW: Optional role badge component
├── prisma/
│   ├── schema.prisma                     # EXISTING: No changes (User table already has passwordHash, role)
│   └── seed.ts                           # NEW: Demo user seeding script
├── postman/
│   ├── backend-apis.postman_collection.json  # MODIFIED: Add auth endpoints, update requests
│   └── backend-apis.postman_environment.json # MODIFIED: Add session token variables
└── .env.example                          # MODIFIED: Add NEXTAUTH_SECRET, NEXTAUTH_URL, demo passwords
```

**Structure Decision**: Web application structure with Next.js App Router. Authentication logic in `src/app/api/auth/`, login UI in `src/app/login/`, and session integration in existing API routes. No new directories needed beyond auth-specific routes.

## Complexity Tracking

> **No violations - this section is empty**

All Phase 3 requirements align with constitution principles. No additional complexity introduced.

## Architecture Decisions

### Decision 1: Session Storage Strategy

**Context**: NextAuth.js supports both JWT (stateless) and database sessions (stateful). Phase 3 requires session management for authentication.

**Options Considered**:
1. **JWT Sessions** (Stateless)
   - Pros: No database queries for session validation, scales horizontally, simpler setup
   - Cons: Cannot revoke sessions server-side, larger cookie size, token refresh complexity
2. **Database Sessions** (Stateful)
   - Pros: Can revoke sessions, smaller cookies, centralized session management
   - Cons: Database query on every request, requires Session model in Prisma schema

**Decision**: JWT Sessions

**Rationale**:
- Hackathon demo doesn't require server-side session revocation
- Stateless sessions align with serverless deployment model
- Avoids adding 6th model to Prisma schema (violates Principle V if Session model added)
- Performance: No database query for session validation (< 50ms p95 target)
- 24-hour expiry is acceptable for demo purposes

**Tradeoffs**: Cannot revoke sessions before expiry, but this is acceptable for Phase 3 scope.

---

### Decision 2: Password Hashing for Demo Users

**Context**: Demo users need credentials for testing. Constitution Principle XV mandates "NO plaintext password storage (use bcrypt or similar for hashing)".

**Options Considered**:
1. **Plaintext Passwords** (Demo-only)
   - Pros: Simpler seed script, faster login
   - Cons: Violates constitution, insecure, bad practice demonstration
2. **Bcrypt Hashing** (Production-ready)
   - Pros: Constitution compliant, demonstrates security best practices, production-ready
   - Cons: Slightly slower login (acceptable: bcrypt rounds = 10)

**Decision**: Bcrypt Hashing with 10 rounds

**Rationale**:
- Constitution Principle XV explicitly prohibits plaintext passwords
- Demonstrates security best practices for hackathon judges
- Performance impact minimal: < 100ms for hashing during login
- Passwords documented in .env.example for testing convenience

**Tradeoffs**: Slightly slower login, but within performance targets (< 5 seconds).

---

### Decision 3: Middleware Placement for Session Validation

**Context**: All Phase 2 API endpoints need session validation. NextAuth.js provides `getServerSession()` for session extraction.

**Options Considered**:
1. **Per-Route Session Extraction**
   - Pros: Explicit control per endpoint, easier to debug
   - Cons: Code duplication across 11 endpoints, easy to forget in new routes
2. **Global Middleware** (Next.js middleware.ts)
   - Pros: Automatic enforcement, single source of truth, DRY principle
   - Cons: Applies to all routes (need exceptions for /login, /api/auth), harder to customize per-route
3. **Shared Helper Function**
   - Pros: Reusable, explicit per-route, no global side effects
   - Cons: Must be called in every route, can be forgotten

**Decision**: Shared Helper Function (`requireAuth()` wrapper)

**Rationale**:
- Balances explicitness with reusability
- Avoids global middleware complexity (exceptions for /login, /api/auth)
- Easy to customize per-route (e.g., different roles)
- Aligns with existing Phase 2 pattern (explicit auth checks)
- Clear error handling per endpoint

**Tradeoffs**: Must be called in every protected route, but this is explicit and auditable.

---

### Decision 4: Login Page UI Complexity

**Context**: Phase 3 requires minimal login page. Constitution Principle XVIII mandates "minimal, functional design acceptable".

**Options Considered**:
1. **Full Dashboard with Navigation**
   - Pros: Complete user experience, demonstrates frontend skills
   - Cons: Out of scope for Phase 3, delays authentication implementation
2. **Minimal Login + Role Badge Only**
   - Pros: Meets Phase 3 requirements, fast to implement, focuses on authentication
   - Cons: Limited user experience, no dashboard functionality
3. **Login + Simple Dashboard Landing**
   - Pros: Demonstrates authentication flow, provides post-login destination
   - Cons: Slightly more complex than minimal requirement

**Decision**: Login + Simple Dashboard Landing with Role Badge

**Rationale**:
- Meets constitution requirement for minimal login page
- Provides clear post-login destination (required by Principle XVIII: redirect to /dashboard)
- Role badge demonstrates session state (Principle XIX)
- Keeps scope focused on authentication, not dashboard features
- Dashboard can be expanded in Phase 5 (frontend development)

**Tradeoffs**: No vault/source management UI yet, but this is deferred to Phase 5.

---

### Decision 5: Postman Session Token Extraction

**Context**: Postman collection needs to authenticate and include session tokens in API requests. NextAuth.js uses HTTP-only cookies by default.

**Options Considered**:
1. **HTTP-Only Cookies** (NextAuth.js default)
   - Pros: Secure, automatic browser handling, CSRF protection
   - Cons: Postman cannot easily extract/store HTTP-only cookies
2. **Custom Token Response** (Return JWT in response body)
   - Pros: Easy Postman extraction, explicit token management
   - Cons: Requires custom NextAuth.js configuration, less secure (XSS risk)
3. **Postman Cookie Jar** (Use Postman's cookie management)
   - Pros: Works with HTTP-only cookies, no custom code
   - Cons: Requires manual cookie extraction from response headers

**Decision**: Postman Cookie Jar with Manual Extraction

**Rationale**:
- Preserves NextAuth.js default security (HTTP-only cookies)
- No custom code required in authentication logic
- Postman can extract cookies from Set-Cookie headers
- Aligns with production security best practices
- Constitution Principle XX requires "Extract session token/cookie from login response"

**Tradeoffs**: Slightly more complex Postman setup, but maintains security.

---

## Execution Plan

### Phase 0: Research & Unknowns Resolution

**Objective**: Resolve all technical unknowns and establish implementation patterns.

**Research Tasks**:
1. NextAuth.js v5 App Router integration patterns
2. Bcrypt password hashing best practices (rounds, salt)
3. JWT session configuration in NextAuth.js
4. Postman cookie extraction from NextAuth.js responses
5. Next.js App Router authentication middleware patterns

**Output**: `research.md` with findings and implementation patterns

**Duration**: 10 minutes

---

### Phase 1: Design & Contracts

**Objective**: Define data models, API contracts, and implementation quickstart.

**Tasks**:
1. **Data Model** (`data-model.md`):
   - Document existing User model (no changes)
   - Document session structure (JWT payload)
   - Document demo user seed data

2. **API Contracts** (`contracts/auth-api.yaml`):
   - POST /api/auth/callback/credentials (login)
   - GET /api/auth/session (session check)
   - POST /api/auth/signout (logout)

3. **Quickstart Guide** (`quickstart.md`):
   - Environment setup (.env variables)
   - Demo user credentials
   - Login flow testing
   - Postman collection usage

4. **Agent Context Update**:
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`
   - Add NextAuth.js v5, bcryptjs to technology stack

**Output**: `data-model.md`, `contracts/auth-api.yaml`, `quickstart.md`, updated agent context

**Duration**: 15 minutes

---

### Phase 2: Implementation Phases

#### Phase 2.1: Foundation Setup (NextAuth.js & Demo Users)

**Objective**: Install NextAuth.js, configure credentials provider, seed demo users.

**Tasks**:
1. Install dependencies: `next-auth@beta`, `bcryptjs`, `@types/bcryptjs`
2. Create NextAuth.js configuration at `src/app/api/auth/[...nextauth]/route.ts`
3. Configure credentials provider with Prisma User lookup
4. Set up JWT session strategy with 24-hour expiry
5. Create Prisma seed script at `prisma/seed.ts` with bcrypt hashing
6. Add environment variables to `.env.example`: NEXTAUTH_SECRET, NEXTAUTH_URL, demo passwords
7. Run seed script to populate demo users

**Validation**:
- NextAuth.js routes accessible at /api/auth/*
- Demo users exist in database with hashed passwords
- Can create session via credentials provider

**Duration**: 10 minutes

---

#### Phase 2.2: Session & Middleware Integration

**Objective**: Replace mock header authentication with session-based validation in all API routes.

**Tasks**:
1. Create `requireAuth()` helper in `src/lib/auth.ts`:
   - Wraps `getServerSession(authOptions)`
   - Returns user ID and role from session
   - Throws 401 if no session
2. Update all 11 Phase 2 API endpoints:
   - Replace `extractAuthHeaders()` with `requireAuth()`
   - Keep existing `checkPermission()` logic
   - Maintain error response format
3. Remove mock header extraction code (keep for reference in comments)

**Endpoints to Update**:
- POST /api/vaults
- GET /api/vaults
- GET /api/vaults/[id]
- PATCH /api/vaults/[id]
- DELETE /api/vaults/[id]
- POST /api/vaults/[id]/sources
- GET /api/vaults/[id]/sources
- DELETE /api/vaults/[id]/sources/[sourceId]
- POST /api/upload

**Validation**:
- API requests without session return 401
- API requests with session but insufficient role return 403
- API requests with valid session and role succeed

**Duration**: 15 minutes

---

#### Phase 2.3: Role-Based Access Enforcement

**Objective**: Verify permission matrix enforcement with session-based authentication.

**Tasks**:
1. Test owner role: Full access to all endpoints
2. Test contributor role: Cannot delete vaults, can create sources
3. Test viewer role: Read-only access (if implemented)
4. Verify audit logging still works with session user IDs

**Validation**:
- Permission matrix from Phase 2 enforced correctly
- Role hierarchy: owner > contributor > viewer
- Unauthorized actions return 403 with clear error messages

**Duration**: 5 minutes

---

#### Phase 2.4: Minimal Frontend Login Page

**Objective**: Create login UI for demo user authentication.

**Tasks**:
1. Create login page at `src/app/login/page.tsx`:
   - Email and password input fields
   - Submit button
   - Error message display
   - Tailwind CSS styling (minimal, functional)
2. Implement login logic:
   - Use NextAuth.js `signIn('credentials', { email, password })`
   - Handle success: redirect to /dashboard
   - Handle failure: display error message
3. Create simple dashboard at `src/app/(authenticated)/dashboard/page.tsx`:
   - Display "Welcome, [email]"
   - Show role badge component
   - Logout button
4. Create RoleBadge component at `src/components/RoleBadge.tsx`:
   - Read role from session
   - Display badge with role name
   - Color-coded: owner (red), contributor (blue), viewer (gray)

**Validation**:
- Login page renders at /login
- Demo users can log in successfully
- Failed login shows error message
- Successful login redirects to /dashboard
- Role badge displays correct role
- Logout destroys session

**Duration**: 10 minutes

---

#### Phase 2.5: Testing & Validation

**Objective**: Comprehensive testing with Postman and manual browser testing.

**Tasks**:
1. Update Postman collection:
   - Add login request: POST /api/auth/callback/credentials
   - Add pre-request script to extract session cookie
   - Update all API requests to include session cookie
   - Add test cases for 401 (no session) and 403 (wrong role)
2. Manual browser testing:
   - Login flow for both demo users
   - Session persistence across page refreshes
   - Logout functionality
   - Role badge display
3. API testing via Postman:
   - All 11 endpoints with valid session
   - All endpoints without session (401)
   - Role-restricted endpoints with insufficient permissions (403)

**Validation**:
- All Postman tests pass
- Login/logout flow works in browser
- Session persists for 24 hours
- API endpoints correctly validate sessions
- Role enforcement works as expected

**Duration**: 10 minutes

---

## Quality Validation Framework

### Code Quality
- TypeScript strict mode enabled
- No unused imports or variables
- Proper error handling with try-catch blocks
- Consistent code formatting (Prettier)
- Clear separation: auth logic in lib/auth.ts, UI in app/login/

### Security
- All passwords hashed with bcrypt (10 rounds)
- HTTP-only cookies for session tokens
- CSRF protection via NextAuth.js
- No sensitive data in error messages
- Session expiry enforced (24 hours)

### Data Integrity
- No schema changes (User table unchanged)
- Demo users seeded with unique emails
- Audit logging continues to work with session user IDs
- Phase 2 permission matrix preserved

### Operational
- Server boots without errors
- NextAuth.js routes accessible
- Sessions persist across requests
- Environment variables documented in .env.example

### Performance
- Login < 5 seconds (target met)
- Session validation < 50ms p95 (JWT decode)
- API requests with session < 250ms p95
- Bcrypt hashing < 100ms (10 rounds)

---

## Execution Timeline

**Total Duration**: ~60 minutes (with buffer)

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 0: Research | 10 min | 10 min |
| Phase 1: Design & Contracts | 15 min | 25 min |
| Phase 2.1: Foundation Setup | 10 min | 35 min |
| Phase 2.2: Session Integration | 15 min | 50 min |
| Phase 2.3: Role Enforcement | 5 min | 55 min |
| Phase 2.4: Login Page | 10 min | 65 min |
| Phase 2.5: Testing | 10 min | 75 min |

**Critical Path**: Phase 2.1 → Phase 2.2 → Phase 2.5 (foundation → integration → testing)

**Parallelization Opportunities**: Phase 2.4 (login page) can be developed in parallel with Phase 2.2 (API integration) if multiple developers available.

---

## Completion Criteria

Phase 3 is complete when all of the following are verified:

### Authentication
- ✅ NextAuth.js configured with credentials provider
- ✅ Demo users seeded with bcrypt-hashed passwords
- ✅ Login page functional at /login route
- ✅ Sessions created with 24-hour expiry
- ✅ Logout destroys sessions

### API Integration
- ✅ All 11 Phase 2 endpoints use `getServerSession()` instead of mock headers
- ✅ Unauthenticated requests return 401 Unauthorized
- ✅ Insufficient permissions return 403 Forbidden
- ✅ Valid sessions with correct roles succeed

### Testing
- ✅ Postman collection updated with session-based authentication
- ✅ All Postman tests pass (success, 401, 403 cases)
- ✅ Manual browser testing confirms login/logout flow
- ✅ Role badge displays correct role from session

### Documentation
- ✅ .env.example updated with NEXTAUTH_SECRET, NEXTAUTH_URL, demo passwords
- ✅ Quickstart guide documents login flow and demo credentials
- ✅ Postman collection includes session token extraction instructions

### Constitution Compliance
- ✅ All Phase 3 principles (XV-XX) satisfied
- ✅ No Phase 1-2 principles violated
- ✅ Performance targets met (login < 5s, session validation < 50ms)

---

## Risk Mitigation

### Risk 1: NextAuth.js v5 Beta Instability
**Likelihood**: Medium | **Impact**: High
**Mitigation**: Use stable v5 beta release, test thoroughly, have fallback to v4 if critical bugs found
**Contingency**: If v5 unstable, downgrade to NextAuth.js v4 (stable) with similar configuration

### Risk 2: Session Cookie Issues in Postman
**Likelihood**: Medium | **Impact**: Medium
**Mitigation**: Document cookie extraction process clearly, provide example Postman scripts
**Contingency**: If cookies don't work, implement custom token response for testing only

### Risk 3: Performance Degradation from Session Validation
**Likelihood**: Low | **Impact**: Medium
**Mitigation**: Use JWT sessions (no database query), monitor p95 latency
**Contingency**: If performance issues, implement session caching or optimize JWT decode

### Risk 4: Breaking Phase 2 API Functionality
**Likelihood**: Low | **Impact**: High
**Mitigation**: Keep existing permission logic unchanged, test all endpoints after migration
**Contingency**: If APIs break, rollback to mock headers temporarily, debug session integration

---

## Dependencies

### External Dependencies
- NextAuth.js v5 (next-auth@beta) - authentication library
- bcryptjs - password hashing
- Prisma Client - database access (existing)
- Next.js 15/16 App Router - framework (existing)

### Internal Dependencies
- Phase 1 complete: User table with email, passwordHash, role fields
- Phase 2 complete: All 11 API endpoints functional with mock headers
- Existing permission matrix in lib/auth.ts
- Existing error response helpers in lib/responses.ts

### Environment Dependencies
- NEXTAUTH_SECRET: Random string for JWT signing
- NEXTAUTH_URL: Application URL (http://localhost:3000 for dev)
- DATABASE_URL: NeonDB connection string (existing)
- Demo user passwords documented in .env.example

---

## Follow-Up Work (Out of Scope for Phase 3)

- Phase 4: Real-time features with Socket.io
- Phase 5: Frontend dashboard with vault/source management UI
- Phase 6: Hackathon submission polish (README, demo script)
- Future: User registration/signup flows
- Future: Password reset functionality
- Future: OAuth providers (Google, GitHub)
- Future: Multi-factor authentication (MFA)
