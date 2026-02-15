# Research: Backend APIs Architecture Decisions

**Feature**: 002-backend-apis
**Date**: 2026-02-15
**Status**: Complete

## Overview

This document captures architecture decisions made during Phase 2 Backend APIs planning. All decisions prioritize simplicity and Phase 2 scope constraints (backend-only, no authentication system, Postman testing).

---

## Decision 1: Ownership Model

**Context**: Vaults need ownership tracking to enforce access control. Phase 1 schema includes both Vault.ownerId and VaultUser junction table.

**Options Evaluated**:

1. **Simple Ownership (ownerId only)**
   - Vault stores single ownerId foreign key
   - One owner per vault
   - No multi-member support
   - Pros: Simple, fast queries, minimal logic
   - Cons: Not scalable for collaboration features

2. **Junction Table (VaultUser)**
   - Use existing VaultUser table from Phase 1
   - Support multiple users per vault with roles
   - Pros: Scalable, supports future collaboration
   - Cons: Complex queries, premature for Phase 2

**Decision**: Simple Ownership (Option 1)

**Rationale**: Phase 2 scope is backend APIs only. Multi-member collaboration is a Phase 5 (frontend) concern. Simple ownership satisfies all Phase 2 requirements without unnecessary complexity.

**Implementation**: Vault model uses ownerId field. VaultUser table exists but is not utilized in Phase 2 APIs.

**Migration Path**: Phase 5 will introduce member management APIs that utilize VaultUser table.

---

## Decision 2: Role Storage Strategy

**Context**: Role-based access control requires role information. Phase 1 User model includes role field. Phase 2 uses mock headers for testing.

**Options Evaluated**:

1. **Database Only**
   - Store role in User table
   - Query database for every authorization check
   - Pros: Single source of truth, consistent
   - Cons: Database query overhead, requires user lookup

2. **Headers Only**
   - Role passed in x-user-role header
   - No database storage
   - Pros: Fast, no database queries
   - Cons: No persistence, inconsistent with Phase 1 schema

3. **Hybrid (DB + Headers)**
   - Store role in database
   - Read from headers for Phase 2 testing
   - Pros: Maintains data integrity, fast testing
   - Cons: Temporary inconsistency tolerated

**Decision**: Hybrid (Option 3)

**Rationale**: User.role field exists from Phase 1 and should be maintained for data integrity. Phase 2 reads from headers for testing convenience. Phase 3 authentication will enforce consistency.

**Implementation**: Middleware reads x-user-role header without database validation. Database role field exists but is not checked in Phase 2.

**Migration Path**: Phase 3 replaces header extraction with session-based role lookup from database.

---

## Decision 3: Cascade Delete Strategy

**Context**: When vault is deleted, associated sources must be removed to prevent orphaned data.

**Options Evaluated**:

1. **Manual Deletion**
   - API route explicitly deletes sources before vault
   - Full control over deletion logic
   - Pros: Flexible, can add custom logic
   - Cons: Error-prone, requires transaction management

2. **Prisma Cascade**
   - Declare onDelete: Cascade in schema
   - Database handles cascade automatically
   - Pros: Declarative, safe, automatic
   - Cons: Less granular control

**Decision**: Prisma Cascade (Option 2)

**Rationale**: Prisma's cascade delete ensures referential integrity at database level. Simpler and safer than manual logic. Aligns with vault ownership model where sources belong exclusively to one vault.

**Implementation**: Source model includes `vault Vault @relation(fields: [vaultId], references: [id], onDelete: Cascade)`

**Tradeoff**: Cannot selectively preserve sources when vault is deleted. Acceptable because sources are vault-scoped resources.

---

## Decision 4: Upload Method

**Context**: PDF files need to be uploaded to Cloudinary. Two approaches: direct client upload or server-proxied upload.

**Options Evaluated**:

1. **Direct Unsigned Upload**
   - Client uploads directly to Cloudinary
   - No server involvement
   - Pros: Fast, no server bandwidth
   - Cons: No validation, security risk

2. **Signed Upload via API**
   - Server generates signed upload parameters
   - Server validates file before upload
   - Pros: Secure, validated, controlled
   - Cons: Server bandwidth, slight latency

**Decision**: Signed Upload via API (Option 2)

**Rationale**: Security and validation requirements justify server-side approach. Server can enforce file type (PDF only), size limits (10MB), and access control.

**Implementation**: POST /api/upload endpoint accepts multipart/form-data, validates file, uploads to Cloudinary, returns secure URL.

