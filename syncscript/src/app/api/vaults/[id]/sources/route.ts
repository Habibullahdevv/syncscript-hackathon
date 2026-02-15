import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, checkPermission } from '@/lib/auth-session';
import { successResponse, errorResponse } from '@/lib/responses';
import { createSourceSchema } from '@/lib/validators';
import { ZodError } from 'zod';
import { getIO } from '@/../../server';

/**
 * POST /api/vaults/[id]/sources
 * Add source to vault (owner and contributor roles)
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
        content: validatedData.content,
        tags: validatedData.tags || [],
        annotation: validatedData.annotation,
        fileUrl: validatedData.fileUrl,
        fileKey: validatedData.fileKey,
        fileSize: validatedData.fileSize,
        createdById: auth.userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
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
        vaultId: params.id,
        action: 'SOURCE_ADDED',
        details: `${auth.name} added source: ${source.title}`,
      },
    });

    // Emit real-time event to vault room
    try {
      const io = getIO();

      // Broadcast source:created event to all clients in vault room
      io.to(`vault:${params.id}`).emit('source:created', {
        vaultId: params.id,
        source: {
          id: source.id,
          title: source.title,
        },
        actor: {
          name: auth.name,
          email: auth.email,
        },
      });
    } catch (socketError) {
      // Log but don't fail the request if Socket.io emission fails
      console.error('Failed to emit source:created event:', socketError);
    }

    return successResponse({ source }, 201);
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
    // Get authenticated user from session
    const auth = await getAuthUser();
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
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

    // Transform to match frontend interface
    const transformedSources = sources.map((source) => ({
      id: source.id,
      vaultId: source.vaultId,
      title: source.title,
      fileUrl: source.fileUrl || '',
      fileSize: source.fileSize || 0,
      uploadedBy: 'User',
      createdAt: source.createdAt.toISOString(),
      updatedAt: source.createdAt.toISOString(),
    }));

    return successResponse({ sources: transformedSources });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return errorResponse(
      'SERVER_ERROR',
      'Failed to fetch sources. Please try again.',
      500
    );
  }
}
