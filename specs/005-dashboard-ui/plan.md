# Implementation Plan: Frontend Dashboard & Role-Based UI

**Branch**: `005-dashboard-ui` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-dashboard-ui/spec.md`

## Summary

Phase 5 implements a fully functional frontend dashboard for the Vault system with role-based UI rendering. The dashboard integrates with Phase 2 backend APIs for CRUD operations, Phase 3 NextAuth.js for session management, and Phase 4 Socket.io for real-time updates. Users can view vaults, manage sources, and see live updates based on their role (owner/contributor/viewer). The implementation uses shadcn/ui components, Tailwind CSS, and React hooks for state management.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.1.6 App Router
**Primary Dependencies**: shadcn/ui, Radix UI, Tailwind CSS, React 19, Socket.io client, NextAuth.js, Zod
**Storage**: N/A (frontend only, data fetched from Phase 2 APIs)
**Testing**: Manual browser testing with multiple user roles and concurrent sessions
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with ES6+ and WebSocket support
**Project Type**: Web application (frontend only, integrates with existing backend)
**Performance Goals**: < 2s page load, < 500ms table rendering, < 1s real-time event propagation
**Constraints**: No backend modifications, no direct database access, responsive design (320px-1920px)
**Scale/Scope**: 4 user stories, 22 functional requirements, 8 shadcn/ui components, 3 main pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Phase 5 Principles (XXVII-XXXII)**:

- ✅ **XXVII. shadcn/ui Component Library Exclusively**: Plan uses shadcn/ui for all UI components (Table, Card, Button, Badge, Toast, Dialog, Form, Input)
- ✅ **XXVIII. Role-Based UI Rendering**: Plan includes dynamic UI adaptation based on NextAuth.js session role
- ✅ **XXIX. Dashboard Layout with Sidebar Navigation**: Plan includes sidebar with role badge and responsive design
- ✅ **XXX. DataTable for Source Management**: Plan includes shadcn/ui DataTable with sorting, filtering, pagination
- ✅ **XXXI. Real-Time Toast Notifications**: Plan includes toast notifications for Socket.io events
- ✅ **XXXII. Minimal Frontend Logic (API-First)**: Plan delegates all business logic to Phase 2 APIs

**Forbidden Patterns Check**:
- ✅ NO alternative component libraries (Material-UI, Ant Design, Chakra UI)
- ✅ NO direct Radix UI primitive installation (using shadcn/ui wrappers)
- ✅ NO client-side Prisma access (using Phase 2 APIs only)
- ✅ NO complex state management libraries (using React hooks and Context API)
- ✅ NO client-side business logic (delegating to backend APIs)
- ✅ NO inline styles or CSS modules (using Tailwind CSS only)

**Result**: ✅ All Phase 5 constitution principles satisfied. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/005-dashboard-ui/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - shadcn/ui integration patterns
├── data-model.md        # Phase 1 output - frontend state management
├── quickstart.md        # Phase 1 output - testing scenarios
├── contracts/           # Phase 1 output - component interfaces
│   ├── components.md    # shadcn/ui component specifications
│   └── api-integration.md # Phase 2 API integration contracts
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
syncscript/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Dashboard route group
│   │   │   ├── layout.tsx        # Sidebar layout
│   │   │   ├── page.tsx          # Vault list page
│   │   │   └── vaults/
│   │   │       └── [id]/
│   │   │           └── page.tsx  # Vault detail page
│   │   ├── api/                  # Existing Phase 2 APIs (no changes)
│   │   └── login/                # Existing Phase 3 login (no changes)
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   └── input.tsx
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx       # Sidebar navigation
│   │   │   ├── vault-card.tsx    # Vault list card
│   │   │   ├── source-table.tsx  # Source DataTable
│   │   │   └── upload-form.tsx   # Source upload form
│   │   └── providers/
│   │       ├── session-provider.tsx  # NextAuth session wrapper
│   │       └── socket-provider.tsx   # Socket.io connection wrapper
│   ├── lib/
│   │   ├── api.ts                # API client functions
│   │   ├── socket.ts             # Socket.io client setup (existing from Phase 4)
│   │   └── utils.ts              # Utility functions
│   └── hooks/
│       ├── use-vaults.ts         # Vault data fetching hook
│       ├── use-sources.ts        # Source data fetching hook
│       └── use-socket-events.ts  # Socket.io event listener hook
└── public/                       # Static assets
```

**Structure Decision**: Next.js App Router structure with route groups for dashboard. Components organized by type (ui/, dashboard/, providers/). Hooks for data fetching and real-time events. No backend modifications - all API integration uses existing Phase 2 endpoints.

## Complexity Tracking

> **No violations - this section is empty**

## Architecture Decisions

### Decision 1: shadcn/ui Component Library

**Context**: Need UI component library for dashboard, table, forms, and notifications.

