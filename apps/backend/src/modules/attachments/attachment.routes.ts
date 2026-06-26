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

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  uploadAttachment.single('file'),
  validate(uploadAttachmentSchema),
  requirePermission(Permission.ISSUE_ATTACHMENT_UPLOAD),
  attachmentController.uploadAttachment
);

router.get(
  '/',
  validate(listAttachmentsSchema),
  requirePermission(Permission.ISSUE_ATTACHMENT_UPLOAD),
  attachmentController.listAttachments
);

router.get(
  '/:attachmentId',
  validate(getAttachmentSchema),
  requirePermission(Permission.ISSUE_ATTACHMENT_UPLOAD),
  attachmentController.getAttachment
);

router.get(
  '/:attachmentId/download',
  validate(downloadAttachmentSchema),
  requirePermission(Permission.ISSUE_ATTACHMENT_UPLOAD),
  attachmentController.downloadAttachment
);

router.delete(
  '/:attachmentId',
  validate(deleteAttachmentSchema),
  requirePermission(Permission.ISSUE_ATTACHMENT_UPLOAD),
  attachmentController.deleteAttachment
);

export default router;
