import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-session';
import { successResponse, errorResponse } from '@/lib/responses';

/**
 * POST /api/invites/[token]/accept
 * Accept invite and join vault as contributor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Get authenticated user from session
    const auth = await getAuthUser();
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }

    // Find invite by token
    const invite = await prisma.vaultInvite.findUnique({
      where: {
        token: params.token,
      },
      include: {
        vault: true,
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

    // Check if user is already a member
    const existingMember = await prisma.vaultUser.findUnique({
      where: {
        userId_vaultId: {
          userId: auth.userId,
          vaultId: invite.vaultId,
        },
      },
    });

    if (existingMember) {
      return errorResponse(
        'ALREADY_MEMBER',
        'You are already a member of this vault',
        400
      );
    }

    // Add user to vault as contributor
    await prisma.vaultUser.create({
      data: {
        userId: auth.userId,
        vaultId: invite.vaultId,
        role: 'contributor',
      },
    });

    // Mark invite as used
    await prisma.vaultInvite.update({
      where: {
        token: params.token,
      },
      data: {
        usedAt: new Date(),
        usedBy: auth.userId,
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        vaultId: invite.vaultId,
        userId: auth.userId,
        action: 'VAULT_JOINED',
        details: `${auth.name} joined the vault via invite link`,
      },
    });

    return successResponse({
      message: 'Successfully joined vault',
      vaultId: invite.vaultId,
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to accept invite. Please try again.',
      500
    );
  }
}
