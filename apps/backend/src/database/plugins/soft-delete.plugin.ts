import { Schema, Query, Document } from "mongoose";

/**
 * Soft Delete Plugin
 *
 * Features:
 * - Adds isDeleted and deletedAt fields
 * - Automatically excludes soft-deleted documents
 * - Supports softDelete() and restore()
 * - Supports aggregation pipelines
 */

export interface SoftDeleteFields {
  isDeleted: boolean;
  deletedAt: Date | null;
}

export interface SoftDeleteMethods {
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

export function softDeletePlugin(schema: Schema): void {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  /**
   * Automatically exclude soft-deleted documents
   * unless caller explicitly specifies isDeleted.
   */
  const excludeDeleted = function (this: Query<any, any>) {
    const filter = this.getFilter();

    if (filter.isDeleted === undefined) {
      this.where({ isDeleted: false });
    }
  };

  schema.pre("find", excludeDeleted);
  schema.pre("findOne", excludeDeleted);
  schema.pre("findOneAndUpdate", excludeDeleted);
  schema.pre("findOneAndDelete", excludeDeleted);
  schema.pre("countDocuments", excludeDeleted);

  schema.pre("aggregate", function () {
    const pipeline = this.pipeline();

    const firstStage = pipeline[0] as any;

    if (
      !firstStage ||
      !firstStage.$match ||
      firstStage.$match.isDeleted === undefined
    ) {
      pipeline.unshift({
        $match: {
          isDeleted: false,
        },
      });
    }
  });

  schema.methods.softDelete = async function (
    this: Document & SoftDeleteFields
  ) {
    this.isDeleted = true;
    this.deletedAt = new Date();

    await this.save({
      validateBeforeSave: false,
    });

    return this;
  };

  schema.methods.restore = async function (
    this: Document & SoftDeleteFields
  ) {
    this.isDeleted = false;
    this.deletedAt = null;

    await this.save({
      validateBeforeSave: false,
    });

    return this;
  };
}