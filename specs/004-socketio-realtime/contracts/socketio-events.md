# Socket.io Event Contracts

**Feature**: Phase 4 - Real-Time Socket.io Integration
**Date**: 2026-02-15
**Version**: 1.0.0

## Overview

This document defines the Socket.io event contracts for real-time vault collaboration. All events use the default namespace (`/`) and are scoped to vault-specific rooms.

## Connection Lifecycle Events

### connect

**Direction**: Server → Client (automatic)
**Description**: Emitted when client successfully establishes Socket.io connection
**Trigger**: Socket.io connection established after session validation

**Payload**: None

**Example**:
```typescript
socket.on('connect', () => {
  console.log('Connected to Socket.io server');
  console.log('Socket ID:', socket.id);
});
```

---

### disconnect

**Direction**: Server → Client (automatic)
**Description**: Emitted when Socket.io connection is lost
**Trigger**: Network interruption, server shutdown, or client disconnect

**Payload**:
```typescript
{
  reason: string; // Disconnect reason
}
```

**Possible Reasons**:
- `"transport close"` - Network connection lost
- `"client namespace disconnect"` - Client called socket.disconnect()
- `"server namespace disconnect"` - Server forced disconnect
- `"ping timeout"` - Client didn't respond to ping

**Example**:
```typescript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Server forced disconnect, manual reconnection required
    socket.connect();
  }
  // Otherwise, automatic reconnection will occur
});
```

---

### reconnect

**Direction**: Server → Client (automatic)
**Description**: Emitted when client successfully reconnects after disconnection
**Trigger**: Automatic reconnection succeeds

**Payload**:
```typescript
{
  attemptNumber: number; // Number of reconnection attempts made
}
```

**Example**:
```typescript
socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  // Re-join vault rooms after reconnection
  socket.emit('vault:join', currentVaultId);
});
```

---

### reconnect_attempt

**Direction**: Server → Client (automatic)
**Description**: Emitted when client attempts to reconnect
**Trigger**: Each reconnection attempt

**Payload**:
```typescript
{
  attemptNumber: number; // Current attempt number
}
```

**Example**:
```typescript
socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('Reconnection attempt', attemptNumber);
});
```

---

## Room Management Events

### vault:join

**Direction**: Client → Server
**Description**: Request to join a vault-specific room
**Authorization**: Requires valid NextAuth.js session and VaultUser membership

**Payload**:
```typescript
{
  vaultId: string; // Vault ID to join (cuid format)
}
```

**Success Response**: `vault:joined` event
**Error Response**: `error` event with message

**Validation**:
- vaultId must be valid cuid format
- User must have VaultUser entry for this vault
- Session must be valid

**Example**:
```typescript
socket.emit('vault:join', 'clx123abc456def');

// Wait for confirmation
socket.on('vault:joined', (data) => {
  console.log('Joined vault:', data.vaultId);
  console.log('Your role:', data.role);
});

// Handle errors
socket.on('error', (error) => {
  console.error('Failed to join vault:', error.message);
});
```

---

### vault:joined

**Direction**: Server → Client
**Description**: Confirmation that user successfully joined vault room
**Trigger**: After successful vault:join request

**Payload**:
```typescript
{
  vaultId: string;  // Vault ID that was joined
  role: string;     // User's role in this vault (owner/contributor/viewer)
}
```

**Example**:
```typescript
socket.on('vault:joined', ({ vaultId, role }) => {
  console.log(`Joined vault ${vaultId} as ${role}`);
  // Start listening for source events
});
```

---

### vault:leave

**Direction**: Client → Server
**Description**: Request to leave a vault-specific room
**Authorization**: No authorization required (user can always leave)

**Payload**:
```typescript
{
  vaultId: string; // Vault ID to leave
}
```

**Response**: None (silent success)

**Example**:
```typescript
socket.emit('vault:leave', 'clx123abc456def');
```

---

## Source Mutation Events

### source:created

**Direction**: Server → Client (broadcast)
**Description**: Notification that a new source was added to the vault
**Trigger**: After successful POST /api/vaults/[id]/sources
**Broadcast**: To all sockets in `vault:{vaultId}` room

**Payload**:
```typescript
{
  source: {
    id: string;        // Source ID (cuid)
    title: string;     // Source title/filename
    fileUrl: string;   // Cloudinary URL
    fileKey?: string;  // Cloudinary public_id (optional)
    fileSize?: number; // File size in bytes (optional)
    mimeType: string;  // MIME type (default: "application/pdf")
    vaultId: string;   // Vault ID this source belongs to
    createdAt: string; // ISO 8601 timestamp
  };
  actor: {
    userId: string;    // User who created the source
    userName: string;  // User's display name
    role: string;      // User's role (owner/contributor)
  };
  timestamp: string;   // ISO 8601 timestamp of event emission
}
```

