# API Integration Contracts: Phase 2 Backend APIs

**Feature**: Phase 5 - Frontend Dashboard & Role-Based UI
**Date**: 2026-02-15
**Status**: Complete

## Overview

This document specifies how Phase 5 frontend integrates with Phase 2 backend APIs. All API calls use native fetch() wrapped in custom client functions for consistent error handling.

## API Client Architecture

### Base Configuration

**Location**: `src/lib/api.ts`

**Base URL**: `/api` (relative, same origin)

**Headers**:
```typescript
{
  'Content-Type': 'application/json',
  'credentials': 'include' // Include session cookies
}
```

**Error Handling**:
```typescript
interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
}
```

---

## API Endpoints

### 1. Get Vault List

**Endpoint**: `GET /api/vaults`

**Purpose**: Fetch all vaults accessible to authenticated user

**Authentication**: Required (NextAuth.js session)

**Authorization**: User must be authenticated

**Request**:
```typescript
// No request body
```

**Response**:
```typescript
interface GetVaultsResponse {
  vaults: Vault[];
}

interface Vault {
  id: string;
  title: string;
  description: string;
  sourceCount: number;
  userRole: 'owner' | 'contributor' | 'viewer';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

**Client Function**:
```typescript
export async function getVaults(): Promise<Vault[]> {
  const response = await fetch('/api/vaults', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await handleResponse<GetVaultsResponse>(response);
  return data.vaults;
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated → Redirect to login
- `500 Internal Server Error`: Database error → Display error message

**Usage**:
```typescript
// In use-vaults.ts hook
const { data: vaults, error, isLoading } = useQuery({
  queryKey: ['vaults'],
  queryFn: getVaults,
});
```

---

### 2. Get Vault Detail

**Endpoint**: `GET /api/vaults/:id`

**Purpose**: Fetch single vault details with metadata

**Authentication**: Required (NextAuth.js session)

**Authorization**: User must have access to vault (owner/contributor/viewer)

**Request**:
```typescript
// URL parameter: vaultId
```

**Response**:
```typescript
interface GetVaultResponse {
  vault: {
    id: string;
    title: string;
    description: string;
    sourceCount: number;
    userRole: 'owner' | 'contributor' | 'viewer';
    createdAt: string;
    updatedAt: string;
  };
}
```

**Client Function**:
```typescript
export async function getVault(vaultId: string): Promise<Vault> {
  const response = await fetch(`/api/vaults/${vaultId}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await handleResponse<GetVaultResponse>(response);
  return data.vault;
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated → Redirect to login
- `403 Forbidden`: User does not have access → Display "Access Denied"
- `404 Not Found`: Vault does not exist → Display "Vault not found"
- `500 Internal Server Error`: Database error → Display error message

**Usage**:
```typescript
// In vault detail page
const vault = await getVault(params.id);
```

---

### 3. Get Source List

**Endpoint**: `GET /api/vaults/:id/sources`

**Purpose**: Fetch all sources within a vault

**Authentication**: Required (NextAuth.js session)

**Authorization**: User must have access to vault (owner/contributor/viewer)

**Request**:
```typescript
// URL parameter: vaultId
```

**Response**:
```typescript
interface GetSourcesResponse {
  sources: Source[];
}

interface Source {
  id: string;
  vaultId: string;
  title: string;
  fileUrl: string; // Cloudinary URL
  fileSize: number; // bytes
  uploadedBy: string; // user email
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

**Client Function**:
```typescript
export async function getSources(vaultId: string): Promise<Source[]> {
  const response = await fetch(`/api/vaults/${vaultId}/sources`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await handleResponse<GetSourcesResponse>(response);
  return data.sources;
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated → Redirect to login
- `403 Forbidden`: User does not have access → Display "Access Denied"
- `404 Not Found`: Vault does not exist → Display "Vault not found"
- `500 Internal Server Error`: Database error → Display error message

**Usage**:
```typescript
// In use-sources.ts hook
const { data: sources, error, isLoading } = useQuery({
  queryKey: ['sources', vaultId],
  queryFn: () => getSources(vaultId),
});
```

---

### 4. Upload Source

**Endpoint**: `POST /api/vaults/:id/sources`

**Purpose**: Upload PDF source to vault

**Authentication**: Required (NextAuth.js session)

**Authorization**: User must be owner or contributor

**Request**:
```typescript
// Content-Type: multipart/form-data
interface UploadSourceRequest {
  file: File; // PDF file
  title: string; // Source title
}
```

**Response**:
```typescript
interface UploadSourceResponse {
  source: {
    id: string;
    vaultId: string;
    title: string;
    fileUrl: string;
    fileSize: number;
    uploadedBy: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Client Function**:
```typescript
export async function uploadSource(
  vaultId: string,
  file: File,
  title: string
): Promise<Source> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);

  const response = await fetch(`/api/vaults/${vaultId}/sources`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // Note: Do NOT set Content-Type header, browser sets it with boundary
  });

  const data = await handleResponse<UploadSourceResponse>(response);
  return data.source;
}
```

**Error Responses**:
- `400 Bad Request`: Invalid file type or missing title → Display validation error
- `401 Unauthorized`: User not authenticated → Redirect to login
- `403 Forbidden`: User is viewer (no upload permission) → Display "Access Denied"
- `404 Not Found`: Vault does not exist → Display "Vault not found"
- `413 Payload Too Large`: File size exceeds limit → Display "File too large"
- `500 Internal Server Error`: Upload failed → Display error message

**Validation Rules** (client-side before API call):
- File type must be `application/pdf`
- File size must be <= 10MB
- Title must be non-empty string (1-255 characters)

**Usage**:
```typescript
// In UploadForm component
const handleSubmit = async (data: { file: File; title: string }) => {
  try {
    setIsUploading(true);
    const source = await uploadSource(vaultId, data.file, data.title);
    toast({ title: "Upload successful" });
    onSuccess();
  } catch (error) {
    toast({ title: "Upload failed", description: error.message, variant: "destructive" });
  } finally {
    setIsUploading(false);
  }
};
```

---

### 5. Delete Source

**Endpoint**: `DELETE /api/vaults/:vaultId/sources/:sourceId`

**Purpose**: Delete source from vault

**Authentication**: Required (NextAuth.js session)

**Authorization**: User must be owner

**Request**:
```typescript
// URL parameters: vaultId, sourceId
```

**Response**:
```typescript
interface DeleteSourceResponse {
  message: string; // "Source deleted successfully"
}
```

**Client Function**:
```typescript
export async function deleteSource(
  vaultId: string,
  sourceId: string
): Promise<void> {
  const response = await fetch(`/api/vaults/${vaultId}/sources/${sourceId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  await handleResponse<DeleteSourceResponse>(response);
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated → Redirect to login
- `403 Forbidden`: User is not owner → Display "Access Denied"
- `404 Not Found`: Source does not exist → Display "Source not found"
- `500 Internal Server Error`: Delete failed → Display error message

**Usage**:
```typescript
// In SourceTable component
const handleDelete = async (sourceId: string) => {
  if (!confirm('Are you sure you want to delete this source?')) return;

  try {
    await deleteSource(vaultId, sourceId);
    toast({ title: "Source deleted" });
    refetchSources();
  } catch (error) {
    toast({ title: "Delete failed", description: error.message, variant: "destructive" });
  }
};
```

---

## Request/Response Flow

### Successful Request Flow

```
1. Component calls API client function
   ↓
2. Client function constructs fetch request
   ↓
3. Browser sends request with session cookie
   ↓
4. Phase 2 API validates session (NextAuth.js)
   ↓
5. Phase 2 API checks authorization (RBAC middleware)
   ↓
6. Phase 2 API processes request (Prisma query)
   ↓
7. Phase 2 API returns JSON response
   ↓
8. Client function parses response
   ↓
9. Component updates state with data
```

### Error Request Flow

```
1. Component calls API client function
   ↓
2. Client function constructs fetch request
   ↓
3. Browser sends request with session cookie
   ↓
4. Phase 2 API validates session (fails)
   ↓
5. Phase 2 API returns 401 Unauthorized
   ↓
6. Client function throws error
   ↓
7. Component catches error
   ↓
8. Component displays error message or redirects
```

---

## Authentication Integration

### Session Management

**Provider**: NextAuth.js (Phase 3)

**Session Cookie**: `next-auth.session-token`

**Session Structure**:
```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'owner' | 'contributor' | 'viewer';
  };
  expires: string; // ISO 8601
}
```

**Session Access**:
```typescript
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();

if (status === 'loading') return <LoadingSpinner />;
if (status === 'unauthenticated') redirect('/login');

// Use session.user.role for role-based UI
```

**Session Validation**: Automatic on every API request (Phase 2 middleware)

---

## Authorization Patterns

### Role-Based Access Control

**Owner Permissions**:
- View vaults
- View sources
- Upload sources
- Delete sources
- Invite members (UI placeholder only)

**Contributor Permissions**:
- View vaults
- View sources
- Upload sources

**Viewer Permissions**:
- View vaults
- View sources

**Client-Side Checks** (UI only, not security):
```typescript
const canUpload = ['owner', 'contributor'].includes(session.user.role);
const canDelete = session.user.role === 'owner';
const canInvite = session.user.role === 'owner';
```

**Server-Side Checks** (Phase 2 APIs enforce authorization):
- All endpoints validate session
- Upload endpoint checks owner/contributor role
- Delete endpoint checks owner role

---

## Error Handling Strategy

### HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request data (validation error)
- `401 Unauthorized`: User not authenticated (redirect to login)
- `403 Forbidden`: User lacks permission (display access denied)
- `404 Not Found`: Resource does not exist (display not found)
- `413 Payload Too Large`: File size exceeds limit (display error)
- `500 Internal Server Error`: Server error (display generic error)

### Error Display

**Toast Notifications** (temporary):
```typescript
toast({
  title: "Error",
  description: error.message,
  variant: "destructive",
  duration: 5000,
});
```

**Inline Error Messages** (persistent):
```typescript
{error && (
  <div className="text-red-500 text-sm">
    {error.message}
  </div>
)}
```

**Redirect** (authentication errors):
```typescript
if (error.statusCode === 401) {
  router.push('/login');
}
```

---

## Real-Time Integration

### Socket.io Events

**Connection**: Established via SocketProvider (Phase 4)

**Events Received**:

1. **source:created**
   ```typescript
   interface SourceCreatedEvent {
     vaultId: string;
     source: Source;
     actor: {
       name: string;
       email: string;
     };
   }
   ```

   **Handler**:
   ```typescript
   socket.on('source:created', (event: SourceCreatedEvent) => {
     // Add toast notification
     toast({
       title: "Source Added",
       description: `${event.actor.name} added "${event.source.title}"`,
     });

     // Refetch source list
     refetchSources();
   });
   ```

2. **source:deleted**
   ```typescript
   interface SourceDeletedEvent {
     vaultId: string;
     sourceId: string;
     actor: {
       name: string;
       email: string;
     };
   }
   ```

   **Handler**:
   ```typescript
   socket.on('source:deleted', (event: SourceDeletedEvent) => {
     // Add toast notification
     toast({
       title: "Source Deleted",
       description: `${event.actor.name} deleted a source`,
     });

     // Refetch source list
     refetchSources();
   });
   ```

**Event Subscription**:
```typescript
// In vault detail page
useSocketEvents('source:created', handleSourceCreated);
useSocketEvents('source:deleted', handleSourceDeleted);
```

---

## Performance Optimization

### Caching Strategy

**No Client-Side Cache**: All data fetched on demand

**Refetch Strategy**:
- Manual refetch on user action
- Automatic refetch on real-time event
- No background refetch
- No stale-while-revalidate

### Request Optimization

**Debouncing**: Table filtering debounced (300ms)

**Throttling**: Real-time events throttled (max 1 per second)

**Batching**: No request batching (simple fetch)

---

## Testing Scenarios

### API Integration Tests

1. **Get Vault List**:
   - [ ] Fetch vaults as owner → Returns all owned vaults
   - [ ] Fetch vaults as contributor → Returns contributed vaults
   - [ ] Fetch vaults as viewer → Returns viewable vaults
   - [ ] Fetch vaults unauthenticated → Returns 401

2. **Get Source List**:
   - [ ] Fetch sources with access → Returns all sources
   - [ ] Fetch sources without access → Returns 403
   - [ ] Fetch sources for non-existent vault → Returns 404

3. **Upload Source**:
   - [ ] Upload as owner → Success
   - [ ] Upload as contributor → Success
   - [ ] Upload as viewer → Returns 403
   - [ ] Upload invalid file type → Returns 400
   - [ ] Upload file > 10MB → Returns 413

4. **Delete Source**:
   - [ ] Delete as owner → Success
   - [ ] Delete as contributor → Returns 403
   - [ ] Delete as viewer → Returns 403
   - [ ] Delete non-existent source → Returns 404

5. **Real-Time Events**:
   - [ ] Source created → Toast appears, table updates
   - [ ] Source deleted → Toast appears, table updates
   - [ ] Multiple events → All toasts appear, no duplicates

---

## Conclusion

Phase 5 frontend integrates with Phase 2 backend APIs using native fetch() wrapped in custom client functions. All authentication is handled by NextAuth.js (Phase 3). All real-time updates are handled by Socket.io (Phase 4). No direct database access from frontend.

**Key Takeaways**:
1. All API calls use fetch() with session cookies
2. Error handling is consistent across all endpoints
3. Authorization is enforced on server (Phase 2 APIs)
4. Real-time events trigger refetch (no optimistic updates)
5. No client-side caching beyond component lifecycle
