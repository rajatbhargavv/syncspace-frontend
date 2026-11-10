import { create } from 'zustand';

interface UiState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const SIDEBAR_STORAGE_KEY = 'syncspace-sidebar-collapsed';

function getInitialSidebarState(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: getInitialSidebarState(),
  toggleSidebar: () =>
    set((state) => {
      const collapsed = !state.isSidebarCollapsed;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
      return { isSidebarCollapsed: collapsed };
    }),
  setSidebarCollapsed: (collapsed) => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    set({ isSidebarCollapsed: collapsed });
  },
}));
