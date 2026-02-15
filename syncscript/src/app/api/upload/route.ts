import { NextRequest } from 'next/server';
import {
  extractAuthHeaders,
  validateRole,
  checkPermission,
} from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responses';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * POST /api/upload
 * Upload PDF file to Cloudinary (owner and contributor roles)
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
    if (!checkPermission(auth.role, 'source:create')) {
      return errorResponse(
        'FORBIDDEN',
        'Insufficient permissions. Owner or contributor role required.',
        403
      );
    }

    // Extract file from multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse(
        'INVALID_INPUT',
        'No file provided',
        400
      );
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return errorResponse(
        'INVALID_INPUT',
        'Only PDF files are allowed',
        400
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return errorResponse(
        'INVALID_INPUT',
        'File size exceeds 10MB limit',
        400
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, {
      resource_type: 'raw',
      folder: 'syncscript-uploads',
    }) as any;

    // Return upload result
    return successResponse({
      url: result.secure_url,
      publicId: result.public_id,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return errorResponse(
      'SERVER_ERROR',
      'File upload failed. Please try again.',
      500
    );
  }
}
