import { z } from 'zod';

 
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, 'Invalid ObjectId format');

export const createCommentSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
    })
    .strict(),

  body: z
    .object({
      content: z
        .string()
        .trim()
        .min(1, 'Content must be at least 1 character')
        .max(5000, 'Content cannot exceed 5000 characters'),
    })
    .strict(),
});

export const listCommentsSchema = z.object({
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

export const getCommentSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
      commentId: objectIdSchema,
    })
    .strict(),
});

export const updateCommentSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
      commentId: objectIdSchema,
    })
    .strict(),

  body: z
    .object({
      content: z
        .string()
        .trim()
        .min(1, 'Content must be at least 1 character')
        .max(5000, 'Content cannot exceed 5000 characters')
        .optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: 'At least one field must be provided for update',
      }
    ),
});

export const deleteCommentSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
      commentId: objectIdSchema,
    })
    .strict(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>['body'];
