import { Schema, model, Document, Types } from 'mongoose';
import {
  softDeletePlugin,
  SoftDeleteFields,
  SoftDeleteMethods,
} from '../../database/plugins/soft-delete.plugin';

export interface IAttachment extends Document, SoftDeleteFields, SoftDeleteMethods {
  organizationId: Types.ObjectId;
  projectId: Types.ObjectId;
  issueId: Types.ObjectId;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  uploadedBy: Types.ObjectId;
  createdById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
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

    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },

    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },

    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },

    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
    },

    storagePath: {
      type: String,
      required: [true, 'Storage path is required'],
      trim: true,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploaded by user is required']
    },

    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
  },
  {
    timestamps: true,
    collection: 'attachments',
  }
);


attachmentSchema.plugin(softDeletePlugin);


const transformFields = (_doc: any, ret: any) => {
  delete ret.isDeleted;
  delete ret.deletedAt;
  delete ret.__v;

  return ret;
};

attachmentSchema.set('toJSON', {
  transform: transformFields,
});

attachmentSchema.set('toObject', {
  transform: transformFields,
});


attachmentSchema.index({
  organizationId: 1,
  projectId: 1,
  issueId: 1,
  createdAt: -1,
});

attachmentSchema.index({
  uploadedBy: 1,
});

export const Attachment = model<IAttachment>('Attachment', attachmentSchema);
