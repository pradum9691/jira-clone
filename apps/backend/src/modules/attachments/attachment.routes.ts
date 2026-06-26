import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { Permission } from '../../shared/constants/role-permissions.constant';
import { uploadAttachment } from './upload.middleware';
import {
  uploadAttachmentSchema,
  listAttachmentsSchema,
  getAttachmentSchema,
  downloadAttachmentSchema,
  deleteAttachmentSchema,
} from './attachment.validation';
import * as attachmentController from './attachment.controller';

/**
 * Mounted at /api/v1/organizations/:orgId/workspaces/:workspaceId/projects/:projectId/issues/:issueId/attachments
 * mergeParams: true — gives access to route params from parent routers
 */
const router = Router({ mergeParams: true });

router.use(authenticate);

// POST / — Upload attachment (ISSUE_ATTACHMENT_UPLOAD permission)
router.post(
  '/',
  uploadAttachment.single('file'),
  validate(uploadAttachmentSchema),
  requirePermission(Permission.ISSUE_ATTACHMENT_UPLOAD),
  attachmentController.uploadAttachment
);

// GET / — List attachments (ISSUE_ATTACHMENT_UPLOAD permission)
router.get(
  '/',
  validate(listAttachmentsSchema),
  requirePermission(Permission.ISSUE_ATTACHMENT_UPLOAD),
  attachmentController.listAttachments
);

// GET /:attachmentId — Get single attachment (ISSUE_ATTACHMENT_UPLOAD permission)
router.get(
  '/:attachmentId',
  validate(getAttachmentSchema),
  requirePermission(Permission.ISSUE_ATTACHMENT_UPLOAD),
  attachmentController.getAttachment
);

// GET /:attachmentId/download — Download attachment (ISSUE_ATTACHMENT_UPLOAD permission)
router.get(
  '/:attachmentId/download',
  validate(downloadAttachmentSchema),
  requirePermission(Permission.ISSUE_ATTACHMENT_UPLOAD),
  attachmentController.downloadAttachment
);

// DELETE /:attachmentId — Delete attachment (ISSUE_ATTACHMENT_UPLOAD permission)
router.delete(
  '/:attachmentId',
  validate(deleteAttachmentSchema),
  requirePermission(Permission.ISSUE_ATTACHMENT_UPLOAD),
  attachmentController.deleteAttachment
);

export default router;
