import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/responses';

/**
 * GET /api/invites/[token]
 * Validate invite token and get vault info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Find invite by token
    const invite = await prisma.vaultInvite.findUnique({
      where: {
        token: params.token,
      },
      include: {
        vault: {
          select: {
            id: true,
            name: true,
          },
        },
        inviter: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return errorResponse('NOT_FOUND', 'Invite not found', 404);
    }

    // Check if invite has expired
    if (new Date() > invite.expiresAt) {
      return errorResponse('EXPIRED', 'This invite link has expired', 410);
    }

    // Check if invite has already been used
    if (invite.usedAt) {
      return errorResponse('USED', 'This invite link has already been used', 410);
    }

    return successResponse({
      vaultName: invite.vault.name,
      inviterName: invite.inviter.name,
      valid: true,
    });
  } catch (error) {
    console.error('Error validating invite:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to validate invite. Please try again.',
      500
    );
  }
}
