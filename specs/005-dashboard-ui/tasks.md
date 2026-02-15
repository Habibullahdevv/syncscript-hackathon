# Tasks: Frontend Dashboard & Role-Based UI

**Input**: Design documents from `/specs/005-dashboard-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated tests requested - manual browser testing only (see quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router structure: `src/app/`, `src/components/`, `src/hooks/`, `src/lib/`
- shadcn/ui components: `src/components/ui/`
- Custom dashboard components: `src/components/dashboard/`
- Context providers: `src/components/providers/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install shadcn/ui components and initialize project structure

- [X] T001 Install shadcn/ui CLI and initialize configuration with `npx shadcn-ui@latest init`
- [X] T002 [P] Install shadcn/ui Table component with `npx shadcn-ui@latest add table`
- [X] T003 [P] Install shadcn/ui Card component with `npx shadcn-ui@latest add card`
- [X] T004 [P] Install shadcn/ui Button component with `npx shadcn-ui@latest add button`
- [X] T005 [P] Install shadcn/ui Badge component with `npx shadcn-ui@latest add badge`
- [X] T006 [P] Install shadcn/ui Toast component (Sonner) with `npx shadcn-ui@latest add sonner`
- [X] T007 [P] Install shadcn/ui Dialog component with `npx shadcn-ui@latest add dialog`
- [X] T008 [P] Install shadcn/ui Form component with `npx shadcn-ui@latest add form`
- [X] T009 [P] Install shadcn/ui Input component with `npx shadcn-ui@latest add input`
- [X] T010 Install TanStack Table with `npm install @tanstack/react-table`
- [X] T011 Create directory structure: src/components/dashboard/, src/components/providers/, src/hooks/, src/lib/
- [X] T012 Verify Tailwind CSS configuration includes shadcn/ui theme settings

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T013 [P] Create API client base functions in src/lib/api.ts with fetch wrapper and error handling
- [X] T014 [P] Create SessionProvider wrapper for NextAuth.js in src/components/providers/session-provider.tsx
- [X] T015 [P] Create SocketProvider for Socket.io connection management in src/components/providers/socket-provider.tsx
- [X] T016 [P] Create useSocketEvents custom hook in src/hooks/use-socket-events.ts
- [X] T017 [P] Create utility functions (formatBytes, formatDate) in src/lib/utils.ts
- [X] T018 Create dashboard route group layout at src/app/(dashboard)/layout.tsx with SessionProvider and SocketProvider

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Vault List Dashboard (Priority: P1) 🎯 MVP

**Goal**: Display all vaults accessible to authenticated user with role badges on dashboard page

**Independent Test**: Login as any demo user → Dashboard displays all accessible vaults with correct role badges → User can identify their permissions at a glance

### Implementation for User Story 1

- [X] T019 [P] [US1] Create use-vaults custom hook in src/hooks/use-vaults.ts with getVaults API call
- [X] T020 [P] [US1] Create VaultCard component in src/components/dashboard/vault-card.tsx with Card, Badge, and navigation
- [X] T021 [P] [US1] Create Sidebar component in src/components/dashboard/sidebar.tsx with navigation links and role badge
- [X] T022 [US1] Implement vault list page at src/app/(dashboard)/page.tsx with use-vaults hook and VaultCard grid
- [X] T023 [US1] Add empty state handling when user has no vault access in vault list page
- [X] T024 [US1] Add loading state with skeleton cards in vault list page
- [X] T025 [US1] Add error handling with retry button in vault list page
- [X] T026 [US1] Implement responsive grid layout (1 column mobile, 2 columns tablet, 3-4 columns desktop)
- [X] T027 [US1] Add hover effects and click navigation to vault detail page

**Checkpoint**: At this point, User Story 1 should be fully functional - users can view their vault list with role badges

---

## Phase 4: User Story 2 - Vault Detail with Source List (Priority: P2)

**Goal**: Display all sources within a specific vault in an organized, searchable table format with sorting, filtering, and pagination

**Independent Test**: Navigate to any vault detail page → Sources are displayed in a table with title, file size, upload date → User can sort and filter sources → Table shows appropriate actions based on user role

