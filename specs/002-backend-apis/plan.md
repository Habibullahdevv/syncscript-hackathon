# Implementation Plan: Backend APIs

**Branch**: `002-backend-apis` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-backend-apis/spec.md`

## Summary

Implement RESTful API layer for vault and source management using Next.js 15 App Router with Prisma ORM connected to NeonDB PostgreSQL. System provides 11 endpoints for CRUD operations on vaults and sources, enforces role-based access control via mock request headers (x-user-id, x-user-role), validates all inputs with Zod schemas, and integrates Cloudinary for secure PDF uploads. All endpoints return standardized JSON responses and are testable via Postman without frontend dependencies. Phase strictly excludes authentication system (NextAuth.js), real-time features, and UI components.

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode enabled)
**Primary Dependencies**: Next.js 15 App Router, Prisma 7.x, Zod 3.x, Cloudinary SDK
**Storage**: NeonDB PostgreSQL (existing Phase 1 schema: User, Vault, VaultUser, Source, AuditLog)
**Testing**: Postman manual testing (no automated test frameworks in Phase 2)
**Target Platform**: Node.js 18+ server environment
**Project Type**: Web API (backend-only, no frontend)
**Performance Goals**: <200ms p95 response time (non-upload), 50 concurrent requests minimum
**Constraints**: Mock header authentication only, no sessions/JWT, 10MB max file size, PDF only
**Scale/Scope**: 11 API endpoints, 3 Prisma models (reusing Phase 1 schema), ~40 minutes implementation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase 1 Principles (I-VIII) - Inherited from Database Foundation

- ✅ **Principle I**: NeonDB PostgreSQL serverless (DATABASE_URL from Phase 1)
- ✅ **Principle II**: Prisma ORM exclusively (reusing Phase 1 schema)
- ✅ **Principle III**: ACID transactions for vault operations (prisma.$transaction())
- ✅ **Principle IV**: Zero-downtime schema evolution (additive changes only)
- ✅ **Principle V**: Five-model architecture (no new models in Phase 2)
- ✅ **Principle VI**: Role-based access control format (owner/contributor/viewer strings)
- ✅ **Principle VII**: Global unique identifiers (cuid() from Phase 1)
- ✅ **Principle VIII**: Cloudinary integration ready (fileUrl field exists in Source model)

### Phase 2 Principles (IX-XIV) - Current Phase

- ✅ **Principle IX**: Backend-First Architecture
  - API routes in `src/app/api/` directory
  - Postman collection for all endpoints
  - NO frontend components

- ✅ **Principle X**: Stateless API Design
  - Mock headers: x-user-id, x-user-role
  - NO NextAuth.js, NO sessions, NO JWT

- ✅ **Principle XI**: Request Validation with Zod
  - Zod schemas for all POST/PATCH endpoints
  - 400 Bad Request with detailed errors

- ✅ **Principle XII**: Role-Based Middleware
  - Custom middleware for header extraction
  - Role hierarchy enforcement (owner > contributor > viewer)
  - 403 Forbidden for unauthorized requests

- ✅ **Principle XIII**: Cloudinary PDF Upload API
  - /api/upload endpoint
  - Multipart/form-data handling
  - File type and size validation

- ✅ **Principle XIV**: Postman Testing Requirement
  - Complete collection with success/error cases
  - Environment variables for base URL and headers

**Gate Status**: ✅ PASS - All Phase 2 principles satisfied, no violations

## Project Structure

### Documentation (this feature)

```text
specs/002-backend-apis/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - Architecture decisions
├── data-model.md        # Phase 1 output - Prisma schema details
├── quickstart.md        # Phase 1 output - Postman testing guide
├── contracts/           # Phase 1 output - API endpoint specifications
│   ├── vaults.yaml      # Vault CRUD endpoints
│   ├── sources.yaml     # Source CRUD endpoints
│   └── upload.yaml      # Cloudinary upload endpoint
└── spec.md              # Feature specification (already exists)
```

### Source Code (repository root)

```text
syncscript/                    # Next.js 15 project (from Phase 1)
├── src/
│   ├── app/
│   │   └── api/               # API routes (Phase 2 implementation)
│   │       ├── vaults/
│   │       │   ├── route.ts           # POST /api/vaults, GET /api/vaults
│   │       │   └── [id]/
│   │       │       ├── route.ts       # GET/PATCH/DELETE /api/vaults/[id]
│   │       │       └── sources/
│   │       │           ├── route.ts   # POST/GET /api/vaults/[id]/sources
│   │       │           └── [sourceId]/
│   │       │               └── route.ts # DELETE /api/vaults/[id]/sources/[sourceId]
│   │       └── upload/
│   │           └── route.ts           # POST /api/upload
│   └── lib/
│       ├── prisma.ts          # Prisma Client singleton (from Phase 1)
│       ├── cloudinary.ts      # Cloudinary SDK configuration
│       ├── auth.ts            # Mock header authentication middleware
│       ├── validators.ts      # Zod schemas for request validation
│       └── responses.ts       # Standardized response format helpers
├── prisma/
│   └── schema.prisma          # Existing Phase 1 schema (no changes)
├── postman/                   # Postman collection (Phase 2 deliverable)
│   ├── backend-apis.postman_collection.json
│   └── backend-apis.postman_environment.json
├── .env.local                 # Environment variables (Phase 1 + Cloudinary)
└── package.json               # Dependencies (add Zod, Cloudinary SDK)
```

**Structure Decision**: Next.js App Router with nested route structure for RESTful API design. Vault endpoints at `/api/vaults`, source endpoints nested under vaults at `/api/vaults/[id]/sources` to reflect resource hierarchy. Shared utilities in `/src/lib` for reusability across routes. Postman collection in dedicated `/postman` directory for testing artifacts.

## Complexity Tracking

> No constitution violations - this section is empty.

## Phase 0: Research & Architecture Decisions

### Decision 1: Ownership Model

**Options Considered**:
- **Option A**: Vault stores ownerId only (simple foreign key)
- **Option B**: Separate VaultUser membership table with roles

**Decision**: Option A - Vault stores ownerId only

**Rationale**: Phase 2 scope is backend APIs only. Simple ownership model (one owner per vault) satisfies all Phase 2 requirements without multi-member complexity. VaultUser table from Phase 1 exists but is not utilized in Phase 2 API implementation.

**Tradeoff**: Not scalable for multi-member vaults (multiple users with different roles per vault). This limitation is acceptable because Phase 3 will introduce proper membership management when authentication system is implemented.

**Implementation Impact**:
- Vault model requires ownerId field (foreign key to User.id)
- Role enforcement simplified: only vault owner can update/delete
- No junction table queries needed in Phase 2

---

### Decision 2: Role Storage Strategy

**Options Considered**:
- **Option A**: Role stored in User table (persistent)
- **Option B**: Role only from request headers (ephemeral)
- **Option C**: Role in both DB and headers (hybrid)

**Decision**: Option C - Store role in User table, validate via headers

**Rationale**: User table from Phase 1 includes role field. Phase 2 APIs read role from x-user-role header for testing convenience, but role should also exist in database for data integrity and Phase 3 migration path.

**Tradeoff**: Temporary inconsistency between header role and database role is tolerated in Phase 2. Header takes precedence for authorization decisions. Phase 3 authentication will enforce consistency.

**Implementation Impact**:
- Middleware reads x-user-role header (does not query database)
- Database role field exists but is not validated against header in Phase 2
- Phase 3 migration: replace header extraction with session-based role lookup

---

### Decision 3: Cascade Delete Strategy

**Options Considered**:
- **Option A**: Manual deletion logic in API routes
- **Option B**: Prisma cascade delete rules (onDelete: Cascade)

**Decision**: Option B - Prisma cascade delete

**Rationale**: Prisma's declarative cascade delete ensures referential integrity at database level. When vault is deleted, all associated sources are automatically removed without explicit API logic.

**Tradeoff**: Less granular control over deletion behavior (cannot selectively preserve sources). However, this aligns with vault ownership model where sources belong exclusively to one vault.

**Implementation Impact**:
- Source model: `vault Vault @relation(fields: [vaultId], references: [id], onDelete: Cascade)`
- DELETE /api/vaults/[id] endpoint only needs to delete vault record
- Database automatically cascades to sources

---

### Decision 4: Upload Method

**Options Considered**:
- **Option A**: Direct unsigned upload (client uploads directly to Cloudinary)
- **Option B**: Signed upload via API (server generates signed URL)

**Decision**: Option B - Signed upload via API

**Rationale**: Server-side signed upload provides security control over who can upload, file type validation, and size limits. Prevents unauthorized uploads and malicious file types.

**Tradeoff**: Slight complexity increase (server must generate signature) and additional latency (file passes through API server). However, security and validation requirements justify this approach.

**Implementation Impact**:
- POST /api/upload endpoint generates Cloudinary signed upload parameters
- Server validates file type (PDF only) and size (10MB max) before upload
- Returns secure Cloudinary URL after successful upload

---

### Decision 5: File Validation Location

**Options Considered**:
- **Option A**: Client-side validation only (browser checks file type/size)
- **Option B**: Server-side validation only (API checks file type/size)
- **Option C**: Both client and server validation

**Decision**: Option B - Server-side validation only

**Rationale**: Phase 2 has no frontend (backend-only). Server-side validation is mandatory for security. Client-side validation would be added in Phase 5 for UX but is not applicable in Phase 2.

**Tradeoff**: No early feedback to user about invalid files (would require client-side check). Acceptable because Phase 2 testing is via Postman where developers can read API error responses.

**Implementation Impact**:
- Upload endpoint validates file.type === 'application/pdf'
- Upload endpoint validates file.size <= 10MB
- Returns 400 Bad Request with INVALID_INPUT error code if validation fails

---

### Decision 6: Response Format Standardization

**Options Considered**:
- **Option A**: Varied response formats per endpoint
- **Option B**: Standardized envelope format for all responses

**Decision**: Option B - Standardized envelope format

**Rationale**: Consistent response structure simplifies API consumption and error handling. All responses follow `{ success, data, error }` pattern.

**Tradeoff**: Slight verbosity (success flag is redundant with HTTP status code). However, consistency and ease of parsing justify this approach.

**Implementation Impact**:
```typescript
// Success response
{ success: true, data: { ...resource }, error: null }

