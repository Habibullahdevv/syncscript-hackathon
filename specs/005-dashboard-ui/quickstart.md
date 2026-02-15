# Quick Start Guide: Phase 5 Dashboard Testing

**Feature**: Phase 5 - Frontend Dashboard & Role-Based UI
**Date**: 2026-02-15
**Status**: Complete

## Overview

This guide provides step-by-step testing scenarios for Phase 5 dashboard implementation. All tests are manual browser tests designed to verify role-based UI, real-time updates, and end-to-end workflows.

## Prerequisites

### Required Setup

1. **Backend Services Running** (Phases 2-4):
   - Phase 2 APIs: `http://localhost:3000/api`
   - Phase 3 Authentication: NextAuth.js configured
   - Phase 4 Socket.io: `http://localhost:3000` (WebSocket)
   - Database: NeonDB PostgreSQL connected

2. **Demo Users Created**:
   - `owner@demo.com` (password: demo123) - Owner role
   - `contributor@demo.com` (password: demo123) - Contributor role
   - `viewer@demo.com` (password: demo123) - Viewer role

3. **Test Data**:
   - At least 1 vault with all three users assigned
   - At least 5 sources in the vault for pagination testing
   - PDF files ready for upload testing (< 10MB)

4. **Development Server**:
   ```bash
   npm run dev
   # Server running at http://localhost:3000
   ```

5. **Browser Setup**:
   - Chrome/Firefox/Safari (latest version)
   - Multiple browser windows/tabs for concurrent testing
   - Incognito/private windows for multi-user testing

---

## Testing Scenarios

### Scenario 1: Owner Role - Full Access

**Objective**: Verify owner has full CRUD access to vaults and sources

**Steps**:

1. **Login as Owner**:
   - Navigate to `http://localhost:3000/login`
   - Enter email: `owner@demo.com`
   - Enter password: `demo123`
   - Click "Sign In"
   - ✅ **Expected**: Redirect to dashboard at `/dashboard`

2. **Verify Dashboard Layout**:
   - ✅ **Expected**: Sidebar visible with navigation links
   - ✅ **Expected**: Role badge displays "Owner" (blue badge)
   - ✅ **Expected**: Vault list displays all owned vaults

3. **Verify Vault List**:
   - ✅ **Expected**: Each vault card shows title, description, source count
   - ✅ **Expected**: Each vault card shows "Owner" badge
   - ✅ **Expected**: Hover effect on vault cards
   - ✅ **Expected**: Click vault card navigates to vault detail

4. **Navigate to Vault Detail**:
   - Click on a vault card
   - ✅ **Expected**: Navigate to `/vaults/{id}`
   - ✅ **Expected**: Vault title displayed at top
   - ✅ **Expected**: "Add Source" button visible
   - ✅ **Expected**: Source table displays all sources

5. **Verify Source Table**:
   - ✅ **Expected**: Columns: Title, File Size, Upload Date, Actions
   - ✅ **Expected**: "Delete" button visible for each source
   - ✅ **Expected**: Click column header sorts table
   - ✅ **Expected**: Search box filters sources by title
   - ✅ **Expected**: Pagination shows 10 sources per page (if > 10 sources)

6. **Upload New Source**:
   - Click "Add Source" button
   - ✅ **Expected**: Upload dialog opens
   - Select PDF file (< 10MB)
   - Enter title: "Test Source"
   - Click "Upload"
   - ✅ **Expected**: Loading indicator appears
   - ✅ **Expected**: Dialog closes on success
   - ✅ **Expected**: New source appears in table
   - ✅ **Expected**: Toast notification: "Upload successful"

7. **Delete Source**:
   - Click "Delete" button on a source
   - ✅ **Expected**: Confirmation dialog appears
   - Click "Confirm"
   - ✅ **Expected**: Source removed from table
   - ✅ **Expected**: Toast notification: "Source deleted"

8. **Logout**:
   - Click logout button
   - ✅ **Expected**: Redirect to login page
   - ✅ **Expected**: Session cleared

