# Tasks: Phase 3 - Authentication & Role-Based Access Control

**Input**: Design documents from `/specs/003-auth-rbac/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated tests requested in specification. Manual testing via browser and Postman.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router structure: `syncscript/src/app/`, `syncscript/src/lib/`, `syncscript/src/components/`
- Prisma: `syncscript/prisma/`
- Postman: `syncscript/postman/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure environment for NextAuth.js authentication

- [x] T001 Install NextAuth.js v5 beta: `npm install next-auth@beta`
- [x] T002 [P] Install bcryptjs for password hashing: `npm install bcryptjs @types/bcryptjs`
- [x] T003 [P] Add NEXTAUTH_SECRET to .env.example with generation instructions
- [x] T004 [P] Add NEXTAUTH_URL to .env.example (http://localhost:3000 for dev)
- [x] T005 [P] Document demo user credentials in .env.example (owner@demo.com: owner123, contributor@demo.com: contributor123)

**Checkpoint**: ✅ Dependencies installed, environment variables documented

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create NextAuth.js route handler at syncscript/src/app/api/auth/[...nextauth]/route.ts with credentials provider
- [x] T007 Configure JWT session strategy with 24-hour expiry in NextAuth.js authOptions
- [x] T008 Implement jwt callback to add user.id and user.role to token in authOptions
- [x] T009 Implement session callback to add token.id and token.role to session object in authOptions
- [x] T010 Configure pages.signIn to point to /login in authOptions
- [x] T011 Create Prisma seed script at syncscript/prisma/seed.ts with bcrypt password hashing
- [x] T012 Implement owner@demo.com user creation with bcrypt.hash('owner123', 10) in seed script
- [x] T013 Implement contributor@demo.com user creation with bcrypt.hash('contributor123', 10) in seed script
- [x] T014 Add seed command to package.json: "prisma": { "seed": "ts-node prisma/seed.ts" }
- [x] T015 Run seed script to populate demo users: `npx prisma db seed`
- [x] T016 Verify demo users exist in database with hashed passwords via Prisma Studio
- [x] T017 Create requireAuth() helper function in syncscript/src/lib/auth.ts that wraps getServerSession(authOptions)
- [x] T018 Implement error handling in requireAuth() to throw UNAUTHORIZED if no session exists
- [x] T019 Test NextAuth.js routes are accessible: GET /api/auth/session, GET /api/auth/providers

**Checkpoint**: ✅ Foundation ready - NextAuth.js configured, demo users seeded, requireAuth() helper available. User story implementation can now begin.

---

## Phase 3: User Story 1 - Core Authentication Flow (Priority: P1) 🎯 MVP

**Goal**: Enable demo users to log in with credentials, maintain sessions, and log out securely

**Independent Test**: Navigate to /login, enter owner@demo.com credentials, verify redirect to /dashboard with active session, confirm logout destroys session and redirects to /login

### Implementation for User Story 1

- [ ] T020 [P] [US1] Create login page at syncscript/src/app/login/page.tsx with email and password input fields
- [ ] T021 [US1] Implement login form submission using NextAuth.js signIn('credentials') in login page
- [ ] T022 [US1] Add error message display for failed login attempts in login page
- [ ] T023 [US1] Configure redirect to /dashboard on successful login in login page
- [ ] T024 [US1] Style login page with Tailwind CSS (minimal, functional design)
- [ ] T025 [P] [US1] Create dashboard page at syncscript/src/app/(authenticated)/dashboard/page.tsx
- [ ] T026 [US1] Display welcome message with user email from session in dashboard page
- [ ] T027 [US1] Add logout button that calls signOut() in dashboard page
- [ ] T028 [US1] Configure logout redirect to /login in dashboard page
- [x] T029 [P] [US1] Create RoleBadge component at syncscript/src/components/RoleBadge.tsx
- [x] T030 [US1] Read role from session using useSession() hook in RoleBadge component
- [x] T031 [US1] Display role badge with color coding (owner: red, contributor: blue, viewer: gray) in RoleBadge component
- [x] T032 [US1] Integrate RoleBadge component into dashboard page
- [ ] T033 [US1] Test login flow with owner@demo.com credentials in browser
- [ ] T034 [US1] Test login flow with contributor@demo.com credentials in browser
- [ ] T035 [US1] Test invalid credentials show error message in browser
- [ ] T036 [US1] Test session persistence across page refresh in browser
- [ ] T037 [US1] Test logout destroys session and redirects to /login in browser

**Checkpoint**: At this point, User Story 1 should be fully functional - users can log in, see their role, and log out

---

## Phase 4: User Story 2 - API Session Protection (Priority: P2)

**Goal**: Replace Phase 2 mock header authentication with NextAuth.js session validation on all 11 API endpoints

**Independent Test**: Use Postman to obtain session via login, verify all API endpoints validate sessions (401 without session, 403 with insufficient role, 200 with valid session and role)

### Implementation for User Story 2

- [ ] T038 [US2] Update requireAuth() in syncscript/src/lib/auth.ts to return { userId, role, email } from session
- [ ] T039 [US2] Keep existing checkPermission() function in syncscript/src/lib/auth.ts (no changes needed)
- [ ] T040 [P] [US2] Update POST /api/vaults in syncscript/src/app/api/vaults/route.ts to use requireAuth() instead of extractAuthHeaders()
- [ ] T041 [P] [US2] Update GET /api/vaults in syncscript/src/app/api/vaults/route.ts to use requireAuth() instead of extractAuthHeaders()
- [ ] T042 [P] [US2] Update GET /api/vaults/[id] in syncscript/src/app/api/vaults/[id]/route.ts to use requireAuth() instead of extractAuthHeaders()
- [ ] T043 [P] [US2] Update PATCH /api/vaults/[id] in syncscript/src/app/api/vaults/[id]/route.ts to use requireAuth() instead of extractAuthHeaders()
- [ ] T044 [P] [US2] Update DELETE /api/vaults/[id] in syncscript/src/app/api/vaults/[id]/route.ts to use requireAuth() instead of extractAuthHeaders()
- [ ] T045 [P] [US2] Update POST /api/vaults/[id]/sources in syncscript/src/app/api/vaults/[id]/sources/route.ts to use requireAuth() instead of extractAuthHeaders()
- [ ] T046 [P] [US2] Update GET /api/vaults/[id]/sources in syncscript/src/app/api/vaults/[id]/sources/route.ts to use requireAuth() instead of extractAuthHeaders()
- [ ] T047 [P] [US2] Update DELETE /api/vaults/[id]/sources/[sourceId] in syncscript/src/app/api/vaults/[id]/sources/[sourceId]/route.ts to use requireAuth() instead of extractAuthHeaders()
- [ ] T048 [P] [US2] Update POST /api/upload in syncscript/src/app/api/upload/route.ts to use requireAuth() instead of extractAuthHeaders()
- [ ] T049 [US2] Comment out old extractAuthHeaders() code in syncscript/src/lib/auth.ts for reference
- [ ] T050 [US2] Update error handling to return 401 for missing session in all API endpoints
- [ ] T051 [US2] Verify existing checkPermission() logic still works with session-based auth in all API endpoints
- [ ] T052 [US2] Test POST /api/vaults with valid owner session returns 200 in Postman
- [ ] T053 [US2] Test POST /api/vaults without session returns 401 in Postman
- [ ] T054 [US2] Test DELETE /api/vaults/[id] with contributor session returns 403 in Postman
- [ ] T055 [US2] Test GET /api/vaults with valid session returns user's vaults in Postman
- [ ] T056 [US2] Verify all 11 endpoints correctly validate sessions and enforce role permissions in Postman

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can log in AND all APIs are protected with session-based authentication

---

## Phase 5: User Story 3 - Testing Infrastructure (Priority: P3)

**Goal**: Update Postman collection to support session-based authentication testing and document setup process

**Independent Test**: Import updated Postman collection, run login request to obtain session, verify all API requests include session cookie automatically, confirm role enforcement tests pass

### Implementation for User Story 3

- [ ] T057 [P] [US3] Add login endpoint to Postman collection: POST /api/auth/callback/credentials in syncscript/postman/backend-apis.postman_collection.json
- [ ] T058 [P] [US3] Configure login request body with email, password, json=true fields in Postman collection
- [ ] T059 [US3] Add test script to extract session cookie from login response in Postman collection
- [ ] T060 [US3] Document cookie jar usage in Postman collection description
- [ ] T061 [P] [US3] Update all existing API requests to rely on automatic cookie handling in Postman collection
- [ ] T062 [P] [US3] Add test case for unauthorized access (no session) to each endpoint in Postman collection
- [ ] T063 [P] [US3] Add test case for forbidden access (wrong role) to role-restricted endpoints in Postman collection
- [ ] T064 [US3] Add session_token environment variable to syncscript/postman/backend-apis.postman_environment.json
- [ ] T065 [US3] Document manual cookie extraction as fallback in Postman environment description
- [ ] T066 [US3] Test login request successfully creates session in Postman
- [ ] T067 [US3] Test subsequent API requests automatically include session cookie in Postman
- [ ] T068 [US3] Test unauthorized access returns 401 for all endpoints in Postman
- [ ] T069 [US3] Test forbidden access returns 403 for role-restricted endpoints in Postman
- [ ] T070 [US3] Verify complete Postman collection runs successfully with session-based auth

**Checkpoint**: All user stories should now be independently functional - login works, APIs are protected, and Postman testing is configured

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and cleanup

- [ ] T071 [P] Update quickstart.md with actual environment setup steps from implementation
- [ ] T072 [P] Verify all demo user credentials documented correctly in .env.example
- [ ] T073 [P] Add troubleshooting section to quickstart.md based on common issues encountered
- [ ] T074 Run complete manual test suite from quickstart.md (login, API calls, logout)
- [ ] T075 Verify session expiry works correctly (24-hour limit)
- [ ] T076 [P] Check TypeScript compilation has no errors: `npm run build`
- [ ] T077 [P] Verify no unused imports or variables in authentication code
- [ ] T078 Confirm all Phase 3 completion criteria from plan.md are met
- [ ] T079 [P] Document any deviations from original plan in implementation notes
- [ ] T080 Final validation: Complete end-to-end flow (seed → login → API call → logout)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational completion - Can work independently but benefits from US1 for testing
- **User Story 3 (Phase 5)**: Depends on US1 and US2 completion - Tests the authentication system
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Independently testable via browser
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independently testable via Postman with manual session setup
- **User Story 3 (P3)**: Requires US1 (login) and US2 (protected APIs) to be complete - Tests the full authentication flow

### Within Each User Story

- **User Story 1**: Login page → Dashboard page → RoleBadge component → Browser testing
- **User Story 2**: Update requireAuth() → Migrate all 11 endpoints in parallel → Postman testing
- **User Story 3**: Update Postman collection → Add test cases → Validate complete flow

### Parallel Opportunities

- **Phase 1 (Setup)**: All 5 tasks can run in parallel (T001-T005)
- **Phase 2 (Foundational)**: NextAuth.js config (T006-T010) and seed script (T011-T014) can be developed in parallel
- **Phase 3 (US1)**: Login page (T020-T024), dashboard page (T025-T028), and RoleBadge (T029-T032) can be developed in parallel
- **Phase 4 (US2)**: All 9 API endpoint migrations (T040-T048) can run in parallel - different files, no dependencies
- **Phase 5 (US3)**: Postman collection updates (T057-T060) and test cases (T061-T063) can be developed in parallel
- **Phase 6 (Polish)**: Documentation tasks (T071-T073) and validation tasks (T076-T077, T079) can run in parallel

---

## Parallel Example: User Story 2 (API Migration)

```bash
# Launch all API endpoint migrations together (9 parallel tasks):
Task: "Update POST /api/vaults to use requireAuth()"
Task: "Update GET /api/vaults to use requireAuth()"
Task: "Update GET /api/vaults/[id] to use requireAuth()"
Task: "Update PATCH /api/vaults/[id] to use requireAuth()"
Task: "Update DELETE /api/vaults/[id] to use requireAuth()"
Task: "Update POST /api/vaults/[id]/sources to use requireAuth()"
Task: "Update GET /api/vaults/[id]/sources to use requireAuth()"
Task: "Update DELETE /api/vaults/[id]/sources/[sourceId] to use requireAuth()"
Task: "Update POST /api/upload to use requireAuth()"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (5 tasks)
2. Complete Phase 2: Foundational (14 tasks) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (18 tasks)
4. **STOP and VALIDATE**: Test login/logout flow independently in browser
5. Demo authentication working before proceeding to API migration

### Incremental Delivery

1. **Foundation** (Phase 1 + 2): NextAuth.js configured, demo users seeded → Can test /api/auth/* endpoints
2. **+ User Story 1** (Phase 3): Login page working → Can authenticate users in browser (MVP!)
3. **+ User Story 2** (Phase 4): APIs protected → Can make authenticated API calls via Postman
4. **+ User Story 3** (Phase 5): Postman testing → Complete testing infrastructure for regression
5. **+ Polish** (Phase 6): Documentation and final validation → Production-ready

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (Login UI) - Phase 3
   - **Developer B**: User Story 2 (API Migration) - Phase 4
   - **Developer C**: User Story 3 (Postman Testing) - Phase 5
3. Stories complete and integrate independently
4. Team reconvenes for Phase 6 (Polish)

**Note**: US2 and US3 can technically start in parallel with US1, but US3 benefits from US1 being complete for end-to-end testing.

---

## Task Summary

**Total Tasks**: 80 tasks

**Tasks per Phase**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 14 tasks
- Phase 3 (User Story 1): 18 tasks
- Phase 4 (User Story 2): 19 tasks
- Phase 5 (User Story 3): 14 tasks
- Phase 6 (Polish): 10 tasks

**Tasks per User Story**:
- User Story 1 (Core Authentication Flow): 18 tasks
- User Story 2 (API Session Protection): 19 tasks
- User Story 3 (Testing Infrastructure): 14 tasks

**Parallel Opportunities**: 32 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- **US1**: Login page → Dashboard → Logout (browser testing)
- **US2**: API calls with session validation (Postman testing)
- **US3**: Complete Postman collection execution (automated testing)

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 37 tasks for working authentication

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No automated tests requested - all testing is manual (browser + Postman)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Phase 2 (Foundational) is critical path - must complete before any user story work
- All API migrations (T040-T048) can run in parallel - maximum parallelization opportunity
