import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_C, LIGHT_C, ColorPalette } from '../data/theme';

const KEY = 'fitapp_theme_v1';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  C: ColorPalette;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  C: DARK_C,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => {
      if (v !== null) setIsDark(v !== 'light');
    });
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, C: isDark ? DARK_C : LIGHT_C }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useContext(ThemeContext).C;
