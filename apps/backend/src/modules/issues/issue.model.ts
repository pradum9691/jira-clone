import { Schema, model, Document, Types } from 'mongoose';
import {
  softDeletePlugin,
  SoftDeleteFields,
  SoftDeleteMethods,
} from '../../database/plugins/soft-delete.plugin';
import { IssueStatus } from '../../shared/enums/issue-status.enum';
import { IssuePriority } from '../../shared/enums/issue-priority.enum';
import { IssueType } from '../../shared/enums/issue-type.enum';

export interface IIssue
  extends Document,
    SoftDeleteFields,
    SoftDeleteMethods {
  organizationId: Types.ObjectId;
  projectId: Types.ObjectId;
  sprintId?: Types.ObjectId | null;
  issueNumber: number;
  title: string;
  description?: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assigneeId?: Types.ObjectId | null;
  reporterId: Types.ObjectId;
  dueDate?: Date | null;
  labels: string[];
  createdById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IIssue>(
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

    sprintId: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      default: null,
      index: true,
    },

    issueNumber: {
      type: Number,
      required: [true, 'Issue number is required'],
    },

    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      maxlength: [200, 'Issue title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(IssueStatus),
      required: true,
      default: IssueStatus.OPEN,
    },

    priority: {
      type: String,
      enum: Object.values(IssuePriority),
      required: true,
      default: IssuePriority.MEDIUM,
    },

    type: {
      type: String,
      enum: Object.values(IssueType),
      required: true,
      default: IssueType.TASK,
    },

    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },

    dueDate: {
      type: Date,
      default: null,
    },

    labels: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [30, 'Label cannot exceed 30 characters'],
        },
      ],
      default: [],
    },

    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
    collection: 'issues',
  }
);

/**
 * Soft Delete Plugin
 */
issueSchema.plugin(softDeletePlugin);

/**
 * Hide internal fields from API responses
 */
const transformFields = (_doc: any, ret: any) => {
  delete ret.isDeleted;
  delete ret.deletedAt;
  delete ret.__v;

  return ret;
};

issueSchema.set('toJSON', {
  transform: transformFields,
});

issueSchema.set('toObject', {
  transform: transformFields,
});

/**
 * Indexes
 */

// List project issues efficiently
issueSchema.index({
  organizationId: 1,
  projectId: 1,
  createdAt: -1,
});

// Organization/sprint issues lookup
issueSchema.index({
  organizationId: 1,
  sprintId: 1,
});

// Assignee task filtering
issueSchema.index({
  assigneeId: 1,
  status: 1,
});

// Default sorting
issueSchema.index({
  createdAt: -1,
});

// Unique issue number per project
issueSchema.index(
  {
    projectId: 1,
    issueNumber: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

export const Issue = model<IIssue>('Issue', issueSchema);