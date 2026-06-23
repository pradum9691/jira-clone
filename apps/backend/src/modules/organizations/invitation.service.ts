import crypto from "crypto";
import { Types } from "mongoose";
import { Invitation } from "./invitation.model";
import { OrganizationMember } from "./organization-member.model";
import { Organization } from "./organization.model";
import { User } from "../users/user.model";
import { InvitationStatus, OrgRole } from "../../shared/enums/role.enum";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../errors";
import { sendInvitationEmail } from "../../shared/utils/email.util";
import { CreateInvitationInput } from "./invitation.validation";
import { env } from "../../config/env";

const INVITATION_EXPIRES_DAYS = 7;

/** Generates a secure random token for invitation links. */
function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Creates an invitation and (placeholder) sends an email.
 *
 * Rules:
 * - Cannot invite someone already a member of the org.
 * - Cannot send a second PENDING invite to the same email in the same org
 *   (unique partial index on invitation.model.ts handles DB-level enforcement;
 *   we throw a friendly error here before hitting that index).
 * - Inviter must be a member themselves (checked in permission middleware).
 */
export async function createInvitation(
  orgId: string,
  inviterId: string,
  input: CreateInvitationInput,
) {
  const org = await Organization.findById(orgId);
  if (!org) throw new NotFoundError("Organization not found");

  // Is this email already a member?
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    const alreadyMember = await OrganizationMember.findOne({
      organizationId: new Types.ObjectId(orgId),
      userId: existingUser._id,
    });
    if (alreadyMember) {
      throw new ConflictError(
        "This user is already a member of the organization",
      );
    }
  }

  // Is there already a pending invite for this email+org?
  const existingInvite = await Invitation.findOne({
    email: input.email,
    organizationId: new Types.ObjectId(orgId),
    status: InvitationStatus.PENDING,
  });
  if (existingInvite) {
    throw new ConflictError(
      "A pending invitation already exists for this email. Revoke it first to re-invite.",
    );
  }

  const inviter = await User.findById(inviterId);
  if (!inviter) throw new NotFoundError("Inviter not found");

  const token = generateInviteToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRES_DAYS);

  const invitation = await Invitation.create({
    email: input.email,
    organizationId: new Types.ObjectId(orgId),
    role: input.role,
    token,
    status: InvitationStatus.PENDING,
    invitedBy: new Types.ObjectId(inviterId),
    expiresAt,
  });

  // Build the accept URL the frontend will handle
  const acceptUrl = `${env.CLIENT_URL}/invitations/${token}/accept`;

  await sendInvitationEmail({
    toEmail: input.email,
    inviterName: inviter.name,
    organizationName: org.name,
    role: input.role,
    acceptUrl,
  });

  return invitation;
}

/**
 * Lists invitations for an organization, with optional status filter.
 */
export async function listInvitations(
  orgId: string,
  status: InvitationStatus | undefined,
  page: number,
  limit: number,
) {
  const filter: Record<string, unknown> = {
    organizationId: new Types.ObjectId(orgId),
  };
  if (status) filter.status = status;

  const [invitations, total] = await Promise.all([
    Invitation.find(filter)
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Invitation.countDocuments(filter),
  ]);

  return { data: invitations, total };
}

/**
 * Accepts an invitation by token.
 *
 * Flow:
 * 1. Find invitation by token.
 * 2. Validate it's PENDING and not expired.
 * 3. Create OrganizationMember entry with the invited role.
 * 4. Mark invitation as ACCEPTED.
 *
 * The accepting user must be logged in (authenticate middleware).
 * Their email must match the invitation email (prevents someone else
 * from accepting an invite meant for another person).
 */
export async function acceptInvitation(token: string, acceptingUserId: string) {
  const invitation = await Invitation.findOne({ token });

  if (!invitation)
    throw new NotFoundError("Invitation not found or already used");

  if (invitation.status !== InvitationStatus.PENDING) {
    throw new BadRequestError(
      `Invitation is already ${invitation.status.toLowerCase()}`,
    );
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = InvitationStatus.EXPIRED;
    await invitation.save();
    throw new BadRequestError(
      "Invitation has expired. Please request a new one.",
    );
  }

  // Verify the logged-in user's email matches the invite
  const acceptingUser = await User.findById(acceptingUserId);
  if (!acceptingUser) throw new NotFoundError("User not found");

  if (
    acceptingUser.email.toLocaleLowerCase() !==
    invitation.email.toLocaleLowerCase()
  ) {
    throw new ForbiddenError(
      "This invitation was sent to a different email address",
    );
  }

  // Check if already a member (edge case: invited twice somehow)
  const alreadyMember = await OrganizationMember.findOne({
    organizationId: invitation.organizationId,
    userId: new Types.ObjectId(acceptingUserId),
  });
  if (alreadyMember) {
    throw new ConflictError("You are already a member of this organization");
  }

  // Create membership
  await OrganizationMember.create({
    organizationId: invitation.organizationId,
    userId: new Types.ObjectId(acceptingUserId),
    role: invitation.role as OrgRole,
    invitedBy: invitation.invitedBy,
    status: "ACTIVE",
    joinedAt: new Date(),
  });

  invitation.status = InvitationStatus.ACCEPTED;
  await invitation.save();

  return { organizationId: invitation.organizationId, role: invitation.role };
}

/**
 * Revokes a pending invitation.
 * Only ORG_ADMIN can do this (enforced in route via requirePermission).
 */
export async function revokeInvitation(orgId: string, invitationId: string) {
  const invitation = await Invitation.findOne({
    _id: new Types.ObjectId(invitationId),
    organizationId: new Types.ObjectId(orgId),
  });

  if (!invitation) throw new NotFoundError("Invitation not found");

  if (invitation.status !== InvitationStatus.PENDING) {
    throw new BadRequestError(
      `Cannot revoke a ${invitation.status.toLowerCase()} invitation`,
    );
  }

  invitation.status = InvitationStatus.REVOKED;
  await invitation.save();

  const { token, ...safeInvitation } = invitation.toObject();

  return safeInvitation;
}
