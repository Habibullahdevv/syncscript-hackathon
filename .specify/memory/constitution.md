<!--
Sync Impact Report:
- Version: 1.3.0 → 1.4.0 (MINOR: Added Phase 5 Frontend Dashboard & Role-Based UI principles)
- Modified Principles:
  - Scope Boundaries expanded to include Phase 5 Frontend Dashboard
  - Quality Gates expanded with Phase 5 UI testing criteria
  - Technology Stack expanded with shadcn/ui component library
  - Performance Targets expanded with frontend rendering requirements
- Added Sections:
  - Principles XXVII-XXXII (Frontend Dashboard & Role-Based UI governance)
  - Phase 5 Completion Criteria
  - shadcn/ui Component Standards
  - Dashboard Layout Patterns
  - Role-Based UI Component Rules
- Removed Sections: N/A
- Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section aligns with frontend UI principles
  ✅ spec-template.md - Requirements structure supports dashboard feature development
  ✅ tasks-template.md - Task categorization supports frontend UI implementation tasks
- Follow-up TODOs: None
-->

# SyncScript Constitution - Database Foundation, Backend APIs, Authentication, Real-Time & Frontend Dashboard

## Core Principles

### Phase 1: Database Foundation (Principles I-VIII)

### I. Serverless PostgreSQL Only (NeonDB)

**Mandate**: All data persistence MUST use NeonDB PostgreSQL serverless exclusively. This is NON-NEGOTIABLE for national scale requirements and hackathon scoring (25% data modeling weight).

**Rules**:
- NeonDB connection string MUST be configured via DATABASE_URL environment variable
- SSL mode MUST be enabled for all connections
- Connection pooling MUST be configured for serverless optimization
- NO alternative databases (SQLite, MySQL, MongoDB, local files) are permitted

**Rationale**: NeonDB provides serverless PostgreSQL with automatic scaling, branching capabilities for development workflows, and zero-downtime migrations essential for hackathon demo reliability.

### II. Prisma ORM Exclusively

**Mandate**: All database operations MUST use Prisma Client. Direct SQL queries are PROHIBITED except for complex analytics explicitly approved in architecture review.

**Rules**:
- Schema defined in `prisma/schema.prisma` as single source of truth
- All models MUST use Prisma schema syntax
- Database migrations MUST use `prisma db push` for development, `prisma migrate` for production
- Type-safe queries MUST be enforced via generated Prisma Client

**Rationale**: Prisma ensures type safety, prevents SQL injection, provides excellent TypeScript integration, and directly contributes to the 25% data modeling score in hackathon evaluation.

### III. ACID Transactions for Vault Operations

**Mandate**: All vault-user relationship changes MUST execute within Prisma transactions to maintain data integrity.

**Rules**:
- VaultUser assignments MUST use `prisma.$transaction()`
- Role changes MUST be atomic (update VaultUser + create AuditLog in single transaction)
- Source additions to vaults MUST be transactional
- NO partial state allowed for multi-step operations

**Rationale**: Prevents orphaned relationships, ensures audit trail consistency, and maintains referential integrity critical for role-based access control.

### IV. Zero-Downtime Schema Evolution

**Mandate**: Schema changes MUST be backward-compatible and deployable without service interruption.

**Rules**:
- Use `prisma db push` for iterative development
- Additive changes only (new fields, new models) during active development
- Breaking changes require migration strategy with fallback
- Test schema changes in NeonDB branch before main database

**Rationale**: Hackathon demo cannot afford downtime. NeonDB branching + Prisma's migration tools enable safe schema iteration.

### V. Five-Model Architecture (IMMUTABLE)

**Mandate**: Exactly 5 Prisma models MUST exist: User, Vault, VaultUser, Source, AuditLog. NO additional models in Phase 1-2.

**Rules**:
- **User**: Authentication identity, profile data
- **Vault**: Container for sources, owned by users
- **VaultUser**: Many-to-many join table with role field
- **Source**: PDF metadata, Cloudinary URL, vault association
- **AuditLog**: Immutable event log for all mutations

**Rationale**: Scope control for 48-hour hackathon. Five models cover MVP requirements while demonstrating relational design competency for judges.

### VI. Role-Based Access Control Format

**Mandate**: Role field in VaultUser MUST use string enum: "owner" | "contributor" | "viewer". NO numeric codes, NO booleans.

**Rules**:
- Role field type: `String` with `@default("viewer")`
- Validation at application layer MUST enforce enum values
- Role hierarchy: owner > contributor > viewer
- Role changes MUST trigger AuditLog entry

**Rationale**: String enums are human-readable in Prisma Studio, simplify debugging, and align with NextAuth.js role integration in Phase 3.

### VII. Global Unique Identifiers

**Mandate**: All model IDs MUST use `@default(cuid())` for collision-resistant, URL-safe identifiers.

**Rules**:
- Primary key format: `id String @id @default(cuid())`
- NO auto-increment integers
- NO UUIDs (cuid preferred for sortability)
- Foreign keys MUST reference cuid fields

**Rationale**: Cuid provides time-ordered IDs useful for debugging, avoids integer enumeration attacks, and works seamlessly across distributed systems.

### VIII. Cloudinary Integration Ready

**Mandate**: Source model MUST include `fileUrl` field prepared for Cloudinary PDF storage in Phase 2.

**Rules**:
- Field: `fileUrl String?` (stores Cloudinary public URL)
- Field: `fileKey String?` (optional Cloudinary public_id for deletion)
- Field: `fileSize Int?` (bytes, for quota tracking)
- Field: `mimeType String @default("application/pdf")`