**Example**:
```typescript
socket.on('source:created', ({ source, actor, timestamp }) => {
  console.log(`${actor.userName} added "${source.title}"`);
  // Add source to UI list
  addSourceToList(source);
  // Show notification
  showToast(`New source: ${source.title}`);
});
```

---

### source:updated

**Direction**: Server → Client (broadcast)
**Description**: Notification that a source was modified
**Trigger**: After successful PATCH /api/sources/[id]
**Broadcast**: To all sockets in `vault:{vaultId}` room

**Payload**:
```typescript
{
  source: {
    id: string;        // Source ID (cuid)
    title: string;     // Updated title
    fileUrl: string;   // Cloudinary URL
    fileKey?: string;  // Cloudinary public_id (optional)
    fileSize?: number; // File size in bytes (optional)
    mimeType: string;  // MIME type
    vaultId: string;   // Vault ID
    updatedAt: string; // ISO 8601 timestamp of update
  };
  actor: {
    userId: string;    // User who updated the source
    userName: string;  // User's display name
    role: string;      // User's role (owner/contributor)
  };
  timestamp: string;   // ISO 8601 timestamp of event emission
}
```

**Example**:
```typescript
socket.on('source:updated', ({ source, actor, timestamp }) => {
  console.log(`${actor.userName} updated "${source.title}"`);
  // Update source in UI list
  updateSourceInList(source);
  // Show notification
  showToast(`Updated: ${source.title}`);
});
```

---

### source:deleted

**Direction**: Server → Client (broadcast)
**Description**: Notification that a source was removed from the vault
**Trigger**: After successful DELETE /api/sources/[id]
**Broadcast**: To all sockets in `vault:{vaultId}` room

**Payload**:
```typescript
{
  sourceId: string;  // ID of deleted source
  vaultId: string;   // Vault ID the source belonged to
  actor: {
    userId: string;  // User who deleted the source
    userName: string; // User's display name
    role: string;    // User's role (owner/contributor)
  };
  timestamp: string; // ISO 8601 timestamp of event emission
}
```

**Example**:
```typescript
socket.on('source:deleted', ({ sourceId, actor, timestamp }) => {
  console.log(`${actor.userName} deleted a source`);
  // Remove source from UI list
  removeSourceFromList(sourceId);
  // Show notification
  showToast(`Source deleted by ${actor.userName}`);
});
```

---

## Error Events

### error

**Direction**: Server → Client
**Description**: Error notification for failed operations
**Trigger**: Authentication failure, authorization failure, or invalid request

**Payload**:
```typescript
{
  message: string;   // Human-readable error message
  code?: string;     // Optional error code
  details?: any;     // Optional additional error details
}
```

**Common Error Messages**:
- `"UNAUTHORIZED"` - No valid session, connection rejected
- `"Access denied to vault"` - User not a member of requested vault
- `"Insufficient permissions"` - Viewer attempted to emit mutation event
- `"Invalid vault ID"` - Malformed vaultId in request
- `"AUTHENTICATION_FAILED"` - Session validation error

**Example**:
```typescript
socket.on('error', ({ message, code, details }) => {
  console.error('Socket.io error:', message);
  if (code === 'UNAUTHORIZED') {
    // Redirect to login
    window.location.href = '/login';
  } else {
    // Show error to user
    showErrorToast(message);
  }
});
```

---

## Event Flow Diagrams

### Source Creation Flow

```
Client A (Owner)                Server                    Client B (Contributor)
     |                            |                              |
     |-- POST /api/vaults/[id]/sources -->                      |
     |                            |                              |
     |                      [Validate session]                   |
     |                      [Create in DB]                       |
     |                      [Emit event]                         |
     |                            |                              |
     |<-- source:created ---------|-------- source:created ----->|
     |                            |                              |
     |  [Update UI]               |                    [Update UI]
```

### Room Join Flow

```
Client                          Server                      Database
  |                               |                             |
  |-- connect (with session) --->|                             |
  |                               |                             |
  |                         [Validate session]                  |
  |                         [Attach userId/role]                |
  |                               |                             |
  |<-- connect confirmation ------|                             |
  |                               |                             |
  |-- vault:join (vaultId) ------>|                             |
  |                               |                             |
  |                               |-- Query VaultUser --------->|
  |                               |<-- VaultUser result --------|
  |                               |                             |
  |                         [socket.join(room)]                 |
  |                               |                             |
  |<-- vault:joined (role) -------|                             |
  |                               |                             |
  |  [Listen for events]          |                             |
```

