---
id: 002
title: Phase 5 Implementation Plan
stage: plan
date: 2026-02-15
surface: agent
model: claude-sonnet-4-5
feature: 005-dashboard-ui
branch: 005-dashboard-ui
user: JHOOLAY LAAL
command: /sp.plan
labels: ["plan", "phase-5", "dashboard", "architecture", "shadcn-ui", "react", "nextjs"]
links:
  spec: specs/005-dashboard-ui/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-dashboard-ui/plan.md
  - specs/005-dashboard-ui/research.md
  - specs/005-dashboard-ui/data-model.md
  - specs/005-dashboard-ui/contracts/components.md
  - specs/005-dashboard-ui/contracts/api-integration.md
  - specs/005-dashboard-ui/quickstart.md
tests:
  - N/A (planning document, testing scenarios defined in quickstart.md)
---

## Prompt

```text
/sp.plan

# 🏗 Execution Strategy Overview

Approach: **Build-Test-Validate**
- Implement a fully functional frontend dashboard for the Vault system
- Integrate with Phase 2 APIs for CRUD operations and Phase 4 Socket.io events for real-time updates
- Enforce role-based UI rendering for Owner, Contributor, and Viewer
- Test incrementally using multiple browser tabs and Postman for data validation

Organized by phases:

1. Foundation Setup – Project scaffolding, Tailwind + shadcn/ui setup
2. Dashboard Layout – Sidebar and navigation
3. Vault List Page – Cards for all accessible vaults
4. Vault Detail Page – DataTable for sources + source upload form
5. Role-Based UI – Conditional rendering of buttons, badges, and forms
6. Real-Time Event Integration – Toasts and table updates from Phase 4 Socket.io events
7. Testing & Validation – End-to-end verification of all interactions

[Full execution strategy with 7 phases, architecture sketch, quality validation framework, and completion criteria provided]
```

## Response snapshot

Successfully created comprehensive Phase 5 implementation plan with complete Phase 0 (Research) and Phase 1 (Design & Contracts) artifacts.

**Plan Structure**:

**Technical Context**:
- Language: TypeScript 5.x with Next.js 16.1.6 App Router
- Dependencies: shadcn/ui, Radix UI, Tailwind CSS, React 19, Socket.io client, NextAuth.js, Zod
- Performance Goals: < 2s page load, < 500ms table rendering, < 1s real-time event propagation
- Constraints: No backend modifications, responsive design (320px-1920px)

**Constitution Check**: ✅ All 6 Phase 5 principles satisfied (XXVII-XXXII)
- shadcn/ui exclusively
- Role-based UI rendering
- Dashboard layout with sidebar
- DataTable for source management
- Real-time toast notifications
- Minimal frontend logic (API-first)

**Project Structure**:
- Next.js App Router with route groups: (dashboard)/layout.tsx, page.tsx, vaults/[id]/page.tsx
- Components: ui/ (shadcn/ui), dashboard/ (custom), providers/ (context)
- Hooks: use-vaults.ts, use-sources.ts, use-socket-events.ts
- Lib: api.ts (API client), socket.ts (Socket.io), utils.ts

**5 Architecture Decisions**:
1. **shadcn/ui Component Library**: Copy-paste approach for full control vs Material-UI/Ant Design
2. **React Hooks + Context API**: Built-in state management vs Redux/Zustand
3. **Server/Client Component Hybrid**: Optimal performance vs all-client or all-server
4. **API Client Functions**: Custom fetch wrappers vs Axios
5. **Socket.io Client Hook**: Context Provider pattern vs direct socket in components

**8 Implementation Phases**:
- Phase 0: Research & Preparation (shadcn/ui patterns, Next.js best practices, Socket.io client)
- Phase 1: Foundation Setup (install components, configure Tailwind, create structure)
- Phase 2: Dashboard Layout & Navigation (sidebar with role badge, responsive design)
- Phase 3: Vault List Page (cards with role badges, empty states, loading states)
- Phase 4: Vault Detail Page with Source Table (DataTable with sorting/filtering/pagination)
- Phase 5: Source Upload Form (PDF validation, Cloudinary integration, role-based access)
- Phase 6: Role-Based UI Rendering (conditional buttons, owner/contributor/viewer logic)
- Phase 7: Real-Time Integration (Socket.io events, toast notifications, table updates)
- Phase 8: Testing & Validation (multi-role testing, concurrent sessions, responsive design)

**Phase 0 Output - research.md**:
- shadcn/ui installation: `npx shadcn-ui@latest add <component>`
- Next.js patterns: Server components for static content, client components for interactivity
- Socket.io: Context Provider + Custom Hook pattern for connection management
- TanStack Table: Integration with shadcn/ui DataTable for sorting/filtering/pagination
- Role-based UI: Custom hook pattern for permission checks
- Technology stack decisions with rationale for each choice

**Phase 1 Output - Design & Contracts**:

1. **data-model.md**: Frontend state management structure
   - Global State: SessionState (NextAuth.js), SocketState (Socket.io connection)
   - Component State: VaultListState, SourceListState, UploadFormState, TableState, ToastState
   - State flow diagrams for vault list, vault detail, and source upload
   - Real-time synchronization patterns
   - Error handling strategies