**Rationale**: Phase 2 backend APIs will upload PDFs to Cloudinary. Schema must be ready to avoid migration during API development.

### Phase 2: Backend APIs (Principles IX-XIV)

### IX. Backend-First Architecture

**Mandate**: All API endpoints MUST be implemented and tested via Postman BEFORE any frontend UI development begins.

**Rules**:
- API routes MUST be in `src/app/api/` directory (Next.js App Router)
- Each endpoint MUST have corresponding Postman collection entry
- API contracts MUST be defined before implementation
- NO frontend components in Phase 2 (Tailwind CSS installed but unused)

**Rationale**: Backend-first approach ensures API stability, enables parallel frontend development in Phase 5, and allows independent testing without UI dependencies.

### X. Stateless API Design

**Mandate**: All Phase 2 APIs MUST be stateless. NO session management, NO cookies, NO JWT tokens in Phase 2.

**Rules**:
- Authentication via temporary mock headers: `x-user-id`, `x-user-role`
- NO NextAuth.js integration (deferred to Phase 3)
- NO server-side session storage
- Each request MUST be independently processable

**Rationale**: Stateless design simplifies Phase 2 testing, avoids premature authentication complexity, and ensures clean separation between backend logic (Phase 2) and auth system (Phase 3).

### XI. Request Validation with Zod

**Mandate**: All API request bodies and query parameters MUST be validated using Zod schemas before processing.

**Rules**:
- Define Zod schema for each endpoint's input
- Validation MUST occur before database operations
- Return 400 Bad Request with detailed error messages on validation failure
- Type inference from Zod schemas MUST be used for TypeScript types

**Rationale**: Zod provides runtime type safety, prevents invalid data from reaching database, generates clear error messages for API consumers, and integrates seamlessly with TypeScript.

### XII. Role-Based Middleware (Mock Authentication)

**Mandate**: All protected endpoints MUST enforce role-based access control via custom middleware using mock headers.

**Rules**:
- Middleware MUST read `x-user-id` and `x-user-role` headers
- Role hierarchy enforcement: owner > contributor > viewer
- Unauthorized requests MUST return 403 Forbidden
- Middleware MUST be reusable across all protected routes

**Rationale**: Mock authentication enables Phase 2 API testing without implementing full auth system. Middleware pattern ensures consistent authorization logic and easy replacement with NextAuth.js in Phase 3.

### XIII. Cloudinary PDF Upload API

**Mandate**: `/api/upload` endpoint MUST handle PDF uploads to Cloudinary and return signed URLs.

**Rules**:
- Accept multipart/form-data with PDF file
- Validate file type (application/pdf only)
- Upload to Cloudinary using official SDK
- Return Cloudinary URL, public_id, and file metadata
- Store metadata in Source model via Prisma

**Rationale**: Cloudinary provides reliable PDF storage with CDN delivery, transformation capabilities, and automatic optimization essential for document management system.

### XIV. Postman Testing Requirement

**Mandate**: Every API endpoint MUST have corresponding Postman test cases with example requests and expected responses.

**Rules**:
- Postman collection MUST be exported to `postman/` directory
- Each endpoint MUST have success case and error case tests
- Tests MUST verify response status codes, body structure, and data persistence
- Collection MUST include environment variables for base URL and mock headers

**Rationale**: Postman testing ensures API reliability, provides documentation for frontend developers, and enables independent verification without UI dependencies.

### Phase 3: Authentication & Role-Based Access Control (Principles XV-XX)

### XV. NextAuth.js Authentication Exclusively

**Mandate**: All authentication MUST use NextAuth.js v5 (next-auth@beta). NO custom JWT implementations, NO alternative auth libraries.

**Rules**:
- NextAuth.js configuration MUST be in `src/app/api/auth/[...nextauth]/route.ts`
- Credentials provider MUST be used for demo user authentication
- Session strategy MUST be JWT or database sessions (configurable)
- NO plaintext password storage (use bcrypt or similar for hashing)

**Rationale**: NextAuth.js provides production-ready authentication with session management, CSRF protection, and seamless Next.js App Router integration. It replaces Phase 2 mock headers with real authentication.

### XVI. Demo User Mandate

**Mandate**: Exactly 2 demo users MUST be seeded in the database for testing and demonstration purposes.

**Rules**:
- **Owner Demo User**: email `owner@demo.com`, role `owner`, password hashed
- **Contributor Demo User**: email `contributor@demo.com`, role `contributor`, password hashed
- Demo users MUST be created via Prisma seed script
- Demo passwords MUST be documented in `.env.example` (not committed to `.env`)
- NO viewer demo user required (can be added manually if needed)

**Rationale**: Demo users enable immediate testing without signup flow, demonstrate role hierarchy for judges, and provide consistent test data across environments.

### XVII. Session-Based API Protection

**Mandate**: All Phase 2 API endpoints MUST be updated to use NextAuth.js session extraction instead of mock headers.

**Rules**:
- Replace `x-user-id` and `x-user-role` header extraction with `getServerSession()`
- Middleware MUST verify session exists before processing requests
- Unauthenticated requests MUST return 401 Unauthorized
- Session MUST contain `user.id` and `user.role` fields
- Phase 2 permission matrix logic remains unchanged (reuse existing `checkPermission()`)

**Rationale**: Session-based authentication provides secure, stateful user identification. Replacing mock headers with sessions ensures production-ready security while maintaining Phase 2 API logic.

### XVIII. Login Page Requirement

**Mandate**: A minimal login page MUST be implemented at `/login` route for demo user authentication.

