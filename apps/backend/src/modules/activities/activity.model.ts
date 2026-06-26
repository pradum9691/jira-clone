import { Schema, model, Document, Types } from "mongoose";
import {
  softDeletePlugin,
  SoftDeleteFields,
  SoftDeleteMethods,
} from "../../database/plugins/soft-delete.plugin";
import { ActivityAction } from "../../shared/enums/activity-action.enum";

export interface IActivity
  extends Document, SoftDeleteFields, SoftDeleteMethods {
  organizationId: Types.ObjectId;
  projectId: Types.ObjectId;
  issueId: Types.ObjectId;
  actorId: Types.ObjectId;
  action: ActivityAction;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: unknown;
  createdById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
      index: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
      index: true,
    },

    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "Issue ID is required"],
      index: true,
    },

    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Actor ID is required"],
      index: true,
    },

    action: {
      type: String,
      enum: Object.values(ActivityAction),
      required: [true, "Action is required"],
    },

    field: {
      type: String,
      trim: true,
    },

    oldValue: {
      type: Schema.Types.Mixed,
    },

    newValue: {
      type: Schema.Types.Mixed,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },

    createdById: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
  },
  {
    timestamps: true,
    collection: "activities",
  },
);

activitySchema.plugin(softDeletePlugin);

const transformFields = (_doc: any, ret: any) => {
  delete ret.isDeleted;
  delete ret.deletedAt;
  delete ret.__v;

  return ret;
};

activitySchema.set("toJSON", {
  transform: transformFields,
});

activitySchema.set("toObject", {
  transform: transformFields,
});

activitySchema.index({
  organizationId: 1,
  projectId: 1,
  issueId: 1,
  createdAt: -1,
});

activitySchema.index({
  actorId: 1,
});

activitySchema.index({
  action: 1,
});

export const Activity = model<IActivity>("Activity", activitySchema);
