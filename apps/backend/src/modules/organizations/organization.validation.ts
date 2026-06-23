import { z } from "zod";

/**
 * Create Organization
 */
export const createOrganizationSchema = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: "Organization name is required",
        })
        .trim()
        .min(2, "Organization name must be at least 2 characters")
        .max(150, "Organization name cannot exceed 150 characters"),

      slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "Slug must be at least 3 characters")
        .max(60, "Slug cannot exceed 60 characters")
        .regex(
          /^[a-z0-9-]+$/,
          "Slug can only contain lowercase letters, numbers, and hyphens"
        )
        .optional(),

      logoUrl: z
        .string()
        .url("Logo URL must be a valid URL")
        .optional(),
    })
    .strict(),
});

/**
 * Update Organization
 */
export const updateOrganizationSchema = z.object({
  params: z
    .object({
      orgId: z
        .string()
        .regex(
          /^[0-9a-fA-F]{24}$/,
          "Invalid organization ID"
        ),
    })
    .strict(),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Organization name must be at least 2 characters")
        .max(150, "Organization name cannot exceed 150 characters")
        .optional(),

      logoUrl: z
        .string()
        .url("Logo URL must be a valid URL")
        .nullable()
        .optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

/**
 * Get Organization By Slug
 */
export const getOrganizationSchema = z.object({
  params: z
    .object({
      slug: z
        .string()
        .trim()
        .min(1, "Organization slug is required"),
    })
    .strict(),
});

/**
 * Types
 */
export type CreateOrganizationInput =
  z.infer<typeof createOrganizationSchema>["body"];

export type UpdateOrganizationInput =
  z.infer<typeof updateOrganizationSchema>["body"];

export type GetOrganizationInput =
  z.infer<typeof getOrganizationSchema>["params"];