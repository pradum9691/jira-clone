import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { Permission } from '../../shared/constants/role-permissions.constant';
import {
  createCommentSchema,
  listCommentsSchema,
  getCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
} from './comment.validation';
import * as commentController from './comment.controller';

/**
 * Mounted at /api/v1/organizations/:orgId/workspaces/:workspaceId/projects/:projectId/issues/:issueId/comments
 * mergeParams: true — gives access to route params from parent routers
 */
const router = Router({ mergeParams: true });

router.use(authenticate);

// POST / — Create comment (ISSUE_COMMENT permission)
router.post(
  '/',
  validate(createCommentSchema),
  requirePermission(Permission.ISSUE_COMMENT),
  commentController.createComment
);

// GET / — List comments (ISSUE_COMMENT permission)
router.get(
  '/',
  validate(listCommentsSchema),
  requirePermission(Permission.ISSUE_COMMENT),
  commentController.listComments
);

// GET /:commentId — Get single comment (ISSUE_COMMENT permission)
router.get(
  '/:commentId',
  validate(getCommentSchema),
  requirePermission(Permission.ISSUE_COMMENT),
  commentController.getComment
);

// PATCH /:commentId — Update comment (ISSUE_COMMENT permission)
router.patch(
  '/:commentId',
  validate(updateCommentSchema),
  requirePermission(Permission.ISSUE_COMMENT),
  commentController.updateComment
);

// DELETE /:commentId — Delete comment (ISSUE_COMMENT permission)
router.delete(
  '/:commentId',
  validate(deleteCommentSchema),
  requirePermission(Permission.ISSUE_COMMENT),
  commentController.deleteComment
);

export default router;
