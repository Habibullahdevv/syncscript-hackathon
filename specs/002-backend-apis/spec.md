# Feature Specification: Backend APIs

**Feature Branch**: `002-backend-apis`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "SyncScript Phase 2 - Backend APIs: Implement Next.js App Router API endpoints for vault and source management with Cloudinary PDF uploads, using mock header-based authentication for Postman testing."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vault Management API (Priority: P1)

API consumers can create, retrieve, update, and delete vaults through RESTful endpoints. Each vault has an owner who controls access, and all operations are validated before execution. Vault operations form the foundation for organizing research sources.

**Why this priority**: Vaults are the core organizational unit. Without vault management, no other features can function. This is the minimum viable API that enables basic data organization.

**Independent Test**: Can be fully tested by sending HTTP requests to vault endpoints via Postman with mock authentication headers, verifying CRUD operations persist to database, and confirming role-based access control blocks unauthorized requests.

**Acceptance Scenarios**:

1. **Given** a valid user ID in request headers, **When** POST request sent to create vault endpoint with vault name, **Then** vault is created with user as owner and unique ID is returned
2. **Given** an existing vault owned by user, **When** GET request sent to retrieve vault endpoint, **Then** vault details including name, owner, and creation timestamp are returned
3. **Given** an existing vault owned by user, **When** PATCH request sent to update vault name, **Then** vault name is updated and confirmation is returned
4. **Given** an existing vault owned by user, **When** DELETE request sent to remove vault, **Then** vault is deleted and all associated data is removed
5. **Given** a user without owner role for a vault, **When** attempting to update or delete vault, **Then** request is rejected with 403 Forbidden status
6. **Given** invalid vault data (missing name, invalid format), **When** POST or PATCH request sent, **Then** request is rejected with 400 Bad Request and detailed validation errors

---

### User Story 2 - Source Management API (Priority: P2)

API consumers can add, retrieve, update, and delete research sources within vaults. Sources can include URLs, annotations, and file metadata. Contributors can add sources to vaults they have access to, while viewers can only read.

**Why this priority**: Once vaults exist, users need to populate them with research sources. This enables the core value proposition of organizing research materials.

**Independent Test**: Can be fully tested by creating a vault via P1 APIs, then sending HTTP requests to source endpoints via Postman, verifying sources are associated with correct vault, and confirming role hierarchy (contributors can add, viewers cannot).

**Acceptance Scenarios**:

1. **Given** a vault and user with contributor role, **When** POST request sent to add source with title and URL, **Then** source is created within vault and unique ID is returned
2. **Given** an existing source in a vault, **When** GET request sent to retrieve source, **Then** source details including title, URL, annotation, and file metadata are returned
3. **Given** an existing source and user with contributor role, **When** PATCH request sent to update source title or annotation, **Then** source is updated and confirmation is returned
4. **Given** an existing source and user with contributor role, **When** DELETE request sent to remove source, **Then** source is deleted from vault
5. **Given** a user with viewer role, **When** attempting to create, update, or delete source, **Then** request is rejected with 403 Forbidden status
6. **Given** invalid source data (missing title, invalid URL format), **When** POST or PATCH request sent, **Then** request is rejected with 400 Bad Request and detailed validation errors
7. **Given** a vault ID, **When** GET request sent to list all sources in vault, **Then** array of all sources in vault is returned

---

### User Story 3 - PDF Upload API (Priority: P3)

API consumers can upload PDF files which are stored in cloud storage and linked to sources. The upload endpoint accepts PDF files, validates file type and size, stores the file securely, and returns a URL for accessing the uploaded document.

**Why this priority**: PDF upload enhances source management by allowing users to attach actual documents to their research sources. This is valuable but not essential for basic vault/source organization.

**Independent Test**: Can be fully tested by uploading a PDF file via Postman multipart/form-data request, verifying file is stored in cloud storage, confirming returned URL is accessible, and checking that file metadata is available for linking to sources.

**Acceptance Scenarios**:

