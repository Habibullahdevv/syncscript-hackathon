---
id: 005
title: Phase 5 Frontend Dashboard Constitution
stage: constitution
date: 2026-02-15
surface: agent
model: claude-sonnet-4-5
feature: none
branch: 004-socketio-realtime
user: JHOOLAY LAAL
command: /sp.constitution
labels: ["constitution", "phase-5", "frontend", "dashboard", "shadcn-ui", "role-based-ui"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution document, no automated tests)
---

## Prompt

```text
/sp.constitution

# 🏛 SP.CONSTITUTION
## Project: Phase 5 – Frontend Dashboard & Role-Based UI

---

## 🎯 Scope Definition (Phase 5 Only)

Phase 5 focuses strictly on **building the frontend dashboard** for the Vault system. It integrates with the backend APIs and authentication from Phases 2–4. This phase emphasizes a functional, role-based user interface to display vaults, sources, and relevant actions based on user roles.

Phase 5 includes:

- shadcn/ui setup (table, card, button, badge, toast)
- Dashboard layout with sidebar navigation
- Vault list page with cards displaying vault information
- Vault detail page showing sources in a DataTable
- Source upload form integration (Phase 2 API)
- Role-based UI components:
  - Owner: "Invite" and full CRUD controls
  - Contributor: "Add Source" and view-only controls
  - Viewer: read-only interface
- Toast notifications for real-time updates (from Phase 4 events)

Phase 5 explicitly **excludes**:

- Backend API development (Phase 2)
- Authentication/session logic (Phase 3)
- Socket.io server logic (Phase 4)
- Audit logs, rate limiting, or deployment polish (Phase 6)
- Any features outside the Vault dashboard UI

No Phase 6+ features are included.

---

## 🎯 Core Principles

- **Role-Based Access Control** – UI dynamically adapts to user role
- **Data Accuracy** – All displayed data sourced from Phase 2 APIs
- **Responsiveness & Usability** – Dashboard layout is functional across screen sizes
- **Seamless Integration** – Connect to real-time events from Phase 4 for live updates
- **Minimal Frontend Logic** – Business logic resides in APIs; frontend handles display and interaction only

---

## 🏗 Technical Stack (Phase 5 Only)

- **Next.js 14+ App Router**
- **TypeScript (strict mode)**
- **Tailwind CSS + shadcn/ui** for components
- **React hooks & context** for state and session management
- **NextAuth.js** for session retrieval (Phase 3)
- **Axios/fetch** to call Phase 2 APIs
- **Socket.io client** to subscribe to Phase 4 events
- **Zod** for form input validation

---

## 🛡 Role-Based UI Standards

- Owner: full CRUD on vaults and sources, access to invite members
- Contributor: add sources, view vault details, cannot delete vaults
- Viewer: read-only access to vaults and sources
- Role detection based on NextAuth session
- Unauthorized UI actions are hidden or disabled

---

## 🧪 Testing Standards

Phase 5 is complete when:

- Dashboard renders without errors
- Vault list page displays all accessible vaults for the user
- Vault detail page displays sources correctly in DataTable
- Upload form works for authorized roles and rejects unauthorized users
- Role-based UI elements appear/disappear correctly based on session role
- Real-time events trigger toast notifications correctly
- End-to-end flow from login → dashboard → source upload → real-time updates works
- Postman and browser testing confirm data integrity

---

## ⚠️ Constraints

- Only frontend dashboard and role-based UI (no backend changes)
- No backend API development (Phase 2 handles persistence)
- Only vault and source views (no global admin, reports, or analytics)
- Must run locally via `npm run dev`
- Minimalistic design; advanced styling or animation is optional
- Phase 6+ features (audit logs, rate limiting, demo recording) not included

---

## 🏁 Success Criteria

Phase 5 is complete when:

- Dashboard UI is fully functional and role-sensitive
- Vaults and sources load correctly via Phase 2 APIs
- Real-time updates appear instantly for connected clients
- Role-based actions are correctly enabled/disabled
- No errors occur in the console or UI
- Postman/browser testing confirms end-to-end frontend/backend integration
- No Phase 6+ features implemented
```

## Response snapshot

Successfully updated SyncScript constitution from v1.3.0 to v1.4.0 (MINOR bump) to include Phase 5 Frontend Dashboard & Role-Based UI principles.

**Constitution Changes**:

**Version**: 1.3.0 → 1.4.0 (MINOR: Added Phase 5 principles)

**Added Principles** (XXVII-XXXII):
- **XXVII. shadcn/ui Component Library Exclusively**: Mandates shadcn/ui for all UI components, prohibits alternative libraries
- **XXVIII. Role-Based UI Rendering**: Requires dynamic UI adaptation based on NextAuth.js session role
- **XXIX. Dashboard Layout with Sidebar Navigation**: Specifies sidebar navigation with role badge and responsive design
- **XXX. DataTable for Source Management**: Mandates shadcn/ui DataTable with sorting, filtering, pagination
- **XXXI. Real-Time Toast Notifications**: Requires toast notifications for all Socket.io events with actor attribution
- **XXXII. Minimal Frontend Logic (API-First)**: Enforces delegation of business logic to backend APIs

**Updated Sections**:
- **Quality Gates**: Added Phase 5 Completion Criteria (14 criteria for dashboard, vault list, DataTable, role-based UI, real-time toasts)
- **Forbidden Patterns**: Added Phase 5 prohibitions (alternative component libraries, client-side Prisma, complex state management, inline styles)
- **Technology Stack**: Added Phase 5 stack (shadcn/ui, Radix UI, Tailwind CSS, React hooks, Zod validation)
- **Scope Boundaries**: Added Phase 5 in-scope items (dashboard layout, vault pages, DataTable, upload form, toast notifications, responsive design)
- **Performance Targets**: Added Phase 5 targets (< 2s page load, < 500ms vault list, < 300ms DataTable, < 50ms toast display)

**Sync Impact Report**:
- Modified Principles: Scope Boundaries, Quality Gates, Technology Stack, Performance Targets expanded
- Added Sections: Principles XXVII-XXXII, Phase 5 Completion Criteria, shadcn/ui standards, dashboard patterns, role-based UI rules
- Removed Sections: None
- Templates Requiring Updates: ✅ All templates align with Phase 5 principles

**Constitution Compliance**:
- All 6 Phase 5 principles follow declarative, testable format
- No bracketed placeholders remaining
- Version semantics followed (MINOR bump for additive principles)
- Dates in ISO format (2026-02-15)
- Governance section unchanged (amendment process remains valid)

## Outcome

- ✅ Impact: Constitution updated to v1.4.0 with complete Phase 5 Frontend Dashboard governance
- 🧪 Tests: N/A (constitution document, validation via implementation adherence)
- 📁 Files: 1 file modified (.specify/memory/constitution.md)
- 🔁 Next prompts: Ready for `/sp.specify` to create Phase 5 feature specification
- 🧠 Reflection: Phase 5 principles maintain consistency with Phases 1-4 by enforcing API-first architecture, role-based access control, and technology stack constraints. shadcn/ui mandate ensures accessible, customizable components while Tailwind CSS maintains styling consistency across all phases.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution update completed successfully
- Graders run and results (PASS/FAIL): Format validation: 6/6 principles PASS declarative format
- Prompt variant (if applicable): Standard /sp.constitution workflow with Phase 5 requirements
- Next experiment (smallest change to try): During Phase 5 implementation, validate that shadcn/ui components integrate cleanly with existing Tailwind CSS setup from Phases 2-3, may need to adjust component customization approach if conflicts arise
