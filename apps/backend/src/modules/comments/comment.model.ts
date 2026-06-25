import { Schema, model, Document, Types } from 'mongoose';
import {
  softDeletePlugin,
  SoftDeleteFields,
  SoftDeleteMethods,
} from '../../database/plugins/soft-delete.plugin';

export interface IComment extends Document, SoftDeleteFields, SoftDeleteMethods {
  organizationId: Types.ObjectId;
  projectId: Types.ObjectId;
  issueId: Types.ObjectId;
  content: string;
  authorId: Types.ObjectId;
  createdById: Types.ObjectId;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },

    issueId: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
      required: [true, 'Issue ID is required'],
      index: true,
    },

    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      minlength: [1, 'Content cannot be empty'],
      maxlength: [5000, 'Comment content cannot exceed 5000 characters'],
    },

    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
      index: true,
    },

    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by ID is required'],
    },

    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'comments',
  }
);

/**
 * Soft Delete Plugin
 */
commentSchema.plugin(softDeletePlugin);

/**
 * Hide internal fields from API responses
 */
const transformFields = (_doc: any, ret: any) => {
  delete ret.isDeleted;
  delete ret.deletedAt;
  delete ret.__v;

  return ret;
};

commentSchema.set('toJSON', {
  transform: transformFields,
});

commentSchema.set('toObject', {
  transform: transformFields,
});

/**
 * Indexes
 */
commentSchema.index({
  organizationId: 1,
  projectId: 1,
  issueId: 1,
  createdAt: 1,
});

commentSchema.index({
  authorId: 1,
});

export const Comment = model<IComment>('Comment', commentSchema);
