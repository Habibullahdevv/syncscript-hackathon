# Feature Specification: Real-Time Socket.io Integration

**Feature Branch**: `004-socketio-realtime`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "Phase 4 - Real-Time Socket.io Integration: Enable real-time collaboration in the Vault system by integrating Socket.io. Multiple users connected to the same vault can see Source additions and contributor activity immediately."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Source Notifications (Priority: P1)

As a vault member, when another user adds a source to our shared vault, I want to see the new source appear in my view immediately without refreshing the page, so that I can stay informed about vault activity in real-time.

**Why this priority**: This is the core value proposition of Phase 4. Real-time source notifications enable true collaboration by eliminating the need for manual page refreshes and ensuring all vault members have synchronized views of vault contents.

**Independent Test**: Open two browser windows logged in as different users (owner and contributor) viewing the same vault. When one user adds a source via the Phase 2 API, the other user's browser should display the new source within 1 second without any manual refresh.

**Acceptance Scenarios**:

1. **Given** two users are connected to the same vault room, **When** user A adds a new source, **Then** user B sees the source appear in their view within 1 second
2. **Given** a user is viewing a vault, **When** they add a source themselves, **Then** they see their own addition reflected immediately
3. **Given** a user is not connected to a vault room, **When** a source is added to that vault, **Then** they do not receive the notification (proper room isolation)
4. **Given** a viewer is connected to a vault room, **When** an owner adds a source, **Then** the viewer receives the notification (viewers can listen)

---

### User Story 2 - Session-Based Socket Authentication (Priority: P2)

As a system administrator, I want all Socket.io connections to authenticate using the existing NextAuth.js session, so that only authorized users can join vault rooms and receive real-time updates.

**Why this priority**: Security is critical but builds on Phase 3 authentication infrastructure. This ensures real-time features maintain the same security model as REST APIs.

**Independent Test**: Attempt to connect to Socket.io without a valid session. The connection should be rejected with an authentication error. Then login via Phase 3 and verify the Socket.io connection succeeds.

**Acceptance Scenarios**:

1. **Given** a user without a valid session, **When** they attempt to connect to Socket.io, **Then** the connection is rejected with "UNAUTHORIZED" error
2. **Given** an authenticated user, **When** they connect to Socket.io, **Then** the connection succeeds and their userId/role are available
3. **Given** an authenticated user, **When** they attempt to join a vault room they don't have access to, **Then** the join request is rejected with "Access denied" error
4. **Given** an authenticated user with vault access, **When** they join the vault room, **Then** they receive a confirmation event with their role

---

### User Story 3 - Role-Based Event Authorization (Priority: P3)

As a vault owner, I want to ensure that only owners and contributors can trigger real-time events, while viewers can only observe, so that the role-based access control from Phase 2/3 is consistently enforced in real-time features.

**Why this priority**: Maintains RBAC consistency across the system but is lower priority because the Phase 2 API already enforces permissions. This adds defense-in-depth for real-time channels.

**Independent Test**: Login as a viewer and attempt to emit a source creation event directly via Socket.io. The event should be rejected. Then verify that owners and contributors can successfully emit events.

**Acceptance Scenarios**:

1. **Given** a viewer is connected to a vault room, **When** they attempt to emit a source creation event, **Then** the event is rejected with "Insufficient permissions" error
2. **Given** a contributor is connected to a vault room, **When** they emit a source creation event, **Then** the event is accepted and broadcast to all room members
3. **Given** an owner is connected to a vault room, **When** they emit any mutation event, **Then** the event is accepted and broadcast to all room members
4. **Given** any role user, **When** they receive an event, **Then** the event includes actor information (userId, userName, role)

---

### Edge Cases

