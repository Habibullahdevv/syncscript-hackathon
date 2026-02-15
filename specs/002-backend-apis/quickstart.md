# Quickstart Guide: Backend APIs Testing

**Feature**: 002-backend-apis
**Date**: 2026-02-15
**Purpose**: Step-by-step guide for testing Phase 2 Backend APIs using Postman

---

## Prerequisites

1. **Development Server Running**:
   ```bash
   cd syncscript
   npm run dev
   ```
   Server should be accessible at http://localhost:3000

2. **Database Ready**:
   - Phase 1 schema deployed to NeonDB
   - At least one test user exists in database

3. **Postman Installed**:
   - Download from https://www.postman.com/downloads/
   - Import collection from `postman/backend-apis.postman_collection.json`
   - Import environment from `postman/backend-apis.postman_environment.json`

---

## Environment Setup

### Step 1: Configure Environment Variables

In Postman, create environment with these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| base_url | http://localhost:3000 | API base URL |
| x_user_id | (your test user cuid) | Mock user ID from database |
| x_user_role | owner | Mock role (owner/contributor/viewer) |
| vault_id | (set after creating vault) | Created vault ID for testing |
| source_id | (set after creating source) | Created source ID for testing |

### Step 2: Get Test User ID

Option A - Via Prisma Studio:
```bash
cd syncscript
npx prisma studio
```
Navigate to User table, copy a user's `id` field.

Option B - Via Database Query:
```sql
SELECT id FROM "User" LIMIT 1;
```

---

## Testing Workflow

### Phase 1: Vault Management (5 endpoints)

#### Test 1.1: Create Vault (POST /api/vaults)

**Request**:
```http
POST http://localhost:3000/api/vaults
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: owner
  Content-Type: application/json

Body:
{
  "name": "Test Vault"
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "name": "Test Vault",
    "ownerId": "clx0a1b2c3d4e5f6g7h8i9j0",
    "createdAt": "2026-02-15T10:30:00.000Z",
    "updatedAt": "2026-02-15T10:30:00.000Z"
  },
  "error": null
}
```

**Action**: Copy `data.id` and save as `vault_id` environment variable.

**Validation**:
- ✅ Status code is 201
- ✅ Response includes vault ID
- ✅ Vault visible in Prisma Studio

---

#### Test 1.2: List Vaults (GET /api/vaults)

**Request**:
```http
GET http://localhost:3000/api/vaults
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: owner
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1",
      "name": "Test Vault",
      "ownerId": "clx0a1b2c3d4e5f6g7h8i9j0",
      "createdAt": "2026-02-15T10:30:00.000Z",
      "updatedAt": "2026-02-15T10:30:00.000Z"
    }
  ],
  "error": null
}
```

**Validation**:
- ✅ Status code is 200
- ✅ Array includes vault from Test 1.1

---

#### Test 1.3: Get Vault Details (GET /api/vaults/[id])

**Request**:
```http
GET http://localhost:3000/api/vaults/{{vault_id}}
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: owner
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "name": "Test Vault",
    "ownerId": "clx0a1b2c3d4e5f6g7h8i9j0",
    "createdAt": "2026-02-15T10:30:00.000Z",
    "updatedAt": "2026-02-15T10:30:00.000Z",
    "sources": []
  },
  "error": null
}
```

**Validation**:
- ✅ Status code is 200
- ✅ Vault details match created vault
- ✅ Sources array is empty (no sources yet)

---

#### Test 1.4: Update Vault (PATCH /api/vaults/[id])

**Request**:
```http
PATCH http://localhost:3000/api/vaults/{{vault_id}}
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: owner
  Content-Type: application/json

Body:
{
  "name": "Updated Vault Name"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "name": "Updated Vault Name",
    "ownerId": "clx0a1b2c3d4e5f6g7h8i9j0",
    "createdAt": "2026-02-15T10:30:00.000Z",
    "updatedAt": "2026-02-15T10:35:00.000Z"
  },
  "error": null
}
```

