import { Types } from 'mongoose';

import { Workspace } from './workspace.model';

import { slugify } from '../../shared/utils/slug.util';

import {
  ConflictError,
  NotFoundError,
} from '../../errors';

import {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from './workspace.validation';

/**
 * Generates a slug unique within the given organization.
 * Example:
 * my-workspace
 * my-workspace-2
 * my-workspace-3
 */
async function generateUniqueSlug(
  orgId: string,
  base: string
): Promise<string> {
  const baseSlug = slugify(base);

  let slug = baseSlug;
  let counter = 2;

  while (
    await Workspace.exists({
      organizationId: new Types.ObjectId(orgId),
      slug,
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validates a custom slug supplied by the user.
 * Slug uniqueness is scoped to the organization.
 */
async function resolveSlug(
  orgId: string,
  requestedSlug: string
): Promise<string> {
  const normalizedSlug = slugify(requestedSlug);

  const existing = await Workspace.findOne({
    organizationId: new Types.ObjectId(orgId),
    slug: normalizedSlug,
  }).lean();

  if (existing) {
    throw new ConflictError(
      `Slug "${normalizedSlug}" is already taken in this organization`
    );
  }

  return normalizedSlug;
}

/**
 * Creates a workspace inside an organization.
 */
export async function createWorkspace(
  orgId: string,
  creatorId: string,
  input: CreateWorkspaceInput
) {
  const existingWorkspace =
    await Workspace.findOne({
      organizationId: new Types.ObjectId(orgId),
      name: input.name,
    }).lean();

  if (existingWorkspace) {
    throw new ConflictError(
      'Workspace name already exists'
    );
  }

  const slug = input.slug
    ? await resolveSlug(orgId, input.slug)
    : await generateUniqueSlug(
        orgId,
        input.name
      );

  const workspace = await Workspace.create({
    organizationId: new Types.ObjectId(orgId),
    name: input.name,
    slug,
    description:
      input.description ?? null,
    createdBy: new Types.ObjectId(
      creatorId
    ),
  });

  return workspace;
}

/**
 * Lists workspaces in an organization.
 */
export async function listWorkspaces(
  orgId: string,
  page: number,
  limit: number
) {
  const filter = {
    organizationId: new Types.ObjectId(
      orgId
    ),
  };

  const [workspaces, total] =
    await Promise.all([
      Workspace.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(
          'createdBy',
          'name email'
        )
        .lean(),

      Workspace.countDocuments(filter),
    ]);

  return {
    data: workspaces,
    total,
    page,
    limit,
  };
}

/**
 * Fetches a workspace by slug.
 */
export async function getWorkspaceBySlug(
  orgId: string,
  slug: string
) {
  const workspace =
    await Workspace.findOne({
      organizationId:
        new Types.ObjectId(orgId),
      slug: slugify(slug),
    })
      .populate(
        'createdBy',
        'name email'
      )
      .lean();

  if (!workspace) {
    throw new NotFoundError(
      'Workspace not found'
    );
  }

  return workspace;
}

/**
 * Fetches a workspace by ID.
 */
export async function getWorkspaceById(
  orgId: string,
  workspaceId: string
) {
  const workspace =
    await Workspace.findOne({
      _id: new Types.ObjectId(
        workspaceId
      ),
      organizationId:
        new Types.ObjectId(orgId),
    });

  if (!workspace) {
    throw new NotFoundError(
      'Workspace not found'
    );
  }

  return workspace;
}

/**
 * Updates workspace.
 */
export async function updateWorkspace(
  orgId: string,
  workspaceId: string,
  input: UpdateWorkspaceInput
) {
  const workspace =
    await getWorkspaceById(
      orgId,
      workspaceId
    );

  if (
    input.name !== undefined &&
    input.name !== workspace.name
  ) {
    const existingWorkspace =
      await Workspace.findOne({
        organizationId:
          new Types.ObjectId(orgId),
        name: input.name,
        _id: {
          $ne: workspace._id,
        },
      }).lean();

    if (existingWorkspace) {
      throw new ConflictError(
        'Workspace name already exists'
      );
    }

    workspace.name = input.name;
  }

  if (
    input.description !== undefined
  ) {
    workspace.description =
      input.description;
  }

  await workspace.save();

  return workspace;
}

/**
 * Soft deletes a workspace.
 */
export async function deleteWorkspace(
  orgId: string,
  workspaceId: string
) {
  const workspace =
    await getWorkspaceById(
      orgId,
      workspaceId
    );

  await workspace.softDelete();

  return workspace.toObject();
}