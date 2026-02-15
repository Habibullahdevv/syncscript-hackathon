import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, checkPermission } from '@/lib/auth-session';
import { successResponse, errorResponse } from '@/lib/responses';
import { updateVaultSchema } from '@/lib/validators';
import { ZodError } from 'zod';

/**
 * GET /api/vaults/[id]
 * Get vault details by ID (all roles)
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

    // Find vault by ID with sources and vault users
    const vault = await prisma.vault.findUnique({
      where: {
        id: id,
      },
      include: {
        sources: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        vaultUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!vault) {
      return errorResponse('NOT_FOUND', 'Vault not found', 404);
    }

    // Check if user has access to this vault
    const userAccess = vault.vaultUsers.find(vu => vu.userId === auth.userId);
    if (!userAccess) {
      return errorResponse('FORBIDDEN', 'You do not have access to this vault', 403);
    }

    // Add user's role to the response
    const vaultWithRole = {
      ...vault,
      userRole: userAccess.role,
    };

    return successResponse({ vault: vaultWithRole });
  } catch (error) {
    console.error('Error fetching vault:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to fetch vault. Please try again.',
      500
    );
  }
}

/**
 * PATCH /api/vaults/[id]
 * Update vault name (owner and contributor roles)
 */
export async function PATCH(
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

    // Check permission
    if (!checkPermission(auth.role, 'vault:update')) {
      return errorResponse(
        'FORBIDDEN',
        'Insufficient permissions. Owner or contributor role required.',
        403
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateVaultSchema.parse(body);

    // Update vault in database
    const vault = await prisma.vault.update({
      where: {
        id: id,
      },
      data: {
        name: validatedData.name,
      },
    });

    return successResponse({ vault });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        'INVALID_INPUT',
        `Validation failed: ${error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }

    // Handle Prisma not found error
    if ((error as any).code === 'P2025') {
      return errorResponse('NOT_FOUND', 'Vault not found', 404);
    }

    console.error('Error updating vault:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to update vault. Please try again.',
      500
    );
  }
}

/**
 * DELETE /api/vaults/[id]
 * Delete vault and cascade delete all sources (owner role only)
 */
export async function DELETE(
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

    // Check permission
    if (!checkPermission(auth.role, 'vault:delete')) {
      return errorResponse(
        'FORBIDDEN',
        'Insufficient permissions. Owner role required.',
        403
      );
    }

    // Delete vault (cascade deletes sources automatically)
    await prisma.vault.delete({
      where: {
        id: id,
      },
    });

    return successResponse({
      message: 'Vault deleted successfully',
    });
  } catch (error) {
    // Handle Prisma not found error
    if ((error as any).code === 'P2025') {
      return errorResponse('NOT_FOUND', 'Vault not found', 404);
    }

    console.error('Error deleting vault:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to delete vault. Please try again.',
      500
    );
  }
}