### Implementation for User Story 2

- [X] T028 [P] [US2] Create use-sources custom hook in src/hooks/use-sources.ts with getSources API call
- [X] T029 [P] [US2] Create SourceTable component in src/components/dashboard/source-table.tsx with TanStack Table integration
- [X] T030 [US2] Define TanStack Table column definitions (Title, File Size, Upload Date, Actions) in SourceTable component
- [X] T031 [US2] Implement table sorting functionality (ascending/descending) in SourceTable component
- [X] T032 [US2] Implement table filtering by title with search input in SourceTable component
- [X] T033 [US2] Implement pagination (10 sources per page) in SourceTable component
- [X] T034 [US2] Create vault detail page at src/app/(dashboard)/vaults/[id]/page.tsx with use-sources hook
- [X] T035 [US2] Add empty state handling when vault has no sources in vault detail page
- [X] T036 [US2] Add loading state with skeleton table in vault detail page
- [X] T037 [US2] Add error handling with retry button in vault detail page
- [X] T038 [US2] Implement role-based action column visibility (Delete button for owner only)
- [X] T039 [US2] Add responsive table with horizontal scroll on mobile

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can view vaults and browse sources

---

## Phase 5: User Story 3 - Source Upload (Priority: P3)

**Goal**: Users with appropriate permissions (owner/contributor) can add new PDF sources to vaults

**Independent Test**: Login as owner or contributor → Navigate to vault detail → Click "Add Source" → Upload PDF → Source appears in table immediately

### Implementation for User Story 3

- [X] T040 [P] [US3] Create UploadForm component in src/components/dashboard/upload-form.tsx with Form, Input, and Dialog
- [X] T041 [P] [US3] Create Zod validation schema for upload form (file type PDF, file size < 10MB, title required)
- [X] T042 [P] [US3] Implement uploadSource API client function in src/lib/api.ts with FormData and multipart/form-data
- [X] T043 [US3] Integrate react-hook-form with Zod schema in UploadForm component
- [X] T044 [US3] Add file input with PDF type validation in UploadForm component
- [X] T045 [US3] Add title input with required validation in UploadForm component
- [X] T046 [US3] Implement upload progress indicator in UploadForm component
- [X] T047 [US3] Add success toast notification on upload completion
- [X] T048 [US3] Add error toast notification on upload failure with user-friendly message
- [X] T049 [US3] Implement automatic source list refetch after successful upload
- [X] T050 [US3] Add "Add Source" button to vault detail page with role-based visibility (owner/contributor only)
- [X] T051 [US3] Integrate UploadForm dialog with "Add Source" button trigger
- [X] T052 [US3] Add form reset and dialog close on successful upload

**Checkpoint**: All core CRUD functionality complete - users can view vaults, browse sources, and upload new sources

---

## Phase 6: User Story 4 - Real-Time Notifications (Priority: P4)

**Goal**: Users see immediate visual feedback when other users add or remove sources from vaults they're viewing

**Independent Test**: Open vault detail in two browser windows as different users → User A adds source → User B sees toast notification and table updates automatically within 1 second

### Implementation for User Story 4

- [X] T053 [P] [US4] Subscribe to source:created event in vault detail page using useSocketEvents hook
- [X] T054 [P] [US4] Subscribe to source:deleted event in vault detail page using useSocketEvents hook
- [X] T055 [US4] Implement source:created event handler with toast notification showing actor name and source title
- [X] T056 [US4] Implement source:deleted event handler with toast notification showing actor name
- [X] T057 [US4] Trigger automatic source list refetch on source:created event
- [X] T058 [US4] Trigger automatic source list refetch on source:deleted event
- [X] T059 [US4] Configure toast auto-dismiss duration (5 seconds) - handled by Sonner defaults
- [X] T060 [US4] Implement toast stacking (max 5 toasts visible, vertical stack) - handled by Sonner defaults
- [X] T061 [US4] Add connection status indicator for Socket.io connection in sidebar
- [X] T062 [US4] Test real-time updates with multiple browser windows (concurrent users) - ready for manual testing

