import { catchAsync } from '../../shared/utils/catch-async';
import { sendResponse, buildPagination } from '../../shared/utils/api-response';
import * as workspaceService from './workspace.service';

/**
 * POST /api/v1/organizations/:orgId/workspaces
 */
export const createWorkspace = catchAsync(async (req, res) => {
  const workspace = await workspaceService.createWorkspace(
    req.params.orgId,
    req.user!.userId,
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    data: workspace,
    message: 'Workspace created successfully',
  });
});

/**
 * GET /api/v1/organizations/:orgId/workspaces
 */
export const listWorkspaces = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const { data, total } = await workspaceService.listWorkspaces(
    req.params.orgId,
    page,
    limit
  );

  sendResponse(res, {
    data,
    message: 'Workspaces fetched successfully',
    pagination: buildPagination(page, limit, total),
  });
});

/**
 * GET /api/v1/organizations/:orgId/workspaces/:slug
 */
export const getWorkspace = catchAsync(async (req, res) => {
  const workspace = await workspaceService.getWorkspaceBySlug(
    req.params.orgId,
    req.params.slug
  );

  sendResponse(res, {
    data: workspace,
    message: 'Workspace fetched successfully',
  });
});

/**
 * PATCH /api/v1/organizations/:orgId/workspaces/:workspaceId
 */
export const updateWorkspace = catchAsync(async (req, res) => {
  const workspace = await workspaceService.updateWorkspace(
    req.params.orgId,
    req.params.workspaceId,
    req.body
  );

  sendResponse(res, {
    data: workspace,
    message: 'Workspace updated successfully',
  });
});

/**
 * DELETE /api/v1/organizations/:orgId/workspaces/:workspaceId
 */
export const deleteWorkspace = catchAsync(async (req, res) => {
  await workspaceService.deleteWorkspace(
    req.params.orgId,
    req.params.workspaceId
  );

  sendResponse(res, {
    message: 'Workspace deleted successfully',
  });
});