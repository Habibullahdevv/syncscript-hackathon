# Feature Specification: Phase 3 - Authentication & Role-Based Access Control

**Feature Branch**: `003-auth-rbac`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "Implement secure authentication and session management for the Vault system to replace the Phase 2 mock-header auth. The system must enable demo users to log in, maintain sessions, and enforce role-based access control on all Vault and Source APIs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core Authentication Flow (Priority: P1)

Demo users need to authenticate with their credentials and maintain a secure session to access the Vault system. The system must provide a login page where users enter their email and password, create a session upon successful authentication, and allow users to log out when finished.

**Why this priority**: Authentication is the foundation of Phase 3. Without login capability, no other features can function. This story delivers immediate value by enabling secure access to the system and replacing the insecure mock-header approach from Phase 2.

**Independent Test**: Can be fully tested by navigating to the login page, entering demo credentials (owner@demo.com or contributor@demo.com), verifying session creation, and confirming logout destroys the session. Delivers secure user authentication without requiring API integration.

**Acceptance Scenarios**:

1. **Given** a user visits the login page, **When** they enter valid credentials (owner@demo.com with correct password), **Then** they are authenticated and redirected to the dashboard with an active session
2. **Given** a user visits the login page, **When** they enter invalid credentials, **Then** they see an error message and remain on the login page
3. **Given** an authenticated user, **When** they click logout, **Then** their session is destroyed and they are redirected to the login page
4. **Given** an unauthenticated user, **When** they try to access a protected page, **Then** they are redirected to the login page
5. **Given** an authenticated user, **When** they refresh the page, **Then** their session persists and they remain logged in

---

### User Story 2 - API Session Protection (Priority: P2)

All Phase 2 API endpoints (Vault CRUD, Source CRUD, Upload) must validate user sessions instead of mock headers. The system must extract user identity and role from the session, enforce role-based permissions, and return appropriate error responses for unauthorized or forbidden requests.

**Why this priority**: This story makes Phase 2 APIs production-ready by replacing mock authentication with real session validation. It's the second priority because it depends on P1 (authentication) but is critical for securing the backend before frontend development in Phase 5.

**Independent Test**: Can be fully tested using Postman by obtaining a session token through login, including it in API requests, and verifying that endpoints correctly validate sessions and enforce role-based permissions. Delivers secure API access without requiring frontend UI.

**Acceptance Scenarios**:

1. **Given** an authenticated owner user, **When** they call POST /api/vaults with a valid session, **Then** the vault is created and associated with their user ID
2. **Given** an unauthenticated user, **When** they call any protected API endpoint without a session, **Then** they receive a 401 Unauthorized response
3. **Given** an authenticated contributor user, **When** they try to DELETE /api/vaults/[id] (owner-only action), **Then** they receive a 403 Forbidden response
4. **Given** an authenticated user, **When** they call GET /api/vaults with a valid session, **Then** they receive only vaults they have access to based on their role
5. **Given** an authenticated user with an expired session, **When** they call any API endpoint, **Then** they receive a 401 Unauthorized response

---

### User Story 3 - Demo User Setup & Testing Infrastructure (Priority: P3)

The system must provide pre-configured demo users for testing and demonstration purposes. Demo users must be seeded in the database with hashed passwords, and the system must support Postman-based testing with session authentication.

**Why this priority**: This story enables comprehensive testing and demonstration of the authentication system. It's third priority because it supports testing of P1 and P2 but doesn't directly deliver user-facing functionality. However, it's essential for hackathon judging and quality assurance.

**Independent Test**: Can be fully tested by running the database seed script, verifying demo users exist in the database with hashed passwords, logging in with demo credentials, and executing the Postman collection with session-based authentication. Delivers a complete testing environment.

**Acceptance Scenarios**:

1. **Given** the database seed script is executed, **When** checking the User table, **Then** both owner@demo.com and contributor@demo.com exist with hashed passwords
2. **Given** demo users are seeded, **When** attempting to log in with owner@demo.com and the correct password, **Then** authentication succeeds and a session is created
3. **Given** the Postman collection is configured, **When** running the login request, **Then** a session token is extracted and stored in the environment
4. **Given** a session token in Postman, **When** running API requests with the token, **Then** all endpoints correctly validate the session and enforce permissions
5. **Given** demo users in the database, **When** checking password storage, **Then** passwords are hashed (not plaintext) using bcrypt

---

### Edge Cases

