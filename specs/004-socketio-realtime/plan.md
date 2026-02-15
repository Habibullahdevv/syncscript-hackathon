# Implementation Plan: Real-Time Socket.io Integration

**Branch**: `004-socketio-realtime` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-socketio-realtime/spec.md`

## Summary

Phase 4 adds real-time collaboration to the SyncScript Vault system by integrating Socket.io for live source notifications. When a user adds a source to a vault, all connected vault members see the update immediately without page refresh. The implementation builds on Phase 3 NextAuth.js authentication and Phase 2 REST APIs, adding Socket.io server with vault-specific rooms, session-based authentication middleware, and role-based event authorization. No database schema changes are required; Socket.io events propagate after successful Phase 2 API mutations.

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode)
**Primary Dependencies**: Socket.io 4.x (server), socket.io-client 4.x (client), Next.js 15+ App Router, NextAuth.js v5
**Storage**: NeonDB PostgreSQL via Prisma (no schema changes, uses existing Phase 2 models)
**Testing**: Manual multi-client testing with browser tabs and Postman Socket.io client
**Target Platform**: Next.js custom server (Node.js 18+) with Socket.io integration
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: < 100ms event propagation latency, 100+ concurrent connections, < 2 second reconnection
**Constraints**: < 1 second source notification delivery, session-based authentication only, vault room isolation
**Scale/Scope**: 3 user stories, 15 functional requirements, minimal test UI (no production dashboard)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase 4 Principles Compliance

**Principle XXI - Socket.io Server Exclusively**: ✅ PASS
- Plan uses Socket.io server and client libraries exclusively
- No native WebSockets or SSE alternatives
- Transport: WebSocket with polling fallback

**Principle XXII - Vault-Specific Room Architecture**: ✅ PASS
- Room naming: `vault:{vaultId}` convention
- Membership verified via VaultUser table before join
- No global broadcast rooms (vault-scoped only)

**Principle XXIII - Session-Based Socket Authentication**: ✅ PASS
- Socket.io middleware extracts NextAuth.js session
- Unauthenticated connections rejected
- Session contains userId and role for authorization

**Principle XXIV - Real-Time Source Event Propagation**: ✅ PASS
- Events: `source:created`, `source:updated`, `source:deleted`
- Emitted AFTER successful database persistence
- Includes actor information (userId, userName, role)

**Principle XXV - Role-Based Event Authorization**: ✅ PASS
- Owner/contributor can emit mutation events
- Viewer can only listen (cannot emit)
- Uses existing checkPermission() from Phase 2/3

**Principle XXVI - Minimal Test UI**: ✅ PASS
- Test page at `/test/realtime` for validation
- Displays vault sources with live updates
- Not production dashboard (Phase 5)

**Gate Status**: ✅ ALL GATES PASSED - Proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/004-socketio-realtime/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── socketio-events.md
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
syncscript/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts    # Phase 3 (existing)
│   │   │   ├── vaults/[id]/sources/route.ts   # Phase 2 (modify for events)
│   │   │   ├── sources/[id]/route.ts          # Phase 2 (modify for events)
│   │   │   └── socketio/route.ts              # Phase 4 (NEW - Socket.io endpoint)
│   │   ├── test/
│   │   │   └── realtime/page.tsx              # Phase 4 (NEW - test UI)
│   │   └── (authenticated)/dashboard/         # Phase 3 (existing)
│   ├── lib/
│   │   ├── auth.ts                            # Phase 3 (existing)
│   │   ├── prisma.ts                          # Phase 1 (existing)
│   │   └── socket.ts                          # Phase 4 (NEW - Socket.io server)
│   └── components/
│       └── RoleBadge.tsx                      # Phase 3 (existing)
├── server.ts                                  # Phase 4 (NEW - custom Next.js server)
└── prisma/
    └── schema.prisma                          # Phase 1 (existing, no changes)
```

**Structure Decision**: Next.js App Router with custom server for Socket.io integration. Socket.io server initialized in `server.ts` alongside Next.js request handler. Real-time events emitted from existing Phase 2 API routes after successful database mutations. Minimal test UI at `/test/realtime` for multi-client validation.

## Architecture Decisions

### Decision 1: Next.js Custom Server vs API Route for Socket.io

**Options Considered**:
- **Option A**: Next.js custom server with Socket.io attached to HTTP server
- **Option B**: Socket.io in API route with standalone server
- **Option C**: Separate Socket.io server on different port

**Decision**: Option A - Next.js custom server with Socket.io

**Rationale**:
- Single server process simplifies deployment
- Socket.io shares same port (3000) as Next.js HTTP
- Session cookies automatically available to Socket.io
- Easier to access Next.js context and Prisma client
- Standard pattern for Next.js + Socket.io integration

