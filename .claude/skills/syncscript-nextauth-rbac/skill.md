--- 
name: syncscript-nextauth-rbac
description: NextAuth.js v5 implementation with Owner/Contributor/Viewer role hierarchy for SyncScript security layer. Use for Phase 3 authentication system.
---

# NextAuth.js + RBAC Authentication

## Instructions
1. **Demo User Credentials Setup**
2. **NextAuth Configuration**
- App Router: `app/api/auth/[...nextauth]/route.ts`
- Credentials provider with hardcoded demo users
- JWT callbacks inject `role` field into session

3. **Role Middleware Pattern**
```typescript
const roleHierarchy = { viewer: 0, contributor: 1, owner: 2 }
export const requireRole = (requiredRole: keyof typeof roleHierarchy) => {
  return (sessionRole: string) => roleHierarchy[sessionRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole]
}