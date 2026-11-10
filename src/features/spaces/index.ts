// ── Space Types ──
export type {
  SpaceKind,
  ThemePreset,
  ThemeMode,
  SpaceVisibility,
  SpaceJoinPolicy,
  SpaceStatus,
  MemberRole,
  SpaceTheme,
  Space,
  SpaceSummary,
  PublicSpace,
  CreateSpaceInput,
  UpdateSpaceInput,
} from './types/space.types';

// ── Space Schemas ──
export {
  createSpaceSchema,
  updateSpaceSchema,
  spaceKindSchema,
  themePresetSchema,
  themeModeSchema,
  visibilitySchema,
  joinPolicySchema,
  spaceStatusSchema,
  spaceThemeSchema,
  type CreateSpaceFormValues,
  type UpdateSpaceFormValues,
} from './schemas/space.schema';

// ── Space API ──
export {
  getMySpaces,
  getSpaceById,
  getPublicSpace,
  createSpace,
  updateSpace,
  deactivateSpace,
} from './api/space.api';

// ── Space Query Hooks ──
export { useSpaces } from './hooks/useSpaces';
export { useSpace } from './hooks/useSpace';
export { usePublicSpace } from './hooks/usePublicSpace';
export { useCreateSpace } from './hooks/useCreateSpace';
export { useUpdateSpace, type UpdateSpaceVariables } from './hooks/useUpdateSpace';
export { useDeactivateSpace } from './hooks/useDeactivateSpace';
export { useSpaceTheme } from './hooks/useSpaceTheme';
export { useSpaceSocket } from './hooks/useSpaceSocket';

// ── Space Utils & Config ──
export {
  SPACE_KIND_CONFIG,
  getSpaceKindConfig,
  type SpaceKindConfig,
  type SpaceKindWording,
} from './utils/spaceKindConfig';

// ── Space Components ──
export { ThemeScope, type ThemeScopeProps } from './components/ThemeScope';
export { SpaceThemeDot, type SpaceThemeDotProps } from './components/SpaceThemeDot';
