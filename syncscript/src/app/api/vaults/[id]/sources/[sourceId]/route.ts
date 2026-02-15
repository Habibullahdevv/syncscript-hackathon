import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  extractAuthHeaders,
  validateRole,
  checkPermission,
} from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responses';
import { getSocketIO } from '@/lib/socket';

const prisma = new PrismaClient();

/**
 * DELETE /api/vaults/[id]/sources/[sourceId]
 * Delete source from vault (owner role only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sourceId: string } }
) {
  try {
    // Extract and validate auth headers
    const auth = extractAuthHeaders(request);
    if (!auth) {
      return errorResponse(
        'UNAUTHORIZED',
        'Missing authentication headers (x-user-id, x-user-role)',
        401
      );
    }

    if (!validateRole(auth.role)) {
      return errorResponse(
        'FORBIDDEN',
        'Invalid role. Must be owner, contributor, or viewer',
        403
      );
    }

    // Check permission
    if (!checkPermission(auth.role, 'source:delete')) {
      return errorResponse(
        'FORBIDDEN',
        'Insufficient permissions. Owner role required.',
        403
      );
    }

    // Verify source exists and belongs to the vault
    const source = await prisma.source.findUnique({
      where: { id: params.sourceId },
    });

    if (!source) {
      return errorResponse('NOT_FOUND', 'Source not found', 404);
    }

    if (source.vaultId !== params.id) {
      return errorResponse(
        'NOT_FOUND',
        'Source not found in this vault',
        404
      );
    }

    // Delete source
    await prisma.source.delete({
      where: { id: params.sourceId },
    });

    // Emit real-time event to vault room
    try {
      const io = getSocketIO();

      // Fetch user name for actor info
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { name: true },
      });

      // Broadcast source:deleted event to all clients in vault room
      io.to(`vault:${params.id}`).emit('source:deleted', {
        sourceId: params.sourceId,
        vaultId: params.id,
        actor: {
          userId: auth.userId,
          userName: user?.name || 'Unknown User',
          role: auth.role,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (socketError) {
      // Log but don't fail the request if Socket.io emission fails
      console.error('Failed to emit source:deleted event:', socketError);
    }

    return successResponse({
      message: 'Source deleted successfully',
    });
  } catch (error) {
    // Handle Prisma not found error
    if ((error as any).code === 'P2025') {
      return errorResponse('NOT_FOUND', 'Source not found', 404);
    }

    console.error('Error deleting source:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to delete source. Please try again.',
      500
    );
  }
}
