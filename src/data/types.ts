// ─── TYPES ───────────────────────────────────────────────
export interface HistoryEntry {
  date: string;
  load: string;
}

export interface Exercise {
  id: number;
  name: string;
  desc: string;
  sets: number;
  reps: string;
  weight: string;
  rest: number; // seconds
  muscle: MuscleGroup;
  equip: string;
  diff: 'Principiante' | 'Intermedio' | 'Avanzado';
  notes: string;
  youtube: string;
  imageUri: string;
  history: HistoryEntry[];
}

export type MuscleGroup =
  | 'Pecho'
  | 'Espalda'
  | 'Piernas'
  | 'Hombros'
  | 'Brazos'
  | 'Core / Abdomen'
  | 'Full Body';

export interface RoutineExercise {
  exId: number;
  sets: number;
  reps: string;
  weight: string;
  rest: number;
  isSuperset?: boolean; // if true, no rest before the next exercise (paired as A+B)
}

export interface Routine {
  id: number;
  name: string;
  desc: string;
  days: string;
  duration: string;
  exercises: RoutineExercise[];
}

export interface RehabExercise {
  name: string;
  emoji: string;
  reps: string;
  desc: string;
  equip: string[];
  tip: string;
  youtube: string;
}

export interface RehabBloque {
  name: string;
  vueltas: number;
  exercises: RehabExercise[];
}
