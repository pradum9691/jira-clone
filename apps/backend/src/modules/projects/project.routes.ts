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
import sprintRoutes from '../sprints/sprint.routes';
import issueRoutes from '../issues/issue.routes';


 
const router = Router({
  mergeParams: true,
});

router.use(authenticate);

 
router.post(
  '/',
  validate(createProjectSchema),
  requirePermission(Permission.PROJECT_CREATE),
  projectController.createProject
);

 
router.get(
  '/',
  validate(listProjectsSchema),
  requirePermission(Permission.PROJECT_VIEW),
  projectController.listProjects
);
 
router.get(
  '/:projectId',
  validate(getProjectSchema),
  requirePermission(Permission.PROJECT_VIEW),
  projectController.getProject
);

 
router.patch(
  '/:projectId',
  validate(updateProjectSchema),
  requirePermission(Permission.PROJECT_UPDATE),
  projectController.updateProject
);

 
router.delete(
  '/:projectId',
  validate(deleteProjectSchema),
  requirePermission(Permission.PROJECT_DELETE),
  projectController.deleteProject
);

router.use(
  '/:projectId/sprints',
  sprintRoutes
);

router.use(
  '/:projectId/issues',
  issueRoutes
);

export default router;
