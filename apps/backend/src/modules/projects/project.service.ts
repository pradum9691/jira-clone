import { Types } from 'mongoose';

import { Project } from './project.model';
import { ProjectMember } from './project-member.model';
import { Workspace } from '../workspaces/workspace.model';
import { ProjectRole } from '../../shared/enums/project-role.enum';
import { ConflictError, NotFoundError } from '../../errors';
import { CreateProjectInput, UpdateProjectInput } from './project.validation';

 
async function verifyWorkspaceBelongsToOrg(orgId: string, workspaceId: string): Promise<void> {
  const workspaceExists = await Workspace.exists({
    _id: new Types.ObjectId(workspaceId),
    organizationId: new Types.ObjectId(orgId),
  });

  if (!workspaceExists) {
    throw new NotFoundError('Workspace not found in this organization');
  }
}

 
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

 
export async function updateProject(
  orgId: string,
  workspaceId: string,
  projectId: string,
  input: UpdateProjectInput
) {
  await verifyWorkspaceBelongsToOrg(orgId, workspaceId);

   
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
