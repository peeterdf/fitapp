import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AtletismoPlan } from '../data/atletismoTypes';

const KEY = 'fitapp_atletismo_plans_v1';

export function useAtletismoPlans() {
  const [plans, setPlans] = useState<AtletismoPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try { setPlans(JSON.parse(raw)); }
        catch { setPlans([]); }
      }
      setLoading(false);
    });
  }, []);

  const addPlan = useCallback((p: AtletismoPlan) => {
    setPlans(prev => {
      const next = [...prev, p];
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updatePlan = useCallback((p: AtletismoPlan) => {
    setPlans(prev => {
      const next = prev.map(x => x.id === p.id ? p : x);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deletePlan = useCallback((id: number) => {
    setPlans(prev => {
      const next = prev.filter(x => x.id !== id);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { plans, loading, addPlan, updatePlan, deletePlan };
}