### Reconnection Flow

```
Client                          Server
  |                               |
  |  [Network interruption]       |
  |                               |
  |<-- disconnect ----------------|
  |                               |
  |  [Auto reconnect attempt 1]   |
  |-- connect ------------------->|
  |                               |
  |                         [Validate session]
  |                               |
  |<-- connect confirmation ------|
  |                               |
  |<-- reconnect (attempt: 1) ----|
  |                               |
  |-- vault:join (vaultId) ------>|
  |                               |
  |<-- vault:joined (role) -------|
  |                               |
  |  [Resume normal operation]    |
```

---

## Client Implementation Example

```typescript
import { io, Socket } from 'socket.io-client';

// Initialize Socket.io client
const socket: Socket = io('http://localhost:3000', {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Connection lifecycle
socket.on('connect', () => {
  console.log('Connected:', socket.id);
  // Join vault room
  socket.emit('vault:join', currentVaultId);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  // Re-join vault room
  socket.emit('vault:join', currentVaultId);
});

// Room management
socket.on('vault:joined', ({ vaultId, role }) => {
  console.log(`Joined vault ${vaultId} as ${role}`);
  setConnectionStatus('connected');
});

// Source events
socket.on('source:created', ({ source, actor }) => {
  addSourceToUI(source);
  showNotification(`${actor.userName} added ${source.title}`);
});

socket.on('source:updated', ({ source, actor }) => {
  updateSourceInUI(source);
  showNotification(`${actor.userName} updated ${source.title}`);
});

socket.on('source:deleted', ({ sourceId, actor }) => {
  removeSourceFromUI(sourceId);
  showNotification(`${actor.userName} deleted a source`);
});

// Error handling
socket.on('error', ({ message, code }) => {
  console.error('Socket error:', message);
  if (code === 'UNAUTHORIZED') {
    window.location.href = '/login';
  } else {
    showErrorNotification(message);
  }
});

// Cleanup on unmount
function cleanup() {
  socket.emit('vault:leave', currentVaultId);
  socket.disconnect();
}
```

---

## Server Implementation Example

```typescript
import { Server as SocketIOServer } from 'socket.io';
import { getServerSession } from 'next-auth';

const io = new SocketIOServer(server);

// Authentication middleware
io.use(async (socket, next) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return next(new Error('UNAUTHORIZED'));
    }
    socket.data.userId = session.user.id;
    socket.data.userRole = session.user.role;
    socket.data.userName = session.user.name;
    next();
  } catch (error) {
    next(new Error('AUTHENTICATION_FAILED'));
  }
});

// Connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.data.userId);

  // Room join handler
  socket.on('vault:join', async (vaultId: string) => {
    // Verify vault membership
    const vaultUser = await prisma.vaultUser.findFirst({
      where: { userId: socket.data.userId, vaultId },
    });

    if (!vaultUser) {
      socket.emit('error', { message: 'Access denied to vault' });
      return;
    }

    // Join room
    socket.join(`vault:${vaultId}`);
    socket.emit('vault:joined', { vaultId, role: vaultUser.role });
  });

  // Room leave handler
  socket.on('vault:leave', (vaultId: string) => {
    socket.leave(`vault:${vaultId}`);
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.data.userId);
  });
});

// Event emission from API route
export function emitSourceCreated(vaultId: string, source: Source, actor: Actor) {
  io.to(`vault:${vaultId}`).emit('source:created', {
    source,
    actor,
    timestamp: new Date().toISOString(),
  });
}
```

---

## Testing Checklist

- [ ] Connection establishment with valid session
- [ ] Connection rejection with invalid session
- [ ] Room join with valid vault membership
- [ ] Room join rejection without vault membership
- [ ] source:created event propagation to all room members
- [ ] source:updated event propagation to all room members
- [ ] source:deleted event propagation to all room members
- [ ] Event isolation (events only to correct vault room)
- [ ] Actor attribution in all events
- [ ] Automatic reconnection after network interruption
- [ ] Room re-join after reconnection
- [ ] Error event for unauthorized operations
- [ ] Viewer cannot emit mutation events
- [ ] Owner/contributor can emit mutation events

---

## Version History

**v1.0.0** (2026-02-15)
- Initial Socket.io event contract specification
- Connection lifecycle events
- Room management events
- Source mutation events
- Error handling events
