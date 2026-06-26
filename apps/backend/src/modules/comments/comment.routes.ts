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

 
const router = Router({ mergeParams: true });

router.use(authenticate);
 
router.post(
  '/',
  validate(createCommentSchema),
  requirePermission(Permission.ISSUE_COMMENT),
  commentController.createComment
);

 
router.get(
  '/',
  validate(listCommentsSchema),
  requirePermission(Permission.ISSUE_COMMENT),
  commentController.listComments
);

 
router.get(
  '/:commentId',
  validate(getCommentSchema),
  requirePermission(Permission.ISSUE_COMMENT),
  commentController.getComment
);

 
router.patch(
  '/:commentId',
  validate(updateCommentSchema),
  requirePermission(Permission.ISSUE_COMMENT),
  commentController.updateComment
);
 
router.delete(
  '/:commentId',
  validate(deleteCommentSchema),
  requirePermission(Permission.ISSUE_COMMENT),
  commentController.deleteComment
);

export default router;
