---
id: 002
title: backend-apis-implementation-plan
stage: plan
date: 2026-02-15
surface: agent
model: claude-sonnet-4-5
feature: 002-backend-apis
branch: 002-backend-apis
user: JHOOLAY LAAL
command: /sp.plan
labels: ["plan", "backend-apis", "architecture", "phase-2"]
links:
  spec: specs/002-backend-apis/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-backend-apis/plan.md
  - specs/002-backend-apis/research.md
  - specs/002-backend-apis/data-model.md
  - specs/002-backend-apis/contracts/vaults.yaml
  - specs/002-backend-apis/contracts/sources.yaml
  - specs/002-backend-apis/contracts/upload.yaml
  - specs/002-backend-apis/quickstart.md
tests:
  - N/A (planning document)
---

## Prompt

# 📌 SP.PLAN
## Project: Phase 2 – Backend APIs (Core Infrastructure Only)

[Full detailed technical plan with 6 phases: Foundation Setup, Database Layer, Core API Implementation, Security & Middleware Enforcement, Upload Integration, Testing & Validation]

Key requirements:
- Build-Validate-Iterate approach
- Next.js App Router with TypeScript strict mode
- Prisma ORM with existing Phase 1 schema
- Mock header authentication (x-user-id, x-user-role)
- Zod validation for all inputs
- Cloudinary signed uploads
- 11 RESTful endpoints (5 vault, 3 source, 1 upload)
- Role-based access control (owner/contributor/viewer)
- Postman testing only
- 40-minute implementation target

## Response snapshot

Created comprehensive Phase 2 Backend APIs implementation plan with 7 architecture decisions, complete API contracts, data model documentation, and Postman testing guide.

**Architecture Decisions** (research.md):
1. **Ownership Model**: Simple ownerId (not VaultUser junction) for Phase 2 scope
2. **Role Storage**: Hybrid approach (DB + headers) for testing convenience
3. **Cascade Delete**: Prisma declarative cascade for referential integrity
4. **Upload Method**: Signed upload via API for security and validation
5. **File Validation**: Server-side only (no frontend in Phase 2)
6. **Response Format**: Standardized envelope { success, data, error }
7. **Error Codes**: Custom codes + HTTP status for precise error handling

**Implementation Plan** (plan.md):
- **Phase 2.1**: Foundation Setup (10 min) - Dependencies, utilities, Cloudinary config
- **Phase 2.2**: Vault CRUD APIs (10 min) - 5 endpoints with Zod validation
- **Phase 2.3**: Source CRUD APIs (5 min) - 3 endpoints nested under vaults
- **Phase 2.4**: Middleware & Roles (3 min) - Permission matrix enforcement
- **Phase 2.5**: Upload Integration (5 min) - Cloudinary signed upload with validation
- **Phase 2.6**: Postman Testing (7 min) - Complete collection with all test cases

**API Contracts** (contracts/*.yaml):
- **vaults.yaml**: 5 endpoints (POST, GET list, GET by ID, PATCH, DELETE) with OpenAPI 3.0 specs
- **sources.yaml**: 3 endpoints (POST, GET list, DELETE) with nested routing
- **upload.yaml**: 1 endpoint (POST multipart/form-data) with file validation

**Data Model** (data-model.md):
- Reuses Phase 1 schema (no changes required)
- Documents User, Vault, Source models with Phase 2 usage patterns
- Includes Prisma query examples for each endpoint
- Notes VaultUser and AuditLog exist but unused in Phase 2

**Testing Guide** (quickstart.md):
- Step-by-step Postman testing workflow
- 5 test phases: Vault Management, Source Management, File Upload, RBAC, Validation
- Complete test checklist (11 endpoints + 10 validation scenarios)
- Troubleshooting guide for common issues

**Constitution Compliance**:
- ✅ All Phase 1 principles (I-VIII) inherited
- ✅ All Phase 2 principles (IX-XIV) satisfied
- ✅ No violations, no complexity tracking needed

**Project Structure**:
- Next.js App Router with nested routes (`/api/vaults/[id]/sources`)
- Shared utilities in `/src/lib` (auth, validators, responses, cloudinary)
- Postman collection in `/postman` directory
- OpenAPI contracts in `/specs/002-backend-apis/contracts`

## Outcome

- ✅ Impact: Complete implementation plan with 7 architecture decisions, 40-minute execution timeline, and comprehensive testing strategy
- 🧪 Tests: Postman testing guide with 21 test scenarios (11 success cases + 10 error cases)
- 📁 Files: Created plan.md, research.md, data-model.md, 3 API contracts (vaults, sources, upload), quickstart.md
- 🔁 Next prompts: /sp.tasks (generate detailed task breakdown for implementation)
- 🧠 Reflection: Plan successfully balances Phase 2 scope constraints (backend-only, mock auth) with production-ready architecture. All decisions documented with rationale and tradeoffs. Ready for task generation and implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None - all planning artifacts generated successfully
- Graders run and results (PASS/FAIL): PASS - Constitution check passed (14/14 principles), all design artifacts complete
- Prompt variant (if applicable): Detailed technical plan with specific implementation phases
- Next experiment (smallest change to try): Validate task generation captures all 6 implementation phases with correct dependencies
