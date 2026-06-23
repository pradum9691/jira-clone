import { Types } from 'mongoose';

import {
  Organization,
  type IOrganization,
} from './organization.model';
import { OrganizationMember } from './organization-member.model';

import { OrgRole } from '../../shared/enums/role.enum';
import { slugify } from '../../shared/utils/slug.util';

import { ConflictError, NotFoundError } from '../../errors';

import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from './organization.validation';

/**
 * Removes internal fields from API responses.
 */
function toSafeOrg(org: IOrganization) {
  const obj = org.toObject();

  delete obj.isDeleted;
  delete obj.deletedAt;
  delete obj.__v;

  return obj;
}

/**
 * Generates a unique slug from a base string.
 * Example:
 * acme-corp
 * acme-corp-2
 * acme-corp-3
 */
async function generateUniqueSlug(
  base: string
): Promise<string> {
  const baseSlug = slugify(base);

  let slug = baseSlug;
  let counter = 2;

  while (await Organization.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validates a custom slug supplied by the user.
 */
async function resolveSlug(
  requestedSlug: string
): Promise<string> {
  const existing = await Organization.findOne({
    slug: requestedSlug,
  }).lean();

  if (existing) {
    throw new ConflictError(
      `Slug "${requestedSlug}" is already taken`
    );
  }

  return requestedSlug;
}

/**
 * Creates organization and owner membership.
 */
export async function createOrganization(
  input: CreateOrganizationInput,
  creatorId: string
) {
  const slug = input.slug
    ? await resolveSlug(input.slug)
    : await generateUniqueSlug(input.name);

  const org = await Organization.create({
    name: input.name,
    ownerId: new Types.ObjectId(creatorId),
    slug,
    logoUrl: input.logoUrl ?? null,
  });

  await OrganizationMember.create({
    organizationId: org._id,
    userId: new Types.ObjectId(creatorId),
    role: OrgRole.ORG_ADMIN,
    status: 'ACTIVE',
    joinedAt: new Date(),
  });

  return toSafeOrg(org);
}

/**
 * Returns organizations where user is an ACTIVE member.
 */
export async function getUserOrganizations(
  userId: string,
  page: number,
  limit: number
) {
  const memberships = await OrganizationMember.find({
    userId: new Types.ObjectId(userId),
    status: 'ACTIVE',
  })
    .select('organizationId role')
    .lean();

  const orgIds = memberships.map(
    (membership) => membership.organizationId
  );

  const [organizations, total] = await Promise.all([
    Organization.find({
      _id: { $in: orgIds },
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Organization.countDocuments({
      _id: { $in: orgIds },
    }),
  ]);

  const roleMap = new Map(
    memberships.map((membership) => [
      membership.organizationId.toString(),
      membership.role,
    ])
  );

  const data = organizations.map((org: any) => {
    const safeOrg = { ...org };

    delete safeOrg.isDeleted;
    delete safeOrg.deletedAt;
    delete safeOrg.__v;

    return {
      ...safeOrg,
      myRole: roleMap.get(org._id.toString()),
    };
  });

  return {
    data,
    total,
    page,
    limit,
  };
}

/**
 * Finds organization by slug.
 */
export async function getOrganizationBySlug(
  slug: string
) {
  const org = await Organization.findOne({
    slug,
  });

  if (!org) {
    throw new NotFoundError(
      'Organization not found'
    );
  }

  return toSafeOrg(org);
}

/**
 * Updates organization.
 */
export async function updateOrganization(
  orgId: string,
  input: UpdateOrganizationInput
) {
  const org = await Organization.findById(orgId);

  if (!org) {
    throw new NotFoundError(
      'Organization not found'
    );
  }

  if (input.name !== undefined) {
    org.name = input.name;
  }

  if (input.logoUrl !== undefined) {
    org.logoUrl = input.logoUrl;
  }

  await org.save();

  return toSafeOrg(org);
}

/**
 * Returns user's role inside organization.
 */
export async function getMemberRole(
  userId: string,
  organizationId: string
): Promise<OrgRole | null> {
  const membership =
    await OrganizationMember.findOne({
      userId: new Types.ObjectId(userId),
      organizationId: new Types.ObjectId(
        organizationId
      ),
      status: 'ACTIVE',
    }).lean();

  return membership?.role ?? null;
}

/**
 * Soft deletes an organization.
 */
export async function deleteOrganization(
  orgId: string
): Promise<void> {
  const org = await Organization.findById(orgId);

  if (!org) {
    throw new NotFoundError(
      'Organization not found'
    );
  }

  await org.softDelete();
}