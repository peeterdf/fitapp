import React, { createContext, useContext, ReactNode } from 'react';
import { useRoutines } from '../hooks/useRoutines';
import { Routine } from '../data/types';

interface RoutinesContextType {
  routines: Routine[];
  loading: boolean;
  addRoutine: (r: Routine) => void;
  updateRoutine: (r: Routine) => void;
  deleteRoutine: (id: number) => void;
  save: (rs: Routine[]) => void;
}

const RoutinesContext = createContext<RoutinesContextType | undefined>(undefined);

export const RoutinesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const data = useRoutines();
  return <RoutinesContext.Provider value={data}>{children}</RoutinesContext.Provider>;
};

export const useRoutinesContext = () => {
  const c = useContext(RoutinesContext);
  if (!c) throw new Error('useRoutinesContext must be used within RoutinesProvider');
  return c;
};
