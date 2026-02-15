import { z } from 'zod';

/**
 * Zod schema for creating a vault
 */
export const createVaultSchema = z.object({
  name: z
    .string()
    .min(1, 'Vault name is required')
    .max(255, 'Vault name must be less than 255 characters'),
});

/**
 * Zod schema for updating a vault
 */
export const updateVaultSchema = z.object({
  name: z
    .string()
    .min(1, 'Vault name is required')
    .max(255, 'Vault name must be less than 255 characters'),
});

/**
 * Zod schema for creating a source
 */
export const createSourceSchema = z.object({
  title: z
    .string()
    .min(1, 'Source title is required')
    .max(255, 'Source title must be less than 255 characters'),
  url: z.string().url('Invalid URL format').optional(),
  annotation: z.string().optional(),
  fileUrl: z.string().url('Invalid file URL format').optional(),
  fileKey: z.string().optional(),
  fileSize: z.number().int().positive('File size must be positive').optional(),
});

/**
 * Zod schema for updating a source
 */
export const updateSourceSchema = z.object({
  title: z
    .string()
    .min(1, 'Source title is required')
    .max(255, 'Source title must be less than 255 characters')
    .optional(),
  url: z.string().url('Invalid URL format').optional(),
  annotation: z.string().optional(),
  fileUrl: z.string().url('Invalid file URL format').optional(),
  fileKey: z.string().optional(),
  fileSize: z.number().int().positive('File size must be positive').optional(),
});

/**
 * Type inference from Zod schemas
 */
export type CreateVaultInput = z.infer<typeof createVaultSchema>;
export type UpdateVaultInput = z.infer<typeof updateVaultSchema>;
export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;
