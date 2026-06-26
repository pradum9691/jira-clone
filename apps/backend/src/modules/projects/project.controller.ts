import { catchAsync } from '../../shared/utils/catch-async';
import { sendResponse, buildPagination } from '../../shared/utils/api-response';
import * as projectService from './project.service';

 
export const createProject = catchAsync(async (req, res) => {
  const project = await projectService.createProject(
    req.params.orgId,
    req.params.workspaceId,
    req.user!.userId,
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    data: project,
    message: 'Project created successfully',
  });
});

 
export const listProjects = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const { data, total } = await projectService.listProjects(
    req.params.orgId,
    req.params.workspaceId,
    page,
    limit
  );

  sendResponse(res, {
    data,
    message: 'Projects fetched successfully',
    pagination: buildPagination(page, limit, total),
  });
});

 
export const getProject = catchAsync(async (req, res) => {
  const project = await projectService.getProjectById(
    req.params.orgId,
    req.params.workspaceId,
    req.params.projectId
  );

  sendResponse(res, {
    data: project,
    message: 'Project fetched successfully',
  });
});

 
export const updateProject = catchAsync(async (req, res) => {
  const project = await projectService.updateProject(
    req.params.orgId,
    req.params.workspaceId,
    req.params.projectId,
    req.body
  );

  sendResponse(res, {
    data: project,
    message: 'Project updated successfully',
  });
});

 
export const deleteProject = catchAsync(async (req, res) => {
  await projectService.deleteProject(
    req.params.orgId,
    req.params.workspaceId,
    req.params.projectId
  );

  sendResponse(res, {
    message: 'Project deleted successfully',
  });
});
