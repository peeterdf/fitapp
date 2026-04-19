import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_MODES, AppMode, DEFAULT_MODE_ID } from '../config/modes';

const KEY = 'fitapp_mode_v1';

interface AppModeContextType {
  mode: AppMode;
  setMode: (id: string) => void;
  modes: AppMode[];
}

const defaultMode = APP_MODES.find(m => m.id === DEFAULT_MODE_ID) ?? APP_MODES[0];

const AppModeContext = createContext<AppModeContextType>({
  mode: defaultMode,
  setMode: () => {},
  modes: APP_MODES,
});

export const AppModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modeId, setModeId] = useState(DEFAULT_MODE_ID);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => {
      if (v && APP_MODES.some(m => m.id === v)) setModeId(v);
    });
  }, []);

  const setMode = (id: string) => {
    if (!APP_MODES.some(m => m.id === id)) return;
    setModeId(id);
    AsyncStorage.setItem(KEY, id);
  };

  const mode = APP_MODES.find(m => m.id === modeId) ?? defaultMode;

  return (
    <AppModeContext.Provider value={{ mode, setMode, modes: APP_MODES }}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => useContext(AppModeContext);
