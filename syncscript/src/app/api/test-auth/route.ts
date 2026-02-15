import { NextRequest } from 'next/server';
import {
  extractAuthHeaders,
  validateRole,
  checkPermission,
} from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responses';

/**
 * Test route to verify auth middleware functionality
 * GET /api/test-auth
 */
export async function GET(request: NextRequest) {
  // Extract auth headers
  const auth = extractAuthHeaders(request);

  if (!auth) {
    return errorResponse(
      'UNAUTHORIZED',
      'Missing authentication headers (x-user-id, x-user-role)',
      401
    );
  }

  // Validate role
  if (!validateRole(auth.role)) {
    return errorResponse(
      'FORBIDDEN',
      'Invalid role. Must be owner, contributor, or viewer',
      403
    );
  }

  // Check permissions
  const permissions = {
    canCreateVault: checkPermission(auth.role, 'vault:create'),
    canReadVault: checkPermission(auth.role, 'vault:read'),
    canUpdateVault: checkPermission(auth.role, 'vault:update'),
    canDeleteVault: checkPermission(auth.role, 'vault:delete'),
    canCreateSource: checkPermission(auth.role, 'source:create'),
    canReadSource: checkPermission(auth.role, 'source:read'),
    canDeleteSource: checkPermission(auth.role, 'source:delete'),
  };

  return successResponse({
    message: 'Auth middleware working correctly',
    userId: auth.userId,
    role: auth.role,
    permissions,
  });
}
