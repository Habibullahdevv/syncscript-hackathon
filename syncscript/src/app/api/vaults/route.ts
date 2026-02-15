import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  extractAuthHeaders,
  validateRole,
  checkPermission,
} from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responses';
import { createVaultSchema } from '@/lib/validators';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

/**
 * POST /api/vaults
 * Create a new vault (owner role only)
 */
export async function POST(request: NextRequest) {
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

    // Query vaults owned by user
    const vaults = await prisma.vault.findMany({
      where: {
        ownerId: auth.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(vaults);
  } catch (error) {
    console.error('Error fetching vaults:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to fetch vaults. Please try again.',
      500
    );
  }
}
