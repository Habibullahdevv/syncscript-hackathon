---
id: 002
title: phase-2-backend-api-constitution
stage: constitution
date: 2026-02-15
surface: agent
model: claude-sonnet-4-5
feature: 002-backend-apis
branch: 001-database-foundation
user: JHOOLAY LAAL
command: /sp.constitution
labels: ["constitution", "phase-2", "backend-apis", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (governance document)
---

## Prompt

# 🏛 SP Constitution
## Project: Phase 2 – Backend APIs (Core Infrastructure Only)

---

## 🎯 Scope Definition (Strictly Phase 2 Only)

This phase includes ONLY:

- Next.js App Router project setup
- Tailwind CSS installation (no UI implementation required)
- Prisma + Neon PostgreSQL integration
- Cloudinary upload API (`/api/upload`)
- Vault CRUD APIs
- Source CRUD APIs
- Basic role-based middleware (mock header-based auth)
- Postman testing
- Data persistence verification in NeonDB

This phase explicitly EXCLUDES:

- ❌ NextAuth.js
- ❌ Login UI
- ❌ Session management system
- ❌ JWT or cookies
- ❌ Socket.io / Real-time features
- ❌ Frontend dashboard pages
- ❌ Toast notifications
- ❌ Invite/member management system
- ❌ README/demo polish
- ❌ Deployment configuration

No implementation from future phases is allowed.

---

## 🎯 Core Principles

- Backend-first architecture
- Secure-by-default API design
- Strict role enforcement (owner / contributor / viewer)
- Data integrity enforced via Prisma schema constraints
- Stateless API design
- All endpoints testable independently via Postman
- Clean separation of validation, business logic, and DB access

---

## 🏗 Technical Stack (Phase 2 Only)

- **Next.js 14+ (App Router)**
- **TypeScript (strict mode enabled)**
- **Tailwind CSS (installed only)**
- **Prisma ORM**
- **Neon (PostgreSQL)**
- **Cloudinary SDK**
- **Zod** for request validation
- Custom middleware for role enforcement

---

## 🔐 Temporary Authentication Model (Phase 2 Version)

Since real authentication belongs to Phase 3:

Use temporary mock authentication via request headers:

## Response snapshot

Updated SyncScript constitution from v1.0.0 to v1.1.0 (MINOR version bump) by adding 6 new principles (IX-XIV) for Phase 2 Backend APIs while preserving all 8 Phase 1 Database Foundation principles (I-VIII).

**Key Additions**:
- **Principle IX**: Backend-First Architecture - API routes in `src/app/api/`, Postman testing mandatory
- **Principle X**: Stateless API Design - Mock headers (`x-user-id`, `x-user-role`), no sessions/JWT in Phase 2
- **Principle XI**: Request Validation with Zod - All inputs validated before database operations
- **Principle XII**: Role-Based Middleware - Mock authentication via headers, 403 enforcement
- **Principle XIII**: Cloudinary PDF Upload API - `/api/upload` endpoint specification
- **Principle XIV**: Postman Testing Requirement - Complete collection with success/error cases

**New Sections**:
- API Architecture Standards (11 endpoint specifications)
- Response format standards (success/error schemas)
- Temporary Authentication Model with middleware logic
- Phase 2 Completion Criteria (8 blocking gates)
- Expanded Forbidden Patterns (Phase 2 specific prohibitions)

**Scope Boundaries Updated**:
- Phase 1 marked COMPLETE
- Phase 2 marked CURRENT with explicit in-scope/out-of-scope items
- Performance targets added for Phase 2 (< 200ms p95, 50 req/s)

**Version Bump Rationale**: MINOR (1.0.0 → 1.1.0) because new principles were added without breaking existing Phase 1 principles. No backward-incompatible changes to governance structure.

## Outcome

- ✅ Impact: Constitution expanded to govern Phase 2 Backend API development with 6 new principles, clear scope boundaries, and 8 completion criteria
- 🧪 Tests: N/A (governance document)
- 📁 Files: Updated .specify/memory/constitution.md (259 → 465 lines)
- 🔁 Next prompts: /sp.specify (create Phase 2 feature spec), /sp.plan (generate Phase 2 implementation plan)
- 🧠 Reflection: Constitution now provides complete governance for both database foundation (Phase 1) and backend APIs (Phase 2) while explicitly prohibiting premature implementation of future phases (NextAuth.js, UI, Socket.io)

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution update followed semantic versioning correctly
- Graders run and results (PASS/FAIL): PASS - All placeholders filled, version incremented correctly, sync impact report complete
- Prompt variant (if applicable): Standard constitution update workflow
- Next experiment (smallest change to try): Validate constitution compliance during /sp.plan execution for Phase 2
