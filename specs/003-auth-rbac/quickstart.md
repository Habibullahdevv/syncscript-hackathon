# Quickstart Guide: Phase 3 - Authentication & Role-Based Access Control

**Date**: 2026-02-15
**Feature**: 003-auth-rbac
**Purpose**: Quick setup and testing guide for NextAuth.js authentication

## Prerequisites

- Phase 1 complete: NeonDB database with User table
- Phase 2 complete: All 11 API endpoints functional
- Node.js 18+ installed
- Next.js 15/16 project running

## Environment Setup

### 1. Install Dependencies

```bash
npm install next-auth@beta bcryptjs
npm install --save-dev @types/bcryptjs
```

### 2. Configure Environment Variables

Add to `.env` (create if doesn't exist):

```env
# Database (existing from Phase 1)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Demo User Passwords (for reference only, not used in code)
# owner@demo.com password: owner123
# contributor@demo.com password: contributor123
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

### 3. Update `.env.example`

Add to `.env.example` (for documentation):

```env
# NextAuth.js Configuration
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Demo User Credentials (for testing)
# Email: owner@demo.com | Password: owner123 | Role: owner
# Email: contributor@demo.com | Password: contributor123 | Role: contributor
```

## Database Setup

### Seed Demo Users

Run the Prisma seed script to create demo users:

```bash
npx prisma db seed
```

**Expected Output**:
```
{
  owner: {
    id: 'clrx1y2z3000008l5a1b2c3d4',
    email: 'owner@demo.com',
    name: 'Demo Owner',
    role: 'owner',
    ...
  },
  contributor: {
    id: 'clrx1y2z3000108l5a1b2c3d5',
    email: 'contributor@demo.com',
    name: 'Demo Contributor',
    role: 'contributor',
    ...
  }
}
```

**Verify in Database**:
```bash
npx prisma studio
```

Navigate to User table and confirm:
- 2 users exist (owner@demo.com, contributor@demo.com)
- Passwords are hashed (start with `$2a$10$`)
- Roles are set correctly

## Development Server

### Start Next.js Server

```bash
npm run dev
```

Server should start at `http://localhost:3000`

### Verify NextAuth.js Routes

Check that authentication endpoints are accessible:

```bash
# Get CSRF token
curl http://localhost:3000/api/auth/csrf

# Get providers
curl http://localhost:3000/api/auth/providers

# Get session (should return empty object if not logged in)
curl http://localhost:3000/api/auth/session
```

## Testing Authentication

### 1. Browser Testing

#### Login Flow

1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - **Owner**: email `owner@demo.com`, password `owner123`
   - **Contributor**: email `contributor@demo.com`, password `contributor123`
3. Click "Sign In"
4. Should redirect to `/dashboard`
5. Verify role badge displays correct role

#### Session Persistence

1. Refresh the page
2. Session should persist (still logged in)
3. Check browser cookies: `next-auth.session-token` should exist

#### Logout Flow

1. Click "Logout" button on dashboard
2. Should redirect to `/login`
3. Session cookie should be cleared
4. Attempting to access `/dashboard` should redirect to `/login`

### 2. Postman Testing

#### Setup Postman Collection

1. Import `postman/backend-apis.postman_collection.json`
2. Import `postman/backend-apis.postman_environment.json`
3. Set environment to "Backend APIs"

#### Login Request

**Request**: POST `/api/auth/callback/credentials`

**Headers**:
```
Content-Type: application/x-www-form-urlencoded
```

**Body** (x-www-form-urlencoded):
```
email: owner@demo.com
password: owner123
json: true
```

**Expected Response** (200 OK):
```json
{
  "url": "/dashboard"
}
```

**Cookie Extraction**:
Postman automatically stores cookies. Check "Cookies" tab to see `next-auth.session-token`.

#### Test API Endpoints with Session

**Request**: GET `/api/vaults`

**Headers**: (Cookies automatically included by Postman)

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": [],
  "error": null
}
```

#### Test Unauthorized Access

1. Clear cookies in Postman (Cookies tab → Remove all)
2. Send GET `/api/vaults` request
3. **Expected Response** (401 Unauthorized):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### Test Forbidden Access

1. Login as contributor (contributor@demo.com)
2. Send DELETE `/api/vaults/[id]` request (owner-only action)
3. **Expected Response** (403 Forbidden):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

## Demo User Credentials

### Owner Account

- **Email**: `owner@demo.com`
- **Password**: `owner123`
- **Role**: `owner`
- **Permissions**: Full access (create, read, update, delete vaults and sources)

### Contributor Account

- **Email**: `contributor@demo.com`
- **Password**: `contributor123`
- **Role**: `contributor`
- **Permissions**: Read vaults, create/read sources (cannot delete vaults)

## Common Issues & Troubleshooting

### Issue: "Invalid credentials" on login

**Cause**: Demo users not seeded or incorrect password

**Solution**:
```bash
# Re-run seed script
npx prisma db seed

