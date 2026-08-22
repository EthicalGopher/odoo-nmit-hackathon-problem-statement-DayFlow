import React, { createContext, useContext, useState } from 'react';

export type ExperienceMode = 'canvas' | 'traditional';

interface ViewModeContextType {
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
  toggleMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ExperienceMode>('canvas');

  const setMode = (newMode: ExperienceMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState(prev => (prev === 'canvas' ? 'traditional' : 'canvas'));
  };

  return (
    <ViewModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};
