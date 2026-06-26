import { catchAsync } from '../../shared/utils/catch-async';
import {
  sendResponse,
  buildPagination,
} from '../../shared/utils/api-response';
import { SprintStatus } from '../../shared/enums/sprint-status.enum';
import * as sprintService from './sprint.service';

 
export const createSprint = catchAsync(async (req, res) => {
  const sprint = await sprintService.createSprint(
    req.params.orgId,
    req.params.projectId,
    req.user!.userId,
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    data: sprint,
    message: 'Sprint created successfully',
  });
});
 
export const listSprints = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(req.query.limit) || 10)
  );

  const status = req.query.status as SprintStatus | undefined;

  const result = await sprintService.listSprints(
    req.params.orgId,
    req.params.projectId,
    status,
    page,
    limit
  );

  sendResponse(res, {
    data: result.data,
    message: 'Sprints fetched successfully',
    pagination: buildPagination(
      result.page,
      result.limit,
      result.total
    ),
  });
});

 
export const getSprint = catchAsync(async (req, res) => {
  const sprint = await sprintService.getSprint(
    req.params.orgId,
    req.params.projectId,
    req.params.sprintId
  );

  sendResponse(res, {
    data: sprint,
    message: 'Sprint fetched successfully',
  });
});
 
export const updateSprint = catchAsync(async (req, res) => {
  const sprint = await sprintService.updateSprint(
    req.params.orgId,
    req.params.projectId,
    req.params.sprintId,
    req.body
  );

  sendResponse(res, {
    data: sprint,
    message: 'Sprint updated successfully',
  });
});
 
export const deleteSprint = catchAsync(async (req, res) => {
  await sprintService.deleteSprint(
    req.params.orgId,
    req.params.projectId,
    req.params.sprintId
  );

  sendResponse(res, {
    message: 'Sprint deleted successfully',
  });
});

 
export const startSprint = catchAsync(async (req, res) => {
  const sprint = await sprintService.startSprint(
    req.params.orgId,
    req.params.projectId,
    req.params.sprintId
  );

  sendResponse(res, {
    data: sprint,
    message: 'Sprint started successfully',
  });
});

 
export const completeSprint = catchAsync(async (req, res) => {
  const sprint = await sprintService.completeSprint(
    req.params.orgId,
    req.params.projectId,
    req.params.sprintId
  );

  sendResponse(res, {
    data: sprint,
    message: 'Sprint completed successfully',
  });
});