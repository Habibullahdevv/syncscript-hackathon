# Research: Real-Time Socket.io Integration

**Feature**: Phase 4 - Real-Time Socket.io Integration
**Date**: 2026-02-15
**Status**: Complete

## Research Questions

### 1. Socket.io + Next.js Custom Server Integration

**Question**: How should Socket.io be integrated with Next.js App Router?

**Options Evaluated**:
- Next.js custom server with Socket.io attached to HTTP server
- Socket.io in API route with standalone server
- Separate Socket.io server on different port

**Decision**: Next.js custom server with Socket.io attached to HTTP server

**Rationale**:
- Single server process simplifies deployment and reduces operational complexity
- Socket.io shares same port (3000) as Next.js HTTP, avoiding CORS issues
- Session cookies automatically available to Socket.io handshake
- Easier to access Next.js context, Prisma client, and shared utilities
- Standard pattern documented in Socket.io + Next.js integration guides

**Alternatives Considered**:
- Separate Socket.io server: More complex deployment, requires CORS configuration, session sharing challenges
- API route only: Limited Socket.io functionality, harder to manage persistent connections

**Implementation Pattern**:
```typescript
// server.ts
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import next from 'next';

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  const io = new SocketIOServer(server, {
    cors: { origin: process.env.NEXTAUTH_URL, credentials: true },
  });

  // Socket.io middleware and event handlers

  server.listen(3000);
});
```

---

### 2. NextAuth.js Session Extraction in Socket.io Middleware

**Question**: How should NextAuth.js sessions be validated for Socket.io connections?

**Options Evaluated**:
- Parse session cookie from Socket.io handshake headers
- Pass session token as query parameter
- Use NextAuth.js getServerSession() with Socket.io request

**Decision**: Parse session cookie from handshake headers with getServerSession()

**Rationale**:
- Consistent with Phase 3 HTTP-only cookie approach
- More secure than exposing session tokens in URL query parameters
- Socket.io handshake includes HTTP headers with cookies
- Can reuse NextAuth.js session validation logic from Phase 3
- Prevents session token leakage in logs or browser history

**Alternatives Considered**:
- Query parameter tokens: Less secure, visible in URLs, not recommended for production
- Custom JWT validation: Duplicates NextAuth.js logic, harder to maintain

**Implementation Pattern**:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

io.use(async (socket, next) => {
  try {
    // Socket.io handshake includes HTTP request with cookies
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return next(new Error('UNAUTHORIZED'));
    }

    // Attach user info to socket for event handlers
    socket.data.userId = session.user.id;
    socket.data.userRole = session.user.role;
    socket.data.userEmail = session.user.email;

    next();
  } catch (error) {
    next(new Error('AUTHENTICATION_FAILED'));
  }
});
```

---

### 3. Event Emission After Database Mutations

**Question**: Where should Socket.io events be emitted in the application flow?

**Options Evaluated**:
- Emit events from Phase 2 API routes after database mutations
- Emit events from Prisma middleware/hooks
- Create separate event service layer

**Decision**: Emit events from API routes after Prisma mutations

**Rationale**:
- Clear control flow: API → Database → Event emission
- Easy to ensure events only fire after successful persistence
- Can access full request context (session, actor information)
- Minimal changes to existing Phase 2 code structure
- Explicit and easy to debug

**Alternatives Considered**:
- Prisma middleware: More complex, harder to access request context, less explicit
- Event service layer: Over-engineering for hackathon scope, adds unnecessary abstraction

**Implementation Pattern**:
```typescript
// In POST /api/vaults/[id]/sources
import { getSocketServer } from '@/lib/socket';

