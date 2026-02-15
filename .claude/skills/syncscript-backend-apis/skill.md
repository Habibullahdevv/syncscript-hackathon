--- 
name: syncscript-backend-apis
description: Next.js 15 App Router APIs with Cloudinary PDF uploads + Prisma CRUD + RBAC middleware. Use for SyncScript Phase 2 backend foundation.
---

# Backend API Implementation

## Instructions
1. **API Route Structure**
   - `/api/vaults` → GET (list) / POST (create)
   - `/api/vaults/[id]` → GET/PUT/DELETE single vault
   - `/api/vaults/[id]/sources` → GET/POST vault sources
   - `/api/upload` → Cloudinary PDF upload endpoint

2. **Cloudinary Configuration**
