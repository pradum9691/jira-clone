import { Schema, model, Document, Types } from 'mongoose';

import {
  softDeletePlugin,
  SoftDeleteFields,
  SoftDeleteMethods,
} from '../../database/plugins/soft-delete.plugin';

export interface IProject
  extends Document,
    SoftDeleteFields,
    SoftDeleteMethods {
  organizationId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  name: string;
  key: string;
  description?: string | null;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 10,
       match: /^[A-Z0-9]+$/,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'projects',
  }
);

projectSchema.plugin(softDeletePlugin);

/**
 * Project key must be unique within an organization.
 * Soft-deleted projects do not block reuse.
 */
projectSchema.index(
  {
    organizationId: 1,
    key: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

/**
 * Optimizes queries for projects under a workspace.
 */
projectSchema.index({
  organizationId: 1,
  workspaceId: 1,
  createdAt: -1,
});

/**
 * Hide internal fields from API responses.
 */
projectSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).isDeleted;
    delete (ret as any).deletedAt;
    delete (ret as any).__v;

    return ret;
  },
});

projectSchema.set('toObject', {
  transform: (_doc, ret) => {
    delete (ret as any).isDeleted;
    delete (ret as any).deletedAt;
    delete (ret as any).__v;

    return ret;
  },
});

export const Project = model<IProject>('Project', projectSchema);
