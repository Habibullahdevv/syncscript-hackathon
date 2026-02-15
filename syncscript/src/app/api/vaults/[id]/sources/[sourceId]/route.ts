import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, checkPermission } from '@/lib/auth-session';
import { successResponse, errorResponse } from '@/lib/responses';
import { getIO } from '@/../../server';

/**
 * DELETE /api/vaults/[id]/sources/[sourceId]
 * Delete source from vault (owner role only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sourceId: string } }
) {
  try {
    // Get authenticated user from session
    const auth = await getAuthUser();
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
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
      const io = getIO();

      // Broadcast source:deleted event to all clients in vault room
      io.to(`vault:${params.id}`).emit('source:deleted', {
        vaultId: params.id,
        sourceId: params.sourceId,
        actor: {
          name: auth.name,
          email: auth.email,
        },
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