**Tradeoffs**:
- Requires custom server.ts (cannot use `next start`)
- Slightly more complex server initialization
- But: Simpler than managing multiple servers

**Implementation**:
```typescript
// server.ts
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import next from 'next';

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  const io = new SocketIOServer(server);

  // Socket.io setup here

  server.listen(3000);
});
```

### Decision 2: Session Extraction Method for Socket.io

**Options Considered**:
- **Option A**: Parse session cookie from Socket.io handshake headers
- **Option B**: Pass session token as query parameter
- **Option C**: Use NextAuth.js getServerSession() with Socket.io request

**Decision**: Option A - Parse session cookie from handshake headers

**Rationale**:
- Consistent with Phase 3 HTTP-only cookie approach
- No need to expose session token in URL
- Socket.io handshake includes HTTP headers with cookies
- Can reuse NextAuth.js session validation logic

**Tradeoffs**:
- Requires cookie parsing in Socket.io middleware
- But: More secure than query parameters

**Implementation**:
```typescript
io.use(async (socket, next) => {
  const cookies = socket.handshake.headers.cookie;
  // Parse NextAuth.js session cookie
  // Validate session using getServerSession()
  // Attach userId and role to socket.data
});
```

### Decision 3: Event Emission Location

**Options Considered**:
- **Option A**: Emit events from Phase 2 API routes after database mutations
- **Option B**: Emit events from Prisma middleware/hooks
- **Option C**: Separate event service layer

**Decision**: Option A - Emit from API routes after mutations

**Rationale**:
- Clear control flow: API → Database → Event
- Easy to ensure events only fire after successful persistence
- Can access full request context (session, actor info)
- Minimal changes to existing Phase 2 code

**Tradeoffs**:
- Couples API routes to Socket.io server
- But: Simpler than Prisma middleware and more explicit

**Implementation**:
```typescript
// In POST /api/vaults/[id]/sources
const source = await prisma.source.create({ data });

// Emit event after successful creation
io.to(`vault:${vaultId}`).emit('source:created', {
  source,
  actor: { userId, userName, role },
  timestamp: new Date().toISOString(),
});
```

### Decision 4: Room Join Verification Strategy

**Options Considered**:
- **Option A**: Verify vault membership on every event emission
- **Option B**: Verify vault membership only on room join
- **Option C**: Verify on join + periodic re-verification

**Decision**: Option B - Verify on join only

**Rationale**:
- Reduces database queries (no check per event)
- Room membership is stable during connection
- Phase 2 APIs already enforce permissions on mutations
- Socket.io events are read-only for most users

**Tradeoffs**:
- If user loses vault access mid-session, they stay in room
- But: Acceptable for hackathon scope, can be enhanced later

**Implementation**:
```typescript
socket.on('vault:join', async (vaultId) => {
  const vaultUser = await prisma.vaultUser.findFirst({
    where: { userId: socket.data.userId, vaultId },
  });

  if (!vaultUser) {
    socket.emit('error', { message: 'Access denied' });
    return;
  }

  socket.join(`vault:${vaultId}`);
  socket.emit('vault:joined', { vaultId, role: vaultUser.role });
});
```

### Decision 5: Test UI Scope

**Options Considered**:
- **Option A**: Full production dashboard with real-time features
- **Option B**: Minimal test page with basic source list
- **Option C**: No UI, Postman Socket.io client only

**Decision**: Option B - Minimal test page

**Rationale**:
- Enables visual validation with multiple browser windows
- Demonstrates real-time updates for judges
- Avoids premature dashboard development (Phase 5)
- Faster to implement than full dashboard

**Tradeoffs**:
- Not production-ready UI
- But: Sufficient for Phase 4 validation

**Implementation**:
- Route: `/test/realtime`
- Features: Connection status, vault source list, live updates
- Styling: Minimal Tailwind CSS (functional only)

## Phase 0: Research

### Research Topics

1. **Socket.io + Next.js Custom Server Integration**
   - Decision: Use Next.js custom server with Socket.io attached to HTTP server
   - Rationale: Single process, shared port, session cookie access
   - Alternatives: Separate Socket.io server (more complex deployment)

2. **NextAuth.js Session Extraction in Socket.io Middleware**
   - Decision: Parse session cookie from Socket.io handshake headers
   - Rationale: Consistent with Phase 3 HTTP-only cookies, secure
   - Alternatives: Query parameter tokens (less secure)

3. **Event Emission After Database Mutations**
   - Decision: Emit events from Phase 2 API routes after Prisma operations
   - Rationale: Clear control flow, ensures persistence before events
   - Alternatives: Prisma middleware (more complex, less explicit)

4. **Room Membership Verification Strategy**
   - Decision: Verify VaultUser membership on room join only
   - Rationale: Reduces database load, room membership is stable
   - Alternatives: Verify on every event (higher database load)

