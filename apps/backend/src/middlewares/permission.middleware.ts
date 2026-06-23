import { NextFunction, Request, Response } from "express";

import { ForbiddenError, UnauthorizedError, NotFoundError } from "../errors";

import {
  Permission,
  hasPermission,
} from "../shared/constants/role-permissions.constant";

import { getMemberRole } from "../modules/organizations/organization.service";
import { Organization } from "../modules/organizations/organization.model";

async function resolveOrganizationId(req: Request): Promise<string> {
  if (req.organizationId) {
    return req.organizationId;
  }

  if (req.params.orgId) {
    return req.params.orgId;
  }

  if (req.params.slug) {
    const org = await Organization.findOne({
      slug: req.params.slug,
    }).select("_id");

    if (!org) {
      throw new NotFoundError("Organization not found");
    }

    return org._id.toString();
  }

  throw new NotFoundError("Organization context could not be determined");
}

export function requirePermission(permission: Permission) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user?.userId) {
        next(new UnauthorizedError("Authentication required"));
        return;
      }

      const organizationId = await resolveOrganizationId(req);

      const role = await getMemberRole(req.user.userId, organizationId);

      if (!role) {
        next(new ForbiddenError("You are not a member of this organization"));
        return;
      }

      if (!hasPermission(role, permission)) {
        next(
          new ForbiddenError(
            "You do not have permission to perform this action",
          ),
        );
        return;
      }

      req.organizationId = organizationId;
      req.memberRole = role;

      next();
    } catch (error) {
      next(error);
    }
  };
}