1. **Given** a valid PDF file and user with contributor role, **When** POST request sent to upload endpoint with file, **Then** file is uploaded to cloud storage and URL is returned
2. **Given** an uploaded PDF, **When** source is created or updated with file URL, **Then** source includes file metadata (URL, size, type)
3. **Given** a non-PDF file, **When** POST request sent to upload endpoint, **Then** request is rejected with 400 Bad Request indicating invalid file type
4. **Given** a PDF file exceeding size limit, **When** POST request sent to upload endpoint, **Then** request is rejected with 400 Bad Request indicating file too large
5. **Given** a user with viewer role, **When** attempting to upload PDF, **Then** request is rejected with 403 Forbidden status

---

### Edge Cases

- What happens when a vault is deleted? All associated sources and their file references must be removed to prevent orphaned data
- How does system handle concurrent updates to the same vault or source? Last write wins, with timestamp-based conflict detection
- What happens when cloud storage upload fails? Return 500 Internal Server Error with retry guidance, do not create source record
- How does system handle malformed authentication headers? Return 401 Unauthorized with clear error message indicating missing or invalid headers
- What happens when a user attempts to access a vault they don't have permission for? Return 403 Forbidden with message indicating insufficient permissions
- How does system handle requests with missing required fields? Return 400 Bad Request with detailed validation errors listing all missing fields
- What happens when a source is created with an invalid vault ID? Return 404 Not Found indicating vault does not exist

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide RESTful API endpoint to create vaults with name and owner assignment
- **FR-002**: System MUST provide RESTful API endpoint to retrieve vault details by unique identifier
- **FR-003**: System MUST provide RESTful API endpoint to update vault name
- **FR-004**: System MUST provide RESTful API endpoint to delete vaults and cascade delete all associated sources
- **FR-005**: System MUST provide RESTful API endpoint to list all vaults accessible to authenticated user
- **FR-006**: System MUST provide RESTful API endpoint to create sources within vaults with title, optional URL, and optional annotation
- **FR-007**: System MUST provide RESTful API endpoint to retrieve source details by unique identifier
- **FR-008**: System MUST provide RESTful API endpoint to update source title, URL, annotation, and file metadata
- **FR-009**: System MUST provide RESTful API endpoint to delete sources from vaults
- **FR-010**: System MUST provide RESTful API endpoint to list all sources within a specific vault
- **FR-011**: System MUST provide RESTful API endpoint to upload PDF files and return cloud storage URL
- **FR-012**: System MUST validate all request inputs against defined schemas before processing
- **FR-013**: System MUST enforce role-based access control with three roles: owner (full access), contributor (read/write), viewer (read-only)
- **FR-014**: System MUST authenticate requests using user identifier and role from request headers
- **FR-015**: System MUST return 400 Bad Request with detailed validation errors for invalid inputs
- **FR-016**: System MUST return 401 Unauthorized for requests missing authentication headers
- **FR-017**: System MUST return 403 Forbidden for requests with insufficient permissions
- **FR-018**: System MUST return 404 Not Found for requests referencing non-existent resources
- **FR-019**: System MUST persist all vault and source data to relational database
- **FR-020**: System MUST store uploaded PDF files in cloud storage service
- **FR-021**: System MUST validate uploaded files are PDF format only
- **FR-022**: System MUST enforce file size limit of 10MB for PDF uploads
- **FR-023**: System MUST return consistent JSON response format for all endpoints (success/error structure)
- **FR-024**: System MUST log all database mutations for audit trail

### Key Entities

- **Vault**: Organizational container for research sources. Attributes include unique identifier, name, owner identifier, creation timestamp, and last updated timestamp. Relationships: owned by one user, contains multiple sources, has multiple user access permissions.

- **Source**: Research material within a vault. Attributes include unique identifier, vault identifier, title, optional URL, optional annotation text, optional file URL, optional file metadata (size, type), and creation timestamp. Relationships: belongs to one vault.

