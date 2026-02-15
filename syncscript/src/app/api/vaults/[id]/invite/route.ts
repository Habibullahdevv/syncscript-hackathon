import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-session';
import { successResponse, errorResponse } from '@/lib/responses';
import crypto from 'crypto';

/**
 * POST /api/vaults/[id]/invite
 * Generate invite link for vault (owner only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
          vaultId: params.id,
        },
      },
    });

    if (!vaultUser || vaultUser.role !== 'owner') {
      return errorResponse(
        'FORBIDDEN',
        'Only vault owners can generate invite links',
        403
      );
    }

    // Generate unique invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');

    // Create invite record (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.vaultInvite.create({
      data: {
        token: inviteToken,
        vaultId: params.id,
        invitedBy: auth.userId,
        expiresAt,
      },
    });

    return successResponse({
      inviteToken,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error generating invite:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to generate invite link. Please try again.',
      500
    );
  }
}