---

### Scenario 2: Contributor Role - Limited Access

**Objective**: Verify contributor can upload but not delete sources

**Steps**:

1. **Login as Contributor**:
   - Navigate to `http://localhost:3000/login`
   - Enter email: `contributor@demo.com`
   - Enter password: `demo123`
   - Click "Sign In"
   - ✅ **Expected**: Redirect to dashboard

2. **Verify Dashboard Layout**:
   - ✅ **Expected**: Sidebar visible
   - ✅ **Expected**: Role badge displays "Contributor" (green badge)
   - ✅ **Expected**: Vault list displays contributed vaults only

3. **Navigate to Vault Detail**:
   - Click on a vault card
   - ✅ **Expected**: Navigate to vault detail page
   - ✅ **Expected**: "Add Source" button visible
   - ✅ **Expected**: Source table displays all sources

4. **Verify Source Table Actions**:
   - ✅ **Expected**: "Delete" button NOT visible for any source
   - ✅ **Expected**: Sorting and filtering work
   - ✅ **Expected**: Pagination works

5. **Upload New Source**:
   - Click "Add Source" button
   - ✅ **Expected**: Upload dialog opens
   - Select PDF file and enter title
   - Click "Upload"
   - ✅ **Expected**: Upload succeeds
   - ✅ **Expected**: New source appears in table

6. **Attempt to Delete Source** (should not be possible):
   - ✅ **Expected**: No delete button visible in UI
   - ✅ **Expected**: Cannot delete via UI

7. **Logout**:
   - Click logout button
   - ✅ **Expected**: Redirect to login page

---

### Scenario 3: Viewer Role - Read-Only Access

**Objective**: Verify viewer has read-only access (no upload, no delete)

**Steps**:

1. **Login as Viewer**:
   - Navigate to `http://localhost:3000/login`
   - Enter email: `viewer@demo.com`
   - Enter password: `demo123`
   - Click "Sign In"
   - ✅ **Expected**: Redirect to dashboard

2. **Verify Dashboard Layout**:
   - ✅ **Expected**: Sidebar visible
   - ✅ **Expected**: Role badge displays "Viewer" (gray badge)
   - ✅ **Expected**: Vault list displays viewable vaults only

3. **Navigate to Vault Detail**:
   - Click on a vault card
   - ✅ **Expected**: Navigate to vault detail page
   - ✅ **Expected**: "Add Source" button NOT visible
   - ✅ **Expected**: Source table displays all sources

4. **Verify Source Table Actions**:
   - ✅ **Expected**: "Delete" button NOT visible for any source
   - ✅ **Expected**: Sorting and filtering work (read-only operations)
   - ✅ **Expected**: Pagination works

5. **Attempt to Upload Source** (should not be possible):
   - ✅ **Expected**: No "Add Source" button visible in UI
   - ✅ **Expected**: Cannot upload via UI

6. **Attempt to Delete Source** (should not be possible):
   - ✅ **Expected**: No delete button visible in UI
   - ✅ **Expected**: Cannot delete via UI

7. **Logout**:
   - Click logout button
   - ✅ **Expected**: Redirect to login page

---

### Scenario 4: Real-Time Updates - Concurrent Users

**Objective**: Verify real-time toast notifications and table updates work across multiple clients

**Setup**: Open two browser windows side-by-side

**Steps**:

1. **Window 1: Login as Owner**:
   - Navigate to `http://localhost:3000/login`
   - Login as `owner@demo.com`
   - Navigate to vault detail page

2. **Window 2: Login as Contributor**:
   - Open incognito/private window
   - Navigate to `http://localhost:3000/login`
   - Login as `contributor@demo.com`
   - Navigate to same vault detail page

3. **Verify Initial State**:
   - ✅ **Expected**: Both windows show same source list
   - ✅ **Expected**: Window 1 shows "Delete" buttons (owner)
   - ✅ **Expected**: Window 2 does NOT show "Delete" buttons (contributor)