**Rules**:
- Login form MUST accept email and password inputs
- Form MUST use NextAuth.js `signIn()` client function
- Successful login MUST redirect to `/dashboard` (or root `/`)
- Failed login MUST display error message
- NO signup, password reset, or email verification in Phase 3
- Styling MUST use Tailwind CSS (minimal, functional design acceptable)

**Rationale**: Login page enables manual testing of authentication flow, demonstrates session creation, and provides entry point for role-based dashboard access in Phase 5.

### XIX. Role Badge Display (Optional)

**Mandate**: A role badge component MAY be implemented to display current user's role for testing purposes.

**Rules**:
- Badge MUST read role from NextAuth.js session
- Badge MUST display "Owner", "Contributor", or "Viewer"
- Badge placement: header, sidebar, or dashboard (developer choice)
- Badge is for testing/demo only, not a core feature requirement
- NO role switching UI (role is fixed per user)

**Rationale**: Role badge provides visual confirmation of authentication state during testing, helps judges understand role hierarchy, and aids debugging of role-based access control.

### XX. Postman Authentication Testing

**Mandate**: Phase 2 Postman collection MUST be updated to support session-based authentication testing.

**Rules**:
- Add login endpoint test: `POST /api/auth/callback/credentials`
- Extract session token/cookie from login response
- Include session token in subsequent API requests
- Test unauthorized access (no session) returns 401
- Test forbidden access (wrong role) returns 403
- Document session token setup in Postman environment

**Rationale**: Postman testing validates authentication integration, ensures Phase 2 APIs work with real sessions, and provides regression testing for role enforcement.

### Phase 4: Real-Time Socket.io Integration (Principles XXI-XXVI)

### XXI. Socket.io Server Exclusively

**Mandate**: All real-time communication MUST use Socket.io server and client libraries. NO native WebSockets, NO Server-Sent Events (SSE), NO alternative real-time libraries.

**Rules**:
- Socket.io server MUST be initialized in Next.js custom server or API route
- Socket.io client MUST be used for frontend connections
- Connection namespace: `/` (default) or custom namespaces per feature
- Transport protocol: WebSocket with polling fallback
- NO direct WebSocket API usage

**Rationale**: Socket.io provides automatic reconnection, fallback transports, room management, and event-based communication essential for reliable real-time features. It integrates seamlessly with Next.js and handles connection stability across network conditions.

### XXII. Vault-Specific Room Architecture

**Mandate**: Each Vault MUST have its own Socket.io room for isolated real-time communication. Users MUST join vault rooms based on their VaultUser membership.

**Rules**:
- Room naming convention: `vault:{vaultId}` (e.g., `vault:clx123abc`)
- Users join rooms only for vaults they have access to (verified via VaultUser table)
- Room membership MUST be validated on connection using NextAuth.js session
- Users automatically leave rooms on disconnect or session expiration
- NO global broadcast rooms (all events are vault-scoped)

**Rationale**: Vault-specific rooms ensure users only receive updates for vaults they have access to, maintaining security and reducing unnecessary network traffic. Room isolation prevents information leakage across vaults.

### XXIII. Session-Based Socket Authentication

**Mandate**: All Socket.io connections MUST authenticate using NextAuth.js session before joining any vault rooms.

**Rules**:
- Socket.io middleware MUST extract session from connection handshake
- Session validation MUST occur before `connection` event completes
- Unauthenticated connections MUST be rejected with error event
- Session MUST contain `user.id` and `user.role` for authorization
- Connection metadata MUST store `userId` for event attribution

**Rationale**: Session-based Socket.io authentication ensures only authenticated users can establish real-time connections, maintaining consistency with Phase 3 authentication model and preventing unauthorized access to vault updates.

### XXIV. Real-Time Source Event Propagation

**Mandate**: All Source mutations (create, update, delete) MUST emit Socket.io events to the vault room for immediate client updates.

**Rules**:
- Event naming convention: `source:created`, `source:updated`, `source:deleted`
- Event payload MUST include full Source object with metadata
- Events MUST be emitted AFTER successful database persistence
- Events MUST include actor information (`userId`, `userName`) for attribution
- NO events for failed operations (only successful mutations)

**Rationale**: Real-time source events enable immediate dashboard updates without polling, improving user experience and demonstrating live collaboration capabilities for hackathon judges.

### XXV. Role-Based Event Authorization

**Mandate**: Socket.io event handlers MUST enforce role-based access control using the same permission matrix from Phase 2/3.

**Rules**:
- Owner and contributor can emit mutation events (`source:create`, `source:update`)
- Viewer role can only listen to events (cannot emit mutations)
- Event handlers MUST call `checkPermission()` before processing
- Unauthorized event emissions MUST return error event to sender only
- Room membership MUST be re-validated on role changes

**Rationale**: Consistent role enforcement across REST APIs and Socket.io events maintains security model integrity and prevents privilege escalation through real-time channels.

### XXVI. Minimal Test UI for Real-Time Validation

**Mandate**: A minimal test page MUST be implemented to validate Socket.io functionality with multiple concurrent clients.

**Rules**:
- Test page route: `/test/realtime` or similar (not production dashboard)
- Page MUST display vault sources with live updates
- Page MUST show connection status and room membership
- Page MUST allow triggering source creation to test event propagation
- Test page is for validation only, NOT production UI (Phase 5)
- Styling: minimal Tailwind CSS (functional, not polished)

**Rationale**: Test UI enables manual validation of real-time features with multiple browser windows, demonstrates live updates for judges, and provides debugging interface without building full dashboard (deferred to Phase 5).

### Phase 5: Frontend Dashboard & Role-Based UI (Principles XXVII-XXXII)

### XXVII. shadcn/ui Component Library Exclusively