export async function POST(request: NextRequest, { params }) {
  const session = await requireAuth();

  // Validate and create source
  const source = await prisma.source.create({ data: validatedData });

  // Emit event AFTER successful database persistence
  const io = getSocketServer();
  io.to(`vault:${params.id}`).emit('source:created', {
    source,
    actor: {
      userId: session.userId,
      userName: session.user.name,
      role: session.role,
    },
    timestamp: new Date().toISOString(),
  });

  return successResponse(source);
}
```

---

### 4. Room Membership Verification Strategy

**Question**: When should vault room membership be verified?

**Options Evaluated**:
- Verify vault membership on every event emission
- Verify vault membership only on room join
- Verify on join + periodic re-verification

**Decision**: Verify vault membership only on room join

**Rationale**:
- Reduces database queries (no check per event)
- Room membership is stable during typical connection lifetime
- Phase 2 APIs already enforce permissions on mutations
- Socket.io events are primarily read-only notifications
- Acceptable tradeoff for hackathon scope

**Alternatives Considered**:
- Verify per event: Higher database load, unnecessary for read-only events
- Periodic re-verification: Added complexity, not needed for short-lived connections

**Implementation Pattern**:
```typescript
socket.on('vault:join', async (vaultId: string) => {
  // Verify user has access to vault via VaultUser table
  const vaultUser = await prisma.vaultUser.findFirst({
    where: {
      userId: socket.data.userId,
      vaultId: vaultId,
    },
  });

  if (!vaultUser) {
    socket.emit('error', { message: 'Access denied to vault' });
    return;
  }

  // Join room and confirm
  socket.join(`vault:${vaultId}`);
  socket.emit('vault:joined', { vaultId, role: vaultUser.role });
});
```

---

### 5. Reconnection Handling

**Question**: How should Socket.io handle connection interruptions?

**Options Evaluated**:
- Socket.io automatic reconnection with default settings
- Custom reconnection logic with exponential backoff
- No automatic reconnection (manual refresh required)

**Decision**: Socket.io automatic reconnection with default settings

**Rationale**:
- Built-in Socket.io feature, no custom implementation needed
- Exponential backoff already implemented (1s, 2s, 4s, 8s, 16s)
- Handles network interruptions gracefully
- Client automatically re-establishes connection
- Meets Phase 4 requirement of < 2 second reconnection

**Alternatives Considered**:
- Custom logic: Unnecessary complexity, reinvents Socket.io features
- No reconnection: Poor user experience, requires manual page refresh

**Implementation Pattern**:
```typescript
// Client-side (automatic, no custom code needed)
const socket = io('http://localhost:3000', {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Listen for reconnection events
socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  // Re-join vault rooms after reconnection
  socket.emit('vault:join', currentVaultId);
});
```

---

## Technology Stack Decisions

**Socket.io Version**: 4.x (latest stable)
- Reason: Modern API, TypeScript support, automatic reconnection

**Transport Protocol**: WebSocket with polling fallback
- Reason: Best performance with WebSocket, polling fallback for compatibility

**Namespace Strategy**: Single namespace with vault-specific rooms
- Reason: Simpler server logic, easier room management

**Event Naming Convention**: `resource:action` format
- Examples: `source:created`, `source:updated`, `source:deleted`
- Reason: Clear, consistent, follows REST-like patterns

**Session Strategy**: NextAuth.js session cookies (from Phase 3)
- Reason: Consistent with existing authentication, secure HTTP-only cookies

---

## Performance Considerations

**Event Propagation Latency**: Target < 100ms
- Socket.io typically achieves 10-50ms latency on local network
- Meets Phase 4 requirement of < 1 second notification delivery

**Concurrent Connections**: Target 100+ simultaneous users
- Socket.io can handle 10,000+ connections per server
- Hackathon scope: 100+ is conservative and easily achievable

**Memory Usage**: Target < 10MB per connection
- Socket.io connections are lightweight
- Minimal state stored per socket (userId, role, joined rooms)

**Reconnection Time**: Target < 2 seconds
- Socket.io default: 1s first attempt, exponential backoff
- Meets Phase 4 requirement

---

## Security Considerations

**Authentication**: NextAuth.js session validation on connection
- Prevents unauthorized Socket.io connections
- Consistent with Phase 3 security model

**Authorization**: VaultUser membership verification on room join
- Prevents users from joining vaults they don't have access to
- Maintains Phase 2 RBAC model

**Event Authorization**: Role-based permission checks on emissions
- Viewers can only listen, not emit
- Owners/contributors can emit mutation events
- Uses existing checkPermission() from Phase 2/3

**Data Exposure**: Events include only necessary information
- No sensitive data in event payloads
- Actor information for attribution only
- Full source objects safe to broadcast (already accessible via Phase 2 APIs)

---

## Testing Strategy

**Multi-Client Testing**: 3+ browser tabs with different users
- Validates real-time synchronization
- Tests room isolation
- Verifies event attribution

**Network Interruption Testing**: Disconnect and reconnect
- Validates automatic reconnection
- Tests room re-join after reconnection
- Verifies no data loss

**Role-Based Testing**: Test with owner, contributor, viewer
- Validates RBAC enforcement
- Tests viewer cannot emit events
- Verifies owner/contributor can emit

**Session Expiry Testing**: Test with expired session
- Validates connection rejection
- Tests graceful error handling
- Verifies clear error messages

---

## Conclusion

All research questions resolved. Phase 4 implementation can proceed with:
- Next.js custom server + Socket.io integration
- NextAuth.js session-based authentication
- Event emission from Phase 2 API routes
- Room membership verification on join
- Automatic reconnection with Socket.io defaults

No blocking issues identified. All decisions align with Phase 4 constitution principles and Phase 1-3 architecture.