- What happens when a user's session expires while they're actively using the system?
- How does the system handle concurrent login attempts from the same user account?
- What happens if a user tries to access an API endpoint with a malformed or tampered session token?
- How does the system behave if the database seed script is run multiple times?
- What happens when a user logs in successfully but the redirect to dashboard fails?
- How does the system handle login attempts with SQL injection or XSS payloads in credentials?
- What happens if NextAuth.js configuration is missing or invalid?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a login page at /login route with email and password input fields
- **FR-002**: System MUST authenticate users using NextAuth.js credentials provider against database records
- **FR-003**: System MUST create a session (JWT or database session) upon successful authentication containing user ID, email, and role
- **FR-004**: System MUST redirect authenticated users to the dashboard (or root /) after successful login
- **FR-005**: System MUST display error messages on the login page for failed authentication attempts
- **FR-006**: System MUST provide a logout mechanism that destroys the user's session
- **FR-007**: System MUST redirect unauthenticated users to /login when they attempt to access protected routes
- **FR-008**: System MUST seed exactly 2 demo users in the database: owner@demo.com (owner role) and contributor@demo.com (contributor role)
- **FR-009**: System MUST hash demo user passwords using bcrypt with 10 rounds before storing in database
- **FR-010**: System MUST replace mock header authentication (x-user-id, x-user-role) with session extraction using getServerSession() in all Phase 2 API endpoints
- **FR-011**: System MUST extract user ID and role from the session for all protected API requests
- **FR-012**: System MUST return 401 Unauthorized for API requests without a valid session
- **FR-013**: System MUST return 403 Forbidden for API requests where the user's role lacks required permissions
- **FR-014**: System MUST maintain the existing permission matrix from Phase 2 (owner > contributor > viewer)
- **FR-015**: System MUST persist sessions across page refreshes and browser restarts (within session expiry time)
- **FR-016**: System MUST set session expiry to 24 hours from creation
- **FR-017**: System MUST update the Postman collection to support session-based authentication testing
- **FR-018**: System MUST provide a way to extract and store session tokens in Postman environment variables
- **FR-019**: System MUST validate session tokens on every protected API request before processing
- **FR-020**: System MUST log authentication events (login success, login failure, logout) for audit purposes

### Key Entities

- **Session**: Represents an authenticated user's session containing user ID, email, role, and expiry timestamp. Sessions are created on login and destroyed on logout or expiry.
- **Demo User**: Pre-configured user accounts for testing with fixed credentials (owner@demo.com, contributor@demo.com) and hashed passwords stored in the User table.
- **Authentication Token**: JWT or session identifier used to validate user identity across requests. Contains encrypted user information and is transmitted via HTTP-only cookies.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Demo users can log in successfully within 5 seconds using correct credentials
- **SC-002**: Invalid login attempts display error messages within 2 seconds
- **SC-003**: Sessions persist across page refreshes for the full 24-hour session lifetime
- **SC-004**: All 11 Phase 2 API endpoints correctly validate sessions and return 401 for unauthenticated requests
- **SC-005**: Role-based permission checks correctly return 403 for insufficient permissions in 100% of test cases
- **SC-006**: Postman collection successfully authenticates and executes all API tests with session-based auth
- **SC-007**: Demo user passwords are stored as bcrypt hashes (not plaintext) in the database
- **SC-008**: Logout successfully destroys sessions and prevents further API access within 1 second
- **SC-009**: System handles 50 concurrent login requests without degradation
- **SC-010**: Authentication flow completes end-to-end (login → API call → logout) in under 10 seconds

## Assumptions

- NextAuth.js v5 (next-auth@beta) is compatible with Next.js 15/16 App Router
- JWT session strategy is sufficient for demo purposes (no need for database sessions)
- Demo user passwords can be documented in .env.example for testing purposes
- Session tokens will be transmitted via HTTP-only cookies (NextAuth.js default)
- No email verification or password reset functionality is required for demo users
- Existing Phase 2 API logic (Zod validation, Prisma queries, permission checks) remains unchanged
- Postman can extract and store session cookies/tokens from login responses
- 24-hour session expiry is acceptable for hackathon demo purposes
- No multi-factor authentication (MFA) is required for Phase 3
- Role badge display is optional and not required for Phase 3 completion

## Dependencies

- Phase 1 (Database Foundation) must be complete with User table containing email, passwordHash, and role fields
- Phase 2 (Backend APIs) must be complete with all 11 endpoints functional using mock headers
- NextAuth.js v5 package must be installed and configured
- bcryptjs package must be installed for password hashing
- Prisma seed script infrastructure must be available
- Postman collection from Phase 2 must be available for updates

## Out of Scope

- User registration/signup flows
- Password reset functionality
- Email verification
- OAuth providers (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- Account management UI (profile editing, password change)
- Remember me functionality
- Social login integration
- CAPTCHA or rate limiting on login attempts
- Frontend dashboard pages beyond login (deferred to Phase 5)
- Real-time session invalidation across devices
- Session management UI (view active sessions, revoke sessions)
