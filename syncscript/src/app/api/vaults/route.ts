import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, checkPermission } from '@/lib/auth-session';
import { successResponse, errorResponse } from '@/lib/responses';
import { createVaultSchema } from '@/lib/validators';
import { ZodError } from 'zod';

/**
 * POST /api/vaults
 * Create a new vault (owner role only)
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session
    const auth = await getAuthUser();
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }

    // Check permission
    if (!checkPermission(auth.role, 'vault:create')) {
      return errorResponse(
        'FORBIDDEN',
        'Insufficient permissions. Owner role required.',
        403
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createVaultSchema.parse(body);

    // Create vault in database
    const vault = await prisma.vault.create({
      data: {
        name: validatedData.name,
        ownerId: auth.userId,
      },
    });

    return successResponse(vault, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        'INVALID_INPUT',
        `Validation failed: ${error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }

    console.error('Error creating vault:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to create vault. Please try again.',
      500
    );
  }
}

/**
 * GET /api/vaults
 * List all vaults owned by the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const auth = await getAuthUser();
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }

    // Query vaults owned by user
    const vaults = await prisma.vault.findMany({
      where: {
        ownerId: auth.userId,
      },
      include: {
        sources: {
          select: {
            id: true,
          },
        },
        vaultUsers: {
          where: {
            userId: auth.userId,
          },
          select: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend interface
    const transformedVaults = vaults.map((vault) => ({
      id: vault.id,
      title: vault.name,
      description: '',
      sourceCount: vault.sources.length,
      userRole: vault.vaultUsers[0]?.role || 'owner',
      createdAt: vault.createdAt.toISOString(),
      updatedAt: vault.updatedAt.toISOString(),
    }));

    return successResponse({ vaults: transformedVaults });
  } catch (error) {
    console.error('Error fetching vaults:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to fetch vaults. Please try again.',
      500
    );
  }
}
