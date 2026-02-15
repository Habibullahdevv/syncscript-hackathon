# Research: Phase 3 - Authentication & Role-Based Access Control

**Date**: 2026-02-15
**Feature**: 003-auth-rbac
**Purpose**: Resolve technical unknowns and establish implementation patterns for NextAuth.js integration

## Research Tasks

### 1. NextAuth.js v5 App Router Integration Patterns

**Question**: How to configure NextAuth.js v5 (beta) with Next.js 15/16 App Router?

**Findings**:
- NextAuth.js v5 uses route handlers in App Router: `src/app/api/auth/[...nextauth]/route.ts`
- Configuration exported as `authOptions` object, then passed to `NextAuth()` function
- Route handler exports both GET and POST handlers: `export { handler as GET, handler as POST }`
- Session extraction in server components: `import { getServerSession } from "next-auth"`
- Client-side authentication: `import { signIn, signOut } from "next-auth/react"`

**Implementation Pattern**:
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

**Decision**: Use NextAuth.js v5 with App Router route handlers, JWT session strategy, and credentials provider.

---

### 2. Bcrypt Password Hashing Best Practices

**Question**: What are the recommended bcrypt settings for demo user password hashing?

**Findings**:
- **Salt Rounds**: 10 rounds is the recommended default (balances security and performance)
- **Auto-salting**: bcrypt automatically generates and stores salt with hash
- **Hashing Time**: ~100ms for 10 rounds on modern hardware
- **Comparison**: Use `bcrypt.compare(plaintext, hash)` for validation (constant-time comparison)
- **Storage**: Store hash directly in database (includes salt and algorithm version)

**Implementation Pattern**:
```typescript
// Hashing (seed script)
import bcrypt from 'bcryptjs';

const passwordHash = await bcrypt.hash('plaintext-password', 10);
// Result: $2a$10$... (60 characters)

// Validation (NextAuth.js authorize)
const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
```

**Performance Impact**:
- Hashing: ~100ms per password (acceptable for login)
- Comparison: ~100ms per attempt (acceptable for authentication)
- Total login time: ~200ms for bcrypt operations (well within 5-second target)

**Decision**: Use bcrypt with 10 rounds for demo user passwords. Hash during seed script, compare during login.

---

### 3. JWT Session Configuration in NextAuth.js

**Question**: How to configure JWT sessions with custom user data (id, role)?

**Findings**:
- **Session Strategy**: Set `session.strategy = "jwt"` in authOptions
- **JWT Callback**: Runs when JWT is created/updated, adds custom data to token
- **Session Callback**: Runs when session is accessed, adds token data to session object
- **Token Structure**: JWT contains user data, signed with NEXTAUTH_SECRET
- **Expiry**: Set via `session.maxAge` (seconds)

**Implementation Pattern**:
```typescript
callbacks: {
  async jwt({ token, user }) {
    // On sign-in, user object is available
    if (user) {
      token.id = user.id;
      token.role = user.role;
    }
    return token;
  },
  async session({ session, token }) {
    // Add token data to session object
    session.user.id = token.id;
    session.user.role = token.role;
    return session;
  }
}
```

**Session Access Pattern**:
```typescript
// In API routes
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const session = await getServerSession(authOptions);
// session.user.id and session.user.role available
```

**Decision**: Use JWT sessions with custom callbacks to include user ID and role. 24-hour expiry.

---

### 4. Postman Cookie Extraction from NextAuth.js Responses

**Question**: How to extract and use NextAuth.js session cookies in Postman?

**Findings**:
- **Cookie Name**: NextAuth.js uses `next-auth.session-token` (or `__Secure-next-auth.session-token` in production)
- **HTTP-Only**: Cookies are HTTP-only by default (secure, but requires manual extraction in Postman)
- **Extraction Method**: Use Postman's built-in cookie management or extract from `Set-Cookie` header
- **Storage**: Store cookie in Postman environment variable for reuse

**Implementation Pattern**:

**Option 1: Postman Cookie Jar (Automatic)**
- Postman automatically stores cookies from responses
- Cookies are sent with subsequent requests to the same domain
- No manual extraction needed

**Option 2: Manual Extraction (More Control)**
```javascript
// Postman Tests tab (after login request)
const setCookieHeader = pm.response.headers.get('Set-Cookie');
if (setCookieHeader) {
  const sessionToken = setCookieHeader.match(/next-auth\.session-token=([^;]+)/);
  if (sessionToken) {
    pm.environment.set('session_token', sessionToken[1]);
  }
}

// Subsequent requests: Add cookie header
// Headers tab: Cookie: next-auth.session-token={{session_token}}
```

**Decision**: Use Postman's automatic cookie jar for simplicity. Document manual extraction as fallback.

---

### 5. Next.js App Router Authentication Middleware Patterns

**Question**: What are the best patterns for protecting API routes with authentication in Next.js App Router?

**Findings**:

**Pattern 1: Global Middleware (middleware.ts)**
- Pros: Automatic enforcement, single source of truth
- Cons: Applies to all routes, requires exceptions, harder to customize

**Pattern 2: Per-Route Session Check**
- Pros: Explicit, easy to debug, flexible per-route
- Cons: Code duplication, easy to forget

**Pattern 3: Shared Helper Function**
- Pros: Reusable, explicit, no global side effects
- Cons: Must be called in every route

**Recommended Pattern**: Shared Helper Function

```typescript
// src/lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  return {
    userId: session.user.id,
    role: session.user.role,
    email: session.user.email
  };
}

// Usage in API routes
export async function GET(request: NextRequest) {
  try {
    const { userId, role } = await requireAuth();

    // Check permissions
    if (!checkPermission(role, 'vault:read')) {
      return errorResponse('FORBIDDEN', 'Insufficient permissions', 403);
    }

    // Process request
    const vaults = await prisma.vault.findMany({
      where: { vaultUsers: { some: { userId } } }
    });

    return successResponse(vaults);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }
    throw error;
  }
}
```

**Decision**: Use shared `requireAuth()` helper function for explicit, reusable authentication checks.

---

## Summary of Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| NextAuth.js Version | v5 (beta) with App Router | Constitution requirement, modern Next.js integration |
| Session Strategy | JWT (stateless) | No database queries, scales horizontally, avoids 6th model |
| Password Hashing | bcrypt with 10 rounds | Constitution requirement, security best practices |
| Middleware Pattern | Shared helper function | Explicit, reusable, no global side effects |
| Postman Testing | Automatic cookie jar | Simpler setup, maintains security (HTTP-only cookies) |

## Implementation Readiness

All technical unknowns resolved. Ready to proceed to Phase 1 (Design & Contracts).

**Key Takeaways**:
1. NextAuth.js v5 App Router integration is straightforward with route handlers
2. Bcrypt 10 rounds provides good security/performance balance (~100ms)
3. JWT sessions avoid database queries and additional models
4. Shared helper function provides explicit, reusable authentication
5. Postman cookie jar handles NextAuth.js cookies automatically

**No Blockers**: All research complete, implementation patterns established.
