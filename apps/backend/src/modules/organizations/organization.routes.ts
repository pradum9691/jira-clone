import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { Permission } from '../../shared/constants/role-permissions.constant';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  getOrganizationSchema,
} from './organization.validation';
import * as orgController from './organization.controller';
import { orgInvitationRouter } from './invitation.routes';
import workspaceRoutes from '../workspaces/workspace.routes';
import projectRoutes from '../projects/project.routes';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrganizationSchema), orgController.createOrganization);
router.get('/', orgController.getMyOrganizations);
router.get('/:slug', validate(getOrganizationSchema), orgController.getOrganization);
router.patch(
  '/:orgId',
  validate(updateOrganizationSchema),
  requirePermission(Permission.ORG_MANAGE),
  orgController.updateOrganization
);

router.delete(
  '/:orgId',
  requirePermission(Permission.ORG_MANAGE),
  orgController.deleteOrganization
);

// Nested: /organizations/:orgId/invitations/...
router.use('/:orgId/invitations', orgInvitationRouter);

// Nested: /organizations/:orgId/workspaces/...
router.use('/:orgId/workspaces', workspaceRoutes);

router.use(
  '/:orgId/workspaces/:workspaceId/projects',
  projectRoutes
);
export default router;