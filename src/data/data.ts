import { Exercise, Routine, RoutineExercise, RehabBloque } from './types';

export const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: 1, name: 'Press Banca',
    desc: 'Acostado en banco, agarre ligeramente más ancho que los hombros. Bajar la barra controlando hasta el pecho, mantener codos a 45°. Empujar de forma explosiva.',
    sets: 4, reps: '8', weight: '80', rest: 90,
    muscle: 'Pecho', equip: 'Barra olímpica', diff: 'Intermedio',
    notes: 'No arquear excesivamente la espalda.',
    youtube: 'https://www.youtube.com/watch?v=rT7DgCr-3pg', imageUri: '',
    history: [
      { date: 'Lun 7 Abr', load: '80 kg × 8 reps' },
      { date: 'Vie 4 Abr', load: '77.5 kg × 8 reps' },
      { date: 'Lun 31 Mar', load: '77.5 kg × 7 reps' },
    ],
  },
  {
    id: 2, name: 'Remo con Barra',
    desc: 'Espalda recta, inclinado hacia adelante. Jalá la barra hacia el abdomen apretando la espalda. Bajá lento y controlado.',
    sets: 4, reps: '8', weight: '70', rest: 90,
    muscle: 'Espalda', equip: 'Barra olímpica', diff: 'Intermedio',
    notes: 'No redondear la espalda.',
    youtube: 'https://www.youtube.com/watch?v=G8l_8chR5BE', imageUri: '',
    history: [{ date: 'Lun 7 Abr', load: '70 kg × 8 reps' }],
  },
  {
    id: 3, name: 'Press Militar',
    desc: 'De pie o sentado, presionás la barra desde los hombros hacia arriba. Mantener core activo.',
    sets: 3, reps: '10', weight: '50', rest: 60,
    muscle: 'Hombros', equip: 'Barra olímpica', diff: 'Intermedio',
    notes: 'No hiperlordosis lumbar.',
    youtube: '', imageUri: '', history: [],
  },
  {
    id: 4, name: 'Curl Bíceps',
    desc: 'De pie, agarre supino. Curvás los codos llevando las mancuernas a los hombros. Bajá lento.',
    sets: 3, reps: '12', weight: '20', rest: 60,
    muscle: 'Brazos', equip: 'Mancuernas', diff: 'Principiante',
    notes: 'No usar impulso de cintura.',
    youtube: '', imageUri: '', history: [],
  },
  {
    id: 5, name: 'Sentadilla',
    desc: 'Pies al ancho de hombros, puntas ligeramente abiertas. Bajás flexionando rodillas hasta paralelo. Espalda recta.',
    sets: 5, reps: '5', weight: '100', rest: 180,
    muscle: 'Piernas', equip: 'Barra olímpica', diff: 'Avanzado',
    notes: 'Rodillas alineadas con los pies.',
    youtube: 'https://www.youtube.com/watch?v=ultWZbUMPL8', imageUri: '', history: [],
  },
  {
    id: 6, name: 'Plancha',
    desc: 'Posición de plancha sobre codos. Cuerpo recto como tabla. Apretás core, glúteos y cuadriceps.',
    sets: 3, reps: '45s', weight: '0', rest: 30,
    muscle: 'Core / Abdomen', equip: 'Peso corporal', diff: 'Principiante',
    notes: 'No dejar caer la cadera.',
    youtube: '', imageUri: '', history: [],
  },
];

export const ROUTINE_FUERZA_A: RoutineExercise[] = [
  { exId: 1, sets: 4, reps: '8', weight: '80 kg', rest: 90 },
  { exId: 2, sets: 4, reps: '8', weight: '70 kg', rest: 90 },
  { exId: 3, sets: 3, reps: '10', weight: '50 kg', rest: 60 },
  { exId: 4, sets: 3, reps: '12', weight: '20 kg', rest: 60 },
  { exId: 5, sets: 5, reps: '5', weight: '100 kg', rest: 180 },
  { exId: 6, sets: 3, reps: '45s', weight: '—', rest: 30 },
];

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 1, name: 'Fuerza A — Upper', desc: 'Upper body enfocado en fuerza. Progresión lineal cada sesión.',
    days: 'Lun / Jue', duration: '45-55', exercises: ROUTINE_FUERZA_A,
  },
];