// Error response
{ success: false, data: null, error: { code: "ERROR_CODE", message: "..." } }
```

---

### Decision 7: Error Code Strategy

**Options Considered**:
- **Option A**: HTTP status codes only
- **Option B**: Custom error codes + HTTP status codes

**Decision**: Option B - Custom error codes + HTTP status codes

**Rationale**: HTTP status codes provide transport-level semantics (401, 403, 404, 400, 500). Custom error codes provide application-level semantics (UNAUTHORIZED, FORBIDDEN, NOT_FOUND, INVALID_INPUT, SERVER_ERROR). Combination enables precise error handling.

**Tradeoff**: Additional complexity in error handling logic. However, improved API consumer experience justifies this approach.

**Implementation Impact**:
- Define error code enum: UNAUTHORIZED, FORBIDDEN, INVALID_INPUT, NOT_FOUND, SERVER_ERROR
- Map error codes to HTTP status codes (UNAUTHORIZED→401, FORBIDDEN→403, etc.)
- Never expose raw Prisma errors (wrap in SERVER_ERROR)

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete Prisma schema details.

**Key Models** (from Phase 1, no changes in Phase 2):
- User: Authentication identity with role field
- Vault: Container for sources with ownerId
- VaultUser: Many-to-many junction (not used in Phase 2)
- Source: Research source with fileUrl for Cloudinary
- AuditLog: Immutable event log (not used in Phase 2)

### API Contracts

See [contracts/](./contracts/) directory for OpenAPI specifications.

**Endpoint Summary**:
- 5 Vault endpoints (POST, GET list, GET by ID, PATCH, DELETE)
- 3 Source endpoints (POST, GET list, DELETE)
- 1 Upload endpoint (POST)

### Testing Guide

See [quickstart.md](./quickstart.md) for Postman testing scenarios.

**Test Coverage**:
- Success cases for all endpoints
- Role-based authorization tests (owner/contributor/viewer)
- Validation error tests (missing fields, invalid formats)
- Not found tests (invalid IDs)
- Unauthorized tests (missing headers)

## Phase 2: Implementation Execution Plan

### Phase 2.1: Foundation Setup (10 minutes)

**Objectives**:
- Install dependencies (Zod, Cloudinary SDK)
- Configure Cloudinary credentials in .env.local
- Create lib utilities (auth.ts, validators.ts, responses.ts, cloudinary.ts)

**Deliverables**:
- package.json updated with zod, cloudinary
- .env.local includes CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- lib/auth.ts: extractAuthHeaders(), validateRole(), checkPermission()
- lib/validators.ts: Zod schemas for vault and source inputs
- lib/responses.ts: successResponse(), errorResponse()
- lib/cloudinary.ts: Cloudinary SDK configuration

**Validation**:
- npm install completes without errors
- TypeScript compiles without errors
- Dev server starts successfully

---

### Phase 2.2: Vault CRUD APIs (10 minutes)

**Implementation Order**:
1. POST /api/vaults (create vault)
2. GET /api/vaults (list user's vaults)
3. GET /api/vaults/[id] (get vault details)
4. PATCH /api/vaults/[id] (update vault name)
5. DELETE /api/vaults/[id] (delete vault + cascade sources)

**Implementation Pattern** (per endpoint):
```typescript
// 1. Extract and validate auth headers
const { userId, role } = extractAuthHeaders(request);