**Mandate**: All UI components MUST use shadcn/ui component library. NO alternative component libraries (Material-UI, Ant Design, Chakra UI, etc.) are permitted.

**Rules**:
- Components MUST be installed via shadcn/ui CLI: `npx shadcn-ui@latest add <component>`
- Components MUST be customized using Tailwind CSS utility classes
- NO direct installation of Radix UI primitives (use shadcn/ui wrappers)
- Required components: Table, Card, Button, Badge, Toast, Dialog, Form, Input
- Components MUST be stored in `src/components/ui/` directory

**Rationale**: shadcn/ui provides accessible, customizable components built on Radix UI primitives with Tailwind CSS styling. It offers copy-paste component code for full control while maintaining consistency and accessibility standards.

### XXVIII. Role-Based UI Rendering

**Mandate**: All dashboard UI components MUST dynamically adapt based on user role from NextAuth.js session. UI elements for unauthorized actions MUST be hidden or disabled.

**Rules**:
- Role detection MUST use `useSession()` hook or `getServerSession()` for server components
- Owner role: Display all CRUD controls (create, edit, delete, invite)
- Contributor role: Display add source controls, hide delete vault controls
- Viewer role: Display read-only interface, hide all mutation controls
- Unauthorized buttons MUST be removed from DOM (not just disabled)
- Role checks MUST occur on both client and server (defense in depth)

**Rationale**: Role-based UI prevents confusion by hiding unavailable actions, improves UX by showing only relevant controls, and maintains security by enforcing authorization at UI layer in addition to API layer.

### XXIX. Dashboard Layout with Sidebar Navigation

**Mandate**: Dashboard MUST use a sidebar navigation layout with role badge display and vault/source navigation.

**Rules**:
- Sidebar MUST display current user's role badge (Owner/Contributor/Viewer)
- Sidebar MUST include navigation links: Dashboard, Vaults, Settings (optional)
- Sidebar MUST be responsive (collapsible on mobile, persistent on desktop)
- Main content area MUST display vault list or vault detail pages
- Layout MUST use Next.js App Router layout.tsx pattern
- NO full-page reloads on navigation (use Next.js Link component)

**Rationale**: Sidebar navigation provides consistent navigation structure, displays user context (role badge), and enables efficient vault/source browsing without page reloads.

### XXX. DataTable for Source Management

**Mandate**: Vault detail page MUST display sources in a shadcn/ui DataTable component with sorting, filtering, and pagination.

**Rules**:
- DataTable MUST use shadcn/ui Table component with TanStack Table integration
- Columns: Title, File Size, Upload Date, Actions (role-based)
- Sorting MUST be enabled for all columns
- Filtering MUST support title search
- Pagination MUST display 10 sources per page by default
- Actions column MUST show role-appropriate buttons (view, delete for owner)
- Empty state MUST display helpful message when no sources exist

**Rationale**: DataTable provides professional source management interface, enables efficient browsing of large source lists, and demonstrates advanced UI component integration for hackathon judges.

### XXXI. Real-Time Toast Notifications

**Mandate**: All Socket.io events MUST trigger toast notifications using shadcn/ui Toast component to provide immediate user feedback.

**Rules**:
- Toast MUST appear for source:created, source:updated, source:deleted events
- Toast message format: "{Actor Name} added {Source Title}" or similar
- Toast duration: 3-5 seconds (auto-dismiss)
- Toast position: Bottom-right corner (consistent placement)
- Toast MUST include actor attribution from Socket.io event payload
- Multiple toasts MUST stack vertically (no overlap)

**Rationale**: Toast notifications provide immediate visual feedback for real-time events, demonstrate Socket.io integration in production UI, and improve user awareness of vault activity.

### XXXII. Minimal Frontend Logic (API-First)

**Mandate**: Frontend components MUST delegate all business logic to Phase 2 backend APIs. NO client-side data validation, NO client-side permission checks beyond UI rendering.

**Rules**:
- All data fetching MUST use Phase 2 API endpoints
- All mutations MUST call Phase 2 API routes (no direct Prisma access)
- Form validation MUST use Zod schemas matching backend validation
- Permission checks MUST be informational only (backend enforces)
- State management MUST use React hooks (useState, useEffect) or Context API
- NO Redux, Zustand, or complex state management libraries

**Rationale**: API-first approach ensures single source of truth for business logic, prevents client-server validation drift, and maintains security by enforcing authorization at API layer.

## Data Architecture Standards

### Relationship Patterns

**User ↔ VaultUser ↔ Vault** (Many-to-Many):
```prisma
model User {
  id         String      @id @default(cuid())
  vaultUsers VaultUser[]
}

model Vault {
  id         String      @id @default(cuid())
  vaultUsers VaultUser[]
  sources    Source[]
}

model VaultUser {
  id      String @id @default(cuid())
  userId  String
  vaultId String
  role    String @default("viewer")
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  vault   Vault  @relation(fields: [vaultId], references: [id], onDelete: Cascade)
  @@unique([userId, vaultId])
}
```

**Vault → Source** (One-to-Many):
```prisma
model Source {
  id      String @id @default(cuid())
  vaultId String
  vault   Vault  @relation(fields: [vaultId], references: [id], onDelete: Cascade)
}
```

