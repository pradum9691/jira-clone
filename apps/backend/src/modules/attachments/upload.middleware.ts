import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

/**
 * Upload destination directory.
 * Created automatically if it does not exist.
 */
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'issues');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Allowed MIME types for attachments.
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

/**
 * Maximum file size: 10 MB
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Disk storage configuration.
 * Generates a unique filename using randomUUID() + original extension.
 */
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || "";
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * MIME type filter.
 * Rejects files with unsupported MIME types.
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
};

/**
 * Multer upload middleware for issue attachments.
 *
 * Usage:
 *   router.post('/', uploadAttachment.single('file'), attachmentController.uploadAttachment);
 */
export const uploadAttachment = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
