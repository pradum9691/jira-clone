import { z } from 'zod';
import { OrgRole } from '../../shared/enums/role.enum';

const objectIdSchema = z.string().regex(
  /^[0-9a-fA-F]{24}$/,
  'Invalid MongoDB ObjectId'
);

export const createInvitationSchema = z.object({
  params: z.object({
    orgId: objectIdSchema,
  }),

  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address'),

    role: z
      .nativeEnum(OrgRole, {
        errorMap: () => ({
          message: 'Invalid role',
        }),
      })
      .refine(
        (role) => role !== OrgRole.SUPER_ADMIN,
        {
          message:
            'SUPER_ADMIN cannot be assigned through invitations',
        }
      ),
  }),
});

export const listInvitationsSchema = z.object({
  params: z.object({
    orgId: objectIdSchema,
  }),

  query: z.object({
    status: z
      .enum([
        'PENDING',
        'ACCEPTED',
        'EXPIRED',
        'REVOKED',
      ])
      .optional(),

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

export const acceptInvitationSchema = z.object({
  params: z.object({
    token: z.string().min(
      1,
      'Token is required'
    ),
  }),
});

export const revokeInvitationSchema = z.object({
  params: z.object({
    orgId: objectIdSchema,

    invitationId: objectIdSchema,
  }),
});

export type CreateInvitationInput =
  z.infer<
    typeof createInvitationSchema
  >['body'];