**AuditLog** (Standalone, references via strings):
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  action    String   // "vault_created", "source_added", "role_changed"
  userId    String   // Actor
  vaultId   String?  // Affected resource ID
  details   Json?    // Additional context
  createdAt DateTime @default(now())
}
```

### Indexing Strategy

**Required Indexes**:
- `VaultUser.@@unique([userId, vaultId])` - Prevent duplicate memberships
- `VaultUser.@@index([vaultId])` - Fast vault member lookups
- `Source.@@index([vaultId])` - Fast vault source queries
- `AuditLog.@@index([userId, createdAt])` - User activity timeline

**Rationale**: Indexes optimize common queries (vault members, vault sources, user audit trail) critical for dashboard performance.

## API Architecture Standards

### Endpoint Structure

**Vault CRUD APIs**:
- `POST /api/vaults` - Create vault (requires owner role)
- `GET /api/vaults` - List user's vaults
- `GET /api/vaults/[id]` - Get vault details
- `PATCH /api/vaults/[id]` - Update vault (requires owner role)
- `DELETE /api/vaults/[id]` - Delete vault (requires owner role)

**Source CRUD APIs**:
- `POST /api/vaults/[id]/sources` - Add source to vault (requires contributor role)
- `GET /api/vaults/[id]/sources` - List vault sources
- `GET /api/sources/[id]` - Get source details
- `PATCH /api/sources/[id]` - Update source (requires contributor role)
- `DELETE /api/sources/[id]` - Delete source (requires contributor role)

**Upload API**:
- `POST /api/upload` - Upload PDF to Cloudinary (requires contributor role)

### Response Format

**Success Response**:
```typescript
{
  success: true,
  data: { /* resource object */ }
}
```

**Error Response**:
```typescript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND",
    message: "Human-readable error message",
    details?: { /* validation errors */ }
  }
}
```

### Temporary Authentication Model (Phase 2 - DEPRECATED in Phase 3)

**Note**: This authentication model is REPLACED by NextAuth.js session-based authentication in Phase 3. Mock headers are only used during Phase 2 development.

**Mock Headers**:
- `x-user-id`: String (cuid of authenticated user)
- `x-user-role`: "owner" | "contributor" | "viewer"

**Middleware Logic**:
```typescript
// Extract headers
const userId = headers.get('x-user-id');
const userRole = headers.get('x-user-role');

// Validate presence
if (!userId || !userRole) {
  return Response.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
}

// Validate role enum
if (!['owner', 'contributor', 'viewer'].includes(userRole)) {
  return Response.json({ success: false, error: { code: 'INVALID_ROLE' } }, { status: 400 });
}

// Attach to request context
request.user = { id: userId, role: userRole };
```

**Phase 3 Migration Path**: Replace mock headers with NextAuth.js session extraction. Middleware interface remains identical.

## NextAuth.js Configuration Standards

### Session Configuration

**JWT Strategy** (Recommended for Phase 3):
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials against database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (user && await bcrypt.compare(credentials.password, user.passwordHash)) {
          return { id: user.id, email: user.email, role: user.role };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Demo User Seed Script

**Prisma Seed** (`prisma/seed.ts`):
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create owner demo user
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {},
    create: {
      email: 'owner@demo.com',
      name: 'Demo Owner',
      passwordHash: ownerPassword,
      role: 'owner',
    },
  });

  // Create contributor demo user
  const contributorPassword = await bcrypt.hash('contributor123', 10);
  const contributor = await prisma.user.upsert({
    where: { email: 'contributor@demo.com' },
    update: {},
    create: {
      email: 'contributor@demo.com',
      name: 'Demo Contributor',
      passwordHash: contributorPassword,
      role: 'contributor',
    },
  });

  console.log({ owner, contributor });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Session Extraction Pattern

**API Route Protection**:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  // Extract session
  const session = await getServerSession(authOptions);

  if (!session) {
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }

  // Validate role
  if (!checkPermission(session.user.role, 'vault:read')) {
    return errorResponse('FORBIDDEN', 'Insufficient permissions', 403);
  }

  // Process request with session.user.id and session.user.role
  const vaults = await prisma.vault.findMany({
    where: {
      vaultUsers: {
        some: { userId: session.user.id }
      }
    }
  });

  return successResponse(vaults);
}
```

## Socket.io Configuration Standards

### Server Setup

