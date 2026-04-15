import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '../data/types';
import { DEFAULT_EXERCISES } from '../data/data';

const KEY = 'fitapp_exercises_v2';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try { setExercises(JSON.parse(raw)); }
        catch { setExercises(DEFAULT_EXERCISES); }
      } else {
        setExercises(DEFAULT_EXERCISES);
        AsyncStorage.setItem(KEY, JSON.stringify(DEFAULT_EXERCISES));
      }
      setLoading(false);
    });
  }, []);

  const save = useCallback((exs: Exercise[]) => {
    setExercises(exs);
    AsyncStorage.setItem(KEY, JSON.stringify(exs));
  }, []);

  const addExercise = useCallback((ex: Exercise) => {
    setExercises(prev => {
      const next = [...prev, ex];
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateExercise = useCallback((ex: Exercise) => {
    setExercises(prev => {
      const next = prev.map(e => e.id === ex.id ? ex : e);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteExercise = useCallback((id: number) => {
    setExercises(prev => {
      const next = prev.filter(e => e.id !== id);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { exercises, loading, addExercise, updateExercise, deleteExercise, save };
}
