import { UnauthorizedError } from "../../errors";

import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse, buildPagination } from "../../shared/utils/api-response";

import * as orgService from "./organization.service";

 
export const createOrganization = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const organization = await orgService.createOrganization(
    req.body,
    req.user.userId,
  );

  sendResponse(res, {
    statusCode: 201,
    data: organization,
    message: "Organization created successfully",
  });
});

 
export const getMyOrganizations = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const page = Math.max(1, Number(req.query.page) || 1);

  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const { data, total } = await orgService.getUserOrganizations(
    req.user.userId,
    page,
    limit,
  );

  sendResponse(res, {
    data,
    message: "Organizations fetched successfully",
    pagination: buildPagination(page, limit, total),
  });
});

 
export const getOrganization = catchAsync(async (req, res) => {
  const organization = await orgService.getOrganizationBySlug(req.params.slug);

  sendResponse(res, {
    data: organization,
    message: "Organization fetched successfully",
  });
});
 
export const updateOrganization = catchAsync(async (req, res) => {
  const organization = await orgService.updateOrganization(
    req.organizationId ?? req.params.orgId,
    req.body,
  );

  sendResponse(res, {
    data: organization,
    message: "Organization updated successfully",
  });
});

 
export const deleteOrganization = catchAsync(async (req, res) => {
  await orgService.deleteOrganization(req.organizationId ?? req.params.orgId);

  sendResponse(res, {
    message: "Organization deleted successfully",
  });
});
