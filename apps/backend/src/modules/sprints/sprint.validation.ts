import { z } from 'zod';
import { SprintStatus } from '../../shared/enums/sprint-status.enum';

 
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, 'Invalid ObjectId format');

export const createSprintSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
    }),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, 'Sprint name must be at least 2 characters')
        .max(100, 'Sprint name cannot exceed 100 characters'),

      goal: z
        .string()
        .trim()
        .max(500, 'Sprint goal cannot exceed 500 characters')
        .nullable()
        .optional(),

      startDate: z.coerce.date().nullable().optional(),

      endDate: z.coerce.date().nullable().optional(),
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return data.endDate > data.startDate;
        }
        return true;
      },
      {
        message: 'End date must be greater than start date',
        path: ['endDate'],
      }
    ),
});

export const listSprintsSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
    }),

  query: z
    .object({
      status: z.nativeEnum(SprintStatus).optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(50).default(10),
    }),
});

export const getSprintSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      sprintId: objectIdSchema,
    }),
});

export const updateSprintSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      sprintId: objectIdSchema,
    }),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, 'Sprint name must be at least 2 characters')
        .max(100, 'Sprint name cannot exceed 100 characters')
        .optional(),

      goal: z
        .string()
        .trim()
        .max(500, 'Sprint goal cannot exceed 500 characters')
        .nullable()
        .optional(),

      startDate: z.coerce.date().nullable().optional(),

      endDate: z.coerce.date().nullable().optional(),
    })

     
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: 'At least one field must be provided for update',
      }
    )

    
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return data.endDate > data.startDate;
        }
        return true;
      },
      {
        message: 'End date must be greater than start date',
        path: ['endDate'],
      }
    ),
});

export const deleteSprintSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      sprintId: objectIdSchema,
    }),
});

export const startSprintSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      sprintId: objectIdSchema,
    }),

  body: z.object({}),
});

export const completeSprintSchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      sprintId: objectIdSchema,
    }),

  body: z.object({}),
});

export type CreateSprintInput =
  z.infer<typeof createSprintSchema>['body'];

export type UpdateSprintInput =
  z.infer<typeof updateSprintSchema>['body'];