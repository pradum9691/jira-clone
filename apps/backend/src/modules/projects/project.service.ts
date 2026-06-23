import { Types } from 'mongoose';

import { Project } from './project.model';
import { ProjectMember } from './project-member.model';
import { Workspace } from '../workspaces/workspace.model';
import { ProjectRole } from '../../shared/enums/project-role.enum';
import { ConflictError, NotFoundError } from '../../errors';
import { CreateProjectInput, UpdateProjectInput } from './project.validation';

/**
 * Verifies if a workspace exists and belongs to the given organization.
 */
async function verifyWorkspaceBelongsToOrg(orgId: string, workspaceId: string): Promise<void> {
  const workspaceExists = await Workspace.exists({
    _id: new Types.ObjectId(workspaceId),
    organizationId: new Types.ObjectId(orgId),
  });

  if (!workspaceExists) {
    throw new NotFoundError('Workspace not found in this organization');
  }
}

/**
 * Creates a project and automatically registers the creator as PROJECT_MANAGER.
 * 
 * Future Improvement:
 * Use MongoDB transaction/session when creating Project + ProjectMember to ensure atomicity.
 */
export async function createProject(
  orgId: string,
  workspaceId: string,
  creatorId: string,
  input: CreateProjectInput
) {
  await verifyWorkspaceBelongsToOrg(orgId, workspaceId);

  const upperKey = input.key?.toUpperCase();
  const existingProject = await Project.findOne({
    organizationId: new Types.ObjectId(orgId),
    key: upperKey,
  }).lean();

  if (existingProject) {
    throw new ConflictError('Project key already exists in this organization');
  }

  const project = await Project.create({
    organizationId: new Types.ObjectId(orgId),
    workspaceId: new Types.ObjectId(workspaceId),
    name: input.name,
    key: upperKey,
    description: input.description ?? null,
    createdBy: new Types.ObjectId(creatorId),
  });

  await ProjectMember.create({
    projectId: project._id,
    userId: new Types.ObjectId(creatorId),
    role: ProjectRole.PROJECT_MANAGER,
    joinedAt: new Date(),
  });

  return project;
}

/**
 * Lists projects under a specific workspace within an organization.
 */
export async function listProjects(
  orgId: string,
  workspaceId: string,
  page: number,
  limit: number
) {
  await verifyWorkspaceBelongsToOrg(orgId, workspaceId);

  const filter = {
    organizationId: new Types.ObjectId(orgId),
    workspaceId: new Types.ObjectId(workspaceId),
  };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean(),

    Project.countDocuments(filter),
  ]);

  const data = projects.map((project: any) => {
    delete project.isDeleted;
    delete project.deletedAt;
    delete project.__v;
    return project;
  });

  return {
    data,
    total,
    page,
    limit,
  };
}

/**
 * Retrieves a single project by its ID, verifying it belongs to the workspace and organization.
 */
export async function getProjectById(orgId: string, workspaceId: string, projectId: string) {
  await verifyWorkspaceBelongsToOrg(orgId, workspaceId);

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    organizationId: new Types.ObjectId(orgId),
    workspaceId: new Types.ObjectId(workspaceId),
  })
    .populate('createdBy', 'name email')
    .lean();

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  return project;
}

/**
 * Updates project details (name, key, description).
 * Checks key uniqueness within the organization if the key is updated.
 */
export async function updateProject(
  orgId: string,
  workspaceId: string,
  projectId: string,
  input: UpdateProjectInput
) {
  await verifyWorkspaceBelongsToOrg(orgId, workspaceId);

  // We fetch the document instead of lean to call .save()
  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    organizationId: new Types.ObjectId(orgId),
    workspaceId: new Types.ObjectId(workspaceId),
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (input.key !== undefined) {
    const upperKey = input.key?.toUpperCase();
    if (upperKey !== project.key) {
      const existingProject = await Project.findOne({
        organizationId: new Types.ObjectId(orgId),
        key: upperKey,
        _id: { $ne: project._id },
      }).lean();

      if (existingProject) {
        throw new ConflictError('Project key already exists in this organization');
      }

      project.key = upperKey;
    }
  }

  if (input.name !== undefined) {
    project.name = input.name;
  }

  if (input.description !== undefined) {
    project.description = input.description;
  }

  await project.save();

  return project;
}

/**
 * Soft deletes a project.
 * Note: ProjectMember records are NOT soft-deleted.
 */
export async function deleteProject(orgId: string, workspaceId: string, projectId: string): Promise<void> {
  await verifyWorkspaceBelongsToOrg(orgId, workspaceId);

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    organizationId: new Types.ObjectId(orgId),
    workspaceId: new Types.ObjectId(workspaceId),
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  await project.softDelete();
}
