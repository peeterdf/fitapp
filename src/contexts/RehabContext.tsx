import React, { createContext, useContext, ReactNode } from 'react';
import { useRehab } from '../hooks/useRehab';
import { RehabBloque } from '../data/types';

interface RehabContextType {
  bloques: RehabBloque[];
  loading: boolean;
  addBloque: (b: RehabBloque) => void;
  updateBloque: (idx: number, b: RehabBloque) => void;
  deleteBloque: (idx: number) => void;
  save: (bs: RehabBloque[]) => void;
}

const RehabContext = createContext<RehabContextType | undefined>(undefined);

export const RehabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const data = useRehab();
  return <RehabContext.Provider value={data}>{children}</RehabContext.Provider>;
};

export const useRehabContext = () => {
  const c = useContext(RehabContext);
  if (!c) throw new Error('useRehabContext must be used within RehabProvider');
  return c;
};
