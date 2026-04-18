import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { fmtTime } from '../data/utils';

interface WorkoutTimerContextType {
  isActive: boolean;
  elapsed: string;
  startWorkout: () => void;
  stopWorkout: () => void;
}

const WorkoutTimerContext = createContext<WorkoutTimerContextType>({
  isActive: false,
  elapsed: '00:00',
  startWorkout: () => {},
  stopWorkout: () => {},
});

export const WorkoutTimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState('00:00');
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsed(fmtTime(secs));
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive]);

  const startWorkout = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsed('00:00');
    setIsActive(true);
  }, []);

  const stopWorkout = useCallback(() => {
    setIsActive(false);
    setElapsed('00:00');
    startTimeRef.current = null;
  }, []);

  return (
    <WorkoutTimerContext.Provider value={{ isActive, elapsed, startWorkout, stopWorkout }}>
      {children}
    </WorkoutTimerContext.Provider>
  );
};

export const useWorkoutTimer = () => useContext(WorkoutTimerContext);