- What happens when a user loses network connection mid-session? Socket.io should automatically attempt reconnection with exponential backoff.
- How does the system handle a user joining a vault room after sources have already been added? They receive the current state from the REST API, then real-time updates via Socket.io.
- What happens when a vault is deleted while users are connected to its room? All connected users should receive a "vault:deleted" event and be disconnected from the room.
- How does the system handle concurrent source additions from multiple users? Each event is broadcast independently with timestamps; clients handle display order.
- What happens when a user's session expires while they're connected via Socket.io? The Socket.io connection should be terminated and the user should be prompted to re-authenticate.
- How does the system handle a user who is a member of multiple vaults? They can join multiple vault rooms simultaneously, receiving events only for vaults they're connected to.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST initialize a Socket.io server integrated with the Next.js application
- **FR-002**: System MUST authenticate all Socket.io connections using NextAuth.js session before allowing any room joins
- **FR-003**: System MUST create one Socket.io room per vault using the naming convention "vault:{vaultId}"
- **FR-004**: System MUST verify vault membership via VaultUser table before allowing users to join vault rooms
- **FR-005**: System MUST emit "source:created" event to vault room when a source is added via POST /api/vaults/[id]/sources
- **FR-006**: System MUST emit "source:updated" event to vault room when a source is modified via PATCH /api/sources/[id]
- **FR-007**: System MUST emit "source:deleted" event to vault room when a source is removed via DELETE /api/sources/[id]
- **FR-008**: System MUST include full source object and actor information (userId, userName, role) in all source events
- **FR-009**: System MUST enforce role-based permissions on Socket.io event emissions (owner/contributor can emit, viewer cannot)
- **FR-010**: System MUST reject unauthorized Socket.io connections with clear error messages
- **FR-011**: System MUST reject vault room join attempts for users without VaultUser membership
- **FR-012**: System MUST support automatic reconnection with exponential backoff when connections are interrupted
- **FR-013**: System MUST emit events only after successful database persistence (no events for failed operations)
- **FR-014**: System MUST isolate events to specific vault rooms (no cross-vault event leakage)
- **FR-015**: System MUST provide a minimal test UI page for validating real-time functionality with multiple concurrent clients

### Key Entities *(include if feature involves data)*

- **Socket Connection**: Represents an authenticated user's real-time connection, includes userId, userRole, and connected vault rooms
- **Vault Room**: Logical grouping of Socket.io connections for a specific vault, identified by "vault:{vaultId}"
- **Real-Time Event**: Message broadcast to vault room members, includes event type (source:created/updated/deleted), payload (source object), and actor information (userId, userName, role)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see new sources appear in their view within 1 second of creation without manual refresh
- **SC-002**: System supports 100+ concurrent Socket.io connections across multiple vaults without performance degradation
- **SC-003**: Socket.io connections automatically reconnect within 2 seconds after network interruption
- **SC-004**: 100% of source mutations (create/update/delete) trigger corresponding real-time events to vault room members
- **SC-005**: Unauthorized connection attempts are rejected within 100ms with clear error messages
- **SC-006**: Multi-client testing with 3+ browser windows demonstrates synchronized real-time updates across all clients
- **SC-007**: Event propagation latency remains under 100ms from server emit to client receive
- **SC-008**: Role-based event authorization correctly blocks 100% of viewer emission attempts while allowing owner/contributor emissions

## Assumptions

- Phase 3 authentication is complete and functional (NextAuth.js sessions available)
- Phase 2 backend APIs are operational and will be modified to emit Socket.io events
- Existing Prisma models (User, Vault, VaultUser, Source) remain unchanged
- No new database tables or schema changes are required for Phase 4
- Socket.io server will run on the same Next.js instance (custom server or API route)
- Test UI is for validation only, not production dashboard (Phase 5)
- Real-time events are ephemeral (not persisted beyond AuditLog entries from Phase 2)
- Network latency for event propagation is assumed to be < 50ms in local/test environments

## Dependencies

- **Phase 3 Complete**: NextAuth.js authentication and session management must be operational
- **Phase 2 APIs**: Vault and Source CRUD endpoints must be functional for event emission integration
- **Socket.io Library**: Requires installation of socket.io (server) and socket.io-client (client) npm packages
- **Next.js Custom Server**: May require custom server setup if using Next.js standalone server (alternative: API route with Socket.io)

## Out of Scope

- Production dashboard UI with polished real-time components (deferred to Phase 5)
- Toast notification components or UI libraries (Phase 5)
- Typing indicators or user presence features
- Message/chat functionality between vault members
- File collaboration features (comments, annotations, concurrent editing)
- Conflict resolution for concurrent source modifications
- Real-time analytics or activity dashboards
- Push notifications (browser or mobile)
- Socket.io scaling across multiple server instances (single instance only for hackathon)
- Persistent event history or replay functionality
- Rate limiting on Socket.io events (basic throttling acceptable)
