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

    // Create vault in database with VaultUser relationship
    const vault = await prisma.vault.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        ownerId: auth.userId,
        vaultUsers: {
          create: {
            userId: auth.userId,
            role: 'owner',
          },
        },
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: auth.userId,
        vaultId: vault.id,
        action: 'VAULT_CREATED',
        details: `${auth.name} created vault: ${vault.name}`,
      },
    });

    return successResponse({ vault }, 201);
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
 * List all vaults accessible to the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const auth = await getAuthUser();
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }

    // Query all vaults where user is a member
    const vaultUsers = await prisma.vaultUser.findMany({
      where: {
        userId: auth.userId,
      },
      include: {
        vault: {
          include: {
            sources: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        vault: {
          createdAt: 'desc',
        },
      },
    });

    // Transform to match frontend interface
    const transformedVaults = vaultUsers.map((vaultUser) => ({
      id: vaultUser.vault.id,
      title: vaultUser.vault.name,
      description: vaultUser.vault.description || '',
      sourceCount: vaultUser.vault.sources.length,
      userRole: vaultUser.role,
      createdAt: vaultUser.vault.createdAt.toISOString(),
      updatedAt: vaultUser.vault.updatedAt.toISOString(),
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