// 2. Validate request body with Zod (POST/PATCH only)
const validatedData = vaultSchema.parse(await request.json());

// 3. Check permissions
if (!checkPermission(role, 'vault:create')) {
  return errorResponse('FORBIDDEN', 'Insufficient permissions', 403);
}

// 4. Execute Prisma operation
const vault = await prisma.vault.create({ data: { ...validatedData, ownerId: userId } });

// 5. Return standardized response
return successResponse(vault, 201);
```

**Validation** (after each endpoint):
- Postman success case (valid role)
- Postman forbidden case (invalid role)
- Postman missing header case (401)
- Postman invalid ID case (404)
- Verify record in NeonDB via Prisma Studio

---

### Phase 2.3: Source CRUD APIs (5 minutes)

**Implementation Order**:
1. POST /api/vaults/[id]/sources (add source to vault)
2. GET /api/vaults/[id]/sources (list vault sources)
3. DELETE /api/vaults/[id]/sources/[sourceId] (delete source)

**Implementation Pattern**:
- Similar to vault endpoints
- Additional validation: verify vaultId exists before creating source
- Role enforcement: contributors can add sources, only owners can delete

**Validation**:
- Postman success cases (owner and contributor roles)
- Postman forbidden case (viewer role attempting POST)
- Verify source associated with correct vault in NeonDB

---

### Phase 2.4: Middleware & Role Enforcement (3 minutes)

**Objectives**:
- Refactor auth logic into reusable middleware
- Implement permission matrix

**Permission Matrix**:
```typescript
const PERMISSIONS = {
  owner: ['vault:create', 'vault:read', 'vault:update', 'vault:delete', 'source:create', 'source:read', 'source:delete'],
  contributor: ['vault:read', 'vault:update', 'source:create', 'source:read'],
  viewer: ['vault:read', 'source:read']
};
```

**Validation**:
- All role combinations tested via Postman
- Viewer cannot create vault (403)
- Contributor cannot delete vault (403)
- Missing headers return 401
- Invalid role returns 403

---

### Phase 2.5: Cloudinary Upload Integration (5 minutes)

**Objectives**:
- Implement POST /api/upload
- Generate signed Cloudinary upload
- Validate file type (PDF only) and size (10MB max)

**Implementation**:
```typescript
// 1. Extract file from multipart/form-data
const formData = await request.formData();
const file = formData.get('file') as File;