- **User Access**: Permission record linking users to vaults with roles. Attributes include user identifier, vault identifier, and role (owner/contributor/viewer). Relationships: connects users to vaults with specific access levels.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: API consumers can create a vault and add a source to it within 30 seconds using provided API documentation
- **SC-002**: All 11 API endpoints return responses within 200 milliseconds for 95% of requests (excluding file uploads)
- **SC-003**: PDF file uploads complete within 5 seconds for files up to 10MB
- **SC-004**: System correctly enforces role hierarchy in 100% of authorization checks (owners can perform all actions, contributors can read/write, viewers can only read)
- **SC-005**: Invalid requests return detailed error messages that clearly indicate what validation failed in 100% of cases
- **SC-006**: All vault and source mutations persist to database and are immediately queryable via GET endpoints
- **SC-007**: Uploaded PDF files are accessible via returned URLs and remain available for the lifetime of the associated source
- **SC-008**: System handles 50 concurrent API requests without errors or performance degradation
- **SC-009**: Complete API test suite (success and error cases for all endpoints) can be executed via Postman collection in under 5 minutes
- **SC-010**: Deleting a vault removes all associated sources and file references, leaving no orphaned data

## Assumptions *(optional)*

- Database schema from Phase 1 (User, Vault, VaultUser, Source, AuditLog models) is already deployed and accessible
- Cloud storage service (Cloudinary) account credentials are configured and valid
- API consumers have access to Postman or equivalent HTTP client for testing
- Mock authentication headers are acceptable for Phase 2 testing (real authentication deferred to Phase 3)
- API endpoints follow RESTful conventions (GET for retrieval, POST for creation, PATCH for updates, DELETE for removal)
- All API responses use JSON format
- File uploads use multipart/form-data encoding
- Database connection pooling is configured for concurrent request handling
- Error responses include both machine-readable error codes and human-readable messages
- API versioning is not required for Phase 2 (single version)

## Dependencies *(optional)*

### External Dependencies

- **Database**: Phase 1 database schema must be deployed to NeonDB PostgreSQL
- **Cloud Storage**: Cloudinary account with API credentials configured
- **ORM**: Prisma Client generated from Phase 1 schema
- **Validation Library**: Zod for request/response schema validation
- **Framework**: Next.js 14+ with App Router for API route handling

### Phase Dependencies

- **Blocks Phase 3**: Authentication system cannot be implemented until backend APIs are functional and testable
- **Blocks Phase 4**: Real-time features require stable API endpoints for data synchronization
- **Blocks Phase 5**: Frontend UI cannot be developed until backend APIs provide data access layer

## Out of Scope *(optional)*

- Real authentication system with sessions, JWT tokens, or OAuth (Phase 3)
- User registration and login endpoints (Phase 3)
- Frontend UI components or pages (Phase 5)
- Real-time updates via WebSockets or Server-Sent Events (Phase 4)
- Email notifications for vault invitations (Phase 6)
- API rate limiting or throttling (Phase 6)
- API versioning strategy (Phase 6)
- Automated API tests (Phase 6)
- API documentation generation (Phase 6)
- Performance monitoring and analytics (Phase 6)
- Deployment configuration and CI/CD pipelines (Phase 6)

## Technical Constraints *(optional)*

- **Authentication**: Mock header-based authentication ONLY (x-user-id, x-user-role headers)
- **File Types**: PDF files ONLY for uploads
- **File Size**: Maximum 10MB per PDF upload
- **API Format**: RESTful JSON APIs ONLY
- **Request Validation**: Zod schemas ONLY for input validation
- **Database Access**: Prisma Client ONLY (no raw SQL queries)
- **Cloud Storage**: Cloudinary SDK ONLY for file uploads
- **Framework**: Next.js App Router ONLY (no Pages Router)
- **Testing**: Postman ONLY for Phase 2 (no automated test frameworks)
- **Response Time**: < 200ms p95 for non-upload endpoints
- **Concurrency**: Minimum 50 concurrent requests supported
