---
id: 001
title: Phase 5 Dashboard UI Specification
stage: spec
date: 2026-02-15
surface: agent
model: claude-sonnet-4-5
feature: 005-dashboard-ui
branch: 005-dashboard-ui
user: JHOOLAY LAAL
command: /sp.specify
labels: ["spec", "phase-5", "dashboard", "ui", "role-based", "shadcn-ui"]
links:
  spec: specs/005-dashboard-ui/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-dashboard-ui/spec.md
  - specs/005-dashboard-ui/checklists/requirements.md
tests:
  - N/A (specification document, testing scenarios defined in spec)
---

## Prompt

```text
/sp.specify

# 📌 SP.SPECIFY
## Project: Phase 5 – Frontend Dashboard & Role-Based UI

---

### 🎯 Objective
Develop a fully functional frontend dashboard for the Vault system that integrates with Phases 2–4 backend APIs. The dashboard must display vaults, sources, and user-specific actions based on roles. Real-time updates from Socket.io (Phase 4) should be reflected in the UI using toast notifications or live table updates.

---

### 👥 Target Audience
- Authenticated demo users:
  - `owner@demo.com` → owner
  - `contributor@demo.com` → contributor
  - `viewer@demo.com` → viewer
- Users interact with dashboard to view vaults, manage sources, and perform role-appropriate actions
- Multiple clients can connect simultaneously to the same vault and see live updates

---

### 🖥 Frontend Components

**Dashboard Layout**
- Sidebar navigation
- Vault list page (cards)
- Vault detail page (DataTable for sources)
- Toast notifications for real-time events

**Role-Based UI Elements**
- Owner:
  - Invite members
  - Add, update, delete sources
  - Delete vault
- Contributor:
  - Add sources
  - View vault details
  - Cannot delete vault
- Viewer:
  - Read-only access
  - Cannot add/edit/delete sources or vaults

**Forms and Validation**
- Source upload form connected to Phase 2 API
- Form validation using Zod
- Role-based form access control

---

### ⚡ Real-Time Integration
- Connect to Socket.io (Phase 4) for real-time updates:
  - `new-source-added` → DataTable updates instantly
  - `contributor-joined` → Toast notifications
- Ensure UI components update dynamically based on incoming events
- Role-based filtering: viewers cannot trigger updates

---

### 🧪 Testing Requirements

Success is achieved if:

1. Dashboard renders for all user roles without errors
2. Vault list displays correctly according to user access
3. Vault detail page DataTable shows sources accurately
4. Upload form works for authorized roles only
5. Role-based UI elements appear or hide correctly
6. Real-time events trigger UI updates instantly
7. End-to-end flow:
   - Login → Dashboard → Source upload → Real-time update
   - Confirm data persistence via Phase 2 APIs
8. Postman/browser testing confirms integrity and role-based functionality

---

### ⚠️ Constraints

- Only Vault dashboard UI and role-based actions; no backend modifications
- No implementation of Phase 6 features (audit logs, rate limiting, demo recording)
- No advanced styling or animations required; focus on functional layout
- Must run locally via `npm run dev`
- Only minimal frontend for real-time event testing; no global admin or analytics pages

---

### 🏁 Completion Criteria

Phase 5 is complete when:

- Dashboard is fully functional for all roles
- Vaults and sources load via Phase 2 APIs
- Real-time updates appear in DataTable or toast notifications
- Role-based UI behavior is correctly enforced
- End-to-end testing confirms login → dashboard → source upload → live update workflow
- No Phase 6+ features are included
```

## Response snapshot

Successfully created Phase 5 Frontend Dashboard & Role-Based UI specification with 4 prioritized user stories, 22 functional requirements, and 12 success criteria.

**Specification Structure**:

**User Stories** (4 stories, independently testable):
- **US1 (P1)**: Vault List Dashboard - Entry point showing all accessible vaults with role badges
- **US2 (P2)**: Vault Detail with Source List - DataTable displaying sources with sorting, filtering, pagination
- **US3 (P3)**: Source Upload - PDF upload form for owner/contributor roles
- **US4 (P4)**: Real-Time Notifications - Toast notifications for live source additions/deletions

**Functional Requirements** (22 requirements):
- FR-001 to FR-003: Vault list and navigation
- FR-004 to FR-007: Source table with sorting, filtering, pagination
- FR-008 to FR-012: Role-based UI and source upload
- FR-013 to FR-016: Real-time notifications and table updates
- FR-017 to FR-022: Empty states, error handling, responsive layout

**Success Criteria** (12 measurable outcomes):
- SC-001 to SC-003: Page load and navigation performance (< 2s, < 1s, < 500ms)
- SC-004: Upload completion time (< 10s)
- SC-005 to SC-006: Real-time update latency (< 1s)
- SC-007: Role-based UI accuracy (100%)
- SC-008: Responsive design (320px to 1920px)
- SC-009 to SC-012: End-to-end flow, empty states, error messages, loading indicators

**Edge Cases** (7 scenarios):
- Network connection loss
- Role changes during session
- Vault deletion while viewing
- 100+ sources pagination
- Simultaneous uploads
- File size limit exceeded
- Form cancellation

**Dependencies**:
- Phase 2: Backend APIs (vault list, source list, upload)
- Phase 3: NextAuth.js session (user.id, user.role)
- Phase 4: Socket.io events (source:created, source:deleted)
- Cloudinary: PDF storage via Phase 2 API

**Assumptions**:
- shadcn/ui component library for UI components
- Tailwind CSS already configured
- Browser supports ES6+ and WebSocket
- Demo users exist with vault access

**Out of Scope**:
- Backend modifications
- Authentication changes
- Socket.io server logic
- User signup/registration
- Advanced styling/animations
- Mobile app development
- Automated testing

**Checklist Validation**: ✅ 16/16 items passed
- No implementation details in spec
- All requirements testable and unambiguous
- Success criteria measurable and technology-agnostic
- No [NEEDS CLARIFICATION] markers
- Dependencies and assumptions documented

## Outcome

- ✅ Impact: Complete Phase 5 specification with 4 user stories, 22 requirements, 12 success criteria
- 🧪 Tests: Manual browser testing scenarios defined for each user story
- 📁 Files: 2 files created (spec.md, checklists/requirements.md)
- 🔁 Next prompts: Ready for `/sp.plan` to generate implementation plan
- 🧠 Reflection: Phase 5 spec maintains clear separation from backend (Phases 2-4) by focusing purely on UI/UX concerns. User stories are prioritized by dependency (P1: vault list is prerequisite for P2: vault detail) and value (P3: upload enables content creation, P4: real-time enhances collaboration). All success criteria are measurable without implementation knowledge.

## Evaluation notes (flywheel)

- Failure modes observed: None - specification completed successfully
- Graders run and results (PASS/FAIL): Checklist validation: 16/16 items PASS
- Prompt variant (if applicable): Standard /sp.specify workflow with Phase 5 dashboard requirements
- Next experiment (smallest change to try): During planning, validate that shadcn/ui DataTable component supports all required features (sorting, filtering, pagination) without custom implementation, may need to adjust component choice if limitations discovered