**Options Considered**:
1. **Build custom components from scratch**
   - Pros: Full control, no dependencies
   - Cons: Time-consuming, accessibility challenges, reinventing the wheel
2. **Use Material-UI or Ant Design**
   - Pros: Comprehensive component libraries, well-documented
   - Cons: Opinionated styling, harder to customize, violates constitution
3. **Use shadcn/ui (CHOSEN)**
   - Pros: Copy-paste components, full control, Tailwind CSS integration, accessible (Radix UI primitives), constitution-compliant
   - Cons: Manual component installation, less comprehensive than full libraries

**Decision**: Use shadcn/ui exclusively for all UI components.

**Rationale**: shadcn/ui provides accessible, customizable components that integrate seamlessly with existing Tailwind CSS setup. Components are copied into the project (not npm packages), giving full control over styling and behavior. This aligns with Phase 5 constitution principle XXVII.

**Implementation**: Install components via `npx shadcn-ui@latest add <component>` and customize with Tailwind CSS utility classes.

---

### Decision 2: React Hooks + Context API for State Management

**Context**: Need state management for vault list, source list, user session, and Socket.io connection.

**Options Considered**:
1. **Redux or Redux Toolkit**
   - Pros: Predictable state management, dev tools, time-travel debugging
   - Cons: Boilerplate code, overkill for Phase 5 scope, violates constitution
2. **Zustand**
   - Pros: Minimal boilerplate, simple API, good TypeScript support
   - Cons: Additional dependency, violates constitution (complex state management)
3. **React Hooks + Context API (CHOSEN)**
   - Pros: Built-in React features, no additional dependencies, adequate for Phase 5 scope, constitution-compliant
   - Cons: More verbose than Zustand, potential prop drilling

**Decision**: Use React hooks (useState, useEffect, useCallback) and Context API for state management.

**Rationale**: Phase 5 scope is limited to dashboard UI with straightforward state needs (vault list, source list, session). React's built-in state management is sufficient and avoids unnecessary dependencies. This aligns with Phase 5 constitution principle XXXII (minimal frontend logic).

**Implementation**: Create custom hooks (use-vaults.ts, use-sources.ts) for data fetching and Context providers for session and Socket.io connection.

---

### Decision 3: Server Components + Client Components Hybrid

**Context**: Next.js App Router supports both server and client components. Need to decide rendering strategy.

**Options Considered**:
1. **All client components**
   - Pros: Simpler mental model, all components can use hooks
   - Cons: Larger JavaScript bundle, slower initial page load
2. **All server components**
   - Pros: Faster initial page load, smaller JavaScript bundle
   - Cons: Cannot use hooks, cannot handle client-side interactions
3. **Hybrid approach (CHOSEN)**
   - Pros: Optimal performance, server components for static content, client components for interactive elements
   - Cons: More complex mental model, need to mark client components with 'use client'

**Decision**: Use server components for layout and static content, client components for interactive elements (forms, tables, Socket.io listeners).

**Rationale**: Server components reduce JavaScript bundle size and improve initial page load. Client components are necessary for interactive elements (forms, real-time updates). This hybrid approach optimizes performance while maintaining interactivity.

**Implementation**:
- Server components: layout.tsx (sidebar structure), page.tsx (initial data fetching)
- Client components: vault-card.tsx, source-table.tsx, upload-form.tsx, socket-provider.tsx

---

### Decision 4: API Client Functions vs Direct Fetch

**Context**: Need to call Phase 2 backend APIs from frontend components.

**Options Considered**:
1. **Direct fetch() calls in components**
   - Pros: Simple, no abstraction
   - Cons: Code duplication, inconsistent error handling, hard to test
2. **Axios library**
   - Pros: Interceptors, automatic JSON parsing, better error handling
   - Cons: Additional dependency, overkill for simple API calls
3. **Custom API client functions (CHOSEN)**
   - Pros: Centralized API logic, consistent error handling, easy to test, no additional dependencies
   - Cons: Requires writing wrapper functions

**Decision**: Create custom API client functions in lib/api.ts wrapping native fetch().

**Rationale**: Centralized API logic ensures consistent error handling, request formatting, and response parsing. Native fetch() is sufficient for Phase 5 needs without adding Axios dependency. Custom functions can be easily tested and maintained.

**Implementation**: Create functions like `getVaults()`, `getSources(vaultId)`, `uploadSource(vaultId, file, title)` in lib/api.ts.

---

### Decision 5: Real-Time Updates via Socket.io Client Hook

**Context**: Need to integrate Phase 4 Socket.io events into dashboard UI for real-time updates.

**Options Considered**:
1. **Direct Socket.io client in components**
   - Pros: Simple, direct access to socket
   - Cons: Code duplication, inconsistent connection management, hard to test
