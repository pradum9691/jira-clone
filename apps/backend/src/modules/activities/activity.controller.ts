import { catchAsync } from '../../shared/utils/catch-async';
import {
  sendResponse,
  buildPagination,
} from '../../shared/utils/api-response';
import * as activityService from './activity.service';

export const listActivities = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(req.query.limit) || 10)
  );

  const result = await activityService.listActivities(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    page,
    limit
  );

  sendResponse(res, {
    data: result.data,
    message: 'Activities fetched successfully',
    pagination: buildPagination(
      result.page,
      result.limit,
      result.total
    ),
  });
});

export const getActivity = catchAsync(async (req, res) => {
  const activity = await activityService.getActivity(
    req.params.orgId,
    req.params.projectId,
    req.params.issueId,
    req.params.activityId
  );

  sendResponse(res, {
    data: activity,
    message: 'Activity fetched successfully',
  });
});