5. **Reconnection Handling**
   - Decision: Socket.io automatic reconnection with exponential backoff
   - Rationale: Built-in Socket.io feature, no custom implementation needed
   - Alternatives: Custom reconnection logic (unnecessary complexity)

### Research Findings

**Socket.io + Next.js Integration Pattern**:
- Custom server.ts creates HTTP server with Next.js handler
- Socket.io server attached to same HTTP server
- Both HTTP and WebSocket traffic on port 3000
- Socket.io middleware runs before connection event

**Session Validation in Socket.io**:
- Socket.io handshake includes HTTP headers with cookies
- Parse NextAuth.js session cookie (next-auth.session-token)
- Use getServerSession() to validate session
- Attach userId and role to socket.data for event handlers

**Event Emission Pattern**:
- Import Socket.io server instance in API routes
- Emit events after successful Prisma mutations
- Include full source object + actor information
- Use io.to(roomName).emit() for room-scoped broadcasts

**Room Management**:
- socket.join(roomName) adds socket to room
- socket.leave(roomName) removes socket from room
- io.to(roomName).emit() broadcasts to all sockets in room
- Automatic cleanup on disconnect

**Reconnection Behavior**:
- Socket.io client automatically reconnects on disconnect
- Exponential backoff: 1s, 2s, 4s, 8s, 16s (max 5 attempts)
- Client must re-join rooms after reconnection
- Server emits 'disconnect' and 'connection' events

## Phase 1: Design & Contracts

### Data Model

**No Schema Changes Required**

Phase 4 uses existing Prisma models from Phase 1/2:
- User (authentication identity)
- Vault (container for sources)
- VaultUser (membership with role)
- Source (PDF metadata)

Real-time events are ephemeral (not persisted beyond existing AuditLog entries from Phase 2).

### Socket.io Event Contracts

**Connection Events**:

```typescript
// Client → Server: Join vault room
socket.emit('vault:join', vaultId: string)

// Server → Client: Join confirmation
socket.on('vault:joined', { vaultId: string, role: string })

// Server → Client: Join rejection
socket.on('error', { message: string })

// Client → Server: Leave vault room
socket.emit('vault:leave', vaultId: string)
```

**Source Mutation Events**:

```typescript
// Server → Clients: Source created
socket.on('source:created', {
  source: {
    id: string,
    title: string,
    fileUrl: string,
    vaultId: string,
    createdAt: string,
  },
  actor: {
    userId: string,
    userName: string,
    role: string,
  },
  timestamp: string,
})

// Server → Clients: Source updated
socket.on('source:updated', {
  source: { /* same as above */ },
  actor: { /* same as above */ },
  timestamp: string,
})

// Server → Clients: Source deleted
socket.on('source:deleted', {
  sourceId: string,
  vaultId: string,
  actor: { /* same as above */ },
  timestamp: string,
})
```

**Connection Lifecycle Events**:

```typescript
// Server → Client: Connection established
socket.on('connect', () => void)

// Server → Client: Connection lost
socket.on('disconnect', (reason: string) => void)

// Server → Client: Reconnection attempt
socket.on('reconnect_attempt', (attemptNumber: number) => void)

// Server → Client: Reconnection successful
socket.on('reconnect', (attemptNumber: number) => void)
```

### Quickstart Scenarios

**Scenario 1: Real-Time Source Notification**

1. User A logs in as owner@demo.com
2. User B logs in as contributor@demo.com
3. Both users navigate to `/test/realtime?vaultId=<vault-id>`
4. Both clients connect to Socket.io and join vault room
5. User A adds source via POST /api/vaults/[id]/sources
6. User B sees source appear in their list within 1 second
7. Both users see connection status: "Connected to vault-{id}"

**Scenario 2: Session-Based Authentication**

1. User attempts to connect to Socket.io without logging in
2. Socket.io middleware rejects connection with "UNAUTHORIZED"
3. User logs in via /login (Phase 3)
4. User connects to Socket.io successfully
5. User attempts to join vault they don't have access to
6. Server emits error event: "Access denied to vault"

**Scenario 3: Role-Based Event Authorization**

1. Viewer logs in and connects to Socket.io
2. Viewer joins vault room successfully (can listen)
3. Viewer attempts to emit source:created event directly
4. Server rejects event with "Insufficient permissions"
5. Owner adds source via Phase 2 API
6. Viewer receives source:created event (can listen)

## Implementation Phases

### Phase 1: Foundation Setup (Socket.io Server & Client)

**Objectives**:
- Install Socket.io server and client libraries
- Create Next.js custom server with Socket.io integration
- Verify basic connection and ping-pong events

