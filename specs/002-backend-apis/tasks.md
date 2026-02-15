---
description: "Task list for Backend APIs implementation"
---

# Tasks: Backend APIs

**Input**: Design documents from `/specs/002-backend-apis/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated tests in Phase 2 - manual validation via Postman

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js project root**: `syncscript/` (from Phase 1)
- **API routes**: `syncscript/src/app/api/`
- **Utilities**: `syncscript/src/lib/`
- **Postman**: `syncscript/postman/`
- Paths shown below assume Next.js App Router structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create shared utilities

- [x] T001 Install Zod validation library: `npm install zod` in syncscript/
- [x] T002 Install Cloudinary SDK: `npm install cloudinary` in syncscript/
- [x] T003 [P] Create response helpers in `syncscript/src/lib/responses.ts` with successResponse() and errorResponse() functions
- [x] T004 [P] Create Cloudinary configuration in `syncscript/src/lib/cloudinary.ts` with SDK initialization
- [x] T005 Add Cloudinary credentials to `syncscript/.env.local`: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- [x] T006 Verify dev server starts: `npm run dev` in syncscript/ (should run without errors)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create auth middleware in `syncscript/src/lib/auth.ts` with extractAuthHeaders() function to read x-user-id and x-user-role headers
- [x] T008 Add validateRole() function to `syncscript/src/lib/auth.ts` to check role is valid enum (owner/contributor/viewer)
- [x] T009 Add checkPermission() function to `syncscript/src/lib/auth.ts` with permission matrix for role-based access control
- [x] T010 [P] Create Zod validators in `syncscript/src/lib/validators.ts` for vault and source request schemas
- [x] T011 Test auth middleware: Create test route that uses extractAuthHeaders() and verify headers are read correctly
- [ ] T011 Test auth middleware: Create test route that uses extractAuthHeaders() and verify headers are read correctly

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Vault Management API (Priority: P1) 🎯 MVP

**Goal**: Implement 5 RESTful endpoints for vault CRUD operations with role-based access control

**Independent Test**: Send HTTP requests to vault endpoints via Postman, verify CRUD operations persist to NeonDB, confirm role enforcement blocks unauthorized requests

### Implementation for User Story 1

- [x] T012 [US1] Create vault route handler in `syncscript/src/app/api/vaults/route.ts` for POST and GET methods
- [x] T013 [US1] Implement POST /api/vaults endpoint: extract auth headers, validate request body with Zod, create vault with Prisma, return standardized response
- [x] T014 [US1] Implement GET /api/vaults endpoint: extract auth headers, query vaults by ownerId with Prisma, return vault list
- [x] T015 [US1] Create dynamic vault route handler in `syncscript/src/app/api/vaults/[id]/route.ts` for GET, PATCH, DELETE methods
- [x] T016 [US1] Implement GET /api/vaults/[id] endpoint: extract auth headers, find vault by ID with Prisma (include sources), return vault details or 404
- [x] T017 [US1] Implement PATCH /api/vaults/[id] endpoint: extract auth headers, check owner/contributor permission, validate request body, update vault with Prisma
- [x] T018 [US1] Implement DELETE /api/vaults/[id] endpoint: extract auth headers, check owner permission, delete vault with Prisma (cascade deletes sources)
- [x] T019 [US1] Add error handling to all vault endpoints: wrap in try/catch, return standardized error responses, never expose raw Prisma errors
- [ ] T020 [US1] Test POST /api/vaults via Postman: create vault with owner role, verify 201 response, check vault in Prisma Studio
- [ ] T021 [US1] Test GET /api/vaults via Postman: list vaults, verify 200 response with vault array
- [ ] T022 [US1] Test GET /api/vaults/[id] via Postman: retrieve vault details, verify 200 response with sources array
- [ ] T023 [US1] Test PATCH /api/vaults/[id] via Postman: update vault name with owner role, verify 200 response and updated name
- [ ] T024 [US1] Test DELETE /api/vaults/[id] via Postman: delete vault with owner role, verify 200 response and vault removed from database
- [ ] T025 [US1] Test role enforcement: attempt vault creation with viewer role, verify 403 Forbidden response
- [ ] T026 [US1] Test missing headers: send request without x-user-id header, verify 401 Unauthorized response
- [ ] T027 [US1] Test validation: send POST request with missing name field, verify 400 Bad Request with Zod error details
- [ ] T028 [US1] Test not found: send GET request with invalid vault ID, verify 404 Not Found response

**Checkpoint**: At this point, User Story 1 should be fully functional - all 5 vault endpoints operational and tested

---

## Phase 4: User Story 2 - Source Management API (Priority: P2)

**Goal**: Implement 3 RESTful endpoints for source CRUD operations nested under vaults

**Independent Test**: Create vault via US1 APIs, then send HTTP requests to source endpoints via Postman, verify sources associated with correct vault, confirm role hierarchy (contributors can add, viewers cannot)

### Implementation for User Story 2

- [x] T029 [US2] Create source route handler in `syncscript/src/app/api/vaults/[id]/sources/route.ts` for POST and GET methods
- [x] T030 [US2] Implement POST /api/vaults/[id]/sources endpoint: extract auth headers, check owner/contributor permission, validate request body with Zod, verify vault exists, create source with Prisma
- [x] T031 [US2] Implement GET /api/vaults/[id]/sources endpoint: extract auth headers, verify vault exists, query sources by vaultId with Prisma, return source list
- [x] T032 [US2] Create dynamic source route handler in `syncscript/src/app/api/vaults/[id]/sources/[sourceId]/route.ts` for DELETE method
- [x] T033 [US2] Implement DELETE /api/vaults/[id]/sources/[sourceId] endpoint: extract auth headers, check owner permission, verify source exists, delete source with Prisma
- [x] T034 [US2] Add error handling to all source endpoints: wrap in try/catch, return standardized error responses, handle vault not found (404)
- [ ] T035 [US2] Test POST /api/vaults/[id]/sources via Postman: add source with contributor role, verify 201 response, check source in Prisma Studio
- [ ] T036 [US2] Test GET /api/vaults/[id]/sources via Postman: list vault sources, verify 200 response with source array
- [ ] T037 [US2] Test DELETE /api/vaults/[id]/sources/[sourceId] via Postman: delete source with owner role, verify 200 response and source removed
- [ ] T038 [US2] Test role enforcement: attempt source creation with viewer role, verify 403 Forbidden response
- [ ] T039 [US2] Test validation: send POST request with missing title field, verify 400 Bad Request with Zod error details
- [ ] T040 [US2] Test vault not found: send POST request with invalid vault ID, verify 404 Not Found response

**Checkpoint**: At this point, User Stories 1 AND 2 are both functional - vault and source management complete

---

## Phase 5: User Story 3 - PDF Upload API (Priority: P3)

**Goal**: Implement Cloudinary PDF upload endpoint with file validation

**Independent Test**: Upload PDF file via Postman multipart/form-data request, verify file stored in Cloudinary, confirm returned URL is accessible, check file metadata available for linking to sources

### Implementation for User Story 3

- [x] T041 [US3] Create upload route handler in `syncscript/src/app/api/upload/route.ts` for POST method
- [x] T042 [US3] Implement POST /api/upload endpoint: extract auth headers, check owner/contributor permission, extract file from multipart/form-data
- [x] T043 [US3] Add file validation to upload endpoint: check file.type === 'application/pdf', check file.size <= 10MB, return 400 Bad Request if validation fails
- [x] T044 [US3] Add Cloudinary upload logic: convert file to buffer, upload to Cloudinary with resource_type 'raw', return secure URL and public_id
- [x] T045 [US3] Add error handling to upload endpoint: wrap in try/catch, return 500 Server Error if Cloudinary upload fails
- [ ] T046 [US3] Test POST /api/upload via Postman: upload valid PDF file, verify 200 response with Cloudinary URL
- [ ] T047 [US3] Test file type validation: upload non-PDF file (e.g., .txt), verify 400 Bad Request with INVALID_INPUT error
- [ ] T048 [US3] Test file size validation: upload PDF exceeding 10MB, verify 400 Bad Request with INVALID_INPUT error
- [ ] T049 [US3] Test role enforcement: attempt upload with viewer role, verify 403 Forbidden response
- [ ] T050 [US3] Test URL accessibility: open returned Cloudinary URL in browser, verify PDF is accessible
- [ ] T051 [US3] Test source integration: create source with fileUrl from upload response, verify source includes file metadata

**Checkpoint**: All user stories are now functional - vault, source, and upload APIs complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, Postman collection, and documentation

- [x] T052 Create Postman collection file in `syncscript/postman/backend-apis.postman_collection.json` with all 11 endpoints
- [x] T053 Add Postman environment file in `syncscript/postman/backend-apis.postman_environment.json` with base_url, x_user_id, x_user_role variables
- [x] T054 Add vault endpoints to Postman collection: POST, GET list, GET by ID, PATCH, DELETE with example requests and expected responses
- [x] T055 Add source endpoints to Postman collection: POST, GET list, DELETE with example requests and expected responses
- [x] T056 Add upload endpoint to Postman collection: POST with multipart/form-data example
- [x] T057 Add role enforcement tests to Postman collection: viewer cannot create vault, contributor cannot delete vault, missing headers return 401
- [x] T058 Add validation tests to Postman collection: missing required fields, invalid IDs, invalid file types
- [ ] T059 Run complete Postman collection: execute all requests in sequence, verify all tests pass
- [ ] T060 Verify data persistence: check NeonDB via Prisma Studio, confirm all created vaults and sources are visible
- [ ] T061 Verify cascade delete: delete vault via API, confirm sources automatically removed from database
- [ ] T062 Test concurrent requests: send 10 parallel requests to GET /api/vaults, verify all succeed without errors
- [ ] T063 Measure response times: verify non-upload endpoints respond within 200ms p95
- [x] T064 Document any deviations from plan in `specs/002-backend-apis/implementation-notes.md`
- [x] T065 Verify constitution compliance: confirm all Phase 2 principles (IX-XIV) satisfied

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after User Story 1 (needs vaults to exist for testing)
  - User Story 3 (P3): Can start after Foundational - No dependencies on other stories (independent upload)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 (needs vault endpoints to create test vaults for source testing)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1 and US2

### Within Each User Story

- **User Story 1**: Sequential execution (T012→T028) - each endpoint builds on previous, testing follows implementation
- **User Story 2**: Sequential execution (T029→T040) - testing requires vaults from US1
- **User Story 3**: Sequential execution (T041→T051) - upload logic must be complete before testing

### Parallel Opportunities

- **Setup tasks**: T003 and T004 can run in parallel (different files)
- **Foundational tasks**: T010 can run in parallel with T007-T009 (validators independent of auth middleware)
- **User Story 1**: Implementation tasks T012-T018 are sequential, but testing tasks T020-T028 can be batched
- **User Story 2 and 3**: US3 (upload) can be developed in parallel with US2 (sources) after US1 completes
- **Polish tasks**: T052-T058 (Postman collection creation) can be done in parallel

---

## Parallel Example: User Story 3 Independent Development

```bash
# After Foundational phase completes, these can run in parallel:
Task T029-T040: User Story 2 (Source Management)
Task T041-T051: User Story 3 (Upload API)

