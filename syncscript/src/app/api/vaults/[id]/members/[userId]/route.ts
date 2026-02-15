import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-session';
import { successResponse, errorResponse } from '@/lib/responses';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.enum(['owner', 'contributor', 'viewer']),
});

/**
 * PATCH /api/vaults/[id]/members/[userId]
 * Update member role (owner only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { id, userId } = await params;

    // Get authenticated user from session
    const auth = await getAuthUser();
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }

    // Check if requesting user is owner of this vault
    const requestingUserVault = await prisma.vaultUser.findUnique({
      where: {
        userId_vaultId: {
          userId: auth.userId,
          vaultId: id,
        },
      },
    });

    if (!requestingUserVault || requestingUserVault.role !== 'owner') {
      return errorResponse(
        'FORBIDDEN',
        'Only vault owners can change member roles',
        403
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    // Cannot change your own role
    if (userId === auth.userId) {
      return errorResponse(
        'INVALID_INPUT',
        'Cannot change your own role',
        400
      );
    }

    // Update member role
    const updatedVaultUser = await prisma.vaultUser.update({
      where: {
        userId_vaultId: {
          userId: userId,
          vaultId: id,
        },
      },
      data: {
        role: validatedData.role,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: auth.userId,
        vaultId: id,
        action: 'ROLE_CHANGED',
        details: `${auth.name} changed ${updatedVaultUser.user.name}'s role to ${validatedData.role}`,
      },
    });

    return successResponse({
      message: 'Role updated successfully',
      vaultUser: updatedVaultUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        'INVALID_INPUT',
        `Validation failed: ${error.issues.map((e) => e.message).join(', ')}`,
        400
      );
    }

    // Handle Prisma not found error
    if ((error as any).code === 'P2025') {
      return errorResponse('NOT_FOUND', 'Member not found in this vault', 404);
    }

    console.error('Error updating member role:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to update role. Please try again.',
      500
    );
  }
}
