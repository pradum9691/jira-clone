import { Schema, model, Document, Types } from 'mongoose';

import {
  softDeletePlugin,
  SoftDeleteFields,
  SoftDeleteMethods,
} from '../../database/plugins/soft-delete.plugin';
import { ProjectRole } from '../../shared/enums/project-role.enum';

export interface IProjectMember
  extends Document,
    SoftDeleteFields,
    SoftDeleteMethods {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  role: ProjectRole;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectMemberSchema = new Schema<IProjectMember>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: Object.values(ProjectRole),
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'project_members',
  }
);

projectMemberSchema.plugin(softDeletePlugin);

/**
 * A user can only have one membership record per project.
 * Soft-deleted members do not block re-adding.
 */
projectMemberSchema.index(
  {
    projectId: 1,
    userId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

/**
 * Optimizes queries for finding all projects of a user,
 * user dashboard queries, and notifications.
 */
projectMemberSchema.index({
  userId: 1,
  projectId: 1,
});

/**
 * Hide internal fields from API responses.
 */
projectMemberSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).isDeleted;
    delete (ret as any).deletedAt;
    delete (ret as any).__v;

    return ret;
  },
});

projectMemberSchema.set('toObject', {
  transform: (_doc, ret) => {
    delete (ret as any).isDeleted;
    delete (ret as any).deletedAt;
    delete (ret as any).__v;

    return ret;
  },
});

export const ProjectMember = model<IProjectMember>(
  'ProjectMember',
  projectMemberSchema
);
