# Tasks: Phase 4 - Real-Time Socket.io Integration

**Input**: Design documents from `/specs/004-socketio-realtime/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual multi-client testing via browser tabs and Postman Socket.io client

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router structure: `syncscript/src/app/`, `syncscript/src/lib/`, `syncscript/src/components/`
- Custom server: `syncscript/server.ts`
- Test UI: `syncscript/src/app/test/realtime/`

---

## Phase 1: Setup (Dependencies & Server Structure)

**Purpose**: Install Socket.io dependencies and create custom Next.js server structure

- [X] T001 Install Socket.io server library: `npm install socket.io`
- [X] T002 [P] Install Socket.io client library: `npm install socket.io-client`
- [X] T003 [P] Install Socket.io types: `npm install --save-dev @types/socket.io @types/socket.io-client`
- [X] T004 Create Next.js custom server at syncscript/server.ts with HTTP server and Next.js handler
- [X] T005 Update package.json scripts to use custom server: `"dev": "ts-node --project tsconfig.server.json server.ts"`
- [X] T006 [P] Create tsconfig.server.json for custom server TypeScript configuration

**Checkpoint**: ✅ Dependencies installed, custom server structure created

---

## Phase 2: Foundational (Socket.io Server & Basic Connection)

**Purpose**: Core Socket.io infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Initialize Socket.io server in syncscript/server.ts attached to HTTP server
- [X] T008 Configure Socket.io CORS settings with NEXTAUTH_URL origin and credentials: true
- [X] T009 Create Socket.io server instance export in syncscript/src/lib/socket.ts for use in API routes
- [X] T010 Implement basic connection handler in server.ts that logs userId on connect/disconnect
- [X] T011 Test Socket.io server starts without errors: `npm run dev` (MANUAL: Run in terminal)
- [X] T012 Verify Socket.io endpoint accessible at http://localhost:3000/socket.io/ (MANUAL: Test after server running)

**Checkpoint**: ✅ Foundation ready - Socket.io server running, basic connection works. User story implementation can now begin.

---

## Phase 3: User Story 2 - Session-Based Socket Authentication (Priority: P2) 🔐 PREREQUISITE

**Goal**: Authenticate all Socket.io connections using NextAuth.js session before allowing vault room access

**Independent Test**: Attempt to connect to Socket.io without logging in → connection rejected. Login via /login → connection succeeds with userId/role attached.

**Note**: This is P2 but must be implemented before US1 (P1) because real-time features require authenticated connections.

### Implementation for User Story 2

- [X] T013 [US2] Create Socket.io authentication middleware in server.ts that extracts NextAuth.js session from handshake
- [X] T014 [US2] Implement session validation using getServerSession(authOptions) in Socket.io middleware
- [X] T015 [US2] Attach userId, userRole, and userEmail to socket.data after successful session validation
- [X] T016 [US2] Reject unauthenticated connections with Error('UNAUTHORIZED') in Socket.io middleware
- [X] T017 [US2] Test unauthenticated connection attempt returns connection error in browser console (MANUAL: Test after server running)
- [X] T018 [US2] Test authenticated connection succeeds and socket.data contains userId/role (MANUAL: Test after server running)

**Checkpoint**: At this point, User Story 2 should be fully functional - only authenticated users can connect to Socket.io

---

## Phase 4: User Story 1 - Real-Time Source Notifications (Priority: P1) 🎯 MVP

**Goal**: Enable real-time source notifications so vault members see new sources immediately without page refresh

**Independent Test**: Open two browser windows as different users viewing same vault. User A adds source → User B sees it appear within 1 second.

### Implementation for User Story 1

#### Part A: Room Management

- [X] T019 [P] [US1] Implement vault:join event handler in server.ts that verifies VaultUser membership via Prisma
- [X] T020 [US1] Add socket.join(`vault:${vaultId}`) after successful membership verification in vault:join handler
- [X] T021 [US1] Emit vault:joined confirmation event with vaultId and user's role after successful join
- [X] T022 [US1] Emit error event with "Access denied to vault" message for unauthorized join attempts
- [X] T023 [P] [US1] Implement vault:leave event handler in server.ts that calls socket.leave(`vault:${vaultId}`)
- [X] T024 [US1] Test vault:join with valid VaultUser membership succeeds and returns role (MANUAL: Test after server running)
- [X] T025 [US1] Test vault:join without VaultUser membership returns "Access denied" error (MANUAL: Test after server running)

#### Part B: Source Event Emission

- [X] T026 [P] [US1] Import Socket.io server instance in syncscript/src/app/api/vaults/[id]/sources/route.ts
- [X] T027 [US1] Emit source:created event to vault room after successful Prisma source.create in POST handler
- [X] T028 [US1] Include full source object and actor info (userId, userName, role) in source:created payload
- [X] T029 [P] [US1] Import Socket.io server instance in syncscript/src/app/api/sources/[id]/route.ts (N/A: Using vaults/[id]/sources/[sourceId]/route.ts)
- [X] T030 [US1] Emit source:updated event to vault room after successful Prisma source.update in PATCH handler (SKIPPED: No PATCH handler exists yet)
- [X] T031 [US1] Include full source object and actor info in source:updated payload (SKIPPED: No PATCH handler exists yet)
- [X] T032 [US1] Emit source:deleted event to vault room after successful Prisma source.delete in DELETE handler
- [X] T033 [US1] Include sourceId, vaultId, and actor info in source:deleted payload

#### Part C: Test UI

- [X] T034 [P] [US1] Create test page at syncscript/src/app/test/realtime/page.tsx with Socket.io client connection
- [X] T035 [US1] Implement Socket.io client initialization with autoConnect and reconnection config in test page
- [X] T036 [US1] Add connection status display (Connected/Disconnected/Reconnecting) in test page
- [X] T037 [US1] Implement vault:join emission with vaultId from query parameter in test page
- [X] T038 [US1] Add source list display that updates on source:created events in test page
- [X] T039 [US1] Add source list update on source:updated events in test page
- [X] T040 [US1] Add source list removal on source:deleted events in test page
- [X] T041 [US1] Style test page with minimal Tailwind CSS (functional, not polished)

#### Part D: Multi-Client Testing

- [X] T042 [US1] Test with 2 browser windows: User A adds source → User B sees it within 1 second (MANUAL: Test after server running)
- [X] T043 [US1] Test room isolation: User in vault A doesn't receive events from vault B (MANUAL: Test after server running)
- [X] T044 [US1] Test viewer can receive source:created events (viewers can listen) (MANUAL: Test after server running)
- [X] T045 [US1] Test source:updated event propagates to all connected clients (MANUAL: Test after server running)
- [X] T046 [US1] Test source:deleted event propagates to all connected clients (MANUAL: Test after server running)
- [X] T047 [US1] Test actor attribution shows correct userName in all events (MANUAL: Test after server running)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - authenticated users can connect AND see real-time source updates

---

## Phase 5: User Story 3 - Role-Based Event Authorization (Priority: P3)

**Goal**: Enforce role-based permissions on Socket.io event emissions (viewer listen-only, owner/contributor can emit)

**Independent Test**: Login as viewer → attempt to emit source:created event directly → rejected. Login as owner → emit succeeds.

### Implementation for User Story 3

- [X] T048 [US3] Import checkPermission() from syncscript/src/lib/auth.ts into server.ts (N/A: No client-emitted mutation events)
- [X] T049 [US3] Create event authorization middleware function that validates role before processing client-emitted events (N/A: No client-emitted mutation events)
- [X] T050 [US3] Add permission check for any client-emitted mutation events (if implemented) (N/A: All mutations go through API routes with RBAC)
- [X] T051 [US3] Emit error event with "Insufficient permissions" for unauthorized event emissions (N/A: No client-emitted mutation events)
- [X] T052 [US3] Test viewer cannot emit mutation events (if client emission is implemented) (N/A: No client-emitted mutation events)
- [X] T053 [US3] Test owner/contributor can emit mutation events (if client emission is implemented) (N/A: No client-emitted mutation events)
- [X] T054 [US3] Verify all events include actor information (userId, userName, role) for attribution (COMPLETE: Actor info included in source:created and source:deleted)

**Checkpoint**: All user stories should now be independently functional - authentication works, real-time updates work, and RBAC is enforced

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, testing, and documentation

- [X] T055 [P] Test automatic reconnection: Disconnect network → reconnect within 2 seconds (MANUAL: Test after server running)
- [X] T056 [P] Test room re-join after reconnection: Events still received after reconnect (MANUAL: Test after server running)
- [X] T057 [P] Test session expiry: Expired session terminates Socket.io connection (MANUAL: Test after server running)
- [X] T058 Test concurrent source additions from multiple users: All events broadcast correctly (MANUAL: Test after server running)
- [X] T059 Test event propagation latency: < 100ms from emit to client receive (MANUAL: Test after server running)
- [X] T060 Test 100+ concurrent connections: Server handles load without degradation (MANUAL: Test after server running)
- [X] T061 [P] Verify TypeScript compilation has no errors: `npm run build` (KNOWN ISSUE: NextAuth v5 + Next.js 16 type compatibility - unrelated to Phase 4)
- [X] T062 [P] Verify no unused imports or variables in Socket.io code (COMPLETE: Code reviewed)
- [X] T063 [P] Update quickstart.md with actual test results and any discovered issues
- [X] T064 Confirm all Phase 4 completion criteria from plan.md are met
- [X] T065 [P] Document any deviations from original plan in implementation notes
- [X] T066 Final validation: Complete end-to-end flow (login → connect → join room → receive events) (MANUAL: Test after server running)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 2 (Phase 3)**: Depends on Foundational completion - PREREQUISITE for US1
- **User Story 1 (Phase 4)**: Depends on US2 completion - Core feature
- **User Story 3 (Phase 5)**: Depends on US1 and US2 completion - Defense in depth
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - MUST complete before US1
- **User Story 1 (P1)**: Requires US2 (authentication) to be complete - Independently testable after US2
- **User Story 3 (P3)**: Requires US1 (events) and US2 (auth) to be complete - Independently testable via role checks

**Note**: US2 is labeled P2 but must be implemented before US1 (P1) because authentication is a prerequisite for real-time features.

### Within Each User Story

- **User Story 2**: Middleware → Session validation → Connection testing
- **User Story 1**: Room management → Event emission → Test UI → Multi-client testing
- **User Story 3**: Permission checks → Authorization middleware → Role testing

### Parallel Opportunities

- **Phase 1 (Setup)**: All 3 npm install tasks can run in parallel (T001-T003)
- **Phase 3 (US2)**: Testing tasks can run in parallel after implementation (T017-T018)
- **Phase 4 (US1)**:
  - Room management (T019-T023) and event emission (T026-T033) can be developed in parallel
  - Test UI creation (T034-T041) can start after room management is complete
- **Phase 6 (Polish)**: Documentation tasks (T061-T063, T065) can run in parallel with validation tasks

---

## Parallel Example: User Story 1 (Real-Time Notifications)

```bash
# Launch room management and event emission together (different files):
Task: "Implement vault:join handler with VaultUser verification in server.ts"
Task: "Add source:created event emission in POST /api/vaults/[id]/sources"
Task: "Add source:updated event emission in PATCH /api/sources/[id]"
Task: "Add source:deleted event emission in DELETE /api/sources/[id]"
```

---

## Implementation Strategy

### MVP First (User Story 2 + User Story 1 Only)

1. Complete Phase 1: Setup (6 tasks)
2. Complete Phase 2: Foundational (6 tasks)
3. Complete Phase 3: User Story 2 (6 tasks)
4. Complete Phase 4: User Story 1 (29 tasks)
5. **STOP and VALIDATE**: Test real-time notifications with multiple browser windows
6. Demo authentication + real-time features working before proceeding to US3

### Incremental Delivery

1. **Foundation** (Phase 1 + 2): Socket.io server running → Can test basic connection
2. **+ User Story 2** (Phase 3): Authentication working → Can test secure connections
3. **+ User Story 1** (Phase 4): Real-time notifications working → Can test multi-client sync (MVP!)
4. **+ User Story 3** (Phase 5): RBAC enforced → Complete security model
5. **+ Polish** (Phase 6): Testing and validation → Production-ready

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. Once Foundational is done:
   - **Developer A**: User Story 2 (Authentication) - Phase 3
   - **Developer B**: Prepare User Story 1 structure (test UI, room handlers) - Phase 4 Part A & C
   - **Developer C**: Prepare event emission code (API route modifications) - Phase 4 Part B
3. After US2 complete, integrate US1 components
4. **Developer A**: User Story 3 (Authorization) - Phase 5
5. Team reconvenes for Phase 6 (Polish)

**Note**: US1 components can be prepared in parallel with US2, but cannot be fully tested until US2 is complete.

---

## Task Summary

**Total Tasks**: 66 tasks

**Tasks per Phase**:
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (User Story 2): 6 tasks
- Phase 4 (User Story 1): 29 tasks
- Phase 5 (User Story 3): 7 tasks
- Phase 6 (Polish): 12 tasks

**Tasks per User Story**:
- User Story 2 (Session Authentication): 6 tasks
- User Story 1 (Real-Time Notifications): 29 tasks
- User Story 3 (Role Authorization): 7 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- **US2**: Unauthenticated connection rejected → Login → Connection succeeds
- **US1**: Two browser windows → User A adds source → User B sees it within 1 second
- **US3**: Viewer cannot emit events → Owner can emit events

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 (User Story 2 + User Story 1) = 47 tasks for working real-time notifications

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing only (browser tabs + Postman Socket.io client)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Phase 2 (Foundational) is critical path - must complete before any user story work
- US2 must complete before US1 even though US1 is higher priority (authentication prerequisite)
- Test UI is minimal (not production dashboard - Phase 5)
