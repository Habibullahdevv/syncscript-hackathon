import { NextRequest } from 'next/server';

/**
 * Valid role types for role-based access control
 */
export type Role = 'owner' | 'contributor' | 'viewer';

/**
 * Permission types for different operations
 */
export type Permission =
  | 'vault:create'
  | 'vault:read'
  | 'vault:update'
  | 'vault:delete'
  | 'source:create'
  | 'source:read'
  | 'source:delete';

/**
 * Permission matrix mapping roles to allowed permissions
 */
const PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'vault:create',
    'vault:read',
    'vault:update',
    'vault:delete',
    'source:create',
    'source:read',
    'source:delete',
  ],
  contributor: [
    'vault:read',
    'vault:update',
    'source:create',
    'source:read',
  ],
  viewer: ['vault:read', 'source:read'],
};

/**
 * Extract authentication headers from request
 * @param request - Next.js request object
 * @returns Object with userId and role, or null if headers missing
 */
export function extractAuthHeaders(request: NextRequest): {
  userId: string;
  role: Role;
} | null {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');

  if (!userId || !role) {
    return null;
  }

  return {
    userId,
    role: role as Role,
  };
}

/**
 * Validate that role is a valid enum value
 * @param role - Role string to validate
 * @returns True if role is valid, false otherwise
 */
export function validateRole(role: string): role is Role {
  return ['owner', 'contributor', 'viewer'].includes(role);
}

/**
 * Check if a role has a specific permission
 * @param role - User role
 * @param permission - Permission to check
 * @returns True if role has permission, false otherwise
 */
export function checkPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission);
}

/**
 * Get all permissions for a role
 * @param role - User role
 * @returns Array of permissions
 */
export function getRolePermissions(role: Role): Permission[] {
  return PERMISSIONS[role];
}
