import { Types } from "mongoose";
import { Issue } from "./issue.model";
import { Project } from "../projects/project.model";
import { Sprint } from "../sprints/sprint.model";
import { OrganizationMember } from "../organizations/organization-member.model";
import { IssueStatus } from "../../shared/enums/issue-status.enum";
import { IssuePriority } from "../../shared/enums/issue-priority.enum";
import { IssueType } from "../../shared/enums/issue-type.enum";
import { BadRequestError, NotFoundError } from "../../errors";
import { CreateIssueInput, UpdateIssueInput } from "./issue.validation";

/**
 * Verify project belongs to organization
 */
async function verifyProjectBelongsToOrg(orgId: string, projectId: string) {
  const exists = await Project.exists({
    _id: new Types.ObjectId(projectId),
    organizationId: new Types.ObjectId(orgId),
  });

  if (!exists) {
    throw new NotFoundError("Project not found");
  }
}

/**
 * Read-only issue fetch
 */
async function getIssueByIdLean(
  orgId: string,
  projectId: string,
  issueId: string,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);

  const issue = await Issue.findOne({
    _id: new Types.ObjectId(issueId),
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
  })
    .populate("assigneeId", "name email avatarUrl")
    .populate("reporterId", "name email avatarUrl")
    .populate("createdById", "name email avatarUrl")
    .populate("sprintId", "name status")
    .lean();

  if (!issue) {
    throw new NotFoundError("Issue not found");
  }

  return issue;
}

/**
 * Document fetch for mutations
 */
async function getIssueById(orgId: string, projectId: string, issueId: string) {
  await verifyProjectBelongsToOrg(orgId, projectId);

  const issue = await Issue.findOne({
    _id: new Types.ObjectId(issueId),
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
  })
    .populate("assigneeId", "name email avatarUrl")
    .populate("reporterId", "name email avatarUrl")
    .populate("createdById", "name email avatarUrl")
    .populate("sprintId", "name status");

  if (!issue) {
    throw new NotFoundError("Issue not found");
  }

  return issue;
}

/**
 * Create Issue
 */
export async function createIssue(
  orgId: string,
  projectId: string,
  creatorId: string,
  input: CreateIssueInput,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);

  const organizationId = new Types.ObjectId(orgId);
  const projectObjectId = new Types.ObjectId(projectId);

  if (input.assigneeId) {
    const assigneeExists = await OrganizationMember.exists({
      organizationId,
      userId: new Types.ObjectId(input.assigneeId),
      status: "ACTIVE",
    });

    if (!assigneeExists) {
      throw new BadRequestError(
        "Assignee is not an active member of this organization",
      );
    }
  }

  if (input.sprintId) {
    const sprintExists = await Sprint.exists({
      _id: new Types.ObjectId(input.sprintId),
      organizationId,
      projectId: projectObjectId,
    });

    if (!sprintExists) {
      throw new BadRequestError(
        "Sprint not found or does not belong to this project",
      );
    }
  }

  const lastIssue = await Issue.findOne({
    organizationId,
    projectId: projectObjectId,
  })
    .sort({ issueNumber: -1 })
    .select("issueNumber")
    .lean();

  const issueNumber = (lastIssue?.issueNumber ?? 0) + 1;

  const issue = await Issue.create({
    organizationId,
    projectId: projectObjectId,
    sprintId: input.sprintId ? new Types.ObjectId(input.sprintId) : null,

    issueNumber,

    title: input.title,
    description: input.description ?? null,

    status: IssueStatus.OPEN,

    priority: input.priority ?? IssuePriority.MEDIUM,

    type: input.type ?? IssueType.TASK,

    assigneeId: input.assigneeId ? new Types.ObjectId(input.assigneeId) : null,

    reporterId: new Types.ObjectId(creatorId),

    dueDate: input.dueDate ?? null,

    labels: input.labels ?? [],

    createdById: new Types.ObjectId(creatorId),
  });

  const populatedIssue = await Issue.findById(issue._id)
    .populate("assigneeId", "name email avatarUrl")
    .populate("reporterId", "name email avatarUrl")
    .populate("createdById", "name email avatarUrl")
    .populate("sprintId", "name status");

  if (!populatedIssue) {
    throw new NotFoundError("Issue not found");
  }

  return populatedIssue;
}

