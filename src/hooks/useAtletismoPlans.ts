import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AtletismoPlan } from '../data/atletismoTypes';
import { nombrePlanPorDefecto, nombreUnico } from '../utils/atletismoPlanGenerator';

const KEY = 'fitapp_atletismo_plans_v1';

/** Planes guardados antes de agregar `nombre` no lo tienen — se completa acá, una sola vez. */
function migrarNombres(plans: AtletismoPlan[]): { plans: AtletismoPlan[]; cambio: boolean } {
  let cambio = false;
  const nombres: string[] = plans.filter(p => p.nombre).map(p => p.nombre);
  const migrados = plans.map(p => {
    if (p.nombre) return p;
    cambio = true;
    const nombre = nombreUnico(nombrePlanPorDefecto(p.inputs), nombres);
    nombres.push(nombre);
    return { ...p, nombre };
  });
  return { plans: migrados, cambio };
}

export function useAtletismoPlans() {
  const [plans, setPlans] = useState<AtletismoPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try {
          const { plans: migrados, cambio } = migrarNombres(JSON.parse(raw));
          setPlans(migrados);
          if (cambio) AsyncStorage.setItem(KEY, JSON.stringify(migrados));
        }
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
