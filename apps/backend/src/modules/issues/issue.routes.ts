import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { Permission } from '../../shared/constants/role-permissions.constant';
import {
  createIssueSchema,
  listIssuesSchema,
  getIssueSchema,
  updateIssueSchema,
  deleteIssueSchema,
} from './issue.validation';
import * as issueController from './issue.controller';
import commentRoutes from '../comments/comment.routes';
import attachmentRoutes from '../attachments/attachment.routes';
import activityRoutes from '../activities/activity.routes'

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  validate(createIssueSchema),
  requirePermission(Permission.ISSUE_CREATE),
  issueController.createIssue
);

router.get(
  '/',
  validate(listIssuesSchema),
  requirePermission(Permission.ISSUE_VIEW),
  issueController.listIssues
);

router.get(
  '/:issueId',
  validate(getIssueSchema),
  requirePermission(Permission.ISSUE_VIEW),
  issueController.getIssue
);

router.patch(
  '/:issueId',
  validate(updateIssueSchema),
  requirePermission(Permission.ISSUE_UPDATE),
  issueController.updateIssue
);

router.delete(
  '/:issueId',
  validate(deleteIssueSchema),
  requirePermission(Permission.ISSUE_DELETE),
  issueController.deleteIssue
);

router.use('/:issueId/comments', commentRoutes);
router.use('/:issueId/attachments', attachmentRoutes);
router.use('/:issueId/activities', activityRoutes);

export default router;
