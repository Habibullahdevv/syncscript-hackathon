import { auth } from '@/auth';

export type Role = 'owner' | 'contributor' | 'viewer';

export type Permission =
  | 'vault:create'
  | 'vault:read'
  | 'vault:update'
  | 'vault:delete'
  | 'source:create'
  | 'source:read'
  | 'source:delete';

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
 * Get authenticated user from NextAuth session
 */
export async function getAuthUser() {
  const session = await auth();

  if (!session || !session.user) {
    return null;
  }

  return {
    userId: session.user.id as string,
    role: (session.user as any).role as Role,
    email: session.user.email || '',
    name: session.user.name || '',
  };
}

/**
 * Check if a role has a specific permission
 */
export function checkPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission);
}

/**
 * Validate that role is a valid enum value
 */
export function validateRole(role: string): role is Role {
  return ['owner', 'contributor', 'viewer'].includes(role);
}
