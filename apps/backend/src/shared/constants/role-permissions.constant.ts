export enum Permission {
  
  ORG_VIEW = 'ORG_VIEW',
  ORG_MANAGE = 'ORG_MANAGE',
  ORG_BILLING_MANAGE = 'ORG_BILLING_MANAGE',
  ORG_MEMBER_INVITE = 'ORG_MEMBER_INVITE',
  ORG_MEMBER_REMOVE = 'ORG_MEMBER_REMOVE',

  WORKSPACE_CREATE = 'WORKSPACE_CREATE',
  WORKSPACE_UPDATE = 'WORKSPACE_UPDATE',
  WORKSPACE_DELETE = 'WORKSPACE_DELETE',
  WORKSPACE_VIEW = 'WORKSPACE_VIEW',

  PROJECT_CREATE = 'PROJECT_CREATE',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  PROJECT_DELETE = 'PROJECT_DELETE',
  PROJECT_MEMBER_MANAGE = 'PROJECT_MEMBER_MANAGE',

  SPRINT_MANAGE = 'SPRINT_MANAGE',

  ISSUE_CREATE = 'ISSUE_CREATE',
  ISSUE_UPDATE = 'ISSUE_UPDATE',
  ISSUE_DELETE = 'ISSUE_DELETE',
  ISSUE_ASSIGN = 'ISSUE_ASSIGN',
  ISSUE_COMMENT = 'ISSUE_COMMENT',
  ISSUE_ATTACHMENT_UPLOAD = 'ISSUE_ATTACHMENT_UPLOAD',

  ANALYTICS_VIEW = 'ANALYTICS_VIEW',
  PROJECT_VIEW = 'PROJECT_VIEW',
  ISSUE_VIEW = 'ISSUE_VIEW',
}

import { OrgRole } from '../enums/role.enum';

 
export const ROLE_PERMISSIONS: Record<OrgRole, Permission[]> = {
  [OrgRole.SUPER_ADMIN]: Object.values(Permission), 

  [OrgRole.ORG_ADMIN]: [
    Permission.ORG_VIEW,
    Permission.ORG_MANAGE,
    Permission.ORG_BILLING_MANAGE,
    Permission.ORG_MEMBER_INVITE,
    Permission.ORG_MEMBER_REMOVE,
    Permission.WORKSPACE_CREATE,
    Permission.WORKSPACE_UPDATE,
    Permission.WORKSPACE_DELETE, 
    Permission.WORKSPACE_VIEW ,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_MEMBER_MANAGE,
    Permission.PROJECT_VIEW,
    Permission.SPRINT_MANAGE,
    Permission.ISSUE_CREATE,
    Permission.ISSUE_UPDATE,
    Permission.ISSUE_DELETE,
    Permission.ISSUE_ASSIGN,
    Permission.ISSUE_COMMENT,
    Permission.ISSUE_ATTACHMENT_UPLOAD,
    Permission.ANALYTICS_VIEW,
    Permission.ISSUE_VIEW,
  ],

  [OrgRole.PROJECT_MANAGER]: [
    Permission.ORG_VIEW,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_MEMBER_MANAGE,
    Permission.SPRINT_MANAGE,
    Permission.ISSUE_CREATE,
    Permission.ISSUE_UPDATE,
    Permission.ISSUE_DELETE,
    Permission.ISSUE_ASSIGN,
    Permission.ISSUE_COMMENT,
    Permission.ISSUE_ATTACHMENT_UPLOAD,
    Permission.ANALYTICS_VIEW,
    Permission.PROJECT_VIEW,
    Permission.ISSUE_VIEW,
  ],

  [OrgRole.DEVELOPER]: [
    Permission.ORG_VIEW,
    Permission.ISSUE_UPDATE,
    Permission.ISSUE_COMMENT,
    Permission.ISSUE_ATTACHMENT_UPLOAD,
    Permission.PROJECT_VIEW,
    Permission.ISSUE_VIEW,
  ],

  [OrgRole.QA]: [
    Permission.ORG_VIEW,
    Permission.ISSUE_CREATE,
    Permission.ISSUE_UPDATE,
    Permission.ISSUE_COMMENT,
    Permission.ISSUE_ATTACHMENT_UPLOAD,
    Permission.PROJECT_VIEW,
    Permission.ISSUE_VIEW,
  ],

  [OrgRole.VIEWER]: [
    Permission.ORG_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.PROJECT_VIEW,
    Permission.ISSUE_VIEW,
    Permission.WORKSPACE_VIEW,
  ],
};

 
export function hasPermission(role: OrgRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
