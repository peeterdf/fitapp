import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routine } from '../data/types';
import { DEFAULT_ROUTINES } from '../data/data';

const KEY = 'fitapp_routines_v1';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try { setRoutines(JSON.parse(raw)); }
        catch { setRoutines(DEFAULT_ROUTINES); }
      } else {
        setRoutines(DEFAULT_ROUTINES);
        AsyncStorage.setItem(KEY, JSON.stringify(DEFAULT_ROUTINES));
      }
      setLoading(false);
    });
  }, []);

  const addRoutine = useCallback((r: Routine) => {
    setRoutines(prev => {
      const next = [...prev, r];
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateRoutine = useCallback((r: Routine) => {
    setRoutines(prev => {
      const next = prev.map(x => x.id === r.id ? r : x);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteRoutine = useCallback((id: number) => {
    setRoutines(prev => {
      const next = prev.filter(x => x.id !== id);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const save = useCallback((rs: Routine[]) => {
    setRoutines(rs);
    AsyncStorage.setItem(KEY, JSON.stringify(rs));
  }, []);

  return { routines, loading, addRoutine, updateRoutine, deleteRoutine, save };
}
