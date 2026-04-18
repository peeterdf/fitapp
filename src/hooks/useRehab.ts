import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RehabBloque } from '../data/types';
import { REHAB_DATA } from '../data/data';

const KEY = 'fitapp_rehab_v1';

export function useRehab() {
  const [bloques, setBloques] = useState<RehabBloque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try { setBloques(JSON.parse(raw)); }
        catch { setBloques(REHAB_DATA); }
      } else {
        setBloques(REHAB_DATA);
        AsyncStorage.setItem(KEY, JSON.stringify(REHAB_DATA));
      }
      setLoading(false);
    });
  }, []);

  const addBloque = useCallback((b: RehabBloque) => {
    setBloques(prev => {
      const next = [...prev, b];
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateBloque = useCallback((idx: number, b: RehabBloque) => {
    setBloques(prev => {
      const next = [...prev];
      next[idx] = b;
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteBloque = useCallback((idx: number) => {
    setBloques(prev => {
      const next = prev.filter((_, i) => i !== idx);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const save = useCallback((bs: RehabBloque[]) => {
    setBloques(bs);
    AsyncStorage.setItem(KEY, JSON.stringify(bs));
  }, []);

  return { bloques, loading, addBloque, updateBloque, deleteBloque, save };
}