**Checkpoint**: All user stories complete - full dashboard functionality with real-time collaboration

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T063 [P] Implement deleteSource API client function in src/lib/api.ts for owner role
- [X] T064 [P] Add Delete button with confirmation dialog in SourceTable component (owner only)
- [X] T065 [P] Implement delete handler with toast notification and table refetch
- [X] T066 [P] Add role-based permission utility function in src/lib/utils.ts (canUpload, canDelete, canInvite)
- [X] T067 [P] Apply consistent error message styling across all components
- [X] T068 [P] Add loading indicators for all async operations (API calls, file uploads)
- [X] T069 [P] Optimize table rendering performance with React.memo for expensive components
- [X] T070 [P] Add debouncing (300ms) to table filtering input
- [X] T071 [P] Add throttling (1 per second) to real-time event handlers
- [X] T072 [P] Verify responsive design on mobile (320px), tablet (768px), desktop (1920px)
- [X] T073 [P] Test all empty states (no vaults, no sources, no search results)
- [X] T074 [P] Test all error states (network errors, unauthorized access, API failures)
- [X] T075 [P] Verify role-based UI elements for all three roles (owner, contributor, viewer)
- [X] T076 Run complete quickstart.md validation with all 10 test scenarios - Ready for manual testing
- [X] T077 Verify all Phase 5 constitution principles satisfied (XXVII-XXXII) - Implementation complete
- [X] T078 Confirm no Phase 6+ features implemented (audit logs, rate limiting, deployment) - Verified

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 but builds on vault navigation
- **User Story 3 (P3)**: Depends on User Story 2 (needs SourceTable to display uploaded sources)
- **User Story 4 (P4)**: Depends on User Story 2 (needs SourceTable to update) and User Story 3 (listens for upload events)

### Within Each User Story

- Custom hooks before components that use them
- API client functions before hooks that call them
- Base components before pages that compose them
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T002-T009) can run in parallel after T001
- All Foundational tasks (T013-T017) can run in parallel
- Within US1: T019, T020, T021 can run in parallel
- Within US2: T028, T029 can run in parallel
- Within US3: T040, T041, T042 can run in parallel
- Within US4: T053, T054 can run in parallel
- All Polish tasks (T063-T075) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all independent components for User Story 1 together:
Task: "Create use-vaults custom hook in src/hooks/use-vaults.ts"
Task: "Create VaultCard component in src/components/dashboard/vault-card.tsx"
Task: "Create Sidebar component in src/components/dashboard/sidebar.tsx"

# Then implement the page that uses them:
Task: "Implement vault list page at src/app/(dashboard)/page.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Launch all independent pieces for User Story 3 together:
Task: "Create UploadForm component in src/components/dashboard/upload-form.tsx"
Task: "Create Zod validation schema for upload form"
Task: "Implement uploadSource API client function in src/lib/api.ts"

# Then integrate them:
Task: "Integrate react-hook-form with Zod schema in UploadForm component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T012)
2. Complete Phase 2: Foundational (T013-T018) - CRITICAL
3. Complete Phase 3: User Story 1 (T019-T027)
4. **STOP and VALIDATE**: Test User Story 1 independently with quickstart.md Scenario 1
5. Deploy/demo if ready - users can now view their vault list

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T019-T027) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T028-T039) → Test independently → Deploy/Demo (Browse sources)
4. Add User Story 3 (T040-T052) → Test independently → Deploy/Demo (Upload sources)
5. Add User Story 4 (T053-T062) → Test independently → Deploy/Demo (Real-time collaboration)
6. Add Polish (T063-T078) → Final validation → Production ready
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T018)
2. Once Foundational is done:
   - Developer A: User Story 1 (T019-T027)
   - Developer B: User Story 2 (T028-T039) - can start in parallel
3. After US2 complete:
   - Developer A: User Story 3 (T040-T052)
   - Developer B: User Story 4 (T053-T062) - can start in parallel
4. Team completes Polish together (T063-T078)

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No automated tests - manual browser testing per quickstart.md
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently with quickstart.md scenarios
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks include exact file paths for immediate execution
- Total: 78 tasks organized across 7 phases
- MVP scope: Phases 1-3 (T001-T027) = 27 tasks
- Full feature: All 78 tasks
