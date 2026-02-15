import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-session';
import { successResponse, errorResponse } from '@/lib/responses';

/**
 * GET /api/vaults/[id]/audit
 * Get audit log for vault (owner only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;

    // Get authenticated user from session
    const auth = await getAuthUser();
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }

    // Check if user is owner of this vault
    const vaultUser = await prisma.vaultUser.findUnique({
      where: {
        userId_vaultId: {
          userId: auth.userId,
          vaultId: id,
        },
      },
    });

    if (!vaultUser || vaultUser.role !== 'owner') {
      return errorResponse(
        'FORBIDDEN',
        'Only vault owners can view audit logs',
        403
      );
    }

    // Get audit logs for this vault
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        vaultId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to last 100 entries
    });

    return successResponse({ auditLogs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to fetch audit logs. Please try again.',
      500
    );
  }
}
