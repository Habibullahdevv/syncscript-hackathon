# Data Model: Frontend State Management

**Feature**: Phase 5 - Frontend Dashboard & Role-Based UI
**Date**: 2026-02-15
**Status**: Complete

## Overview

This document defines the frontend state management structure for the Phase 5 dashboard. Unlike backend data models, this focuses on React state, Context API structures, and component state management patterns.

## State Architecture

### Global State (Context API)

#### 1. Session State (SessionProvider)

**Purpose**: Manage user authentication session and role information

**State Structure**:
```typescript
interface SessionState {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'owner' | 'contributor' | 'viewer';
  } | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
}
```

**Source**: NextAuth.js session (Phase 3)

**Usage**: Role-based UI rendering, permission checks

**Validation Rules**:
- user.role must be one of: 'owner', 'contributor', 'viewer'
- status must be one of: 'loading', 'authenticated', 'unauthenticated'
- user is null when status is 'unauthenticated'

---

#### 2. Socket Connection State (SocketProvider)

**Purpose**: Manage single Socket.io connection across all components

**State Structure**:
```typescript
interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}
```

**Source**: Socket.io client connection to Phase 4 server

**Usage**: Real-time event subscriptions, connection status display

**Validation Rules**:
- socket is null when isConnected is false
- connectionError is null when isConnected is true
- Only one socket instance exists per application

**State Transitions**:
```
disconnected → connecting → connected
connected → disconnecting → disconnected
connected → error → disconnected
```

---

### Component State (React Hooks)

#### 3. Vault List State (use-vaults.ts)

**Purpose**: Manage vault list data fetching and caching

**State Structure**:
```typescript
interface VaultListState {
  vaults: Vault[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface Vault {
  id: string;
  title: string;
  description: string;
  sourceCount: number;
  userRole: 'owner' | 'contributor' | 'viewer';
  createdAt: string;
  updatedAt: string;
}
```

**Source**: Phase 2 API `/api/vaults` (GET)

**Usage**: Vault list page display, navigation

**Validation Rules**:
- vaults is empty array when no vaults exist
- isLoading is true during API fetch
- error is null when fetch succeeds
- userRole must match session user's role for that vault

**State Transitions**:
```
idle → loading → success (vaults populated)
idle → loading → error (error message set)
success → loading → success (refetch)
```

---

#### 4. Source List State (use-sources.ts)

**Purpose**: Manage source list data fetching for a specific vault

**State Structure**:
```typescript
interface SourceListState {
  sources: Source[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface Source {
  id: string;
  vaultId: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}
```

**Source**: Phase 2 API `/api/vaults/:id/sources` (GET)

**Usage**: Vault detail page DataTable, real-time updates

**Validation Rules**:
- sources is empty array when vault has no sources
- isLoading is true during API fetch
- error is null when fetch succeeds
- fileSize is in bytes (positive integer)
- fileUrl is valid Cloudinary URL

**State Transitions**:
```
idle → loading → success (sources populated)
idle → loading → error (error message set)
success → loading → success (refetch)
success → real-time update → success (source added/removed)
```

---

#### 5. Upload Form State (UploadForm component)

**Purpose**: Manage source upload form state and validation

**State Structure**:
```typescript
interface UploadFormState {
  file: File | null;
  title: string;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  isOpen: boolean;
}
```

**Source**: User input, file selection

**Usage**: Source upload dialog, form validation

**Validation Rules**:
- file must be PDF type (application/pdf)
- file size must be <= 10MB (configurable)
- title must be non-empty string (1-255 characters)
- uploadProgress is 0-100 during upload
- isUploading is true during API call

**State Transitions**:
```
closed → open (dialog opened)
open → uploading (form submitted)
uploading → success (upload complete, dialog closes)
uploading → error (error message displayed)
error → uploading (retry)
```

---

#### 6. Table State (SourceTable component)

**Purpose**: Manage DataTable sorting, filtering, pagination state

**State Structure**:
```typescript
interface TableState {
  sorting: SortingState;
  filtering: FilteringState;
  pagination: PaginationState;
}

type SortingState = {
  id: string;
  desc: boolean;
}[];

type FilteringState = {
  id: string;
  value: string;
}[];

type PaginationState = {
  pageIndex: number;
  pageSize: number;
};
```

**Source**: TanStack Table hooks

**Usage**: Source table sorting, filtering, pagination

**Validation Rules**:
- sorting.id must match column accessor key
- filtering.id must match column accessor key
- pagination.pageIndex is 0-based
- pagination.pageSize is 10 by default

**State Transitions**:
```
default → sorted (user clicks column header)
sorted → filtered (user types in search)
filtered → paginated (user clicks page number)
```

---

#### 7. Toast Notification State (use-toast.ts)

**Purpose**: Manage toast notification queue and display

