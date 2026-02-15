---
id: 001
title: backend-apis-specification
stage: spec
date: 2026-02-15
surface: agent
model: claude-sonnet-4-5
feature: 002-backend-apis
branch: 002-backend-apis
user: JHOOLAY LAAL
command: /sp.specify
labels: ["spec", "backend-apis", "rest-api", "phase-2"]
links:
  spec: specs/002-backend-apis/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-backend-apis/spec.md
  - specs/002-backend-apis/checklists/requirements.md
tests:
  - N/A (specification document)
---

## Prompt

**SyncScript Phase 2 - Backend APIs**

**Goal**: Implement Next.js App Router API endpoints for vault and source management with Cloudinary PDF uploads, using mock header-based authentication for Postman testing.

**Core Features**:
1. Cloudinary PDF upload endpoint (`/api/upload`)
2. Vault CRUD operations (create, read, update, delete)
3. Source CRUD operations within vaults
4. Role-based access control middleware (mock headers: x-user-id, x-user-role)
5. Zod request validation for all endpoints
6. Postman collection with test cases

**Technical Requirements**:
- Next.js 14+ App Router (`src/app/api/` directory)
- Prisma Client for database operations (existing schema from Phase 1)
- Cloudinary SDK for PDF storage
- Zod for request/response validation
- TypeScript strict mode
- Mock authentication (NO NextAuth.js, NO sessions, NO JWT)

**Success Criteria**:
- All 11 endpoints functional and tested via Postman
- PDF uploads persist to Cloudinary and metadata stored in NeonDB
- Role hierarchy enforced (owner > contributor > viewer)
- Invalid requests return 400 with Zod error details
- Unauthorized requests return 403 Forbidden
- All mutations visible in Prisma Studio
- Postman collection exported with environment variables

**Out of Scope**:
- NextAuth.js integration (Phase 3)
- Frontend UI components (Phase 5)
- Real-time features (Phase 4)
- Session management or JWT tokens

## Response snapshot

Created comprehensive Phase 2 Backend APIs specification with 3 prioritized user stories, 24 functional requirements, and 10 measurable success criteria.

**User Stories**:
- **P1: Vault Management API** - Core CRUD operations for vault organization (5 endpoints)
- **P2: Source Management API** - Research source management within vaults (5 endpoints)
- **P3: PDF Upload API** - Cloud storage integration for document uploads (1 endpoint)

**Key Requirements**:
- 11 RESTful API endpoints with clear input/output contracts
- Role-based access control (owner/contributor/viewer hierarchy)
- Request validation with detailed error responses
- Database persistence via existing Prisma schema
- Cloud storage integration for PDF files
- Consistent JSON response format (success/error structure)

**Success Criteria Highlights**:
- API operations complete within 30 seconds using documentation
- 200ms p95 response time for non-upload endpoints
- 5-second upload time for 10MB PDFs
- 100% correct role enforcement
- 50 concurrent requests supported
- Complete Postman test suite executable in under 5 minutes

**Validation Results**:
- ✅ All specification quality checks passed
- ✅ No [NEEDS CLARIFICATION] markers (all requirements unambiguous)
- ✅ All success criteria are measurable and technology-agnostic
- ✅ Edge cases documented with clear handling expectations
- ✅ Scope boundaries clearly defined (in-scope vs out-of-scope)

**Feature Readiness**: Specification is complete and ready for planning phase (`/sp.plan`)

## Outcome

- ✅ Impact: Complete backend API specification with 3 independently testable user stories, 24 functional requirements, and 10 measurable success criteria
- 🧪 Tests: N/A (specification document)
- 📁 Files: Created spec.md (186 lines) and requirements.md checklist (all checks passed)
- 🔁 Next prompts: /sp.plan (generate implementation plan with architecture decisions)
- 🧠 Reflection: Specification successfully balances technical precision with business clarity. All requirements are testable without implementation details. Mock authentication approach enables Phase 2 API testing while deferring auth complexity to Phase 3.

## Evaluation notes (flywheel)

- Failure modes observed: None - specification passed all quality checks on first validation
- Graders run and results (PASS/FAIL): PASS - No [NEEDS CLARIFICATION] markers, all success criteria measurable and technology-agnostic
- Prompt variant (if applicable): Standard specification workflow with quality checklist validation
- Next experiment (smallest change to try): Validate constitution compliance during planning phase to ensure Phase 2 principles are followed
