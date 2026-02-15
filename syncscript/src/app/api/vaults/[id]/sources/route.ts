import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  extractAuthHeaders,
  validateRole,
  checkPermission,
} from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responses';
import { createSourceSchema } from '@/lib/validators';
import { ZodError } from 'zod';
import { getSocketIO } from '@/lib/socket';

const prisma = new PrismaClient();

/**
 * POST /api/vaults/[id]/sources
 * Add source to vault (owner and contributor roles)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    if (!checkPermission(auth.role, 'source:create')) {
      return errorResponse(
        'FORBIDDEN',
        'Insufficient permissions. Owner or contributor role required.',
        403
      );
    }

    // Verify vault exists
    const vault = await prisma.vault.findUnique({
      where: { id: params.id },
    });

    if (!vault) {
      return errorResponse('NOT_FOUND', 'Vault not found', 404);
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createSourceSchema.parse(body);

    // Create source in database
    const source = await prisma.source.create({
      data: {
        vaultId: params.id,
        title: validatedData.title,
        url: validatedData.url,
        annotation: validatedData.annotation,
        fileUrl: validatedData.fileUrl,
        fileKey: validatedData.fileKey,
        fileSize: validatedData.fileSize,
      },
    });

    // Emit real-time event to vault room
    try {
      const io = getSocketIO();

      // Fetch user name for actor info
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { name: true },
      });

      // Broadcast source:created event to all clients in vault room
      io.to(`vault:${params.id}`).emit('source:created', {
        source: {
          id: source.id,
          title: source.title,
          fileUrl: source.fileUrl || '',
          fileKey: source.fileKey,
          fileSize: source.fileSize,
          mimeType: 'application/pdf',
          vaultId: source.vaultId,
          createdAt: source.createdAt.toISOString(),
        },
        actor: {
          userId: auth.userId,
          userName: user?.name || 'Unknown User',
          role: auth.role,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (socketError) {
      // Log but don't fail the request if Socket.io emission fails
      console.error('Failed to emit source:created event:', socketError);
    }

    return successResponse(source, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        'INVALID_INPUT',
        `Validation failed: ${error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }

    console.error('Error creating source:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to create source. Please try again.',
      500
    );
  }
}

/**
 * GET /api/vaults/[id]/sources
 * List all sources in a vault (all roles)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Verify vault exists
    const vault = await prisma.vault.findUnique({
      where: { id: params.id },
    });

    if (!vault) {
      return errorResponse('NOT_FOUND', 'Vault not found', 404);
    }

    // Query sources in vault
    const sources = await prisma.source.findMany({
      where: {
        vaultId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(sources);
  } catch (error) {
    console.error('Error fetching sources:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to fetch sources. Please try again.',
      500
    );
  }
}
