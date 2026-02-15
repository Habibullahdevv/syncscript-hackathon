---
id: 004
title: Phase 4 Socket.io Constitution Update
stage: constitution
date: 2026-02-15
surface: agent
model: claude-sonnet-4-5
feature: none
branch: 002-backend-apis
user: JHOOLAY LAAL
command: /sp.constitution
labels: ["constitution", "phase-4", "socketio", "real-time", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution update, no code tests)
---

## Prompt

```text
## Project: Phase 4 – Real-Time Socket.io Integration

---

## 🎯 Scope Definition (Phase 4 Only)

Phase 4 focuses strictly on **adding real-time capabilities** to the existing Vault system. It builds on the authenticated backend from Phase 3, enabling live updates of Sources within Vaults and notifications to all connected users. This phase **does not include frontend dashboard construction beyond test/demo UI, authentication changes, or CRUD API modifications** beyond real-time propagation.

Phase 4 includes:

- Socket.io server setup
- Vault-specific rooms for connected users
- Client connection to Socket.io
- Real-time propagation of Source creation and updates
- Real-time notifications (toast-style messages) for new sources or contributors joining
- End-to-end testing with multiple clients to validate live updates

Phase 4 explicitly **excludes**:

- NextAuth.js modifications (Phase 3 handles auth)
- Vault/Source CRUD implementation (Phase 2 handles backend logic)
- Frontend dashboard layout beyond minimal testing UI
- File upload API modifications (Phase 2)
- Rate limiting, audit logs, or other Phase 6 features
- Advanced role management beyond what Phase 3 provides

No implementation from Phase 5+ is included.

---

## 🎯 Core Principles

- **Immediate Feedback** – Users see new sources or contributor actions in real time
- **Secure Room Management** – Only authorized users can join a vault room
- **Stateless Updates** – Real-time events propagate without altering persistent data logic
- **Minimal Frontend** – Only test/demo UI for real-time verification
- **Error Transparency** – Invalid actions (e.g., unauthorized users attempting updates) result in clear events or rejection messages

---

## 🏗 Technical Stack (Phase 4 Only)

- **Next.js 14+ App Router**
- **TypeScript (strict mode)**
- **Socket.io (server & client)**
- **Prisma ORM + Neon PostgreSQL** (Phase 2 models)
- **NextAuth.js session middleware** (Phase 3 auth)
- **Zod** for input validation if needed for real-time events
- Optional lightweight frontend JS to connect to Socket.io for testing

---

## 🔐 Authentication & Authorization Standards

- All Socket.io connections must validate session via NextAuth
- Only users with proper role (owner, contributor, viewer) may join vault rooms
- Owner and contributor can emit events that modify Sources (add/update)
- Viewer role can only listen to events
- Unauthorized connection attempts are rejected with a clear error event

---

## 📡 Real-Time Features

1. **Vault Rooms**
   - Each Vault has its own Socket.io room
   - Users join room on client connection
   - Room membership verified via session and vault access

2. **Real-Time Source Updates**
   - Add Source → event emitted to all connected users in that vault
```

## Response snapshot

Successfully updated SyncScript Constitution from v1.2.0 to v1.3.0 with Phase 4 Real-Time Socket.io Integration principles.

**Version Change**: 1.2.0 → 1.3.0 (MINOR)

**Rationale**: Added new phase with 6 new principles (XXI-XXVI) covering Socket.io real-time features. This is a MINOR version bump because it adds new governance without breaking existing Phase 1-3 principles.

**Added Sections**:
- Principles XXI-XXVI: Socket.io Server, Vault Rooms, Session Authentication, Event Propagation, Role Authorization, Test UI
- Socket.io Configuration Standards: Server setup, client setup, event schema, API integration patterns
- Phase 4 Completion Criteria: 12 blocking criteria for Phase 5
- Real-Time Event Schema: source:created, source:updated, source:deleted, contributor:joined
- Phase 4 Forbidden Patterns: Native WebSocket, SSE, unauthenticated connections, global rooms
- Phase 4 Technology Stack: Socket.io server/client, Next.js custom server
- Phase 4 Scope Boundaries: In-scope and out-of-scope items
- Phase 4 Performance Targets: Connection latency, event propagation, throughput

**Modified Sections**:
- Title: Added "& Real-Time" to constitution title
- Scope Boundaries: Expanded with Phase 4 in-scope and out-of-scope items
- Technology Stack: Added Phase 4 real-time libraries
- Forbidden Patterns: Added Phase 4 specific prohibitions
- Performance Targets: Added Phase 4 latency and throughput requirements

**Template Validation**:
- ✅ plan-template.md: Constitution Check section compatible with Phase 4 principles
- ✅ spec-template.md: User story structure supports real-time feature requirements
- ✅ tasks-template.md: Task categorization supports Socket.io implementation tasks

**Key Principles Added**:

1. **Principle XXI - Socket.io Server Exclusively**: Mandates Socket.io for all real-time communication, prohibits native WebSockets and SSE
2. **Principle XXII - Vault-Specific Room Architecture**: Each vault has isolated Socket.io room with membership validation
3. **Principle XXIII - Session-Based Socket Authentication**: All connections authenticate via NextAuth.js session
4. **Principle XXIV - Real-Time Source Event Propagation**: Source mutations emit events to vault rooms
5. **Principle XXV - Role-Based Event Authorization**: Consistent RBAC enforcement across REST and Socket.io
6. **Principle XXVI - Minimal Test UI**: Test page for multi-client validation without production dashboard

**Configuration Standards Provided**:
- Next.js custom server with Socket.io integration
- Session-based authentication middleware
- Vault room join/leave handlers
- Event emission patterns after database mutations
- Client connection management with reconnection
- Event schema with actor attribution

**Completion Criteria**: 12 blocking criteria defined for Phase 5, including server setup, authentication, room management, event propagation, role enforcement, and multi-client testing.

## Outcome

- ✅ Impact: Constitution updated to v1.3.0 with comprehensive Phase 4 Socket.io governance
- 🧪 Tests: N/A (constitution document, no code tests)
- 📁 Files: 1 file modified (.specify/memory/constitution.md)
- 🔁 Next prompts: Ready for `/sp.specify` or `/sp.plan` for Phase 4 implementation planning
- 🧠 Reflection: Constitution now covers all 4 phases (Database, Backend APIs, Authentication, Real-Time) with clear principles, standards, and completion criteria for each phase

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution update completed successfully
- Graders run and results (PASS/FAIL): N/A (manual constitution update)
- Prompt variant (if applicable): Standard constitution update workflow
- Next experiment (smallest change to try): Validate Phase 4 principles during actual Socket.io implementation
