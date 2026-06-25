import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { Permission } from '../../shared/constants/role-permissions.constant';
import {
  createSprintSchema,
  listSprintsSchema,
  getSprintSchema,
  updateSprintSchema,
  deleteSprintSchema,
  startSprintSchema,
  completeSprintSchema,
} from './sprint.validation';
import * as sprintController from './sprint.controller';

/**
 * Mounted at /api/v1/organizations/:orgId/workspaces/:workspaceId/projects/:projectId/sprints
 * mergeParams: true — gives access to :orgId, :workspaceId, :projectId from parent routers
 */
const router = Router({ mergeParams: true });

router.use(authenticate);

// POST /projects/:projectId/sprints — create sprint (SPRINT_MANAGE)
router.post(
  '/',
  validate(createSprintSchema),
  requirePermission(Permission.SPRINT_MANAGE),
  sprintController.createSprint
);

// GET /projects/:projectId/sprints — list sprints (authenticated only)
router.get(
  '/',
  validate(listSprintsSchema),
  sprintController.listSprints
);

// GET /projects/:projectId/sprints/:sprintId — get single sprint (authenticated only)
router.get(
  '/:sprintId',
  validate(getSprintSchema),
  sprintController.getSprint
);

// PATCH /projects/:projectId/sprints/:sprintId — update sprint (SPRINT_MANAGE)
router.patch(
  '/:sprintId',
  validate(updateSprintSchema),
  requirePermission(Permission.SPRINT_MANAGE),
  sprintController.updateSprint
);

// DELETE /projects/:projectId/sprints/:sprintId — delete sprint (SPRINT_MANAGE)
router.delete(
  '/:sprintId',
  validate(deleteSprintSchema),
  requirePermission(Permission.SPRINT_MANAGE),
  sprintController.deleteSprint
);

// POST /projects/:projectId/sprints/:sprintId/start — start sprint (SPRINT_MANAGE)
router.post(
  '/:sprintId/start',
  validate(startSprintSchema),
  requirePermission(Permission.SPRINT_MANAGE),
  sprintController.startSprint
);

// POST /projects/:projectId/sprints/:sprintId/complete — complete sprint (SPRINT_MANAGE)
router.post(
  '/:sprintId/complete',
  validate(completeSprintSchema),
  requirePermission(Permission.SPRINT_MANAGE),
  sprintController.completeSprint
);

export default router;