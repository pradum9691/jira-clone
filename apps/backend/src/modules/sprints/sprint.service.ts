import { Types } from 'mongoose';
import { Sprint } from './sprint.model';
import { Project } from '../projects/project.model';
import { SprintStatus } from '../../shared/enums/sprint-status.enum';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../errors';
import {
  CreateSprintInput,
  UpdateSprintInput,
} from './sprint.validation';

/**
 * Verify project belongs to organization
 */
async function verifyProjectBelongsToOrg(
  orgId: string,
  projectId: string
) {
  const exists = await Project.exists({
    _id: new Types.ObjectId(projectId),
    organizationId: new Types.ObjectId(orgId),
  });

  if (!exists) {
    throw new NotFoundError('Project not found');
  }
}

/**
 * Read-only sprint fetch
 * Uses lean() for better performance
 */
async function getSprintByIdLean(
  orgId: string,
  projectId: string,
  sprintId: string
) {
  await verifyProjectBelongsToOrg(orgId, projectId);

  const sprint = await Sprint.findOne({
    _id: new Types.ObjectId(sprintId),
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
  })
    .populate('createdBy', 'name email')
    .lean();

  if (!sprint) {
    throw new NotFoundError('Sprint not found');
  }

  return sprint;
}

/**
 * Document fetch for mutations
 */
async function getSprintById(
  orgId: string,
  projectId: string,
  sprintId: string
) {
  await verifyProjectBelongsToOrg(orgId, projectId);

  const sprint = await Sprint.findOne({
    _id: new Types.ObjectId(sprintId),
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
  }).populate('createdBy', 'name email');

  if (!sprint) {
    throw new NotFoundError('Sprint not found');
  }

  return sprint;
}

/**
 * Create Sprint
 */
export async function createSprint(
  orgId: string,
  projectId: string,
  creatorId: string,
  input: CreateSprintInput
) {
  await verifyProjectBelongsToOrg(orgId, projectId);

  const organizationId = new Types.ObjectId(orgId);
  const projectObjectId = new Types.ObjectId(projectId);

  const sprint = await Sprint.create({
    organizationId,
    projectId: projectObjectId,
    name: input.name,
    goal: input.goal ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    status: SprintStatus.PLANNED,
    createdBy: new Types.ObjectId(creatorId),
  });

  return sprint;
}

/**
 * List Sprints
 */
export async function listSprints(
  orgId: string,
  projectId: string,
  status: SprintStatus | undefined,
  page: number,
  limit: number
) {
  await verifyProjectBelongsToOrg(orgId, projectId);

  const filter: Record<string, unknown> = {
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
  };

  if (status) {
    filter.status = status;
  }

  const [sprints, total] = await Promise.all([
    Sprint.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean(),

    Sprint.countDocuments(filter),
  ]);

  return {
    data: sprints,
    total,
    page,
    limit,
  };
}

/**
 * Get Sprint Details
 */
export async function getSprint(
  orgId: string,
  projectId: string,
  sprintId: string
) {
  return getSprintByIdLean(
    orgId,
    projectId,
    sprintId
  );
}

/**
 * Update Sprint
 */
export async function updateSprint(
  orgId: string,
  projectId: string,
  sprintId: string,
  input: UpdateSprintInput
) {
  const sprint = await getSprintById(
    orgId,
    projectId,
    sprintId
  );

  if (sprint.status === SprintStatus.COMPLETED) {
    throw new BadRequestError(
      'Cannot update a completed sprint'
    );
  }

  if (input.name !== undefined) {
    sprint.name = input.name;
  }

  if (input.goal !== undefined) {
    sprint.goal = input.goal;
  }

  if (input.startDate !== undefined) {
    sprint.startDate = input.startDate;
  }

  if (input.endDate !== undefined) {
    sprint.endDate = input.endDate;
  }

  await sprint.save();

  return sprint;
}

/**
 * Delete Sprint
 */
export async function deleteSprint(
  orgId: string,
  projectId: string,
  sprintId: string
) {
  const sprint = await getSprintById(
    orgId,
    projectId,
    sprintId
  );

  if (sprint.status === SprintStatus.ACTIVE) {
    throw new BadRequestError(
      'Cannot delete an active sprint. Complete it first.'
    );
  }

  await sprint.softDelete();

  return sprint;
}

/**
 * Start Sprint
 */
export async function startSprint(
  orgId: string,
  projectId: string,
  sprintId: string
) {
  const sprint = await getSprintById(
    orgId,
    projectId,
    sprintId
  );

  if (sprint.status !== SprintStatus.PLANNED) {
    throw new BadRequestError(
      `Cannot start a sprint in ${sprint.status} status. Only PLANNED sprints can be started.`
    );
  }

  const activeSprint = await Sprint.findOne({
    organizationId: new Types.ObjectId(orgId),
    projectId: new Types.ObjectId(projectId),
    status: SprintStatus.ACTIVE,
  });

  if (activeSprint) {
    throw new ConflictError(
      `Project already has an active sprint: "${activeSprint.name}". Complete it before starting a new one.`
    );
  }

  sprint.status = SprintStatus.ACTIVE;

  if (!sprint.startDate) {
    sprint.startDate = new Date();
  }

  await sprint.save();

  return sprint;
}

/**
 * Complete Sprint
 */
export async function completeSprint(
  orgId: string,
  projectId: string,
  sprintId: string
) {
  const sprint = await getSprintById(
    orgId,
    projectId,
    sprintId
  );

  if (sprint.status !== SprintStatus.ACTIVE) {
    throw new BadRequestError(
      `Cannot complete a sprint in ${sprint.status} status. Only ACTIVE sprints can be completed.`
    );
  }

  sprint.status = SprintStatus.COMPLETED;
  sprint.endDate = new Date();

  await sprint.save();

  return sprint;
}