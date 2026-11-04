const THEME_PRESET_KEY = 'syncspace-theme-preset';
const THEME_MODE_KEY = 'syncspace-theme-mode';
const SIDEBAR_COLLAPSED_KEY = 'syncspace-sidebar-collapsed';

export const storage = {
  getThemePreset(): string | null {
    try {
      return localStorage.getItem(THEME_PRESET_KEY);
    } catch {
      return null;
    }
  },

  setThemePreset(preset: string): void {
    try {
      localStorage.setItem(THEME_PRESET_KEY, preset);
    } catch {
      /* storage unavailable */
    }
  },

  getThemeMode(): string | null {
    try {
      return localStorage.getItem(THEME_MODE_KEY);
    } catch {
      return null;
    }
  },

  setThemeMode(mode: string): void {
    try {
      localStorage.setItem(THEME_MODE_KEY, mode);
    } catch {
      /* storage unavailable */
    }
  },

  getSidebarCollapsed(): boolean {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setSidebarCollapsed(collapsed: boolean): void {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch {
      /* storage unavailable */
    }
  },
<<<<<<< HEAD
} as const;
=======
} as const;
>>>>>>> 7a42eac4da9d7d72067212ae06555f7d94377449
