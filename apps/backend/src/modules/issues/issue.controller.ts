import { catchAsync } from '../../shared/utils/catch-async';
import {
  sendResponse,
  buildPagination,
} from '../../shared/utils/api-response';
import { IssueStatus } from '../../shared/enums/issue-status.enum';
import { IssuePriority } from '../../shared/enums/issue-priority.enum';
import { IssueType } from '../../shared/enums/issue-type.enum';
import * as issueService from './issue.service';
 
export const createIssue = catchAsync(async (req, res) => {
  const issue = await issueService.createIssue(
    req.params.orgId,
    req.params.projectId,
    req.user!.userId,
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    data: issue,
    message: 'Issue created successfully',
  });
});
 
export const listIssues = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(req.query.limit) || 10)
  );

  const sprintId = req.query.sprintId as string | undefined;
  const status = req.query.status as IssueStatus | undefined;
  const priority = req.query.priority as IssuePriority | undefined;
  const type = req.query.type as IssueType | undefined;
  const assigneeId = req.query.assigneeId as string | undefined;

  const result = await issueService.listIssues(
    req.params.orgId,
    req.params.projectId,
    {
      sprintId,
      status,
      priority,
      type,
      assigneeId,
      page,
      limit,
    }
  );

  sendResponse(res, {
    data: result.data,
    message: 'Issues fetched successfully',
    pagination: buildPagination(
      result.page,
      result.limit,
      result.total
    ),
  });
});

 
export const getIssue = catchAsync(async (req, res) => {
  const issue = await issueService.getIssue(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId
  );

  sendResponse(res, {
    data: issue,
    message: 'Issue fetched successfully',
  });
});

 
export const updateIssue = catchAsync(async (req, res) => {
  const issue = await issueService.updateIssue(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    req.body
  );

  sendResponse(res, {
    data: issue,
    message: 'Issue updated successfully',
  });
});

 
export const deleteIssue = catchAsync(async (req, res) => {
  await issueService.deleteIssue(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId
  );

  sendResponse(res, {
    message: 'Issue deleted successfully',
  });
});
