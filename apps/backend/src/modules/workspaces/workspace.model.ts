import { Schema, model, Document, Types } from 'mongoose';

import {
  softDeletePlugin,
  SoftDeleteFields,
  SoftDeleteMethods,
} from '../../database/plugins/soft-delete.plugin';

export interface IWorkspace
  extends Document,
    SoftDeleteFields,
    SoftDeleteMethods {
  organizationId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string | null;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      match: /^[a-z0-9-]+$/,
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
    collection: 'workspaces',
  }
);

workspaceSchema.plugin(softDeletePlugin);

/**
 * Slug must be unique within an organization.
 * Soft-deleted workspaces do not block reuse.
 */
workspaceSchema.index(
  {
    organizationId: 1,
    slug: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

/**
 * Workspace name must be unique within an organization.
 * Soft-deleted workspaces do not block reuse.
 */
workspaceSchema.index(
  {
    organizationId: 1,
    name: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

/**
 * Optimizes organization workspace listings.
 */
workspaceSchema.index({
  organizationId: 1,
  createdAt: -1,
});

/**
 * Hide internal fields from API responses.
 */
workspaceSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).isDeleted;
    delete (ret as any).deletedAt;
    delete (ret as any).__v;

    return ret;
  },
});

workspaceSchema.set('toObject', {
  transform: (_doc, ret) => {
    delete (ret as any).isDeleted;
    delete (ret as any).deletedAt;
    delete (ret as any).__v;

    return ret;
  },
});

export const Workspace = model<IWorkspace>(
  'Workspace',
  workspaceSchema
);