4. **Window 1: Upload Source**:
   - Click "Add Source" button
   - Upload PDF file with title "Real-Time Test"
   - Click "Upload"
   - ✅ **Expected**: Window 1 shows upload success toast
   - ✅ **Expected**: Window 1 table updates with new source

5. **Window 2: Verify Real-Time Update**:
   - ✅ **Expected**: Toast notification appears: "Owner added 'Real-Time Test'"
   - ✅ **Expected**: Source table updates automatically (no refresh needed)
   - ✅ **Expected**: New source appears in table within 1 second

6. **Window 1: Delete Source**:
   - Click "Delete" button on "Real-Time Test" source
   - Confirm deletion
   - ✅ **Expected**: Window 1 shows delete success toast
   - ✅ **Expected**: Window 1 table updates (source removed)

7. **Window 2: Verify Real-Time Update**:
   - ✅ **Expected**: Toast notification appears: "Owner deleted a source"
   - ✅ **Expected**: Source table updates automatically
   - ✅ **Expected**: Deleted source removed from table within 1 second

8. **Verify Toast Behavior**:
   - ✅ **Expected**: Toasts auto-dismiss after 5 seconds
   - ✅ **Expected**: Multiple toasts stack vertically
   - ✅ **Expected**: Max 5 toasts visible at once

---

### Scenario 5: Form Validation

**Objective**: Verify upload form validation works correctly

**Steps**:

1. **Login as Owner**:
   - Navigate to vault detail page
   - Click "Add Source" button

2. **Test Empty Title**:
   - Select PDF file
   - Leave title empty
   - Click "Upload"
   - ✅ **Expected**: Validation error: "Title is required"
   - ✅ **Expected**: Upload does not proceed

3. **Test Invalid File Type**:
   - Select non-PDF file (e.g., .jpg, .txt)
   - Enter title
   - Click "Upload"
   - ✅ **Expected**: Validation error: "Please select a PDF file"
   - ✅ **Expected**: Upload does not proceed

4. **Test File Size Limit**:
   - Select PDF file > 10MB
   - Enter title
   - Click "Upload"
   - ✅ **Expected**: Validation error: "File size must be under 10MB"
   - ✅ **Expected**: Upload does not proceed

5. **Test Valid Upload**:
   - Select PDF file < 10MB
   - Enter title: "Valid Upload"
   - Click "Upload"
   - ✅ **Expected**: Upload succeeds
   - ✅ **Expected**: Source appears in table

---

### Scenario 6: Table Features

**Objective**: Verify DataTable sorting, filtering, pagination work correctly

**Prerequisites**: Vault must have at least 15 sources for pagination testing

**Steps**:

1. **Login as Owner**:
   - Navigate to vault detail page with 15+ sources

2. **Test Sorting**:
   - Click "Title" column header
   - ✅ **Expected**: Table sorts by title (ascending)
   - Click "Title" column header again
   - ✅ **Expected**: Table sorts by title (descending)
   - Click "Upload Date" column header
   - ✅ **Expected**: Table sorts by date (ascending)

3. **Test Filtering**:
   - Type "test" in search box
   - ✅ **Expected**: Table filters to show only sources with "test" in title
   - Clear search box
   - ✅ **Expected**: Table shows all sources again

4. **Test Pagination**:
   - ✅ **Expected**: Table shows 10 sources per page
   - ✅ **Expected**: Pagination controls visible at bottom
   - Click "Next" button
   - ✅ **Expected**: Table shows next 10 sources
   - Click "Previous" button
   - ✅ **Expected**: Table shows previous 10 sources

5. **Test Combined Features**:
   - Sort by title
   - Filter by "test"
   - ✅ **Expected**: Filtered results are sorted
   - ✅ **Expected**: Pagination works on filtered results

---

### Scenario 7: Error Handling

**Objective**: Verify error messages display correctly for API failures

**Steps**:

1. **Test Network Error** (simulate by stopping backend):
   - Stop backend server (`Ctrl+C` in terminal)
   - Login as owner
   - Navigate to vault detail page
   - ✅ **Expected**: Error message: "Failed to load sources"
   - ✅ **Expected**: Retry button visible

2. **Test Upload Error** (backend still stopped):
   - Click "Add Source" button
   - Select PDF and enter title
   - Click "Upload"
   - ✅ **Expected**: Error toast: "Upload failed, please try again"
   - ✅ **Expected**: Dialog remains open for retry

3. **Test Unauthorized Access**:
   - Logout
   - Manually navigate to `/vaults/{id}` (without login)
   - ✅ **Expected**: Redirect to login page
   - ✅ **Expected**: No error displayed (silent redirect)

4. **Test Forbidden Access**:
   - Login as viewer
   - Manually try to access owner-only endpoint (via browser console)
   - ✅ **Expected**: Error message: "Access Denied"

5. **Restart Backend**:
   - Start backend server again
   - Refresh page
   - ✅ **Expected**: Data loads successfully

---

### Scenario 8: Responsive Design

**Objective**: Verify dashboard works on mobile, tablet, desktop screen sizes

**Steps**:

1. **Desktop View (1920px)**:
   - Open browser at full width
   - ✅ **Expected**: Sidebar visible on left
   - ✅ **Expected**: Vault cards in grid (3-4 columns)
   - ✅ **Expected**: Source table shows all columns

2. **Tablet View (768px)**:
   - Resize browser to 768px width
   - ✅ **Expected**: Sidebar visible (narrower)
   - ✅ **Expected**: Vault cards in grid (2 columns)
   - ✅ **Expected**: Source table shows all columns (scrollable)

3. **Mobile View (375px)**:
   - Resize browser to 375px width
   - ✅ **Expected**: Sidebar collapses to hamburger menu
   - ✅ **Expected**: Vault cards in single column
   - ✅ **Expected**: Source table scrolls horizontally
   - ✅ **Expected**: Upload dialog fits screen

4. **Test Navigation on Mobile**:
   - Click hamburger menu
   - ✅ **Expected**: Sidebar slides in from left
   - Click outside sidebar
   - ✅ **Expected**: Sidebar closes

---

### Scenario 9: Empty States

**Objective**: Verify empty state messages display correctly

**Steps**:

1. **Empty Vault List**:
   - Login as user with no vault access
   - ✅ **Expected**: Empty state message: "You don't have access to any vaults"
   - ✅ **Expected**: Helpful guidance displayed

2. **Empty Source List**:
   - Login as owner
   - Navigate to vault with no sources
   - ✅ **Expected**: Empty state message: "No sources in this vault"
   - ✅ **Expected**: "Add Source" button visible (if owner/contributor)

3. **Empty Search Results**:
   - Navigate to vault with sources
   - Search for non-existent term
   - ✅ **Expected**: Empty state message: "No sources match your search"
   - ✅ **Expected**: Clear search button visible

---

### Scenario 10: End-to-End Workflow

**Objective**: Verify complete user journey from login to real-time collaboration

**Setup**: Two browser windows (Owner and Contributor)

**Steps**:

1. **Window 1: Owner Login**:
   - Navigate to login page
   - Login as `owner@demo.com`
   - ✅ **Expected**: Redirect to dashboard

2. **Window 1: Navigate to Vault**:
   - Click on vault card
   - ✅ **Expected**: Navigate to vault detail
   - ✅ **Expected**: Source table displays

3. **Window 2: Contributor Login**:
   - Open incognito window
   - Login as `contributor@demo.com`
   - Navigate to same vault
   - ✅ **Expected**: Both windows show same data

4. **Window 2: Upload Source**:
   - Click "Add Source"
   - Upload PDF: "Collaboration Test"
   - ✅ **Expected**: Upload succeeds

5. **Window 1: Verify Real-Time Update**:
   - ✅ **Expected**: Toast: "Contributor added 'Collaboration Test'"
   - ✅ **Expected**: Table updates automatically