**Tasks**:
1. Install dependencies: `npm install socket.io socket.io-client`
2. Create `server.ts` with Next.js custom server
3. Initialize Socket.io server attached to HTTP server
4. Create `src/lib/socket.ts` for Socket.io server instance export
5. Create minimal test page at `/test/realtime` with Socket.io client
6. Test connection establishment and basic events

**Validation**:
- Server starts without errors
- Client can connect to Socket.io
- Ping-pong events work between client and server

### Phase 2: Session Authentication & Room Management

**Objectives**:
- Implement Socket.io middleware for NextAuth.js session validation
- Create vault room join/leave handlers
- Verify VaultUser membership before allowing room join

**Tasks**:
1. Create Socket.io middleware to extract and validate NextAuth.js session
2. Attach userId and role to socket.data
3. Implement `vault:join` event handler with VaultUser verification
4. Implement `vault:leave` event handler
5. Add error handling for unauthorized connections and invalid room joins
6. Test authentication flow with valid and invalid sessions

**Validation**:
- Authenticated users can join vault rooms
- Unauthenticated users are rejected
- Users without vault access cannot join rooms

### Phase 3: Real-Time Source Event Propagation

**Objectives**:
- Modify Phase 2 API routes to emit Socket.io events after mutations
- Implement source:created, source:updated, source:deleted events
- Include actor information in event payloads

**Tasks**:
1. Import Socket.io server in POST /api/vaults/[id]/sources
2. Emit source:created event after successful Prisma create
3. Import Socket.io server in PATCH /api/sources/[id]
4. Emit source:updated event after successful Prisma update
5. Import Socket.io server in DELETE /api/sources/[id]
6. Emit source:deleted event after successful Prisma delete
7. Update test UI to listen for and display source events

**Validation**:
- Source creation triggers source:created event to vault room
- Source update triggers source:updated event to vault room
- Source deletion triggers source:deleted event to vault room
- Events include full source object and actor information

### Phase 4: Role-Based Event Authorization

**Objectives**:
- Enforce role-based permissions on Socket.io event emissions
- Ensure viewers can only listen, not emit
- Validate owner/contributor can emit mutation events

**Tasks**:
1. Create event authorization middleware using checkPermission()
2. Add permission checks to any client-emitted mutation events
3. Return error events for unauthorized emissions
4. Test viewer cannot emit events
5. Test owner/contributor can emit events

**Validation**:
- Viewer role cannot emit mutation events
- Owner/contributor can emit mutation events
- Unauthorized emissions return clear error messages

### Phase 5: Testing & Validation

**Objectives**:
- Validate real-time functionality with multiple concurrent clients
- Test reconnection behavior
- Verify room isolation and event attribution

**Tasks**:
1. Open 3+ browser tabs with different users
2. Test source creation propagates to all connected clients
3. Test network interruption and automatic reconnection
4. Test room isolation (events only to correct vault)
5. Verify event attribution includes correct actor information
6. Test viewer can listen but not emit
7. Document any issues or edge cases discovered

**Validation**:
- Multi-client testing shows synchronized updates
- Reconnection works within 2 seconds
- Room isolation prevents cross-vault event leakage
- All events include actor information

## Quality Validation Framework

**Code Quality**:
- TypeScript strict mode enabled
- No unused imports or variables
- Clear separation between HTTP API and Socket.io events
- Consistent error handling patterns

**Security**:
- All Socket.io connections authenticated via NextAuth.js session
- Vault room membership verified before join
- Role-based permissions enforced on event emissions
- No sensitive data in event payloads (use IDs, not passwords)

**Data Integrity**:
- Events emitted only after successful database persistence
- Phase 2 APIs remain authoritative for mutations
- Socket.io events are read-only notifications
- No database writes from Socket.io event handlers

**Operational**:
- Server starts reliably with Socket.io enabled
- Automatic reconnection handles network interruptions
- Event propagation latency < 100ms
- 100+ concurrent connections supported

## Completion Criteria

Phase 4 is complete when:

1. ✅ Socket.io server runs alongside Next.js on port 3000
2. ✅ NextAuth.js session authentication works for Socket.io connections
3. ✅ Vault-specific rooms enforce VaultUser membership
4. ✅ Source mutations emit real-time events to vault rooms
5. ✅ Events include full source object and actor information
6. ✅ Role-based permissions enforced (viewer listen-only)
7. ✅ Automatic reconnection works within 2 seconds
8. ✅ Multi-client testing shows synchronized updates
9. ✅ Test UI at `/test/realtime` validates functionality
10. ✅ No Phase 5+ features implemented (no production dashboard)
11. ✅ Phase 2 database integrity maintained
12. ✅ All Phase 4 constitution principles satisfied

## Next Steps

After Phase 4 completion:
1. Run `/sp.tasks` to generate detailed task breakdown
2. Execute implementation following task plan
3. Validate with multi-client testing
4. Prepare for Phase 5 (production dashboard with real-time features)