export const REHAB_DATA: RehabBloque[] = [
  {
    name: 'Activación', vueltas: 1,
    exercises: [
      { name: 'Movilidad apertura de cadera', emoji: '🦵', reps: '×10 repeticiones', desc: 'Boca arriba. Abrís y cerrás las piernas lento y controlado. Sentís el estiramiento en la ingle.', equip: [], tip: '', youtube: '' },
      { name: 'Rotación de cadera', emoji: '🔄', reps: '×10 cada lado', desc: 'Acostado boca arriba. Hacés un círculo estirando la pierna. Controlá el movimiento.', equip: [], tip: 'Buscá "rotación cadera boca arriba" en YouTube', youtube: '' },
      { name: 'Aductor rocking', emoji: '🧘', reps: '×6 repeticiones', desc: 'Posición a cuatro patas. Deslizás una rodilla hacia afuera y hacés un balanceo lateral.', equip: [], tip: 'Buscá "aductor rocking" en YouTube', youtube: '' },
    ],
  },
  {
    name: 'Fuerza', vueltas: 3,
    exercises: [
      { name: 'Elevación de cadera con apriete', emoji: '🛋️', reps: '×8 repeticiones', desc: 'Boca arriba con almohadón entre rodillas. Apretás mientras levantás la cadera. 1 segundo arriba.', equip: ['Almohadón / pelota'], tip: '', youtube: '' },
      { name: 'Plancha copenhague corta', emoji: '🪑', reps: '2×10 seg por lado', desc: 'Pie apoyado en silla. Cuerpo recto como tabla lateral. 10 segundos por lado, 2 veces.', equip: ['Silla'], tip: 'Activá el core y no dejés caer la cadera', youtube: '' },
      { name: 'Sentadilla sumo', emoji: '🏋️', reps: '×8 repeticiones', desc: 'Pies bien abiertos, puntas afuera. Peso colgando en el medio. Bajás lento y controlado.', equip: ['Peso central'], tip: 'Rodillas siguen la dirección de las puntas', youtube: '' },
      { name: 'Saltos CMJ', emoji: '⬆️', reps: '×8 repeticiones', desc: 'Saltos continuos. Bajás rápido y explotás sin pausar. Usás el rebote elástico del músculo.', equip: [], tip: 'Aterrizás suave, rodillas ligeramente flexionadas', youtube: '' },
    ],
  },
  {
    name: 'Potencia', vueltas: 3,
    exercises: [
      { name: 'Banda roja — bajada lateral', emoji: '🔴', reps: '×6 cada lado', desc: 'Banda enganchada en pata de mesa. En tobillo. Bajás la pierna de costado como si patearas una pelota.', equip: ['Banda roja larga', 'Mesa / poste'], tip: 'Buscá "band hip abduction side" en YouTube', youtube: '' },
      { name: 'Estocada lateral con patín', emoji: '⛸️', reps: '×8 cada lado', desc: 'Un pie sobre hoja o toalla que resbale. Deslizás en estocada y volvés controlando el regreso.', equip: ['Hoja / toalla', 'Piso liso'], tip: 'La pierna que trabaja es la que no resbala', youtube: '' },
      { name: 'Skipping con banda negra + roja', emoji: '⚫', reps: '×40 cada pierna', desc: 'Ambas bandas enganchadas a la cintura. Pasás por dentro. Skipping rápido y explosivo.', equip: ['Banda negra', 'Banda roja', 'Punto fijo a altura cintura'], tip: 'Cuanto más rápido el skipping, mejor el estímulo', youtube: '' },
      { name: 'Saltos laterales sobre obstáculo', emoji: '🏃', reps: '×6 cada lado', desc: 'Objeto en el piso. Saltás lateralmente por encima. Ida y vuelta = 1 rep. Aterrizás suave.', equip: ['Objeto como obstáculo'], tip: 'Aterrizaje suave: absorbé el impacto con las rodillas', youtube: '' },
    ],
  },
];

export const MUSCLE_EMOJIS: Record<string, string> = {
  Pecho: '🏋️', Espalda: '🔙', Piernas: '🦵', Hombros: '🙌',
  Brazos: '💪', 'Core / Abdomen': '🧱', 'Full Body': '⚡',
};