**Validation**:
- ✅ Status code is 200
- ✅ Name updated to "Updated Vault Name"
- ✅ updatedAt timestamp changed

---

#### Test 1.5: Delete Vault (DELETE /api/vaults/[id]) - SKIP FOR NOW

**Note**: Skip this test until after source testing to avoid deleting test vault.

---

### Phase 2: Source Management (3 endpoints)

#### Test 2.1: Add Source to Vault (POST /api/vaults/[id]/sources)

**Request**:
```http
POST http://localhost:3000/api/vaults/{{vault_id}}/sources
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: contributor
  Content-Type: application/json

Body:
{
  "title": "Test Research Paper",
  "url": "https://arxiv.org/abs/2024.12345",
  "annotation": "Important findings on ML optimization"
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "clx3c4d5e6f7g8h9i0j1k2l3",
    "vaultId": "clx1a2b3c4d5e6f7g8h9i0j1",
    "title": "Test Research Paper",
    "url": "https://arxiv.org/abs/2024.12345",
    "annotation": "Important findings on ML optimization",
    "fileUrl": null,
    "fileKey": null,
    "fileSize": null,
    "mimeType": "application/pdf",
    "createdAt": "2026-02-15T11:00:00.000Z"
  },
  "error": null
}
```

**Action**: Copy `data.id` and save as `source_id` environment variable.

**Validation**:
- ✅ Status code is 201
- ✅ Source includes vault ID
- ✅ Source visible in Prisma Studio

---

#### Test 2.2: List Vault Sources (GET /api/vaults/[id]/sources)

**Request**:
```http
GET http://localhost:3000/api/vaults/{{vault_id}}/sources
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: viewer
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "clx3c4d5e6f7g8h9i0j1k2l3",
      "vaultId": "clx1a2b3c4d5e6f7g8h9i0j1",
      "title": "Test Research Paper",
      "url": "https://arxiv.org/abs/2024.12345",
      "annotation": "Important findings on ML optimization",
      "fileUrl": null,
      "createdAt": "2026-02-15T11:00:00.000Z"
    }
  ],
  "error": null
}
```

**Validation**:
- ✅ Status code is 200
- ✅ Array includes source from Test 2.1
- ✅ Viewer role can read sources

---

#### Test 2.3: Delete Source (DELETE /api/vaults/[id]/sources/[sourceId])

**Request**:
```http
DELETE http://localhost:3000/api/vaults/{{vault_id}}/sources/{{source_id}}
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: owner
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Source deleted successfully"
  },
  "error": null
}
```

**Validation**:
- ✅ Status code is 200
- ✅ Source removed from Prisma Studio
- ✅ GET sources returns empty array

---

### Phase 3: File Upload (1 endpoint)

#### Test 3.1: Upload PDF (POST /api/upload)

**Request**:
```http
POST http://localhost:3000/api/upload
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: contributor
  Content-Type: multipart/form-data

Body (form-data):
  file: (select PDF file, max 10MB)
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/demo/raw/upload/v1708012345/research-paper.pdf",
    "publicId": "v1708012345/research-paper",
    "fileSize": 2048576,
    "mimeType": "application/pdf"
  },
  "error": null
}
```

**Validation**:
- ✅ Status code is 200
- ✅ URL is accessible in browser
- ✅ File size matches uploaded file

**Next Step**: Use returned `url` and `publicId` when creating source with file attachment.

---

### Phase 4: Role-Based Access Control Testing

#### Test 4.1: Viewer Cannot Create Vault (403 Forbidden)

**Request**:
```http
POST http://localhost:3000/api/vaults
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: viewer
  Content-Type: application/json

Body:
{
  "name": "Unauthorized Vault"
}
```