# Both are independent and can be developed simultaneously by different developers
# or implemented sequentially in any order
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T011) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T012-T028)
4. **STOP and VALIDATE**: Test User Story 1 independently via Postman and NeonDB
5. Ready for Phase 3 authentication development (or continue with US2/US3)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Vault management validated (MVP!)
3. Add User Story 2 → Test independently → Source management validated
4. Add User Story 3 → Test independently → Upload integration validated
5. Each story adds functionality without breaking previous stories

### Sequential Execution (Recommended for Phase 2)

Phase 2 is backend APIs only - no parallel team work needed:

1. Developer completes Setup + Foundational (T001-T011)
2. Developer completes User Story 1 (T012-T028) - vault CRUD
3. Developer completes User Story 2 (T029-T040) - source CRUD
4. Developer completes User Story 3 (T041-T051) - upload API
5. Developer completes Polish (T052-T065) - Postman collection and validation

---

## Notes

- No automated tests in Phase 2 - all testing via Postman manual requests
- [Story] labels map tasks to user stories for traceability
- Each user story is independently testable via Postman
- Commit after completing each phase
- Stop at any checkpoint to validate story independently
- Total task count: 65 tasks across 6 phases
- Estimated time: 40 minutes (per plan.md timeline)
- Constitution compliance: All Phase 2 principles (IX-XIV) satisfied