# Verify users exist
npx prisma studio
```

### Issue: "NEXTAUTH_SECRET not set" error

**Cause**: Missing or invalid NEXTAUTH_SECRET environment variable

**Solution**:
```bash
# Generate new secret
openssl rand -base64 32

# Add to .env
echo 'NEXTAUTH_SECRET="your-generated-secret"' >> .env

# Restart dev server
npm run dev
```

### Issue: Session not persisting across requests

**Cause**: Cookie not being sent or NEXTAUTH_URL mismatch

**Solution**:
1. Check NEXTAUTH_URL matches your server URL
2. Verify cookies are enabled in browser
3. Check browser console for cookie errors
4. Ensure HTTP-only cookies are allowed

### Issue: API returns 401 even with valid session

**Cause**: Session validation failing or authOptions not imported correctly

**Solution**:
1. Verify `getServerSession(authOptions)` is called in API route
2. Check authOptions is exported from `[...nextauth]/route.ts`
3. Verify JWT secret matches NEXTAUTH_SECRET
4. Check session hasn't expired (24-hour limit)

### Issue: Postman not sending cookies

**Cause**: Cookie jar disabled or cookies not stored

**Solution**:
1. Enable cookie jar in Postman settings
2. Check "Cookies" tab after login request
3. Manually add cookie header if needed:
   ```
   Cookie: next-auth.session-token=<token-value>
   ```

## API Endpoint Summary

### Authentication Endpoints (NextAuth.js)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/callback/credentials` | Login with email/password |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/signout` | Logout and destroy session |
| GET | `/api/auth/csrf` | Get CSRF token |
| GET | `/api/auth/providers` | List auth providers |

### Protected API Endpoints (Phase 2)

All Phase 2 endpoints now require valid session:

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| POST | `/api/vaults` | owner | Create vault |
| GET | `/api/vaults` | any | List user's vaults |
| GET | `/api/vaults/[id]` | any | Get vault details |
| PATCH | `/api/vaults/[id]` | owner/contributor | Update vault |
| DELETE | `/api/vaults/[id]` | owner | Delete vault |
| POST | `/api/vaults/[id]/sources` | owner/contributor | Add source |
| GET | `/api/vaults/[id]/sources` | any | List sources |
| DELETE | `/api/vaults/[id]/sources/[sourceId]` | owner | Delete source |
| POST | `/api/upload` | owner/contributor | Upload PDF |

## Performance Benchmarks

### Expected Performance

- **Login**: < 5 seconds (includes bcrypt hashing)
- **Session Validation**: < 50ms (JWT verification)
- **API Request with Session**: < 250ms (includes session + business logic)

### Measuring Performance

**Browser DevTools**:
1. Open Network tab
2. Login and observe timing
3. Check "Timing" tab for each request

**Postman**:
1. Check response time in bottom-right corner
2. Should see < 500ms for most requests

## Next Steps

After completing Phase 3 setup:

1. ✅ Verify all demo users can login
2. ✅ Test all 11 API endpoints with session authentication
3. ✅ Confirm role-based access control works (401/403 responses)
4. ✅ Update Postman collection with session-based tests
5. ⏭️ Proceed to Phase 4: Real-time features (Socket.io)

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js v5 Migration Guide](https://authjs.dev/guides/upgrade-to-v5)
- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Prisma Seeding Guide](https://www.prisma.io/docs/guides/database/seed-database)

## Support

For issues or questions:
1. Check constitution: `.specify/memory/constitution.md` (Principles XV-XX)
2. Review specification: `specs/003-auth-rbac/spec.md`
3. Check implementation plan: `specs/003-auth-rbac/plan.md`
4. Review research findings: `specs/003-auth-rbac/research.md`
