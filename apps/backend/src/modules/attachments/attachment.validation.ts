import { z } from 'zod';

/**
 * MongoDB ObjectId validation (24-character hex string)
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, 'Invalid ObjectId format');

export const uploadAttachmentSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
    })
    .strict(),
});

export const listAttachmentsSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
    })
    .strict(),

  query: z
    .object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(50).default(10),
    })
    .strict(),
});

export const getAttachmentSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
      attachmentId: objectIdSchema,
    })
    .strict(),
});

export const downloadAttachmentSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
      attachmentId: objectIdSchema,
    })
    .strict(),
});

export const deleteAttachmentSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
      attachmentId: objectIdSchema,
    })
    .strict(),
});

export type UploadAttachmentInput = z.infer<typeof uploadAttachmentSchema>;
