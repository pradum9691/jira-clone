import { catchAsync } from '../../shared/utils/catch-async';
import {
  sendResponse,
  buildPagination,
} from '../../shared/utils/api-response';
import * as commentService from './comment.service';
 
export const createComment = catchAsync(async (req, res) => {
  const comment = await commentService.createComment(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    req.user!.userId,
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    data: comment,
    message: 'Comment created successfully',
  });
});
 
export const listComments = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(req.query.limit) || 10)
  );

  const result = await commentService.listComments(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    page,
    limit
  );

  sendResponse(res, {
    data: result.data,
    message: 'Comments fetched successfully',
    pagination: buildPagination(
      result.page,
      result.limit,
      result.total
    ),
  });
});

 
export const getComment = catchAsync(async (req, res) => {
  const comment = await commentService.getComment(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    req.params.commentId
  );

  sendResponse(res, {
    data: comment,
    message: 'Comment fetched successfully',
  });
});
 
export const updateComment = catchAsync(async (req, res) => {
   console.log("req.user =", req.user);
  const comment = await commentService.updateComment(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    req.params.commentId,
    req.user!.userId,
    req.body
  );

  sendResponse(res, {
    data: comment,
    message: 'Comment updated successfully',
  });
});

 
export const deleteComment = catchAsync(async (req, res) => {
  const comment = await commentService.deleteComment(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    req.params.commentId,
    req.user!.userId,
    req.memberRole!
  );

  sendResponse(res, {
  data: comment,
  message: "Comment deleted successfully",
});
});
