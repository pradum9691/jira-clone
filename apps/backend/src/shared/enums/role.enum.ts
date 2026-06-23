/**
 * Organization-level roles.
 *
 * These map to the `role` field on `organization_members` and
 * `project_members`. The actual permission set per role is defined
 * in `shared/constants/role-permissions.constant.ts` (Phase 1
 * hardcoded map, later backed by the `roles` / `permissions` /
 * `role_permissions` collections for custom roles).
 */
export enum OrgRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  DEVELOPER = 'DEVELOPER',
  QA = 'QA',
  VIEWER = 'VIEWER',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  DELETED = 'DELETED',
}

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
}

export enum SubscriptionPlan { 
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}   