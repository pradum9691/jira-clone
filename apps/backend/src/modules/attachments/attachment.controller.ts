import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse, buildPagination } from "../../shared/utils/api-response";
import * as attachmentService from "./attachment.service";
import { BadRequestError } from '../../errors';


export const uploadAttachment = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No file uploaded");
  }
  const attachment = await attachmentService.uploadAttachment(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    req.user!.userId,
    req.file,
  );

  sendResponse(res, {
    statusCode: 201,
    data: attachment,
    message: "Attachment uploaded successfully",
  });
});


export const listAttachments = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const result = await attachmentService.listAttachments(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    page,
    limit,
  );

  sendResponse(res, {
    data: result.data,
    message: "Attachments fetched successfully",
    pagination: buildPagination(result.page, result.limit, result.total),
  });
});


export const getAttachment = catchAsync(async (req, res) => {
  const attachment = await attachmentService.getAttachment(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    req.params.attachmentId,
  );

  sendResponse(res, {
    data: attachment,
    message: "Attachment fetched successfully",
  });
});

export const downloadAttachment = catchAsync(async (req, res) => {
  const attachment = await attachmentService.downloadAttachment(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    req.params.attachmentId,
  );

  res.download(attachment.storagePath, attachment.originalName);
});


export const deleteAttachment = catchAsync(async (req, res) => {
  await attachmentService.deleteAttachment(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    req.params.attachmentId,
    req.user!.userId,
    req.memberRole!,
  );

  sendResponse(res, {
    message: "Attachment deleted successfully",
  });
});
