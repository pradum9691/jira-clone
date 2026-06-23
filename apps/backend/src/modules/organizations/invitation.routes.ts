import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { Permission } from '../../shared/constants/role-permissions.constant';
import {
  createInvitationSchema,
  listInvitationsSchema,
  acceptInvitationSchema,
  revokeInvitationSchema,
} from './invitation.validation';
import * as invitationController from './invitation.controller';

/**
 * Routes nested under /api/v1/organizations/:orgId/invitations
 * (mounted in organization.routes.ts)
 */
export const orgInvitationRouter = Router({ mergeParams: true });

orgInvitationRouter.use(authenticate);

// POST /organizations/:orgId/invitations — send invite (ORG_ADMIN)
orgInvitationRouter.post(
  '/',
  validate(createInvitationSchema),
  requirePermission(Permission.ORG_MEMBER_INVITE),
  invitationController.createInvitation
);

// GET /organizations/:orgId/invitations — list invitations (ORG_ADMIN)
orgInvitationRouter.get(
  '/',
  validate(listInvitationsSchema),
  requirePermission(Permission.ORG_MEMBER_INVITE),
  invitationController.listInvitations
);

// DELETE /organizations/:orgId/invitations/:invitationId — revoke (ORG_ADMIN)
orgInvitationRouter.delete(
  '/:invitationId',
  validate(revokeInvitationSchema),
  requirePermission(Permission.ORG_MEMBER_REMOVE),
  invitationController.revokeInvitation
);

/**
 * Standalone accept route — /api/v1/invitations/:token/accept
 * Does NOT need org context; token is self-contained.
 * (mounted separately in routes/index.ts)
 */
export const invitationAcceptRouter = Router();

invitationAcceptRouter.post(
  '/:token/accept',
  authenticate,
  validate(acceptInvitationSchema),
  invitationController.acceptInvitation
);