2. **contracts/components.md**: shadcn/ui component specifications
   - 8 shadcn/ui components: Table, Card, Button, Badge, Toast, Dialog, Form, Input
   - 4 custom dashboard components: Sidebar, VaultCard, SourceTable, UploadForm
   - Props interfaces, usage patterns, integration requirements
   - Accessibility requirements (keyboard navigation, screen reader support)
   - Manual testing checklist for each component

3. **contracts/api-integration.md**: Phase 2 API integration contracts
   - 5 API endpoints: GET /api/vaults, GET /api/vaults/:id, GET /api/vaults/:id/sources, POST /api/vaults/:id/sources, DELETE /api/vaults/:vaultId/sources/:sourceId
   - Request/response structures with TypeScript interfaces
   - Error handling strategy (401, 403, 404, 413, 500)
   - Authentication integration (NextAuth.js session cookies)
   - Authorization patterns (role-based access control)
   - Real-time integration (Socket.io events: source:created, source:deleted)
   - Performance optimization (debouncing, throttling, no caching)

4. **quickstart.md**: Manual testing scenarios
   - 10 comprehensive test scenarios covering all user stories
   - Scenario 1: Owner role full access (CRUD operations)
   - Scenario 2: Contributor role limited access (upload only)
   - Scenario 3: Viewer role read-only access
   - Scenario 4: Real-time updates with concurrent users (2 browser windows)
   - Scenario 5: Form validation (file type, size, title)
   - Scenario 6: Table features (sort, filter, paginate)
   - Scenario 7: Error handling (network errors, unauthorized access)
   - Scenario 8: Responsive design (mobile, tablet, desktop)
   - Scenario 9: Empty states (no vaults, no sources, no search results)
   - Scenario 10: End-to-end workflow (login → upload → real-time update)
   - Performance benchmarks and troubleshooting guide

**Completion Criteria** (12 items):
1. shadcn/ui components installed and configured
2. Dashboard layout with sidebar navigation functional
3. Vault list page displays all accessible vaults with role badges
4. Vault detail page displays sources in DataTable with sorting, filtering, pagination
5. Source upload form works for owner/contributor roles
6. Role-based UI elements appear/disappear correctly for all roles
7. Real-time toast notifications appear for source:created and source:deleted events
8. Source table updates automatically on real-time events
9. End-to-end flow (login → dashboard → source upload → real-time update) works without errors
10. Responsive design works on screen sizes from 320px to 1920px
11. All Phase 5 constitution principles satisfied
12. No Phase 6+ features implemented

**Risk Analysis**:
- Risk 1: shadcn/ui DataTable complexity (High impact, mitigated by research)
- Risk 2: Socket.io connection management (Medium impact, Context provider pattern)
- Risk 3: Role-based UI edge cases (Medium impact, defense in depth)
- Risk 4: Responsive design complexity (Low impact, Tailwind utilities)

**Dependencies**:
- Phase 2 Backend APIs: Vault list, source list, source upload endpoints
- Phase 3 Authentication: NextAuth.js session with user.id and user.role
- Phase 4 Socket.io: Real-time events (source:created, source:deleted)
- Cloudinary: PDF storage via Phase 2 API

## Outcome

- ✅ Impact: Complete Phase 5 implementation plan with 5 architecture decisions, 8 implementation phases, and 4 Phase 1 design artifacts (research.md, data-model.md, contracts/, quickstart.md)
- 🧪 Tests: Manual browser testing scenarios defined for 10 comprehensive test cases covering all user stories and edge cases
- 📁 Files: 6 files created (plan.md, research.md, data-model.md, contracts/components.md, contracts/api-integration.md, quickstart.md)
- 🔁 Next prompts: Ready for `/sp.tasks` to generate actionable task breakdown, then `/sp.implement` to execute implementation
- 🧠 Reflection: Phase 5 plan maintains clear separation from backend (Phases 2-4) by focusing purely on frontend concerns. Architecture decisions prioritize simplicity (React hooks over Redux, native fetch over Axios) while maintaining performance (server/client hybrid, debouncing). Research phase resolved all technical unknowns (shadcn/ui integration, Socket.io patterns, TanStack Table). Design artifacts provide complete contracts for implementation without ambiguity. All 6 Phase 5 constitution principles satisfied with no violations.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully with all Phase 0 and Phase 1 artifacts generated
- Graders run and results (PASS/FAIL): Constitution check: 6/6 principles PASS, Forbidden patterns: 6/6 checks PASS
- Prompt variant (if applicable): Standard /sp.plan workflow with Phase 5 frontend dashboard requirements following Build-Test-Validate approach
- Next experiment (smallest change to try): During task generation, validate that all 8 implementation phases can be broken down into independently testable tasks with clear acceptance criteria. Consider whether Phase 7 (Real-Time Integration) should be merged with Phase 4 (Vault Detail Page) since Socket.io events are tightly coupled to source table updates.