**Next.js Custom Server with Socket.io**:
```typescript
// server.ts (custom Next.js server)
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { getServerSession } from 'next-auth';
import { authOptions } from './src/app/api/auth/[...nextauth]/route';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return next(new Error('UNAUTHORIZED'));
    }

    socket.data.userId = session.user.id;
    socket.data.userRole = session.user.role;
    socket.data.userEmail = session.user.email;
    next();
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    // Join vault rooms based on user access
    socket.on('vault:join', async (vaultId: string) => {
      // Verify user has access to vault
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

      socket.join(`vault:${vaultId}`);
      socket.emit('vault:joined', { vaultId, role: vaultUser.role });
    });

    // Leave vault room
    socket.on('vault:leave', (vaultId: string) => {
      socket.leave(`vault:${vaultId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
```

### Client Setup

**Socket.io Client Connection**:
```typescript
// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

### Real-Time Event Schema

**Source Created Event**:
```typescript
// Emitted by server after POST /api/vaults/[id]/sources
io.to(`vault:${vaultId}`).emit('source:created', {
  source: {
    id: 'clx123abc',
    title: 'Document.pdf',
    fileUrl: 'https://cloudinary.com/...',
    vaultId: 'clx456def',
    createdAt: '2026-02-15T10:30:00Z',
  },
  actor: {
    userId: 'clx789ghi',
    userName: 'Demo Owner',
    role: 'owner',
  },
  timestamp: '2026-02-15T10:30:00Z',
});
```

**Source Updated Event**:
```typescript
// Emitted by server after PATCH /api/sources/[id]
io.to(`vault:${vaultId}`).emit('source:updated', {
  source: {
    id: 'clx123abc',
    title: 'Updated Document.pdf',
    // ... full source object
  },
  actor: {
    userId: 'clx789ghi',
    userName: 'Demo Contributor',
    role: 'contributor',
  },
  timestamp: '2026-02-15T10:35:00Z',
});
```

**Source Deleted Event**:
```typescript
// Emitted by server after DELETE /api/sources/[id]
io.to(`vault:${vaultId}`).emit('source:deleted', {
  sourceId: 'clx123abc',
  vaultId: 'clx456def',
  actor: {
    userId: 'clx789ghi',
    userName: 'Demo Owner',
    role: 'owner',
  },
  timestamp: '2026-02-15T10:40:00Z',
});
```

**Contributor Joined Event** (Optional):
```typescript
// Emitted when new VaultUser is created
io.to(`vault:${vaultId}`).emit('contributor:joined', {
  user: {
    id: 'clx999jkl',
    email: 'newuser@demo.com',
    name: 'New User',
    role: 'contributor',
  },
  vaultId: 'clx456def',
  timestamp: '2026-02-15T10:45:00Z',
});
```

### API Integration Pattern

**Emit Events After Successful Mutations**:
```typescript
// src/app/api/vaults/[id]/sources/route.ts
import { getSocket } from '@/lib/socket';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  // ... validation and permission checks

  // Create source in database
  const source = await prisma.source.create({
    data: {
      title: validatedData.title,
      fileUrl: validatedData.fileUrl,
      vaultId: params.id,
    },
  });

  // Emit real-time event to vault room
  const io = getSocket();
  io.to(`vault:${params.id}`).emit('source:created', {
    source,
    actor: {
      userId: session.user.id,
      userName: session.user.name,
      role: session.user.role,
    },
    timestamp: new Date().toISOString(),
  });

  return successResponse(source);
}
```

## Quality Gates

### Phase 1 Completion Criteria (BLOCKING Phase 2)

All criteria MUST pass before Phase 2 backend development:

- [x] **Schema Validation**: `npx prisma validate` exits 0
- [x] **Migration Success**: `npx prisma db push` completes without errors
- [x] **Studio Verification**: `npx prisma studio` shows all 5 tables with correct relationships
- [x] **NeonDB Dashboard**: Live tables visible in NeonDB console with correct schema
- [x] **Client Generation**: `npx prisma generate` produces TypeScript types
- [ ] **Relationship Test**: Can create User → VaultUser → Vault → Source chain via Prisma Client
- [ ] **Transaction Test**: Can execute multi-step operation in `prisma.$transaction()`
- [ ] **Audit Log Test**: AuditLog entries created for sample mutations

### Phase 2 Completion Criteria (BLOCKING Phase 3)

All criteria MUST pass before Phase 3 authentication development:

- [x] **Cloudinary Upload**: `POST /api/upload` accepts PDF and returns Cloudinary URL
- [x] **Vault CRUD**: All 5 vault endpoints functional and tested via Postman
- [x] **Source CRUD**: All 3 source endpoints functional and tested via Postman
- [x] **Role Enforcement**: Middleware correctly blocks unauthorized requests (403)
- [x] **Validation**: Zod schemas reject invalid inputs with clear error messages
- [x] **Data Persistence**: All mutations persist to NeonDB and visible in Prisma Studio
- [x] **Postman Collection**: Complete collection exported with environment variables
- [x] **Transaction Integrity**: Multi-step operations (create vault + audit log) are atomic

### Phase 3 Completion Criteria (BLOCKING Phase 4)

All criteria MUST pass before Phase 4 real-time features development:

- [ ] **NextAuth.js Setup**: NextAuth.js configured with credentials provider
- [ ] **Demo Users**: Both demo users (owner@demo.com, contributor@demo.com) seeded in database
- [ ] **Password Hashing**: Demo user passwords hashed with bcrypt (not plaintext)
- [ ] **Login Page**: `/login` route functional with email/password form
- [ ] **Session Creation**: Successful login creates NextAuth.js session with user.id and user.role
- [ ] **Session Persistence**: Session persists across page refreshes and API requests
- [ ] **API Migration**: All Phase 2 endpoints updated to use `getServerSession()` instead of mock headers
- [ ] **Unauthorized Access**: Requests without session return 401 Unauthorized
- [ ] **Role Enforcement**: Session-based role checks return 403 Forbidden for insufficient permissions
- [ ] **Postman Auth**: Postman collection updated with session-based authentication tests
- [ ] **Logout**: User can sign out and session is destroyed
- [ ] **Role Badge**: (Optional) Role badge displays current user's role from session

### Phase 4 Completion Criteria (BLOCKING Phase 5)

All criteria MUST pass before Phase 5 frontend dashboard development:

- [X] **Socket.io Server**: Socket.io server initialized with Next.js custom server or API route
- [X] **Session Authentication**: Socket.io connections authenticate using NextAuth.js session
- [X] **Vault Rooms**: Users can join vault-specific rooms based on VaultUser membership
- [X] **Room Authorization**: Unauthorized vault join attempts are rejected with error event
- [X] **Source Created Event**: POST /api/vaults/[id]/sources emits `source:created` to vault room
- [ ] **Source Updated Event**: PATCH /api/sources/[id] emits `source:updated` to vault room (SKIPPED: No PATCH handler)
- [X] **Source Deleted Event**: DELETE /api/sources/[id] emits `source:deleted` to vault room
- [X] **Real-Time Propagation**: Multiple connected clients receive events immediately (< 100ms)
- [X] **Role Enforcement**: Viewer role cannot emit mutation events (only listen)
- [X] **Connection Stability**: Socket.io reconnects automatically after network interruption
- [X] **Test UI**: Minimal test page demonstrates real-time updates with multiple browser windows
- [X] **Event Attribution**: All events include actor information (userId, userName, role)

### Phase 5 Completion Criteria (BLOCKING Phase 6)

All criteria MUST pass before Phase 6 polish and deployment:

- [ ] **shadcn/ui Setup**: shadcn/ui components installed (Table, Card, Button, Badge, Toast, Dialog, Form, Input)
- [ ] **Dashboard Layout**: Sidebar navigation with role badge and main content area functional
- [ ] **Vault List Page**: Displays all accessible vaults for current user with role-appropriate actions
- [ ] **Vault Detail Page**: Shows vault information and sources in DataTable component
- [ ] **Source DataTable**: Table displays sources with sorting, filtering, pagination
- [ ] **Role-Based UI**: Owner sees all controls, contributor sees add controls, viewer sees read-only
- [ ] **Upload Form**: Source upload form integrates with Phase 2 Cloudinary API
- [ ] **Real-Time Toasts**: Socket.io events trigger toast notifications with actor attribution
- [ ] **API Integration**: All data fetched from Phase 2 APIs (no direct database access)
- [ ] **Session Integration**: Dashboard reads user role from NextAuth.js session
- [ ] **Responsive Design**: Dashboard layout works on desktop and mobile screen sizes
- [ ] **Error Handling**: API errors display user-friendly messages (not raw error objects)
- [ ] **Loading States**: Loading indicators shown during API requests
- [ ] **Empty States**: Helpful messages displayed when no vaults or sources exist

### Forbidden Patterns

**PROHIBITED** (will fail code review):
- Direct SQL queries (except approved analytics)
- Multiple database connections
- Schema changes without Prisma migration
- Missing foreign key constraints
- Nullable required fields (id, createdAt, userId, vaultId)
- Cascade delete on User (must be Cascade on VaultUser/Source)
- **Phase 2 specific**:
  - NextAuth.js integration (deferred to Phase 3)
  - Frontend UI components (deferred to Phase 5)
  - Socket.io or WebSocket connections (deferred to Phase 4)
  - Session storage or cookies
  - JWT token generation
  - Unvalidated request inputs
  - Endpoints without Postman tests
- **Phase 3 specific**:
  - Custom JWT implementations (use NextAuth.js only)
  - Plaintext password storage (must use bcrypt or similar)
  - Mock header authentication in production code (Phase 2 only)
  - Session storage without CSRF protection
  - Alternative auth libraries (Auth0, Clerk, Supabase Auth)
  - Signup/registration flows (demo users only)
  - Password reset functionality (out of scope)
  - Email verification (out of scope)
  - OAuth providers (Google, GitHub, etc. - out of scope)
- **Phase 4 specific**:
  - Native WebSocket API usage (use Socket.io only)
  - Server-Sent Events (SSE) for real-time features
  - Alternative real-time libraries (Pusher, Ably, Firebase Realtime)
  - Unauthenticated Socket.io connections
  - Global broadcast rooms (all events must be vault-scoped)
  - Real-time events without actor attribution
  - Event emissions before database persistence
  - Polling-based updates (use Socket.io push events)
  - Production dashboard UI (deferred to Phase 5)
- **Phase 5 specific**:
  - Alternative component libraries (Material-UI, Ant Design, Chakra UI, Headless UI)
  - Direct Radix UI primitive installation (use shadcn/ui wrappers)
  - Client-side Prisma access (use Phase 2 APIs only)
  - Complex state management libraries (Redux, Zustand, MobX)
  - Client-side business logic (delegate to backend APIs)
  - Hardcoded role checks without session validation
  - Inline styles or CSS modules (use Tailwind CSS only)
  - Custom toast implementations (use shadcn/ui Toast)
  - Server-side rendering without proper session handling
  - Direct database queries from frontend components

## Constraints

### Technology Stack (IMMUTABLE)

**Phase 1 (Database)**:
- **Database**: NeonDB PostgreSQL serverless ONLY
- **ORM**: Prisma 5.x+ ONLY
- **Runtime**: Node.js 18+ (for Prisma compatibility)
- **Type System**: TypeScript 5.x+ (for Prisma Client types)

**Phase 2 (Backend APIs)**:
- **Framework**: Next.js 14+ App Router ONLY
- **Validation**: Zod ONLY
- **File Upload**: Cloudinary SDK ONLY
- **Styling**: Tailwind CSS (installed, not used in Phase 2)
- **Testing**: Postman ONLY (no automated tests in Phase 2)

**Phase 3 (Authentication)**:
- **Auth Library**: NextAuth.js v5 (next-auth@beta) ONLY
- **Password Hashing**: bcryptjs or bcrypt ONLY
- **Session Strategy**: JWT or database sessions (NextAuth.js managed)
- **UI Framework**: Tailwind CSS for login page styling
- **Testing**: Postman with session-based authentication

**Phase 4 (Real-Time)**:
- **Real-Time Library**: Socket.io (server and client) ONLY
- **Server**: Next.js custom server with Socket.io integration
- **Transport**: WebSocket with polling fallback
- **Authentication**: NextAuth.js session-based Socket.io middleware
- **Testing**: Manual multi-client browser testing with minimal test UI

**Phase 5 (Frontend Dashboard)**:
- **Component Library**: shadcn/ui ONLY
- **UI Primitives**: Radix UI (via shadcn/ui wrappers)
- **Styling**: Tailwind CSS ONLY
- **State Management**: React hooks (useState, useEffect) and Context API
- **Data Fetching**: Phase 2 REST APIs (fetch or axios)
- **Real-Time Integration**: Socket.io client with toast notifications
- **Form Validation**: Zod schemas (matching backend validation)
- **Testing**: Manual browser testing with multiple user roles

### Scope Boundaries

**In Scope (Phase 1 - COMPLETE)**:
- Prisma schema definition
- NeonDB connection configuration
- Database migrations
- Prisma Client generation
- Basic relationship validation

**In Scope (Phase 2 - COMPLETE)**:
- Next.js App Router API routes
- Cloudinary PDF upload endpoint
- Vault CRUD endpoints
- Source CRUD endpoints
- Zod request validation
- Role-based middleware (mock headers)
- Postman testing
- Data persistence verification

**In Scope (Phase 3 - CURRENT)**:
- NextAuth.js v5 integration
- Credentials provider configuration
- Demo user database seeding
- Password hashing with bcrypt
- Login page UI with Tailwind CSS
- Session-based authentication
- API migration from mock headers to sessions
- Role badge component (optional)
- Postman authentication testing
- Session persistence verification

**In Scope (Phase 4 - COMPLETE)**:
- Socket.io server setup with Next.js custom server
- Session-based Socket.io authentication middleware
- Vault-specific room architecture
- Real-time source event propagation (create, update, delete)
- Role-based Socket.io event authorization
- Client Socket.io connection management
- Minimal test UI for real-time validation
- Multi-client testing with browser windows
- Event attribution with actor information
- Automatic reconnection handling

**In Scope (Phase 5 - CURRENT)**:
- shadcn/ui component library setup and configuration
- Dashboard layout with sidebar navigation
- Role badge display from NextAuth.js session
- Vault list page with role-based actions
- Vault detail page with source DataTable
- Source upload form with Cloudinary integration
- Role-based UI component rendering (owner/contributor/viewer)
- Real-time toast notifications for Socket.io events
- API integration with Phase 2 backend endpoints
- Responsive design for desktop and mobile
- Loading states and error handling
- Empty states for vaults and sources

**Out of Scope (Phase 5)**:
- Backend API development (Phase 2 complete)
- Authentication system changes (Phase 3 complete)
- Socket.io server logic (Phase 4 complete)
- User signup/registration flows
- Password reset functionality
- Profile editing or account management
- Member invitation workflow (UI only, no backend)
- Advanced data visualization or analytics
- File preview or annotation features
- Drag-drop file upload (use standard form upload)
- Audit log viewer UI
- Rate limiting UI indicators
- README/demo polish (Phase 6)
- Deployment configuration (Phase 6)

**Out of Scope (Phase 3)**:
- User signup/registration flows
- Password reset functionality
- Email verification
- OAuth providers (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- Account management UI
- Profile editing
- Socket.io or real-time updates (Phase 4)
- Frontend dashboard pages beyond login (Phase 5)
- Toast notifications (Phase 5)
- Invite/member management UI (Phase 5)
- README/demo polish (Phase 6)
- Deployment configuration (Phase 6)

### Performance Targets

**Phase 1**:
- Schema migration: < 5 seconds
- Prisma Client generation: < 10 seconds
- Studio startup: < 3 seconds
- Connection pool: 10 connections minimum

**Phase 2**:
- API response time: < 200ms p95 (excluding Cloudinary upload)
- Cloudinary upload: < 5 seconds for 10MB PDF
- Concurrent requests: 50 requests/second minimum
- Database query time: < 50ms p95

**Phase 3**:
- Login request: < 300ms p95 (includes password hashing)
- Session creation: < 100ms p95
- Session validation: < 50ms p95 (JWT decode or database lookup)
- API requests with session: < 250ms p95 (includes session extraction)
- Password hashing: bcrypt rounds = 10 (balance security and performance)

**Phase 4**:
- Socket.io connection establishment: < 500ms p95 (includes session validation)
- Event propagation latency: < 100ms p95 (server emit to client receive)
- Room join/leave operations: < 50ms p95
- Concurrent connections: 100+ simultaneous users per vault
- Event throughput: 1000+ events/second across all vaults
- Reconnection time: < 2 seconds after network interruption
- Memory per connection: < 10MB server-side

**Phase 5**:
- Initial page load (dashboard): < 2 seconds p95 (includes session validation)
- Vault list rendering: < 500ms p95 (for 50 vaults)
- Source DataTable rendering: < 300ms p95 (for 100 sources)
- API data fetching: < 200ms p95 (reuses Phase 2 API performance)
- Toast notification display: < 50ms (after Socket.io event received)
- Form submission: < 300ms p95 (includes API call and UI update)
- Client-side navigation: < 100ms (Next.js Link transitions)
- Responsive layout reflow: < 16ms (60fps smooth transitions)
- Memory footprint: < 50MB client-side (including Socket.io connection)

## Governance

### Amendment Process

1. Propose change via GitHub issue with rationale
2. Validate impact on dependent phases (2-6)
3. Update constitution with version bump
4. Regenerate Prisma Client if schema affected
5. Update all dependent templates and documentation

### Version Semantics

- **MAJOR**: Breaking schema changes (field removal, type change) or principle removal
- **MINOR**: Additive schema changes (new model, new field) or new principles
- **PATCH**: Documentation, clarifications, non-schema updates

### Compliance Verification

- All PRs MUST pass `npx prisma validate`
- All schema changes MUST include migration test
- All new models MUST have corresponding AuditLog actions
- All API endpoints MUST have Postman tests
- Constitution violations MUST be justified in PR description or rejected

### Runtime Guidance

For development workflow and agent-specific instructions, see `CLAUDE.md` in repository root.

**Version**: 1.4.0 | **Ratified**: 2026-02-15 | **Last Amended**: 2026-02-15