// 2. Validate file type and size
if (file.type !== 'application/pdf') {
  return errorResponse('INVALID_INPUT', 'Only PDF files allowed', 400);
}
if (file.size > 10 * 1024 * 1024) {
  return errorResponse('INVALID_INPUT', 'File size exceeds 10MB', 400);
}

// 3. Upload to Cloudinary
const result = await cloudinary.uploader.upload(file, { resource_type: 'raw' });

// 4. Return secure URL
return successResponse({ url: result.secure_url, publicId: result.public_id });
```

**Validation**:
- Upload valid PDF → returns secure URL
- Upload non-PDF → INVALID_INPUT error
- Upload oversized file → INVALID_INPUT error
- Verify URL is accessible in browser

---

### Phase 2.6: Postman Collection & Testing (7 minutes)

**Objectives**:
- Create Postman collection with all 11 endpoints
- Add environment variables (base URL, x-user-id, x-user-role)
- Test all success and error cases

**Collection Structure**:
```
Backend APIs Collection
├── Vaults
│   ├── Create Vault (POST)
│   ├── List Vaults (GET)
│   ├── Get Vault (GET)
│   ├── Update Vault (PATCH)
│   └── Delete Vault (DELETE)
├── Sources
│   ├── Add Source (POST)
│   ├── List Sources (GET)
│   └── Delete Source (DELETE)
└── Upload
    └── Upload PDF (POST)
