import { SPACE_KIND, THEME_PRESET, THEME_MODE } from '@/config/constants';
import type { SpaceKind, ThemePreset, ThemeMode } from '../types/space.types';

export interface SpaceKindWording {
  taskNoun: string;
  taskNounSingular: string;
  columns: {
    todo: string;
    inProgress: string;
    done: string;
  };
  memberNoun: string;
}

export interface SpaceKindConfig {
  kind: SpaceKind;
  label: string;
  tagline: string;
  defaultTheme: {
    preset: ThemePreset;
    mode: ThemeMode;
  };
  wording: SpaceKindWording;
}

export const SPACE_KIND_CONFIG: Record<SpaceKind, SpaceKindConfig> = {
  [SPACE_KIND.OUR_HOME]: {
    kind: SPACE_KIND.OUR_HOME,
    label: 'Our Home',
    tagline: 'For families and households sharing chores and daily routines',
    defaultTheme: {
      preset: THEME_PRESET.HEARTH,
      mode: THEME_MODE.LIGHT,
    },
    wording: {
      taskNoun: 'Chores',
      taskNounSingular: 'Chore',
      columns: {
        todo: 'To do',
        inProgress: 'Doing',
        done: 'Done',
      },
      memberNoun: 'Family',
    },
  },

  [SPACE_KIND.BUILDERS_CIRCLE]: {
    kind: SPACE_KIND.BUILDERS_CIRCLE,
    label: "Builders' Circle",
    tagline: 'For developer teams running sprints, tracking issues, and shipping code',
    defaultTheme: {
      preset: THEME_PRESET.NEON_GRID,
      mode: THEME_MODE.DARK,
    },
    wording: {
      taskNoun: 'Tickets',
      taskNounSingular: 'Ticket',
      columns: {
        todo: 'Backlog',
        inProgress: 'In progress',
        done: 'Shipped',
      },
      memberNoun: 'Sprint',
    },
  },

  [SPACE_KIND.STUDIO]: {
    kind: SPACE_KIND.STUDIO,
    label: 'The Studio',
    tagline: 'For creative agencies, studios, and professional client deliverables',
    defaultTheme: {
      preset: THEME_PRESET.IVORY_INK,
      mode: THEME_MODE.LIGHT,
    },
    wording: {
      taskNoun: 'Deliverables',
      taskNounSingular: 'Deliverable',
      columns: {
        todo: 'Planned',
        inProgress: 'Active',
        done: 'Delivered',
      },
      memberNoun: 'Team',
    },
  },

  [SPACE_KIND.MY_CORNER]: {
    kind: SPACE_KIND.MY_CORNER,
    label: 'My Corner',
    tagline: 'For personal tasks, habits, and private productivity',
    defaultTheme: {
      preset: THEME_PRESET.ORBIT,
      mode: THEME_MODE.DARK,
    },
    wording: {
      taskNoun: 'Tasks',
      taskNounSingular: 'Task',
      columns: {
        todo: 'To do',
        inProgress: 'Doing',
        done: 'Done',
      },
      memberNoun: 'Members',
    },
  },

  [SPACE_KIND.CUSTOM]: {
    kind: SPACE_KIND.CUSTOM,
    label: 'Custom',
    tagline: 'Create a tailored space with your own configuration',
    defaultTheme: {
      preset: THEME_PRESET.ORBIT,
      mode: THEME_MODE.DARK,
    },
    wording: {
      taskNoun: 'Tasks',
      taskNounSingular: 'Task',
      columns: {
        todo: 'To do',
        inProgress: 'In progress',
        done: 'Done',
      },
      memberNoun: 'Members',
    },
  },
};

export function getSpaceKindConfig(kind: SpaceKind): SpaceKindConfig {
  return SPACE_KIND_CONFIG[kind];
}