2. **Socket.io Context Provider + Custom Hook (CHOSEN)**
   - Pros: Centralized connection management, reusable hook, easy to test, consistent event handling
   - Cons: Requires Context setup

**Decision**: Create SocketProvider context and useSocketEvents custom hook for real-time event handling.

**Rationale**: Context provider ensures single Socket.io connection across all components. Custom hook provides clean API for subscribing to events (source:created, source:deleted). This pattern is reusable and testable.

**Implementation**:
- SocketProvider: Manages Socket.io connection lifecycle
- useSocketEvents: Custom hook for subscribing to specific events
- Components call useSocketEvents('source:created', callback) to listen for events

---

## Implementation Phases

### Phase 0: Research & Preparation

**Objective**: Research shadcn/ui integration patterns, Next.js App Router best practices, and Socket.io client patterns.

**Tasks**:
1. Research shadcn/ui installation and customization
2. Research Next.js App Router server/client component patterns
3. Research Socket.io client connection management in React
4. Research TanStack Table integration with shadcn/ui DataTable
5. Document findings in research.md

**Output**: research.md with integration patterns and best practices

---

### Phase 1: Foundation Setup

**Objective**: Install shadcn/ui components, configure Tailwind CSS, set up project structure.

**Tasks**:
1. Install shadcn/ui CLI and initialize configuration
2. Install required components: Table, Card, Button, Badge, Toast, Dialog, Form, Input
3. Create directory structure: components/ui/, components/dashboard/, hooks/, lib/
4. Configure Tailwind CSS for shadcn/ui components
5. Create API client functions in lib/api.ts
6. Create custom hooks: use-vaults.ts, use-sources.ts

**Validation**:
- `npm run dev` starts without errors
- shadcn/ui components render correctly
- Tailwind CSS classes apply correctly

---

### Phase 2: Dashboard Layout & Navigation

**Objective**: Build sidebar navigation with role badge and responsive design.

**Tasks**:
1. Create (dashboard) route group with layout.tsx
2. Implement Sidebar component with navigation links
3. Add role badge display using NextAuth.js session
4. Implement responsive sidebar (collapsible on mobile)
5. Create SessionProvider wrapper for NextAuth.js
6. Test navigation between pages

**Validation**:
- Sidebar renders with role badge
- Navigation links work without full-page reloads
- Sidebar collapses on mobile screen sizes
- Role badge displays correct role from session

---

### Phase 3: Vault List Page

**Objective**: Display all accessible vaults as cards with role badges.

**Tasks**:
1. Create vault list page at (dashboard)/page.tsx
2. Implement VaultCard component
3. Fetch vaults from Phase 2 API using use-vaults hook
4. Display vault cards with title, description, source count, role badge
5. Implement empty state when no vaults exist
6. Add loading state during data fetching
7. Add error handling for API failures

**Validation**:
- Vault cards display correctly for all roles
- Role badges show correct role (owner/contributor/viewer)
- Empty state displays when no vaults exist
- Loading indicator appears during fetch
- Error messages display on API failure

---

### Phase 4: Vault Detail Page with Source Table

**Objective**: Display sources in DataTable with sorting, filtering, pagination.

**Tasks**:
1. Create vault detail page at (dashboard)/vaults/[id]/page.tsx
2. Implement SourceTable component using shadcn/ui DataTable
3. Integrate TanStack Table for sorting, filtering, pagination
4. Fetch sources from Phase 2 API using use-sources hook
5. Display columns: Title, File Size, Upload Date, Actions
6. Implement table sorting (ascending/descending)
7. Implement table filtering by title
8. Implement pagination (10 sources per page)
9. Implement empty state when no sources exist

**Validation**:
- Source table displays all sources correctly
- Sorting works for all columns
- Filtering by title works correctly
- Pagination displays 10 sources per page
- Empty state displays when no sources exist

---

### Phase 5: Source Upload Form

**Objective**: Implement PDF upload form for owner/contributor roles.

**Tasks**:
1. Create UploadForm component using shadcn/ui Dialog and Form
2. Add file input (PDF only) and title input
3. Implement form validation using Zod
4. Call Phase 2 upload API on form submission
5. Display loading indicator during upload
6. Display success/error messages
7. Refresh source table after successful upload
8. Close dialog after successful upload

**Validation**:
- Upload form opens when "Add Source" button clicked
- File type validation rejects non-PDF files
- Title validation requires non-empty title
- Upload succeeds and source appears in table
- Loading indicator displays during upload
- Error messages display on upload failure

---

### Phase 6: Role-Based UI Rendering

**Objective**: Dynamically show/hide UI elements based on user role.

**Tasks**:
1. Implement role check utility function
2. Add conditional rendering for "Add Source" button (owner/contributor only)
3. Add conditional rendering for "Delete" action (owner only)
4. Hide "Invite" button for contributor/viewer
5. Test UI rendering for all three roles
6. Ensure unauthorized buttons are removed from DOM (not just disabled)

