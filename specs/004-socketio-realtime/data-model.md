# Data Model: Real-Time Socket.io Integration

**Feature**: Phase 4 - Real-Time Socket.io Integration
**Date**: 2026-02-15
**Status**: Complete

## Overview

Phase 4 introduces **no new database models or schema changes**. All real-time functionality builds on existing Prisma models from Phase 1/2. Socket.io events are ephemeral (not persisted) and serve as notifications for database changes that occur through Phase 2 REST APIs.

## Existing Models (No Changes)

### User Model (Phase 1)

```prisma
model User {
  id           String      @id @default(cuid())
  email        String      @unique
  name         String?
  passwordHash String
  role         String      @default("viewer")
  vaultUsers   VaultUser[]
  createdAt    DateTime    @default(now())
}
```

**Usage in Phase 4**:
- User.id → Socket connection identification (socket.data.userId)
- User.role → Event authorization (owner/contributor/viewer)
- User.name → Actor attribution in event payloads

### Vault Model (Phase 1)

```prisma
model Vault {
  id          String      @id @default(cuid())
  name        String
  description String?
  vaultUsers  VaultUser[]
  sources     Source[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

**Usage in Phase 4**:
- Vault.id → Socket.io room naming (`vault:{vaultId}`)
- Vault relationships → Room membership verification

### VaultUser Model (Phase 1)

```prisma
model VaultUser {
  id      String @id @default(cuid())
  userId  String
  vaultId String
  role    String @default("viewer")
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  vault   Vault  @relation(fields: [vaultId], references: [id], onDelete: Cascade)

  @@unique([userId, vaultId])
  @@index([vaultId])
}
```

**Usage in Phase 4**:
- VaultUser → Room membership verification on `vault:join`
- VaultUser.role → Event authorization (emit vs listen-only)
- Query: `findFirst({ where: { userId, vaultId } })` validates room access

### Source Model (Phase 1/2)

```prisma
model Source {
  id        String   @id @default(cuid())
  title     String
  fileUrl   String?
  fileKey   String?
  fileSize  Int?
  mimeType  String   @default("application/pdf")
  vaultId   String
  vault     Vault    @relation(fields: [vaultId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([vaultId])
}
```

**Usage in Phase 4**:
- Source mutations → Trigger real-time events
- Source object → Included in event payloads
- Source.vaultId → Determines which room receives event

### AuditLog Model (Phase 1)

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  action    String
  userId    String
  vaultId   String?
  details   Json?
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```

**Usage in Phase 4**:
- AuditLog continues to persist all mutations (Phase 2 behavior)
- Socket.io events are separate from audit logs (ephemeral notifications)
- No changes to audit logging behavior

## Ephemeral Data Structures (Not Persisted)

### Socket Connection Metadata

**Stored in**: `socket.data` (in-memory, per connection)

```typescript
interface SocketData {
  userId: string;      // From NextAuth.js session
  userRole: string;    // From NextAuth.js session (owner/contributor/viewer)
  userEmail: string;   // From NextAuth.js session
  joinedRooms: Set<string>; // Vault rooms user has joined
}
```

**Lifecycle**:
- Created: On Socket.io connection after session validation
- Updated: When user joins/leaves vault rooms
- Destroyed: On Socket.io disconnect

### Socket.io Room Membership

**Stored in**: Socket.io server memory (not database)

```typescript
interface RoomMembership {
  roomName: string;    // Format: "vault:{vaultId}"
  sockets: Set<Socket>; // All connected sockets in this room
}
```

**Lifecycle**:
- Created: When first user joins vault room
- Updated: As users join/leave room
- Destroyed: When last user leaves room

### Real-Time Event Payloads

**Stored in**: Ephemeral (broadcast only, not persisted)

```typescript
interface SourceCreatedEvent {
  source: {
    id: string;
    title: string;
    fileUrl: string;
    vaultId: string;
    createdAt: string;
  };
  actor: {
    userId: string;
    userName: string;
    role: string;
  };
  timestamp: string; // ISO 8601
}

interface SourceUpdatedEvent {
  source: {
    id: string;
    title: string;
    fileUrl: string;
    vaultId: string;
    updatedAt: string;
  };
  actor: {
    userId: string;
    userName: string;
    role: string;
  };
  timestamp: string;
}

interface SourceDeletedEvent {
  sourceId: string;
  vaultId: string;
  actor: {
    userId: string;
    userName: string;
    role: string;
  };
  timestamp: string;
}
```

**Lifecycle**:
- Created: After successful database mutation
- Broadcast: To all sockets in vault room
- Destroyed: Immediately after broadcast (not stored)

## Data Flow

### Source Creation Flow

```
1. Client → POST /api/vaults/[id]/sources (Phase 2 API)
2. API validates session and permissions
3. API creates Source in database via Prisma
4. API creates AuditLog entry (Phase 2 behavior)
5. API emits source:created event to Socket.io
6. Socket.io broadcasts event to vault:{vaultId} room
7. All connected clients receive event
8. Clients update UI with new source
```

### Room Join Flow

```
1. Client connects to Socket.io with session cookie
2. Socket.io middleware validates NextAuth.js session
3. Socket.io attaches userId/role to socket.data
4. Client emits vault:join with vaultId
5. Server queries VaultUser table for membership
6. If authorized: socket.join(vault:{vaultId})
7. Server emits vault:joined confirmation to client
8. Client begins listening for source events
```

## Relationships

### User ↔ Socket Connection (1:N)

- One user can have multiple Socket.io connections (multiple browser tabs)
- Each connection has independent socket.data
- All connections for same user share same userId/role

### Vault ↔ Socket Room (1:1)

- Each vault has exactly one Socket.io room
- Room name: `vault:{vaultId}`
- Room exists only when at least one user is connected

### Socket ↔ Vault Room (N:M)

- One socket can join multiple vault rooms
- One vault room can have multiple sockets
- Membership tracked in Socket.io server memory

### Source Mutation ↔ Event (1:1)

- Each source mutation triggers exactly one event
- Event includes full source object + actor info
- Event broadcast to all sockets in vault room

## Indexes (No Changes)

Phase 4 uses existing indexes from Phase 1:

- `VaultUser.@@unique([userId, vaultId])` - Prevents duplicate memberships
- `VaultUser.@@index([vaultId])` - Fast vault member lookups (used for room join verification)
- `Source.@@index([vaultId])` - Fast vault source queries
- `AuditLog.@@index([userId, createdAt])` - User activity timeline

No new indexes required for Phase 4.

## Performance Considerations

### Database Queries

**Room Join Verification**:
```sql
SELECT * FROM VaultUser
WHERE userId = ? AND vaultId = ?
LIMIT 1;
```
- Indexed on (userId, vaultId) unique constraint
- Fast lookup: O(1) with index
- Executed once per room join (not per event)

**No Additional Queries**:
- Event emission does not query database
- Source object already available from Phase 2 API mutation
- Actor information from session (no additional query)

### Memory Usage

**Per Socket Connection**:
- socket.data: ~100 bytes (userId, role, email)
- Room memberships: ~50 bytes per room
- Total: ~150-200 bytes per connection

**Per Vault Room**:
- Room name: ~50 bytes
- Socket set: ~8 bytes per socket reference
- Total: ~50 + (8 * num_sockets) bytes

**100 Concurrent Connections**:
- Socket metadata: 100 * 200 bytes = 20 KB
- Room overhead: Negligible
- Total: < 1 MB for 100 connections

## Data Integrity

### Consistency Guarantees

**Event Ordering**:
- Events emitted in order of database mutations
- Socket.io preserves event order per connection
- No guaranteed ordering across different connections

**Event Delivery**:
- At-most-once delivery (Socket.io default)
- Events not persisted, no replay on reconnection
- Clients must fetch current state from Phase 2 APIs on reconnection

**Database as Source of Truth**:
- Phase 2 REST APIs remain authoritative
- Socket.io events are notifications only
- Clients should not rely solely on events for state

### Failure Scenarios

**Event Emission Failure**:
- Database mutation succeeds
- Event emission fails (Socket.io error)
- Result: Database consistent, some clients miss notification
- Mitigation: Clients can poll Phase 2 APIs as fallback

**Room Join Failure**:
- User authenticated but VaultUser query fails
- Result: User cannot join room, receives error event
- Mitigation: Retry join or refresh page

**Connection Loss**:
- Socket disconnects mid-session
- Result: User misses events during disconnection
- Mitigation: Automatic reconnection + fetch current state from API

## Validation Rules

### Room Name Validation

```typescript
function isValidRoomName(roomName: string): boolean {
  return /^vault:[a-z0-9]+$/.test(roomName);
}
```

### Event Payload Validation

```typescript
function validateSourceEvent(event: any): boolean {
  return (
    typeof event.source === 'object' &&
    typeof event.source.id === 'string' &&
    typeof event.source.vaultId === 'string' &&
    typeof event.actor === 'object' &&
    typeof event.actor.userId === 'string' &&
    typeof event.timestamp === 'string'
  );
}
```

## Summary

Phase 4 introduces **zero schema changes**. All real-time functionality leverages existing Prisma models from Phase 1/2. Socket.io events are ephemeral notifications that complement (not replace) the authoritative Phase 2 REST APIs. Database remains the single source of truth, with Socket.io providing real-time propagation of mutations to connected clients.
