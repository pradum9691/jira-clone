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


/**
 * Mounted at /api/v1/organizations/:orgId/workspaces/:workspaceId/projects/:projectId/issues
 * mergeParams: true — gives access to :orgId, :workspaceId, :projectId from parent routers
 */
const router = Router({ mergeParams: true });

router.use(authenticate);

// POST / — create issue (ISSUE_CREATE)
router.post(
  '/',
  validate(createIssueSchema),
  requirePermission(Permission.ISSUE_CREATE),
  issueController.createIssue
);

// GET / — list issues (ISSUE_VIEW)
router.get(
  '/',
  validate(listIssuesSchema),
  requirePermission(Permission.ISSUE_VIEW),
  issueController.listIssues
);

// GET /:issueId — get single issue (ISSUE_VIEW)
router.get(
  '/:issueId',
  validate(getIssueSchema),
  requirePermission(Permission.ISSUE_VIEW),
  issueController.getIssue
);

// PATCH /:issueId — update issue (ISSUE_UPDATE)
router.patch(
  '/:issueId',
  validate(updateIssueSchema),
  requirePermission(Permission.ISSUE_UPDATE),
  issueController.updateIssue
);

// DELETE /:issueId — delete issue (ISSUE_DELETE)
router.delete(
  '/:issueId',
  validate(deleteIssueSchema),
  requirePermission(Permission.ISSUE_DELETE),
  issueController.deleteIssue
);

router.use('/:issueId/comments', commentRoutes);

export default router;
