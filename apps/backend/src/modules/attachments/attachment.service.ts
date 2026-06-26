import fs from "fs/promises";
import { Types } from "mongoose";
import { Attachment } from "./attachment.model";
import { Project } from "../projects/project.model";
import { Issue } from "../issues/issue.model";
import { OrgRole } from "../../shared/enums/role.enum";
import { BadRequestError, NotFoundError } from "../../errors";

/**
 * Verify project belongs to organization
 */
async function verifyProjectBelongsToOrg(
  orgId: string,
  projectId: string,
): Promise<void> {
  const exists = await Project.exists({
    _id: new Types.ObjectId(projectId),
    organizationId: new Types.ObjectId(orgId),
  });

  if (!exists) {
    throw new NotFoundError("Project not found");
  }
}

/**
 * Verify issue belongs to organization and project
 */
async function verifyIssueBelongsToProject(
  orgId: string,
  projectId: string,
  issueId: string,
): Promise<void> {
  const exists = await Issue.exists({
    _id: new Types.ObjectId(issueId),
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
  });

  if (!exists) {
    throw new NotFoundError("Issue not found");
  }
}

/**
 * Fetch attachment document for mutations
 */
async function getAttachmentById(
  orgId: string,
  projectId: string,
  issueId: string,
  attachmentId: string,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const attachment = await Attachment.findOne({
    _id: new Types.ObjectId(attachmentId),
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
    issueId: new Types.ObjectId(issueId),
  });

  if (!attachment) {
    throw new NotFoundError("Attachment not found");
  }

  return attachment;
}

/**
 * Fetch attachment lean (read-only)
 */
async function getAttachmentByIdLean(
  orgId: string,
  projectId: string,
  issueId: string,
  attachmentId: string,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const attachment = await Attachment.findOne({
    _id: new Types.ObjectId(attachmentId),
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
    issueId: new Types.ObjectId(issueId),
  })
    .populate("uploadedBy", "name email avatarUrl")
    .lean();

  if (!attachment) {
    throw new NotFoundError("Attachment not found");
  }

  return attachment;
}

/**
 * Upload Attachment
 */
export async function uploadAttachment(
  orgId: string,
  projectId: string,
  issueId: string,
  userId: string,
  file: Express.Multer.File,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  if (!file) {
    throw new BadRequestError("No file uploaded");
  }

  try {
    await fs.access(file.path);
  } catch {
    throw new BadRequestError("Uploaded file not found");
  }

  const attachment = await Attachment.create({
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
    issueId: new Types.ObjectId(issueId),
    fileName: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    storagePath: file.path,
    uploadedBy: new Types.ObjectId(userId),
    createdById: new Types.ObjectId(userId),
  });

  const populated = await Attachment.findById(attachment._id)
    .populate("uploadedBy", "name email avatarUrl")
    .lean();

  if (!populated) {
    throw new NotFoundError("Attachment upload failed");
  }

  return populated;
}

/**
 * List Attachments (newest first)
 */
export async function listAttachments(
  orgId: string,
  projectId: string,
  issueId: string,
  page: number,
  limit: number,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const filter = {
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
    issueId: new Types.ObjectId(issueId),
  };

  const [attachments, total] = await Promise.all([
    Attachment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("uploadedBy", "name email avatarUrl")
      .lean(),

    Attachment.countDocuments(filter),
  ]);

  return {
    data: attachments,
    total,
    page,
    limit,
  };
}

/**
 * Get single attachment (lean)
 */
export async function getAttachment(
  orgId: string,
  projectId: string,
  issueId: string,
  attachmentId: string,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  return getAttachmentByIdLean(orgId, projectId, issueId, attachmentId);
}

/**
 * Download Attachment
 * Verifies physical file existence before returning.
 * Controller is responsible for streaming.
 */
export async function downloadAttachment(
  orgId: string,
  projectId: string,
  issueId: string,
  attachmentId: string,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const attachment = await getAttachmentById(
    orgId,
    projectId,
    issueId,
    attachmentId,
  );

  try {
    await fs.access(attachment.storagePath);
  } catch {
    throw new NotFoundError("Attachment file not found on server");
  }

  return attachment;
}

/**
 * Delete Attachment
 * Only uploader, ORG_ADMIN, or SUPER_ADMIN can delete.
 * Removes physical file from disk then soft-deletes the record.
 */
export async function deleteAttachment(
  orgId: string,
  projectId: string,
  issueId: string,
  attachmentId: string,
  userId: string,
  userRole: OrgRole,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const attachment = await getAttachmentById(
    orgId,
    projectId,
    issueId,
    attachmentId,
  );

  const isUploader = attachment.uploadedBy.toString() === userId;
  const isAdmin =
    userRole === OrgRole.SUPER_ADMIN || userRole === OrgRole.ORG_ADMIN;

  if (!isUploader && !isAdmin) {
    throw new BadRequestError(
      "Only the attachment uploader or an administrator can delete this attachment",
    );
  }

  // Remove physical file, ignore if already missing
  try {
    await fs.unlink(attachment.storagePath);
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  await attachment.softDelete();

  return attachment;
}
