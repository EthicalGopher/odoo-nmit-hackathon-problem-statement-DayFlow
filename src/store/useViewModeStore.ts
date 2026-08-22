import { create } from 'zustand';

export type ViewMode = 'canvas' | 'traditional';

interface ViewModeState {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  toggleMode: () => void;
}

export const useViewModeStore = create<ViewModeState>((set) => ({
  mode: (localStorage.getItem('dayflow_view_mode') as ViewMode) || 'canvas',
  setMode: (mode: ViewMode) => {
    localStorage.setItem('dayflow_view_mode', mode);
    set({ mode });
  },
  toggleMode: () => {
    set((state) => {
      const next = state.mode === 'canvas' ? 'traditional' : 'canvas';
      localStorage.setItem('dayflow_view_mode', next);
      return { mode: next };
    });
  },
}));