**Tradeoff**: Additional latency and server bandwidth. Acceptable for Phase 2 scope (limited file uploads during testing).

---

## Decision 5: File Validation Location

**Context**: Uploaded files must be validated for type and size. Validation can occur client-side, server-side, or both.

**Options Evaluated**:

1. **Client-Side Only**
   - Browser validates before upload
   - Pros: Fast feedback, reduced server load
   - Cons: Bypassable, not secure

2. **Server-Side Only**
   - API validates after upload
   - Pros: Secure, mandatory
   - Cons: No early feedback

3. **Both Client and Server**
   - Client validates for UX
   - Server validates for security
   - Pros: Best UX and security
   - Cons: Duplicate logic

**Decision**: Server-Side Only (Option 2)

**Rationale**: Phase 2 has no frontend (backend-only). Client-side validation is not applicable. Server-side validation is mandatory for security.

**Implementation**: Upload endpoint validates file.type === 'application/pdf' and file.size <= 10MB. Returns 400 Bad Request if validation fails.

**Migration Path**: Phase 5 frontend will add client-side validation for better UX.

---

## Decision 6: Response Format Standardization

**Context**: API responses need consistent structure for easy consumption and error handling.

**Options Evaluated**:

1. **Varied Formats**
   - Each endpoint returns different structure
   - Pros: Flexible, minimal
   - Cons: Inconsistent, hard to consume

2. **Envelope Format**
   - All responses follow { success, data, error } pattern
   - Pros: Consistent, predictable
   - Cons: Slight verbosity

**Decision**: Envelope Format (Option 2)

**Rationale**: Consistency simplifies API consumption. Success flag enables uniform error handling. Slight verbosity is acceptable tradeoff.

**Implementation**:
```typescript
// Success: { success: true, data: {...}, error: null }
// Error: { success: false, data: null, error: { code, message } }
```

**Standard Applied**: All 11 endpoints use this format.

---

## Decision 7: Error Code Strategy

**Context**: Errors need to be communicated to API consumers with sufficient detail for handling.

**Options Evaluated**:

1. **HTTP Status Only**
   - Use standard HTTP codes (401, 403, 404, 400, 500)
   - Pros: Standard, simple
   - Cons: Limited semantics

2. **Custom Codes + HTTP Status**
   - HTTP status for transport layer
   - Custom codes for application layer
   - Pros: Precise, actionable
   - Cons: Additional complexity

**Decision**: Custom Codes + HTTP Status (Option 2)

**Rationale**: HTTP status codes provide transport semantics. Custom error codes provide application semantics. Combination enables precise error handling.

**Implementation**:
- Error codes: UNAUTHORIZED, FORBIDDEN, INVALID_INPUT, NOT_FOUND, SERVER_ERROR
- Mapping: UNAUTHORIZED→401, FORBIDDEN→403, INVALID_INPUT→400, NOT_FOUND→404, SERVER_ERROR→500
- Never expose raw Prisma errors

**Standard Applied**: All error responses include both HTTP status and custom error code.

---

## Technology Stack Validation

### Next.js 15 App Router

**Chosen**: Next.js 15 with App Router
**Alternatives Considered**: Express.js, Fastify, Nest.js
**Rationale**: Next.js App Router provides file-based routing, TypeScript support, and seamless integration with Prisma. Already used in Phase 1 project setup.

### Zod for Validation

**Chosen**: Zod 3.x
**Alternatives Considered**: Joi, Yup, class-validator
**Rationale**: Zod provides TypeScript-first schema validation with type inference. Integrates seamlessly with Next.js API routes. Lightweight and fast.

### Cloudinary SDK

**Chosen**: Cloudinary official Node.js SDK
**Alternatives Considered**: AWS S3, Azure Blob Storage
**Rationale**: Cloudinary provides PDF-specific features (preview generation, transformation), CDN delivery, and simple SDK. Phase 1 constitution mandates Cloudinary.

---

## Best Practices Applied

1. **Separation of Concerns**: Route handlers, validation, business logic, and database access are separated into distinct modules
2. **Error Handling**: All routes wrapped in try/catch with standardized error responses
3. **Type Safety**: Zod schemas provide runtime validation and TypeScript type inference
4. **Security**: Mock authentication enforced on all protected routes, no raw error exposure
5. **Testing**: Postman collection provides comprehensive test coverage for all endpoints

---

## Open Questions (None)

All architecture decisions are finalized. No unresolved questions remain.
