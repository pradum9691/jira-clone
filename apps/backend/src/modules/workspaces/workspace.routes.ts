import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';

import { Permission } from '../../shared/constants/role-permissions.constant';

import {
  createWorkspaceSchema,
  listWorkspacesSchema,
  getWorkspaceSchema,
  updateWorkspaceSchema,
  deleteWorkspaceSchema,
} from './workspace.validation';

import * as workspaceController from './workspace.controller';

/**
 * Mounted at:
 * /api/v1/organizations/:orgId/workspaces
 *
 * mergeParams: true
 * Allows access to :orgId from parent router.
 */
const router = Router({
  mergeParams: true,
});

router.use(authenticate);

/**
 * POST /
 */
router.post(
  '/',
  validate(createWorkspaceSchema),
  requirePermission(
    Permission.WORKSPACE_CREATE
  ),
  workspaceController.createWorkspace
);

/**
 * GET /
 */
router.get(
  '/',
  validate(listWorkspacesSchema),
  requirePermission(
    Permission.WORKSPACE_VIEW
  ),
  workspaceController.listWorkspaces
);

/**
 * GET /:slug
 */
router.get(
  '/:slug',
  validate(getWorkspaceSchema),
  requirePermission(
    Permission.WORKSPACE_VIEW
  ),
  workspaceController.getWorkspace
);

/**
 * PATCH /:workspaceId
 */
router.patch(
  '/:workspaceId',
  validate(updateWorkspaceSchema),
  requirePermission(
    Permission.WORKSPACE_UPDATE
  ),
  workspaceController.updateWorkspace
);

/**
 * DELETE /:workspaceId
 */
router.delete(
  '/:workspaceId',
  validate(deleteWorkspaceSchema),
  requirePermission(
    Permission.WORKSPACE_DELETE
  ),
  workspaceController.deleteWorkspace
);

export default router;