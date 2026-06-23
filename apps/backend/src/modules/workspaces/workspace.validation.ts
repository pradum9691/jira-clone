
import { z } from 'zod';

const objectIdSchema = z.string().regex(
  /^[0-9a-fA-F]{24}$/,
  'Invalid MongoDB ObjectId'
);

export const createWorkspaceSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
    })
    .strict(),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(100),

      slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(3)
        .max(50)
        .regex(
          /^[a-z0-9-]+$/,
          'Slug can only contain lowercase letters, numbers, and hyphens'
        )
        .optional(),

      description: z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),
    })
    .strict(),
});

export const listWorkspacesSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
    })
    .strict(),

  query: z
    .object({
      page: z.coerce
        .number()
        .int()
        .positive()
        .default(1),

      limit: z.coerce
        .number()
        .int()
        .positive()
        .max(50)
        .default(10),
    })
    .strict(),
});

export const getWorkspaceSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,

      slug: z
        .string()
        .trim()
        .min(1, 'Workspace slug is required'),
    })
    .strict(),
});

export const updateWorkspaceSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,

      workspaceId: objectIdSchema,
    })
    .strict(),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2)
        .max(100)
        .optional(),

      description: z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message:
          'At least one field must be provided',
      }
    ),
});

export const deleteWorkspaceSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,

      workspaceId: objectIdSchema,
    })
    .strict(),
});

export type CreateWorkspaceInput =
  z.infer<typeof createWorkspaceSchema>['body'];

export type UpdateWorkspaceInput =
  z.infer<typeof updateWorkspaceSchema>['body'];