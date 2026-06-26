import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { Permission } from '../../shared/constants/role-permissions.constant';
import {
  listActivitiesSchema,
  getActivitySchema,
} from './activity.validation';
import * as activityController from './activity.controller';

 
const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(
  '/',
  validate(listActivitiesSchema),
  requirePermission(Permission.ISSUE_VIEW),
  activityController.listActivities
);

router.get(
  '/:activityId',
  validate(getActivitySchema),
  requirePermission(Permission.ISSUE_VIEW),
  activityController.getActivity
);

export default router;