import { Schema, model, Document } from 'mongoose';

import {
  softDeletePlugin,
  SoftDeleteFields,
  SoftDeleteMethods,
} from '../../database/plugins/soft-delete.plugin';

import {
  OrganizationStatus,
  SubscriptionPlan,
} from '../../shared/enums/role.enum';

export interface IOrganization
  extends Document,
    SoftDeleteFields,
    SoftDeleteMethods {
  name: string;
  ownerId: Schema.Types.ObjectId;
  slug: string;
  logoUrl?: string | null;
  status: OrganizationStatus;
  trialEndsAt?: Date | null;
  subscriptionPlan?: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      match: /^[a-z0-9-]+$/,
    },

    logoUrl: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(OrganizationStatus),
      default: OrganizationStatus.TRIAL,
    },

    trialEndsAt: {
      type: Date,
      default: () => {
        const now = new Date();
        now.setDate(now.getDate() + 14);
        return now;
      },
    },

    subscriptionPlan: {
      type: String,
      enum: Object.values(SubscriptionPlan),
    },
  },
  {
    timestamps: true,
  }
);

organizationSchema.plugin(softDeletePlugin);

organizationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const obj = ret as Record<string, any>
    delete obj.isDeleted;
    delete obj.deletedAt;
    delete obj.__v;

    return obj;
  },
});

organizationSchema.set('toObject', {
  transform: (_doc, ret) => {
    const obj = ret as Record<string, any>
    delete obj.isDeleted;
    delete obj.deletedAt;
    delete obj.__v;

    return obj;
  },
});

export const Organization = model<IOrganization>(
  'Organization',
  organizationSchema
);