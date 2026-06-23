import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';

import { Permission } from '../../shared/constants/role-permissions.constant';
import {
  createProjectSchema,
  listProjectsSchema,
  getProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
} from './project.validation';

import * as projectController from './project.controller';

/**
 * Mounted at:
 * /api/v1/organizations/:orgId/workspaces/:workspaceId/projects
 *
 * mergeParams: true
 * Allows access to :orgId and :workspaceId from parent router.
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
  validate(createProjectSchema),
  requirePermission(Permission.PROJECT_CREATE),
  projectController.createProject
);

/**
 * GET /
 */
router.get(
  '/',
  validate(listProjectsSchema),
  requirePermission(Permission.PROJECT_VIEW),
  projectController.listProjects
);

/**
 * GET /:projectId
 */
router.get(
  '/:projectId',
  validate(getProjectSchema),
  requirePermission(Permission.PROJECT_VIEW),
  projectController.getProject
);

/**
 * PATCH /:projectId
 */
router.patch(
  '/:projectId',
  validate(updateProjectSchema),
  requirePermission(Permission.PROJECT_UPDATE),
  projectController.updateProject
);

/**
 * DELETE /:projectId
 */
router.delete(
  '/:projectId',
  validate(deleteProjectSchema),
  requirePermission(Permission.PROJECT_DELETE),
  projectController.deleteProject
);

export default router;
