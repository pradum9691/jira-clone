import { z } from 'zod';

 
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, 'Invalid ObjectId format');

export const listActivitiesSchema = z.object({
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

export const getActivitySchema = z.object({
  params: z
    .object({
      orgId: objectIdSchema,
      workspaceId: objectIdSchema,
      projectId: objectIdSchema,
      issueId: objectIdSchema,
      activityId: objectIdSchema,
    })
    .strict(),
});

export type ListActivitiesInput = z.infer<typeof listActivitiesSchema>;
export type GetActivityInput = z.infer<typeof getActivitySchema>;
