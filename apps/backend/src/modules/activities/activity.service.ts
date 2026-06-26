import { Types } from 'mongoose';
import { Activity } from './activity.model';
import { Project } from '../projects/project.model';
import { Issue } from '../issues/issue.model';
import { ActivityAction } from '../../shared/enums/activity-action.enum';
import { NotFoundError } from '../../errors';

 
async function verifyProjectBelongsToOrg(
  orgId: string,
  projectId: string,
): Promise<void> {
  const organizationId = new Types.ObjectId(orgId);
  const projectObjectId = new Types.ObjectId(projectId);

  const exists = await Project.exists({
    _id: projectObjectId,
    organizationId,
  });

  if (!exists) {
    throw new NotFoundError('Project not found');
  }
}

async function verifyIssueBelongsToProject(
  orgId: string,
  projectId: string,
  issueId: string,
): Promise<void> {
  const organizationId = new Types.ObjectId(orgId);
  const projectObjectId = new Types.ObjectId(projectId);
  const issueObjectId = new Types.ObjectId(issueId);

  const exists = await Issue.exists({
    _id: issueObjectId,
    organizationId,
    projectId: projectObjectId,
  });

  if (!exists) {
    throw new NotFoundError('Issue not found');
  }
}

 
export async function getActivityById(
  orgId: string,
  projectId: string,
  issueId: string,
  activityId: string,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const organizationId = new Types.ObjectId(orgId);
  const projectObjectId = new Types.ObjectId(projectId);
  const issueObjectId = new Types.ObjectId(issueId);
  const activityObjectId = new Types.ObjectId(activityId);

  const activity = await Activity.findOne({
    _id: activityObjectId,
    organizationId,
    projectId: projectObjectId,
    issueId: issueObjectId,
  }).populate('actorId', 'name email avatarUrl');

  if (!activity) {
    throw new NotFoundError('Activity not found');
  }

  return activity;
}
 
async function getActivityByIdLean(
  orgId: string,
  projectId: string,
  issueId: string,
  activityId: string,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const organizationId = new Types.ObjectId(orgId);
  const projectObjectId = new Types.ObjectId(projectId);
  const issueObjectId = new Types.ObjectId(issueId);
  const activityObjectId = new Types.ObjectId(activityId);

  const activity = await Activity.findOne({
    _id: activityObjectId,
    organizationId,
    projectId: projectObjectId,
    issueId: issueObjectId,
  })
    .populate('actorId', 'name email avatarUrl')
    .lean();

  if (!activity) {
    throw new NotFoundError('Activity not found');
  }

  return activity;
}

 
export async function createActivity(
  orgId: string,
  projectId: string,
  issueId: string,
  actorId: string,
  action: ActivityAction,
  options: {
    field?: string;
    oldValue?: unknown;
    newValue?: unknown;
    metadata?: unknown;
  } = {},
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const organizationId = new Types.ObjectId(orgId);
  const projectObjectId = new Types.ObjectId(projectId);
  const issueObjectId = new Types.ObjectId(issueId);
  const actorObjectId = new Types.ObjectId(actorId);

  const activity = await Activity.create({
    organizationId,
    projectId: projectObjectId,
    issueId: issueObjectId,
    actorId: actorObjectId,
    action,
    field: options.field,
    oldValue: options.oldValue,
    newValue: options.newValue,
    metadata: options.metadata,
    createdById: actorObjectId,
  });

  const populatedActivity = await Activity.findById(activity._id).populate(
    'actorId',
    'name email avatarUrl',
  );

  if (!populatedActivity) {
    throw new NotFoundError('Activity creation failed');
  }

  return populatedActivity;
}

 
export async function listActivities(
  orgId: string,
  projectId: string,
  issueId: string,
  page: number,
  limit: number,
) {
  await verifyProjectBelongsToOrg(orgId, projectId);
  await verifyIssueBelongsToProject(orgId, projectId, issueId);

  const organizationId = new Types.ObjectId(orgId);
  const projectObjectId = new Types.ObjectId(projectId);
  const issueObjectId = new Types.ObjectId(issueId);

  const filter = {
    organizationId,
    projectId: projectObjectId,
    issueId: issueObjectId,
  };

  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actorId', 'name email avatarUrl')
      .lean(),

    Activity.countDocuments(filter),
  ]);

  return {
    data: activities,
    total,
    page,
    limit,
  };
}
 
export async function getActivity(
  orgId: string,
  projectId: string,
  issueId: string,
  activityId: string,
) {
  return getActivityByIdLean(
    orgId,
    projectId,
    issueId,
    activityId,
  );
}