6. **Window 1: Delete Source**:
   - Click "Delete" on "Collaboration Test"
   - Confirm deletion
   - ✅ **Expected**: Delete succeeds

7. **Window 2: Verify Real-Time Update**:
   - ✅ **Expected**: Toast: "Owner deleted a source"
   - ✅ **Expected**: Table updates automatically

8. **Both Windows: Logout**:
   - Click logout
   - ✅ **Expected**: Both redirect to login page
   - ✅ **Expected**: Sessions cleared

---

## Performance Benchmarks

### Page Load Times

- Dashboard page load: < 2 seconds
- Vault detail page load: < 2 seconds
- Source table rendering (100 sources): < 500ms
- Real-time event propagation: < 1 second

### User Actions

- Upload source (5MB PDF): < 10 seconds
- Delete source: < 1 second
- Table sorting: < 100ms
- Table filtering: < 300ms (debounced)

---

## Troubleshooting

### Common Issues

1. **"Failed to load vaults"**:
   - Check backend server is running
   - Check database connection
   - Check Phase 2 APIs are accessible

2. **"Upload failed"**:
   - Check file is PDF type
   - Check file size < 10MB
   - Check Cloudinary credentials configured

3. **Real-time updates not working**:
   - Check Socket.io server is running
   - Check WebSocket connection in browser console
   - Check firewall allows WebSocket connections

4. **Role badge not displaying**:
   - Check NextAuth.js session includes user.role
   - Check Phase 3 authentication configured
   - Clear browser cookies and re-login

---

## Test Data Setup

### Create Test Vault

```sql
-- Run in NeonDB console
INSERT INTO "Vault" (id, title, description, "createdAt", "updatedAt")
VALUES ('test-vault-1', 'Test Vault', 'Vault for testing Phase 5', NOW(), NOW());

-- Assign users to vault
INSERT INTO "VaultUser" (id, "vaultId", "userId", role, "createdAt", "updatedAt")
VALUES
  ('vu-1', 'test-vault-1', 'owner-user-id', 'owner', NOW(), NOW()),
  ('vu-2', 'test-vault-1', 'contributor-user-id', 'contributor', NOW(), NOW()),
  ('vu-3', 'test-vault-1', 'viewer-user-id', 'viewer', NOW(), NOW());
```

### Create Test Sources

```sql
-- Run in NeonDB console
INSERT INTO "Source" (id, "vaultId", title, "fileUrl", "fileSize", "uploadedBy", "createdAt", "updatedAt")
VALUES
  ('src-1', 'test-vault-1', 'Test Source 1', 'https://cloudinary.com/test1.pdf', 1024000, 'owner@demo.com', NOW(), NOW()),
  ('src-2', 'test-vault-1', 'Test Source 2', 'https://cloudinary.com/test2.pdf', 2048000, 'contributor@demo.com', NOW(), NOW()),
  ('src-3', 'test-vault-1', 'Test Source 3', 'https://cloudinary.com/test3.pdf', 512000, 'owner@demo.com', NOW(), NOW());
```

---

## Conclusion

Phase 5 testing focuses on manual browser testing with multiple user roles and concurrent sessions. All tests verify role-based UI rendering, real-time updates, and end-to-end workflows.

**Testing Checklist**:
- [ ] Scenario 1: Owner role full access
- [ ] Scenario 2: Contributor role limited access
- [ ] Scenario 3: Viewer role read-only access
- [ ] Scenario 4: Real-time updates concurrent users
- [ ] Scenario 5: Form validation
- [ ] Scenario 6: Table features (sort, filter, paginate)
- [ ] Scenario 7: Error handling
- [ ] Scenario 8: Responsive design
- [ ] Scenario 9: Empty states
- [ ] Scenario 10: End-to-end workflow

**Next Steps**: After all scenarios pass, Phase 5 is complete and ready for Phase 6 (production polish).
