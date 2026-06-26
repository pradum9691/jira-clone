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

 
export const orgInvitationRouter = Router({ mergeParams: true });

orgInvitationRouter.use(authenticate);

 
orgInvitationRouter.post(
  '/',
  validate(createInvitationSchema),
  requirePermission(Permission.ORG_MEMBER_INVITE),
  invitationController.createInvitation
);

 
orgInvitationRouter.get(
  '/',
  validate(listInvitationsSchema),
  requirePermission(Permission.ORG_MEMBER_INVITE),
  invitationController.listInvitations
);

 
orgInvitationRouter.delete(
  '/:invitationId',
  validate(revokeInvitationSchema),
  requirePermission(Permission.ORG_MEMBER_REMOVE),
  invitationController.revokeInvitation
);
 
export const invitationAcceptRouter = Router();

invitationAcceptRouter.post(
  '/:token/accept',
  authenticate,
  validate(acceptInvitationSchema),
  invitationController.acceptInvitation
);