**Validation**:
- Owner sees all controls (Add Source, Delete, Invite)
- Contributor sees Add Source only
- Viewer sees no action buttons (read-only)
- Unauthorized buttons are not in DOM

---

### Phase 7: Real-Time Integration

**Objective**: Integrate Socket.io events for real-time toast notifications and table updates.

**Tasks**:
1. Create SocketProvider context component
2. Create useSocketEvents custom hook
3. Subscribe to source:created event in vault detail page
4. Subscribe to source:deleted event in vault detail page
5. Display toast notification on source:created with actor name
6. Display toast notification on source:deleted with actor name
7. Update source table automatically on source:created
8. Remove source from table automatically on source:deleted
9. Configure toast auto-dismiss (5 seconds)
10. Test with multiple browser windows

**Validation**:
- Toast notifications appear on source:created
- Toast notifications appear on source:deleted
- Source table updates automatically without refresh
- Toasts stack vertically without overlapping
- Toasts auto-dismiss after 5 seconds
- Multiple clients see updates simultaneously

---

### Phase 8: Testing & Validation

**Objective**: End-to-end testing with multiple user roles and concurrent sessions.

**Tasks**:
1. Test vault list page for all roles
2. Test vault detail page for all roles
3. Test source upload for owner/contributor
4. Test role-based UI rendering
5. Test real-time updates with multiple browser windows
6. Test responsive design on mobile/tablet/desktop
7. Test error handling for API failures
8. Test empty states for vaults and sources
9. Verify no Phase 6+ features implemented
10. Document any issues or deviations

**Validation**:
- All user stories pass acceptance scenarios
- All functional requirements satisfied
- All success criteria met
- No console errors
- Responsive design works on all screen sizes

---

## Completion Criteria

Phase 5 is complete when:

1. ✅ shadcn/ui components installed and configured
2. ✅ Dashboard layout with sidebar navigation functional
3. ✅ Vault list page displays all accessible vaults with role badges
4. ✅ Vault detail page displays sources in DataTable with sorting, filtering, pagination
5. ✅ Source upload form works for owner/contributor roles
6. ✅ Role-based UI elements appear/disappear correctly for all roles
7. ✅ Real-time toast notifications appear for source:created and source:deleted events
8. ✅ Source table updates automatically on real-time events
9. ✅ End-to-end flow (login → dashboard → source upload → real-time update) works without errors
10. ✅ Responsive design works on screen sizes from 320px to 1920px
11. ✅ All Phase 5 constitution principles satisfied
12. ✅ No Phase 6+ features implemented

---

## Risk Analysis

**Risk 1: shadcn/ui DataTable complexity**
- **Impact**: High - DataTable is core component for source management
- **Mitigation**: Research TanStack Table integration patterns before implementation
- **Fallback**: Use simpler table component without advanced features if integration proves too complex

**Risk 2: Socket.io connection management in React**
- **Impact**: Medium - Real-time updates are P4 (lower priority)
- **Mitigation**: Use Context provider pattern to manage single connection
- **Fallback**: Implement polling-based updates if Socket.io integration fails

**Risk 3: Role-based UI rendering edge cases**
- **Impact**: Medium - Security concern if unauthorized actions are accessible
- **Mitigation**: Implement role checks on both client and server (defense in depth)
- **Fallback**: Backend APIs already enforce authorization, UI is additional layer

**Risk 4: Responsive design complexity**
- **Impact**: Low - Functional layout is acceptable, polish is optional
- **Mitigation**: Use Tailwind CSS responsive utilities, test on multiple screen sizes
- **Fallback**: Focus on desktop layout first, mobile optimization is secondary

---

## Dependencies

**External Dependencies**:
- Phase 2 Backend APIs: Vault list, source list, source upload endpoints
- Phase 3 Authentication: NextAuth.js session with user.id and user.role
- Phase 4 Socket.io: Real-time events (source:created, source:deleted)
- Cloudinary: PDF storage via Phase 2 API

**Internal Dependencies**:
- Tailwind CSS configuration (already set up in previous phases)
- Next.js App Router (already configured)
- TypeScript configuration (already configured)

**Blocking Issues**:
- None - all dependencies from Phases 2-4 are complete and functional

---

## Notes

- Phase 5 is purely frontend work - no backend modifications
- All data fetching uses existing Phase 2 APIs
- All authentication uses existing Phase 3 NextAuth.js
- All real-time events use existing Phase 4 Socket.io
- Manual browser testing only - no automated tests
- Focus on functional layout - advanced styling is optional
- shadcn/ui components provide accessibility out of the box
- Responsive design uses Tailwind CSS utilities
- No Phase 6+ features (audit logs, rate limiting, deployment)