```

**Environment Variables**:
- base_url: http://localhost:3000
- x_user_id: (test user cuid)
- x_user_role: owner | contributor | viewer

**Validation**:
- All endpoints return expected responses
- Role enforcement works correctly
- Data persists in NeonDB
- Export collection to postman/ directory

## Timeline & Milestones

**Total Estimated Time**: 40 minutes

| Phase | Duration | Milestone |
|-------|----------|-----------|
| 2.1 Foundation Setup | 10 min | Dependencies installed, utilities created |
| 2.2 Vault CRUD APIs | 10 min | 5 vault endpoints functional |
| 2.3 Source CRUD APIs | 5 min | 3 source endpoints functional |
| 2.4 Middleware & Roles | 3 min | Permission matrix enforced |
| 2.5 Upload Integration | 5 min | Cloudinary upload working |
| 2.6 Postman Testing | 7 min | Complete test collection exported |

**Critical Path**: Foundation Setup → Vault APIs → Source APIs (sources depend on vaults existing)

**Parallel Opportunities**: Upload integration can be developed independently after foundation setup

## Risk Mitigation

**Risk 1**: Cloudinary upload fails due to credential issues
- **Mitigation**: Verify credentials in .env.local before implementation
- **Fallback**: Mock upload endpoint returns dummy URL for testing

**Risk 2**: Prisma schema changes required during implementation
- **Mitigation**: Phase 1 schema is complete and validated
- **Fallback**: Use prisma db push for quick schema updates (development only)

**Risk 3**: Role enforcement logic becomes complex
- **Mitigation**: Simple permission matrix with clear owner/contributor/viewer rules
- **Fallback**: Start with owner-only enforcement, add contributor/viewer incrementally

**Risk 4**: Postman testing reveals API design issues
- **Mitigation**: Test each endpoint immediately after implementation
- **Fallback**: Iterate on endpoint design before moving to next endpoint

## Success Criteria Validation

Phase 2 is complete when all success criteria from spec.md are met:

- ✅ **SC-001**: API consumers can create vault and add source within 30 seconds
- ✅ **SC-002**: All endpoints return responses within 200ms p95
- ✅ **SC-003**: PDF uploads complete within 5 seconds for 10MB files
- ✅ **SC-004**: Role hierarchy enforced in 100% of authorization checks
- ✅ **SC-005**: Invalid requests return detailed error messages
- ✅ **SC-006**: All mutations persist to NeonDB and are queryable
- ✅ **SC-007**: Uploaded PDFs accessible via returned URLs
- ✅ **SC-008**: System handles 50 concurrent requests without errors
- ✅ **SC-009**: Postman collection executable in under 5 minutes
- ✅ **SC-010**: Deleting vault removes all sources (cascade delete)

## Next Steps

After Phase 2 completion:

1. **Generate tasks.md**: Run `/sp.tasks` to create detailed task breakdown
2. **Execute implementation**: Run `/sp.implement` to build all endpoints
3. **Phase 3 Planning**: Begin NextAuth.js authentication system design