**Expected Response** (403 Forbidden):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions. Owner role required."
  }
}
```

**Validation**:
- ✅ Status code is 403
- ✅ Error code is FORBIDDEN

---

#### Test 4.2: Contributor Cannot Delete Vault (403 Forbidden)

**Request**:
```http
DELETE http://localhost:3000/api/vaults/{{vault_id}}
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: contributor
```

**Expected Response** (403 Forbidden):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions. Owner role required."
  }
}
```

**Validation**:
- ✅ Status code is 403
- ✅ Vault still exists in database

---

#### Test 4.3: Missing Headers (401 Unauthorized)

**Request**:
```http
GET http://localhost:3000/api/vaults
(No x-user-id or x-user-role headers)
```

**Expected Response** (401 Unauthorized):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing authentication headers (x-user-id, x-user-role)"
  }
}
```

**Validation**:
- ✅ Status code is 401
- ✅ Error code is UNAUTHORIZED

---

### Phase 5: Validation Testing

#### Test 5.1: Missing Required Field (400 Bad Request)

**Request**:
```http
POST http://localhost:3000/api/vaults
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: owner
  Content-Type: application/json

Body:
{
  "description": "Missing name field"
}
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed: name is required"
  }
}
```

**Validation**:
- ✅ Status code is 400
- ✅ Error message indicates missing field

---

#### Test 5.2: Invalid Vault ID (404 Not Found)

**Request**:
```http
GET http://localhost:3000/api/vaults/invalid-id-12345
Headers:
  x-user-id: {{x_user_id}}
  x-user-role: owner
```

**Expected Response** (404 Not Found):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Vault not found"
  }
}
```

**Validation**:
- ✅ Status code is 404
- ✅ Error code is NOT_FOUND

---

## Complete Test Checklist

### Vault Endpoints
- [ ] POST /api/vaults (owner role)
- [ ] GET /api/vaults (all roles)
- [ ] GET /api/vaults/[id] (all roles)
- [ ] PATCH /api/vaults/[id] (owner/contributor)
- [ ] DELETE /api/vaults/[id] (owner only)

### Source Endpoints
- [ ] POST /api/vaults/[id]/sources (owner/contributor)
- [ ] GET /api/vaults/[id]/sources (all roles)
- [ ] DELETE /api/vaults/[id]/sources/[sourceId] (owner only)

### Upload Endpoint
- [ ] POST /api/upload (owner/contributor)

### Role Enforcement
- [ ] Viewer cannot create vault (403)
- [ ] Contributor cannot delete vault (403)
- [ ] Missing headers return 401
- [ ] Invalid role returns 403

### Validation
- [ ] Missing required fields return 400
- [ ] Invalid IDs return 404
- [ ] Invalid file types return 400
- [ ] Oversized files return 400

### Data Persistence
- [ ] Created vaults visible in Prisma Studio
- [ ] Created sources visible in Prisma Studio
- [ ] Updated vaults reflect changes
- [ ] Deleted vaults removed from database
- [ ] Cascade delete removes sources

---

## Troubleshooting

### Issue: 401 Unauthorized on all requests
**Solution**: Verify x-user-id and x-user-role headers are set in environment variables.

### Issue: 404 Not Found for valid vault ID
**Solution**: Ensure vault exists in database and vault_id environment variable is correct.

### Issue: 500 Server Error
**Solution**: Check server logs for Prisma errors. Verify DATABASE_URL is correct.

### Issue: Upload fails with Cloudinary error
**Solution**: Verify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local.

### Issue: Cascade delete not working
**Solution**: Verify Prisma schema has `onDelete: Cascade` on Source.vault relation.

---

## Next Steps

After completing all tests:

1. **Export Postman Collection**:
   - File → Export → Collection v2.1
   - Save to `postman/backend-apis.postman_collection.json`

2. **Export Environment**:
   - Environments → Export
   - Save to `postman/backend-apis.postman_environment.json`

3. **Verify Phase 2 Completion**:
   - All 11 endpoints functional
   - Role enforcement working
   - Data persisting to NeonDB
   - Upload integration working

4. **Proceed to Phase 3**:
   - Begin NextAuth.js authentication system planning