/**
 * List Issues
 */
export async function listIssues(
  orgId: string,
  projectId: string,
  query: {
    sprintId?: string;
    status?: IssueStatus;
    priority?: IssuePriority;
    type?: IssueType;
    assigneeId?: string;
    page: number;
    limit: number;
  },
) {
  await verifyProjectBelongsToOrg(orgId, projectId);

  const filter: Record<string, any> = {
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
  };

  if (query.sprintId !== undefined) {
    filter.sprintId = query.sprintId
      ? new Types.ObjectId(query.sprintId)
      : null;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.assigneeId !== undefined) {
    filter.assigneeId = query.assigneeId
      ? new Types.ObjectId(query.assigneeId)
      : null;
  }

  const [issues, total] = await Promise.all([
    Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate("assigneeId", "name email avatarUrl")
      .populate("reporterId", "name email avatarUrl")
      .populate("createdById", "name email avatarUrl")
      .populate("sprintId", "name status")
      .lean(),

    Issue.countDocuments(filter),
  ]);

  return {
    data: issues,
    total,
    page: query.page,
    limit: query.limit,
  };
}

/**
 * Get Issue
 */
export async function getIssue(
  orgId: string,
  projectId: string,
  issueId: string,
) {
  return await getIssueByIdLean(orgId, projectId, issueId);
}

/**
 * Update Issue
 */
export async function updateIssue(
  orgId: string,
  projectId: string,
  issueId: string,
  input: UpdateIssueInput,
) {
  const issue = await getIssueById(orgId, projectId, issueId);

  const organizationId = new Types.ObjectId(orgId);
  const projectObjectId = new Types.ObjectId(projectId);

  if (input.assigneeId !== undefined) {
    if (input.assigneeId !== null) {
      const assigneeExists = await OrganizationMember.exists({
        organizationId,
        userId: new Types.ObjectId(input.assigneeId),
        status: "ACTIVE",
      });

      if (!assigneeExists) {
        throw new BadRequestError(
          "Assignee is not an active member of this organization",
        );
      }

      issue.assigneeId = new Types.ObjectId(input.assigneeId);
    } else {
      issue.assigneeId = null;
    }
  }

  if (input.sprintId !== undefined) {
    if (input.sprintId !== null) {
      const sprintExists = await Sprint.exists({
        _id: new Types.ObjectId(input.sprintId),
        organizationId,
        projectId: projectObjectId,
      });

      if (!sprintExists) {
        throw new BadRequestError(
          "Sprint not found or does not belong to this project",
        );
      }

      issue.sprintId = new Types.ObjectId(input.sprintId);
    } else {
      issue.sprintId = null;
    }
  }

  if (input.title !== undefined) {
    issue.title = input.title;
  }

  if (input.description !== undefined) {
    issue.description = input.description;
  }

  if (input.status !== undefined) {
    issue.status = input.status;
  }

  if (input.priority !== undefined) {
    issue.priority = input.priority;
  }

  if (input.type !== undefined) {
    issue.type = input.type;
  }

  if (input.dueDate !== undefined) {
    issue.dueDate = input.dueDate;
  }

  if (input.labels !== undefined) {
    issue.labels = input.labels;
  }

  await issue.save();

  const populatedIssue = await Issue.findById(issue._id)
    .populate("assigneeId", "name email avatarUrl")
    .populate("reporterId", "name email avatarUrl")
    .populate("createdById", "name email avatarUrl")
    .populate("sprintId", "name status");

  if (!populatedIssue) {
    throw new NotFoundError("Issue not found");
  }

  return populatedIssue;
}

/**
 * Delete Issue
 */
export async function deleteIssue(
  orgId: string,
  projectId: string,
  issueId: string,
): Promise<void> {
  const issue = await getIssueById(orgId, projectId, issueId);

  await issue.softDelete();
}
