import { z } from 'zod';

const objectIdSchema = z.string().regex(
  /^[0-9a-fA-F]{24}$/,
  'Invalid MongoDB ObjectId'
);

export const createProjectSchema = z
  .object({
    params: z
      .object({
        orgId: objectIdSchema,
        workspaceId: objectIdSchema,
      }),

    body: z
      .object({
        name: z
          .string({
            required_error: 'Project name is required',
          })
          .trim()
          .min(2, 'Project name must be at least 2 characters')
          .max(100, 'Project name cannot exceed 100 characters'),

        key: z
          .string({
            required_error: 'Project key is required',
          })
          .trim()
          .min(2, 'Project key must be at least 2 characters')
          .max(10, 'Project key cannot exceed 10 characters')
          .regex(
            /^[A-Z0-9]+$/,
            'Project key must contain uppercase letters and numbers only'
          ).toUpperCase(),

        description: z
          .string()
          .trim()
          .max(500, 'Description cannot exceed 500 characters')
          .nullable()
          .optional(),
      })
  })
export const listProjectsSchema = z
  .object({
    params: z
      .object({
        orgId: objectIdSchema,
        workspaceId: objectIdSchema,
      }),

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
      }),
  });

export const getProjectSchema = z
  .object({
    params: z
      .object({
        orgId: objectIdSchema,
        workspaceId: objectIdSchema,
        projectId: objectIdSchema,
      })
      
  })
  
export const updateProjectSchema = z
  .object({
    params: z
      .object({
        orgId: objectIdSchema,
        workspaceId: objectIdSchema,
        projectId: objectIdSchema,
      })
      ,

    body: z
      .object({
        name: z
          .string()
          .trim()
          .min(2, 'Project name must be at least 2 characters')
          .max(100, 'Project name cannot exceed 100 characters')
          .optional(),

        key: z
          .string()
          .trim()
          .min(2, 'Project key must be at least 2 characters')
          .max(10, 'Project key cannot exceed 10 characters')
          .regex(
            /^[A-Z0-9]+$/,
            'Project key must contain uppercase letters and numbers only'
          )
          .optional(),

        description: z
          .string()
          .trim()
          .max(500, 'Description cannot exceed 500 characters')
          .nullable()
          .optional(),
      }).refine(
        (data) => Object.keys(data).length > 0,
        {
          message: 'At least one field must be provided for update',
          path: ['body'],
        }
      ),
  })
 ;

export const deleteProjectSchema = z
  .object({
    params: z
      .object({
        orgId: objectIdSchema,
        workspaceId: objectIdSchema,
        projectId: objectIdSchema,
      })
      ,
  })
  ;

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
