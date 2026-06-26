import { z } from 'zod';
import { IssueStatus } from '../../shared/enums/issue-status.enum';
import { IssuePriority } from '../../shared/enums/issue-priority.enum';
import { IssueType } from '../../shared/enums/issue-type.enum';

 
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, 'Invalid ObjectId format');

export const createIssueSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
    })
    .strict(),

  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters'),

      description: z
        .string()
        .trim()
        .max(2000, 'Description cannot exceed 2000 characters')
        .nullable()
        .optional(),

      sprintId: objectIdSchema
        .nullable()
        .optional(),

      priority: z
        .nativeEnum(IssuePriority)
        .optional(),

      type: z
        .nativeEnum(IssueType)
        .optional(),

      assigneeId: objectIdSchema
        .nullable()
        .optional(),

      dueDate: z.coerce
        .date()
        .nullable()
        .optional(),

      labels: z
        .array(
          z
            .string()
            .trim()
            .min(1, 'Label cannot be empty')
            .max(30, 'Each label cannot exceed 30 characters')
        )
        .max(5, 'Cannot have more than 5 labels')
        .optional(),
    })
    .strict(),
});

export const listIssuesSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
    })
    .strict(),

  query: z
    .object({
      sprintId: objectIdSchema.optional(),
      status: z.nativeEnum(IssueStatus).optional(),
      priority: z.nativeEnum(IssuePriority).optional(),
      type: z.nativeEnum(IssueType).optional(),
      assigneeId: objectIdSchema.optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(50).default(10),
    })
    .strict(),
});

export const getIssueSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
    })
    .strict(),
});

export const updateIssueSchema = z.object({
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
      title: z
        .string()
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .optional(),

      description: z
        .string()
        .trim()
        .max(2000, 'Description cannot exceed 2000 characters')
        .nullable()
        .optional(),

      sprintId: objectIdSchema
        .nullable()
        .optional(),

      status: z
        .nativeEnum(IssueStatus)
        .optional(),

      priority: z
        .nativeEnum(IssuePriority)
        .optional(),

      type: z
        .nativeEnum(IssueType)
        .optional(),

      assigneeId: objectIdSchema
        .nullable()
        .optional(),

      dueDate: z.coerce
        .date()
        .nullable()
        .optional(),

      labels: z
        .array(
          z
            .string()
            .trim()
            .min(1, 'Label cannot be empty')
            .max(30, 'Each label cannot exceed 30 characters')
        )
        .max(5, 'Cannot have more than 5 labels')
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

export const deleteIssueSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
    })
    .strict(),
});

export type CreateIssueInput =
  z.infer<typeof createIssueSchema>['body'];

export type UpdateIssueInput =
  z.infer<typeof updateIssueSchema>['body'];