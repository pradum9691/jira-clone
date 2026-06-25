import { Schema, model, Document, Types } from 'mongoose';
import {
  softDeletePlugin,
  SoftDeleteFields,
  SoftDeleteMethods,
} from '../../database/plugins/soft-delete.plugin';
import { SprintStatus } from '../../shared/enums/sprint-status.enum';

export interface ISprint extends Document, SoftDeleteFields, SoftDeleteMethods {
  organizationId: Types.ObjectId;
  projectId: Types.ObjectId;
  name: string;
  status: SprintStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  goal?: string | null;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sprintSchema = new Schema<ISprint>(
  {
    // Multi-tenancy support
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },

    // Sprint belongs to one project
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Sprint name is required'],
      trim: true,
      maxlength: [100, 'Sprint name cannot exceed 100 characters'],
    },

    status: {
      type: String,
      enum: Object.values(SprintStatus),
      required: true,
      default: SprintStatus.PLANNED,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (this: ISprint, value: Date | null) {
          if (!value || !this.startDate) return true;
          return value >= this.startDate;
        },
        message: 'End date cannot be earlier than start date',
      },
    },

    goal: {
      type: String,
      trim: true,
      maxlength: [500, 'Sprint goal cannot exceed 500 characters'],
      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
  },
  {
    timestamps: true,
    collection: 'sprints',
  }
);

/**
 * Soft Delete Plugin
 */
sprintSchema.plugin(softDeletePlugin);

/**
 * Hide internal fields from API responses
 */
const transformFields = (_doc: any, ret: any) => {
  delete ret.isDeleted;
  delete ret.deletedAt;
  delete ret.__v;

  return ret;
};

sprintSchema.set('toJSON', {
  transform: transformFields,
});

sprintSchema.set('toObject', {
  transform: transformFields,
});

/**
 * Indexes
 */

// List project sprints efficiently
sprintSchema.index({
  organizationId: 1,
  projectId: 1,
  createdAt: -1,
});

// Filter by project + status
sprintSchema.index({
  projectId: 1,
  status: 1,
});

// Organization-wide sprint status queries
sprintSchema.index({
  organizationId: 1,
  status: 1,
});

// Frequently used query
sprintSchema.index({
  organizationId: 1,
  projectId: 1,
  status: 1,
});

/**
 * Allow only ONE ACTIVE sprint per project
 * Remove this index if your business logic
 * allows multiple active sprints.
 */
sprintSchema.index(
  {
    projectId: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: SprintStatus.ACTIVE,
      isDeleted: false,
    },
  }
);

/**
 * Normalize sprint name before save
 */
sprintSchema.pre('save', function (next) {
  if (this.name) {
    this.name = this.name.trim();
  }

  next();
});

export const Sprint = model<ISprint>('Sprint', sprintSchema);