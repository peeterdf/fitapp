import { Exercise, Routine, RoutineExercise, RehabBloque } from './types';

export interface RoutineTemplate {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  days: string;
  duration: string;
  exercises: RoutineExercise[];
}

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
    youtube: 'https://www.youtube.com/watch?v=B-aVuyhvLHU', imageUri: '',
    history: [],
  },
  {
    id: 4, name: 'Curl Bíceps',
    desc: 'De pie, agarre supino. Curvás los codos llevando las mancuernas a los hombros. Bajá lento.',
    sets: 3, reps: '12', weight: '20', rest: 60,
    muscle: 'Brazos', equip: 'Mancuernas', diff: 'Principiante',
    notes: 'No usar impulso de cintura.',
    youtube: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', imageUri: '', history: [],
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
    youtube: 'https://www.youtube.com/watch?v=ASdvN_XEl_c', imageUri: '', history: [],
  },
  // Más ejercicios para Pecho
  {
    id: 7, name: 'Press de Banca con Mancuernas',
    desc: 'Acostado en banco, mancuernas en manos. Bajar controlando hasta el pecho, empujar explosivamente.',
    sets: 4, reps: '10', weight: '25', rest: 90,
    muscle: 'Pecho', equip: 'Mancuernas', diff: 'Intermedio',
    notes: 'Mantener codos a 45°.',
    youtube: 'https://www.youtube.com/watch?v=VmB1G1K7v94', imageUri: '', history: [],
  },
  {
    id: 8, name: 'Aperturas con Mancuernas',
    desc: 'Acostado, mancuernas arriba. Abrir brazos lateralmente hasta paralelo al suelo, volver juntando.',
    sets: 3, reps: '12', weight: '15', rest: 60,
    muscle: 'Pecho', equip: 'Mancuernas', diff: 'Principiante',
    notes: 'No bajar demasiado para evitar tensión en hombros.',
    youtube: 'https://www.youtube.com/watch?v=eozdVDA78K0', imageUri: '', history: [],
  },
  {
    id: 9, name: 'Press Inclinado con Barra',
    desc: 'Banco inclinado, barra desde pecho hacia arriba. Enfocado en parte superior del pecho.',
    sets: 4, reps: '8', weight: '60', rest: 90,
    muscle: 'Pecho', equip: 'Barra olímpica', diff: 'Intermedio',
    notes: 'Mantener espalda apoyada.',
    youtube: 'https://www.youtube.com/watch?v=8iPEnn-ltC8', imageUri: '', history: [],
  },
  {
    id: 10, name: 'Fondos en Paralelas',
    desc: 'En paralelas, bajar cuerpo flexionando codos, empujar hacia arriba.',
    sets: 3, reps: '10', weight: '0', rest: 60,
    muscle: 'Pecho', equip: 'Paralelas', diff: 'Avanzado',
    notes: 'Mantener cuerpo recto.',
    youtube: 'https://www.youtube.com/watch?v=6kALZikXxLc', imageUri: '', history: [],
  },
  {
    id: 11, name: 'Cruces en Polea',
    desc: 'Poleas altas, cruzar brazos frente al cuerpo, volver lentamente.',
    sets: 3, reps: '12', weight: '30', rest: 60,
    muscle: 'Pecho', equip: 'Poleas', diff: 'Intermedio',
    notes: 'Enfocado en contracción.',
    youtube: 'https://www.youtube.com/watch?v=Iwe6AmxVf7o', imageUri: '', history: [],
  },
  // Más ejercicios para Espalda
  {
    id: 12, name: 'Dominadas',
    desc: 'Colgado de barra, tirar hacia arriba hasta que barbilla pase la barra.',
    sets: 3, reps: '8', weight: '0', rest: 90,
    muscle: 'Espalda', equip: 'Barra de dominadas', diff: 'Avanzado',
    notes: 'Usar asistencia si necesario.',
    youtube: 'https://www.youtube.com/watch?v=eGo4IYlbE5g', imageUri: '', history: [],
  },
  {
    id: 13, name: 'Jalones en Polea',
    desc: 'Sentado en máquina, jalar barra hacia pecho, espalda recta.',
    sets: 4, reps: '10', weight: '50', rest: 90,
    muscle: 'Espalda', equip: 'Máquina de poleas', diff: 'Intermedio',
    notes: 'Apretar escápulas.',
    youtube: 'https://www.youtube.com/watch?v=CAwf7n6Luuc', imageUri: '', history: [],
  },
  {
    id: 14, name: 'Remo con Mancuerna',
    desc: 'Inclinado, mancuerna en una mano, jalar hacia cadera.',
    sets: 3, reps: '12', weight: '25', rest: 60,
    muscle: 'Espalda', equip: 'Mancuerna', diff: 'Principiante',
    notes: 'Mantener espalda plana.',
    youtube: 'https://www.youtube.com/watch?v=pYcpY20QaE8', imageUri: '', history: [],
  },
  {
    id: 15, name: 'Peso Muerto Rumano',
    desc: 'De pie, barra en manos, bajar doblando caderas, mantener piernas casi rectas.',
    sets: 4, reps: '8', weight: '70', rest: 90,
    muscle: 'Espalda', equip: 'Barra olímpica', diff: 'Intermedio',
    notes: 'Sentir en isquiotibiales.',
    youtube: 'https://www.youtube.com/watch?v=2shDmPcAw5o', imageUri: '', history: [],
  },
  {
    id: 16, name: 'Face Pulls',
    desc: 'Poleas altas, jalar hacia cara, codos altos.',
    sets: 3, reps: '15', weight: '20', rest: 60,
    muscle: 'Espalda', equip: 'Poleas', diff: 'Principiante',
    notes: 'Enfocado en hombros posteriores.',
    youtube: 'https://www.youtube.com/watch?v=rep-qVOkqgk', imageUri: '', history: [],
  },
  // Más ejercicios para Piernas
  {
    id: 17, name: 'Peso Muerto Convencional',
    desc: 'De pie, barra en suelo, levantar estirando caderas y rodillas.',
    sets: 5, reps: '5', weight: '100', rest: 180,
    muscle: 'Piernas', equip: 'Barra olímpica', diff: 'Avanzado',
    notes: 'Mantener barra cerca del cuerpo.',
    youtube: 'https://www.youtube.com/watch?v=ytGaGIn3SjE', imageUri: '', history: [],
  },
  {
    id: 18, name: 'Extensiones de Cuádriceps',
    desc: 'Sentado en máquina, extender piernas contra resistencia.',
    sets: 3, reps: '12', weight: '40', rest: 60,
    muscle: 'Piernas', equip: 'Máquina', diff: 'Principiante',
    notes: 'No bloquear rodillas.',
    youtube: 'https://www.youtube.com/watch?v=GW0RFZ2KdY4', imageUri: '', history: [],
  },
  {
    id: 19, name: 'Curl de Piernas',
    desc: 'Acostado boca abajo, flexionar rodillas contra resistencia.',
    sets: 3, reps: '12', weight: '40', rest: 60,
    muscle: 'Piernas', equip: 'Máquina', diff: 'Principiante',
    notes: 'Controlar el movimiento.',
    youtube: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs', imageUri: '', history: [],
  },
  {
    id: 20, name: 'Prensa de Piernas',
    desc: 'Sentado, empujar plataforma con pies.',
    sets: 4, reps: '10', weight: '100', rest: 90,
    muscle: 'Piernas', equip: 'Máquina de prensa', diff: 'Intermedio',
    notes: 'Pies al ancho de hombros.',
    youtube: 'https://www.youtube.com/watch?v=gwLzBJYoWlI', imageUri: '', history: [],
  },
  {
    id: 21, name: 'Elevaciones de Talones',
    desc: 'De pie, subir sobre puntas de pies.',
    sets: 3, reps: '15', weight: '0', rest: 60,
    muscle: 'Piernas', equip: 'Peso corporal', diff: 'Principiante',
    notes: 'Enfocado en gemelos.',
    youtube: 'https://www.youtube.com/watch?v=gwLzBJYoWlI', imageUri: '', history: [],
  },
  // Más ejercicios para Hombros
  {
    id: 22, name: 'Elevaciones Laterales con Mancuernas',
    desc: 'De pie, elevar mancuernas lateralmente hasta paralelo al suelo.',
    sets: 3, reps: '12', weight: '10', rest: 60,
    muscle: 'Hombros', equip: 'Mancuernas', diff: 'Principiante',
    notes: 'Codos ligeramente flexionados.',
    youtube: 'https://www.youtube.com/watch?v=3VcKaXpzqRo', imageUri: '', history: [],
  },
  {
    id: 23, name: 'Elevaciones Frontales',
    desc: 'De pie, elevar mancuernas hacia adelante.',
    sets: 3, reps: '12', weight: '10', rest: 60,
    muscle: 'Hombros', equip: 'Mancuernas', diff: 'Principiante',
    notes: 'Mantener core activo.',
    youtube: 'https://www.youtube.com/watch?v=-t7fuZ0KhDA', imageUri: '', history: [],
  },
  {
    id: 24, name: 'Press Arnold',
    desc: 'Sentado, girar mancuernas desde supino a pronación.',
    sets: 4, reps: '8', weight: '20', rest: 90,
    muscle: 'Hombros', equip: 'Mancuernas', diff: 'Avanzado',
    notes: 'Movimiento completo.',
    youtube: 'https://www.youtube.com/watch?v=6Z15_WdXmVw', imageUri: '', history: [],
  },
  {
    id: 25, name: 'Encogimientos de Hombros',
    desc: 'De pie, encoger hombros hacia arriba.',
    sets: 3, reps: '15', weight: '30', rest: 60,
    muscle: 'Hombros', equip: 'Mancuernas', diff: 'Intermedio',
    notes: 'Enfocado en trapecios.',
    youtube: 'https://www.youtube.com/watch?v=cJRVVxmytaM', imageUri: '', history: [],
  },
  {
    id: 26, name: 'Remo al Mentón',
    desc: 'De pie, jalar barra hacia mentón con codos altos.',
    sets: 3, reps: '10', weight: '40', rest: 60,
    muscle: 'Hombros', equip: 'Barra', diff: 'Intermedio',
    notes: 'Mantener barra cerca del cuerpo.',
    youtube: 'https://www.youtube.com/watch?v=7V9JnO6pLHA', imageUri: '', history: [],
  },
  // Más ejercicios para Brazos
  {
    id: 27, name: 'Extensiones de Tríceps en Polea',
    desc: 'De pie, polea alta, extender brazos hacia abajo.',
    sets: 3, reps: '12', weight: '30', rest: 60,
    muscle: 'Brazos', equip: 'Poleas', diff: 'Principiante',
    notes: 'Codos fijos.',
    youtube: 'https://www.youtube.com/watch?v=2-LAMcpzODU', imageUri: '', history: [],
  },
  {
    id: 28, name: 'Curl Martillo',
    desc: 'De pie, mancuernas con agarre neutro.',
    sets: 3, reps: '12', weight: '15', rest: 60,
    muscle: 'Brazos', equip: 'Mancuernas', diff: 'Principiante',
    notes: 'Trabaja bíceps y antebrazos.',
    youtube: 'https://www.youtube.com/watch?v=zC3nLlEvin4', imageUri: '', history: [],
  },
  {
    id: 29, name: 'Fondos de Tríceps',
    desc: 'En banco, bajar y subir con brazos.',
    sets: 3, reps: '10', weight: '0', rest: 60,
    muscle: 'Brazos', equip: 'Banco', diff: 'Intermedio',
    notes: 'Mantener codos hacia atrás.',
    youtube: 'https://www.youtube.com/watch?v=6kALZikXxLc', imageUri: '', history: [],
  },
  {
    id: 30, name: 'Curl Concentrado',
    desc: 'Sentado, curl con una mancuerna.',
    sets: 3, reps: '12', weight: '15', rest: 60,
    muscle: 'Brazos', equip: 'Mancuerna', diff: 'Principiante',
    notes: 'Enfocado en contracción.',
    youtube: 'https://www.youtube.com/watch?v=0AUGkch3tzc', imageUri: '', history: [],
  },
  {
    id: 31, name: 'Extensiones por Encima de la Cabeza',
    desc: 'De pie, mancuerna sobre cabeza, extender hacia abajo.',
    sets: 3, reps: '12', weight: '20', rest: 60,
    muscle: 'Brazos', equip: 'Mancuerna', diff: 'Intermedio',
    notes: 'Mantener codos cerca de cabeza.',
    youtube: 'https://www.youtube.com/watch?v=YbX7Wd8j_vQ', imageUri: '', history: [],
  },
  // Más ejercicios para Core / Abdomen
  {
    id: 32, name: 'Crunches',
    desc: 'Acostado, levantar hombros del suelo.',
    sets: 3, reps: '15', weight: '0', rest: 30,
    muscle: 'Core / Abdomen', equip: 'Peso corporal', diff: 'Principiante',
    notes: 'No tirar del cuello.',
    youtube: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU', imageUri: '', history: [],
  },
  {
    id: 33, name: 'Russian Twists',
    desc: 'Sentado, girar torso de lado a lado.',
    sets: 3, reps: '20', weight: '10', rest: 30,
    muscle: 'Core / Abdomen', equip: 'Mancuerna', diff: 'Principiante',
    notes: 'Mantener pies en suelo.',
    youtube: 'https://www.youtube.com/watch?v=wkD8rjkodUI', imageUri: '', history: [],
  },
  {
    id: 34, name: 'Elevaciones de Piernas',
    desc: 'Acostado, levantar piernas rectas.',
    sets: 3, reps: '12', weight: '0', rest: 30,
    muscle: 'Core / Abdomen', equip: 'Peso corporal', diff: 'Intermedio',
    notes: 'Mantener espalda en suelo.',
    youtube: 'https://www.youtube.com/watch?v=JB2oyawG9KI', imageUri: '', history: [],
  },
  {
    id: 35, name: 'Plancha Lateral',
    desc: 'De lado, cuerpo recto apoyado en codo.',
    sets: 3, reps: '30s', weight: '0', rest: 30,
    muscle: 'Core / Abdomen', equip: 'Peso corporal', diff: 'Principiante',
    notes: 'Cada lado.',
    youtube: 'https://www.youtube.com/watch?v=9c2pNd1gTkw', imageUri: '', history: [],
  },
  {
    id: 36, name: 'Mountain Climbers',
    desc: 'En plancha, alternar rodillas hacia pecho.',
    sets: 3, reps: '20', weight: '0', rest: 30,
    muscle: 'Core / Abdomen', equip: 'Peso corporal', diff: 'Intermedio',
    notes: 'Movimiento rápido.',
    youtube: 'https://www.youtube.com/watch?v=nmwgirgXLYM', imageUri: '', history: [],
  },
  // Más ejercicios para Full Body
  {
    id: 37, name: 'Burpees',
    desc: 'De pie, bajar a plancha, saltar pies, saltar arriba.',
    sets: 3, reps: '10', weight: '0', rest: 60,
    muscle: 'Full Body', equip: 'Peso corporal', diff: 'Intermedio',
    notes: 'Movimiento completo.',
    youtube: 'https://www.youtube.com/watch?v=auBLPXO8Fww', imageUri: '', history: [],
  },
  {
    id: 38, name: 'Snatches',
    desc: 'Levantar barra desde suelo a overhead en un movimiento.',
    sets: 4, reps: '5', weight: '50', rest: 120,
    muscle: 'Full Body', equip: 'Barra olímpica', diff: 'Avanzado',
    notes: 'Técnica precisa.',
    youtube: 'https://www.youtube.com/watch?v=9xQp2sldyts', imageUri: '', history: [],
  },
  {
    id: 39, name: 'Clean and Jerk',
    desc: 'Levantar barra a hombros, luego overhead.',
    sets: 4, reps: '5', weight: '60', rest: 120,
    muscle: 'Full Body', equip: 'Barra olímpica', diff: 'Avanzado',
    notes: 'Dos fases.',
    youtube: 'https://www.youtube.com/watch?v=9xQp2sldyts', imageUri: '', history: [],
  },
  {
    id: 40, name: 'Thrusters',
    desc: 'Sentadilla con press overhead.',
    sets: 3, reps: '10', weight: '30', rest: 90,
    muscle: 'Full Body', equip: 'Mancuernas', diff: 'Intermedio',
    notes: 'Movimiento continuo.',
    youtube: 'https://www.youtube.com/watch?v=L219ltL15zk', imageUri: '', history: [],
  },
  {
    id: 41, name: 'Kettlebell Swings',
    desc: 'Balancear kettlebell entre piernas y overhead.',
    sets: 3, reps: '15', weight: '20', rest: 60,
    muscle: 'Full Body', equip: 'Kettlebell', diff: 'Intermedio',
    notes: 'Impulso de caderas.',
    youtube: 'https://www.youtube.com/watch?v=YSxH6s0l4wA', imageUri: '', history: [],
  },
  {
    id: 42, name: 'Push Press',
    desc: 'Press con impulso de piernas.',
    sets: 3, reps: '8', weight: '40', rest: 90,
    muscle: 'Full Body', equip: 'Barra', diff: 'Intermedio',
    notes: 'Ayuda para levantar más.',
    youtube: 'https://www.youtube.com/watch?v=2yjwXTZQDDI', imageUri: '', history: [],
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

// ─── ROUTINE TEMPLATES ───────────────────────────────────────────────────────
// Exercise IDs reference DEFAULT_EXERCISES (1–6). When applying a template,
// the screen filters out IDs not present in the user's exercise list.
export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'ppl-push',
    name: 'PPL — Push',
    emoji: '💪',
    desc: 'Día de empuje: pecho y hombros. Progresión lineal por sesión.',
    days: 'Lun / Jue',
    duration: '45',
    exercises: [
      { exId: 1, sets: 4, reps: '8', weight: '80 kg', rest: 90 },
      { exId: 3, sets: 3, reps: '10', weight: '50 kg', rest: 60 },
    ],
  },
  {
    id: 'ppl-pull',
    name: 'PPL — Pull',
    emoji: '🔙',
    desc: 'Día de jalón: espalda y bíceps. Foco en retracción escapular.',
    days: 'Mar / Vie',
    duration: '40',
    exercises: [
      { exId: 2, sets: 4, reps: '8', weight: '70 kg', rest: 90 },
      { exId: 4, sets: 3, reps: '12', weight: '20 kg', rest: 60 },
    ],
  },
  {
    id: 'ppl-legs',
    name: 'PPL — Legs',
    emoji: '🦵',
    desc: 'Día de piernas y core. El más importante del PPL.',
    days: 'Mié / Sáb',
    duration: '50',
    exercises: [
      { exId: 5, sets: 5, reps: '5', weight: '100 kg', rest: 180 },
      { exId: 6, sets: 3, reps: '45s', weight: '—', rest: 30 },
    ],
  },
  {
    id: '5x5-a',
    name: '5×5 — Día A',
    emoji: '⚡',
    desc: 'Stronglifts 5×5. Tres ejercicios compuestos, máxima fuerza.',
    days: 'Lun / Mié / Vie',
    duration: '45',
    exercises: [
      { exId: 5, sets: 5, reps: '5', weight: '100 kg', rest: 180 },
      { exId: 1, sets: 5, reps: '5', weight: '80 kg', rest: 180 },
      { exId: 2, sets: 5, reps: '5', weight: '70 kg', rest: 180 },
    ],
  },
  {
    id: '5x5-b',
    name: '5×5 — Día B',
    emoji: '⚡',
    desc: 'Stronglifts 5×5 variante. Alternas con Día A cada sesión.',
    days: 'Lun / Mié / Vie',
    duration: '45',
    exercises: [
      { exId: 5, sets: 5, reps: '5', weight: '100 kg', rest: 180 },
      { exId: 3, sets: 5, reps: '5', weight: '50 kg', rest: 180 },
      { exId: 4, sets: 3, reps: '8', weight: '20 kg', rest: 60 },
    ],
  },
  {
    id: 'upper',
    name: 'Upper/Lower — Upper',
    emoji: '🙌',
    desc: 'Tren superior completo: pecho, espalda, hombros y brazos.',
    days: 'Lun / Jue',
    duration: '55',
    exercises: [
      { exId: 1, sets: 4, reps: '8', weight: '80 kg', rest: 90 },
      { exId: 2, sets: 4, reps: '8', weight: '70 kg', rest: 90 },
      { exId: 3, sets: 3, reps: '10', weight: '50 kg', rest: 60 },
      { exId: 4, sets: 3, reps: '12', weight: '20 kg', rest: 60 },
    ],
  },
  {
    id: 'lower',
    name: 'Upper/Lower — Lower',
    emoji: '🦵',
    desc: 'Tren inferior: cuadriceps, core y estabilidad.',
    days: 'Mar / Vie',
    duration: '40',
    exercises: [
      { exId: 5, sets: 5, reps: '5', weight: '100 kg', rest: 180 },
      { exId: 6, sets: 3, reps: '45s', weight: '—', rest: 30 },
    ],
  },
];

export const MUSCLE_EMOJIS: Record<string, string> = {
  Pecho: '🏋️', Espalda: '🔙', Piernas: '🦵', Hombros: '🙌',
  Brazos: '💪', 'Core / Abdomen': '🧱', 'Full Body': '⚡',
};
