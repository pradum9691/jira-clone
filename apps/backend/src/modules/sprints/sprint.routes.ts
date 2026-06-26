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


const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  validate(createSprintSchema),
  requirePermission(Permission.SPRINT_MANAGE),
  sprintController.createSprint
);
 
router.get(
  '/',
  validate(listSprintsSchema),
  sprintController.listSprints
);
 
router.get(
  '/:sprintId',
  validate(getSprintSchema),
  sprintController.getSprint
);

 
router.patch(
  '/:sprintId',
  validate(updateSprintSchema),
  requirePermission(Permission.SPRINT_MANAGE),
  sprintController.updateSprint
);
 
router.delete(
  '/:sprintId',
  validate(deleteSprintSchema),
  requirePermission(Permission.SPRINT_MANAGE),
  sprintController.deleteSprint
);
 
router.post(
  '/:sprintId/start',
  validate(startSprintSchema),
  requirePermission(Permission.SPRINT_MANAGE),
  sprintController.startSprint
);
 
router.post(
  '/:sprintId/complete',
  validate(completeSprintSchema),
  requirePermission(Permission.SPRINT_MANAGE),
  sprintController.completeSprint
);

export default router;