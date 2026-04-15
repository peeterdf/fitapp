import React, { createContext, useContext, ReactNode } from 'react';
import { useExercises } from '../hooks/useExercises';
import { Exercise } from '../data/types';

interface ExercisesContextType {
  exercises: Exercise[];
  loading: boolean;
  addExercise: (ex: Exercise) => void;
  updateExercise: (ex: Exercise) => void;
  deleteExercise: (id: number) => void;
  save: (exs: Exercise[]) => void;
}

const ExercisesContext = createContext<ExercisesContextType | undefined>(undefined);

export const ExercisesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const exercisesData = useExercises();

  return (
    <ExercisesContext.Provider value={exercisesData}>
      {children}
    </ExercisesContext.Provider>
  );
};

export const useExercisesContext = () => {
  const context = useContext(ExercisesContext);
  if (!context) {
    throw new Error('useExercisesContext must be used within an ExercisesProvider');
  }
  return context;
};