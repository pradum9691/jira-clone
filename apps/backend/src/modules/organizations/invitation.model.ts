import { Schema, model, Document, Types } from 'mongoose';
import { OrgRole, InvitationStatus } from '../../shared/enums/role.enum';

 
export interface IInvitation extends Document {
  email: string;
  organizationId: Types.ObjectId;
  role: OrgRole;
  token: string;
  status: InvitationStatus;
  invitedBy: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(OrgRole),
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

 
invitationSchema.index(
  { email: 1, organizationId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: InvitationStatus.PENDING },
  }
);
 
invitationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 }
);

export const Invitation = model<IInvitation>('Invitation', invitationSchema);
