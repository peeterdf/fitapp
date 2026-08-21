import React, { createContext, useContext, ReactNode } from 'react';
import { useAtletismoPlans } from '../hooks/useAtletismoPlans';
import { AtletismoPlan } from '../data/atletismoTypes';

interface AtletismoContextType {
  plans: AtletismoPlan[];
  loading: boolean;
  addPlan: (p: AtletismoPlan) => void;
  updatePlan: (p: AtletismoPlan) => void;
  deletePlan: (id: number) => void;
}

const AtletismoContext = createContext<AtletismoContextType | undefined>(undefined);

export const AtletismoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const data = useAtletismoPlans();
  return <AtletismoContext.Provider value={data}>{children}</AtletismoContext.Provider>;
};

export const useAtletismoContext = () => {
  const c = useContext(AtletismoContext);
  if (!c) throw new Error('useAtletismoContext must be used within AtletismoProvider');
  return c;
};
