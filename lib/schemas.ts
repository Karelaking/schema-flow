import { z } from "zod";

/**
 * Validation schema for creating a new database schema project.
 */
export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(64, "Name must be 64 characters or less"),
  description: z.string().max(256, "Description must be 256 characters or less"),
  dialect: z.enum(["sqlite", "postgres", "mysql"], {
    errorMap: () => ({ message: "Please select a valid database dialect" }),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Validation schema for editing project settings.
 */
export const projectSettingsSchema = z.object({
  name: z.string().min(1, "Project name is required").max(64, "Name must be 64 characters or less"),
  description: z.string().max(256, "Description must be 256 characters or less"),
  dialect: z.enum(["sqlite", "postgres", "mysql"]),
  autoAddId: z.boolean(),
  autoAddTimestamps: z.boolean(),
});

export type ProjectSettingsInput = z.infer<typeof projectSettingsSchema>;
