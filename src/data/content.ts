export type ContentCategory = 'Mentalidad' | 'Hábitos' | 'Movimiento' | 'Bienestar';

export interface ContentArticle {
  id: string;
  category: ContentCategory;
  emoji: string;
  title: string;
  body: string;
  tip?: string;
}

export const CONTENT_ARTICLES: ContentArticle[] = [
  {
    id: 'bienvenida',
    category: 'Mentalidad',
    emoji: '🎁',
    title: 'Moverse es un regalo',
    body: 'Este programa nace con una idea muy simple, pero poderosa: volver a disfrutar del movimiento, reconectando con el cuerpo desde un lugar más consciente, más humano y más libre.\n\nEl objetivo no es solo entrenar, sino entender cómo se siente moverse bien, cómo recuperar esa relación natural con tu cuerpo y cómo hacer del movimiento un hábito que te sostenga.\n\nNo te preocupes por tu nivel ni tu punto de partida: lo importante es que te comprometas con vos.',
    tip: 'No busques hacerlo perfecto: buscá sentir, escuchar y aprender de tu cuerpo.',
  },
  {
    id: 'sol',
    category: 'Hábitos',
    emoji: '☀️',
    title: 'Exposición al sol',
    body: 'Cada día que puedas, exponete de forma controlada al sol. No solo la cara, sino el torso y las piernas — grandes superficies del cuerpo.\n\n• Activa la vitamina D\n• Mejora el sistema inmune\n• Mejora el equilibrio hormonal\n• Reduce infecciones y procesos inflamatorios\n• Eleva dopamina y serotonina\n• Reduce ansiedad y estrés\n• Optimiza el metabolismo\n• Mejora la circulación y la presión\n• Protege la salud cardiovascular',
    tip: 'No hace falta que sea mucho tiempo. Con 10–15 minutos de exposición directa ya activás estos beneficios.',
  },
  {
    id: 'grounding',
    category: 'Hábitos',
    emoji: '🌱',
    title: 'Grounding — conexión con la tierra',
    body: 'Estar en contacto directo con la tierra: caminar descalzo por el pasto o hacer tareas de jardinería sin guantes.\n\n• Reduce la inflamación\n• Baja los niveles de cortisol (estrés)\n• Calma el sistema nervioso\n• Reduce la carga eléctrica del cuerpo\n• Aumenta la conexión con el entorno\n• Mejora la calidad del sueño\n• Reduce dolores musculares y articulares',
    tip: 'Empezá con 5 minutos descalzo en el pasto. Es simple y gratuito.',
  },
  {
    id: 'atardecer',
    category: 'Hábitos',
    emoji: '🌅',
    title: 'Luz del atardecer',
    body: 'Cada vez que puedas, mirá la luz del atardecer sin lentes de sol, sin el teléfono en la mano, respirando tranquilo durante unos 10–15 minutos.\n\n• Regula tu reloj biológico\n• Manda señal al cerebro de que el día está terminando\n• Ayuda a que el cuerpo se prepare para descansar\n• Facilita conciliar el sueño\n• Calma el sistema nervioso\n• Baja el estado de alarma constante\n• Ayuda a soltar el ruido mental del día\n• Reduce estrés y ansiedad',
    tip: 'Este momento puede ser tu ritual de cierre del día. Respirá tranquilo y disfrutalo.',
  },
  {
    id: 'iluminacion',
    category: 'Hábitos',
    emoji: '🕯️',
    title: 'Iluminación nocturna',
    body: 'Cada noche, empezá a usar luces más cálidas dentro de casa. Pueden ser velas o luces que simulen el fuego (rojas, naranjas, amarillas). Poner música relajante también ayuda.\n\n• Evita la inhibición de melatonina causada por luz blanca/azul\n• Facilita la transición natural hacia el descanso\n• Aumenta la producción natural de melatonina\n• Favorece un sueño más profundo y continuo\n• Activa el sistema parasimpático (relajación)\n• Reduce la sensación de "cabeza acelerada"\n• Baja los niveles de cortisol nocturno\n• Facilita la relajación neurosensorial',
    tip: 'Combiná esto con el punto del atardecer: es la continuación natural de la señal que ya le mandaste a tu cerebro.',
  },
  {
    id: 'bases-movimiento',
    category: 'Movimiento',
    emoji: '🧠',
    title: 'Bases del movimiento',
    body: 'Antes de cualquier entrenamiento, hay conceptos fundamentales que vale la pena integrar:\n\n• El cuerpo humano está diseñado para moverse, no para estar estático\n• Cada movimiento tiene un patrón: empuje, tirón, bisagra, sentadilla, rotación\n• La calidad siempre va antes que la cantidad\n• El dolor es información — no lo ignorés\n• La respiración es parte del movimiento, no algo aparte\n• La consistencia supera a la intensidad',
    tip: 'Practicá, comprobá e integrá los movimientos a tu cuerpo. No copies, sentí.',
  },
  {
    id: 'suelo-pelvico',
    category: 'Bienestar',
    emoji: '🫀',
    title: 'Suelo pélvico',
    body: 'Todos tenemos suelo pélvico — no es solo información para embarazadas. Es un grupo muscular que forma el piso de la pelvis y sostiene órganos clave.\n\n¿Por qué importa?\n• Da soporte a vejiga, intestinos y útero/próstata\n• Es fundamental para la continencia\n• Influye en la postura y el dolor lumbar\n• Participa en cada respiración y en cada esfuerzo físico\n\nCómo cuidarlo:\n• Evitá la apnea durante el esfuerzo físico (exhalar al hacer fuerza)\n• No aguantes la orina innecesariamente\n• Hacé ejercicios de activación consciente (Kegel con técnica correcta)',
    tip: 'Es nuestra responsabilidad cuidarlo. Hablá con un profesional si notás molestias.',
  },
  {
    id: 'mentalidad-proceso',
    category: 'Mentalidad',
    emoji: '🔁',
    title: 'El proceso, no el resultado',
    body: 'Uno de los mayores obstáculos del movimiento es la expectativa de resultados inmediatos. El cuerpo humano cambia lento — pero de forma consistente y duradera cuando lo trabajás bien.\n\nAlgunas ideas para sostener el proceso:\n\n• Celebrá los pequeños logros: una vuelta más, un kilo más, una sesión más\n• No te compares con otros — comparate con vos de la semana pasada\n• Un día malo no arruina el proceso, abandonar sí lo hace\n• Descansár es parte del entrenamiento, no una señal de debilidad\n• La motivación va y viene — el hábito se queda',
    tip: '"Buscá sentir, escuchar y aprender de tu cuerpo." — Profe Tincho',
  },
];

export const CONTENT_CATEGORIES: ContentCategory[] = ['Mentalidad', 'Hábitos', 'Movimiento', 'Bienestar'];

export const CATEGORY_COLORS: Record<ContentCategory, string> = {
  'Mentalidad': '#6abf6a',
  'Hábitos':    '#a8d8a8',
  'Movimiento': '#4a9a4a',
  'Bienestar':  '#8fc88f',
};
