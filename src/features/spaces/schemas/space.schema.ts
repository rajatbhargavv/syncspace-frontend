import { z } from 'zod';
import {
  SPACE_KIND,
  THEME_PRESET,
  THEME_MODE,
  VISIBILITY,
  JOIN_POLICY,
  SPACE_STATUS,
} from '@/config/constants';

// ── Enum schemas ──

export const spaceKindSchema = z.enum([
  SPACE_KIND.OUR_HOME,
  SPACE_KIND.BUILDERS_CIRCLE,
  SPACE_KIND.STUDIO,
  SPACE_KIND.MY_CORNER,
  SPACE_KIND.CUSTOM,
]);

export const themePresetSchema = z.enum([
  THEME_PRESET.HEARTH,
  THEME_PRESET.NEON_GRID,
  THEME_PRESET.IVORY_INK,
  THEME_PRESET.ORBIT,
]);

export const themeModeSchema = z.enum([THEME_MODE.LIGHT, THEME_MODE.DARK]);

export const visibilitySchema = z.enum([
  VISIBILITY.PRIVATE,
  VISIBILITY.UNLISTED,
  VISIBILITY.PUBLIC,
]);

export const joinPolicySchema = z.enum([
  JOIN_POLICY.INVITE_ONLY,
  JOIN_POLICY.REQUEST,
  JOIN_POLICY.OPEN,
]);

export const spaceStatusSchema = z.enum([SPACE_STATUS.ACTIVE, SPACE_STATUS.INACTIVE]);
export const spacePermissionSchema = z.enum(['OWNER_ONLY', 'OWNER_AND_CREATOR', 'ALL_MEMBERS']);

export const spaceThemeSchema = z.object({
  preset: themePresetSchema,
  mode: themeModeSchema,
});

// ── Create Space ──

export const createSpaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .default(''),
  kind: spaceKindSchema,
  theme: spaceThemeSchema,
  visibility: visibilitySchema,
  joinPolicy: joinPolicySchema,
});

export type CreateSpaceFormValues = z.infer<typeof createSpaceSchema>;

// ── Update Space ──

export const updateSpaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters')
    .optional(),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  status: spaceStatusSchema.optional(),
  kind: spaceKindSchema.optional(),
  theme: spaceThemeSchema.optional(),
  visibility: visibilitySchema.optional(),
  joinPolicy: joinPolicySchema.optional(),
  assigneePermission: spacePermissionSchema.optional(),
  invitePermission: spacePermissionSchema.optional(),
});

export type UpdateSpaceFormValues = z.infer<typeof updateSpaceSchema>;
