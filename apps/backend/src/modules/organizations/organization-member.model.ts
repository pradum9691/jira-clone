import { Schema, model, Document, Types } from "mongoose";
import {
  softDeletePlugin,
  SoftDeleteFields,
  SoftDeleteMethods,
} from "../../database/plugins/soft-delete.plugin";
import { OrgRole } from "../../shared/enums/role.enum";
 
export interface IOrganizationMember
  extends Document, SoftDeleteFields, SoftDeleteMethods {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: OrgRole;
  invitedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  status: "ACTIVE" | "PENDING" | "REMOVED";
  joinedAt: Date;
}

const organizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(OrgRole),
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "PENDING", "REMOVED"],
      default: "ACTIVE",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

organizationMemberSchema.plugin(softDeletePlugin);

 
organizationMemberSchema.index(
  { organizationId: 1, userId: 1 },
  { unique: true },
);

export const OrganizationMember = model<IOrganizationMember>(
  "OrganizationMember",
  organizationMemberSchema,
);