**State Structure**:
```typescript
interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'default' | 'success' | 'error' | 'warning';
  duration: number;
}
```

**Source**: Socket.io events, API responses

**Usage**: Real-time notifications, user feedback

**Validation Rules**:
- toasts is array of max 5 toasts (oldest removed)
- duration is in milliseconds (default 5000)
- variant must be one of: 'default', 'success', 'error', 'warning'
- id is unique UUID

**State Transitions**:
```
empty → toast added → toast displayed
toast displayed → duration expires → toast removed
toast displayed → user dismisses → toast removed
```

---

## State Flow Diagrams

### Vault List Page Flow

```
User navigates to dashboard
  ↓
SessionProvider checks authentication
  ↓
use-vaults hook fetches vault list from Phase 2 API
  ↓
VaultCard components render with role badges
  ↓
User clicks vault card
  ↓
Navigate to vault detail page
```

### Vault Detail Page Flow

```
User navigates to vault detail
  ↓
use-sources hook fetches source list from Phase 2 API
  ↓
SourceTable component renders with TanStack Table
  ↓
SocketProvider subscribes to vault-specific events
  ↓
Real-time event received (source:created)
  ↓
use-toast adds notification
  ↓
use-sources refetches source list
  ↓
SourceTable updates automatically
```

### Source Upload Flow

```
User clicks "Add Source" button (owner/contributor only)
  ↓
UploadForm dialog opens
  ↓
User selects PDF file and enters title
  ↓
Form validation (Zod schema)
  ↓
API call to Phase 2 upload endpoint
  ↓
Upload progress tracked
  ↓
Success: Dialog closes, source appears in table
  ↓
Socket.io event emitted to other clients
```

---

## State Persistence

**No Local Storage**: All state is ephemeral (session-based)

**Session Persistence**: NextAuth.js handles session cookies

**Cache Strategy**: No client-side caching beyond component lifecycle

**Refetch Strategy**: Manual refetch on user action or real-time event

---

## State Synchronization

### Real-Time Updates

**Socket.io Events → State Updates**:

1. `source:created` event received
   - Add toast notification
   - Refetch source list
   - Update table automatically

2. `source:deleted` event received
   - Add toast notification
   - Refetch source list
   - Update table automatically

3. `contributor:added` event received
   - Add toast notification
   - No state update needed (vault list unchanged)

**Optimistic Updates**: Not implemented (wait for API response)

**Conflict Resolution**: Last-write-wins (backend authoritative)

---

## Performance Considerations

### State Updates

- Debounce table filtering (300ms)
- Throttle real-time events (max 1 per second)
- Batch toast notifications (max 5 visible)
- Memoize expensive computations (React.memo, useMemo)

### Data Fetching

- No prefetching (fetch on demand)
- No background refetch (manual only)
- No stale-while-revalidate (simple fetch)

---

## Error Handling

### API Errors

- Network errors: Display user-friendly message, retry button
- 401 Unauthorized: Redirect to login
- 403 Forbidden: Display "Access Denied" message
- 404 Not Found: Display "Vault/Source not found"
- 500 Server Error: Display "Something went wrong, try again"

### Socket.io Errors

- Connection failed: Display connection status indicator
- Reconnection: Automatic with exponential backoff
- Event errors: Log to console, no user notification

### Form Validation Errors

- File type invalid: "Please select a PDF file"
- File size exceeded: "File size must be under 10MB"
- Title empty: "Title is required"
- Upload failed: Display API error message

---

## Testing Scenarios

### State Management Tests

1. **Session State**: Login as owner/contributor/viewer, verify role badge
2. **Vault List State**: Fetch vaults, verify empty state, verify error state
3. **Source List State**: Fetch sources, verify empty state, verify error state
4. **Upload Form State**: Submit form, verify validation, verify upload progress
5. **Table State**: Sort columns, filter by title, paginate results
6. **Toast State**: Add toast, verify auto-dismiss, verify max 5 toasts
7. **Socket State**: Connect, disconnect, verify reconnection

### Real-Time Synchronization Tests

1. Open vault detail in two browser windows
2. User A adds source → User B sees toast and table update
3. User A deletes source → User B sees toast and table update
4. Verify no duplicate toasts
5. Verify table updates without page refresh

---

## Conclusion

Phase 5 frontend state management uses React hooks and Context API for simplicity. All business logic resides in Phase 2 APIs. Real-time updates are handled via Socket.io events. No complex state management library is needed for this scope.

**Key Takeaways**:
1. Session state managed by NextAuth.js (Phase 3)
2. Socket connection managed by Context Provider
3. Component state managed by custom hooks
4. Real-time updates trigger refetch (no optimistic updates)
5. Error handling is user-friendly and actionable
6. Performance optimizations via debouncing and memoization
