---
name: atletismo-plan
description: Usar siempre que se cree, genere, ajuste, edite o revise un plan de entrenamiento de atletismo/running (fitapp, sección Atletismo) — pedidos como "armame un plan", "ajustá el plan para la carrera", "qué corro esta semana", "mové esta sesión", o cuando el usuario cuenta qué corrió realmente y hay que reacomodar lo que queda. Consultar esta skill INCLUSO para un cambio de una sola sesión o un solo día — el riesgo que resuelve es exactamente el de tratar un ajuste puntual como si fuera el criterio general del plan.
---

# Armar y ajustar planes de atletismo

## El problema que esto evita

Cuando se ajusta un plan conversacionalmente, sesión por sesión, es fácil sobre-indexar en lo último que dijo el usuario: si menciona cuestas, aparecen cuestas todas las semanas; si cuenta que hizo un fartlek, el fartlek se repite sin criterio. Eso no es periodización, es reaccionar al último mensaje. Un plan de carrera tiene que sostener una lógica de semanas completas (qué estímulo mete cada semana y por qué, cuánto se separan los esfuerzos duros), y un pedido puntual del usuario es un dato que se acomoda *dentro* de esa lógica, no un reemplazo de la lógica.

**Regla de oro: antes de tocar una sesión puntual, reconstruí el esqueleto completo de las semanas que quedan (fase por semana, qué slot ocupa cada tipo de sesión) y recién ahí encajá el pedido específico en un solo lugar de ese esqueleto.** Si el pedido no encaja sin romper las reglas de abajo (por ejemplo, dos sesiones duras muy pegadas), decílo y proponé la mejor ubicación en vez de forzarlo donde el usuario lo puso.

## Fuente de verdad: el algoritmo ya está en el repo

Este proyecto (`peeterdf/fitapp`) ya tiene codificada la periodización en:

- `src/utils/atletismoPlanGenerator.ts` — `calcularFases` (cuánto dura cada fase según las semanas totales) y `construirSesionesSemana` (qué tipo de sesión va en cada slot según fase y objetivo).
- `src/utils/atletismoSessionBuilders.ts` — constructores de cada tipo de sesión (`cuerpoFondo`, `cuerpoSeries`, `cuerpoFartlek`, `cuerpoTempo`, `cuerpoCuestas`, `cuerpoTiradaLargaEspecifica`) y `crearSesion`/`reconstruirSesion` para armar sesiones sueltas.
- `src/data/atletismoTypes.ts` — los tipos de sesión y fases disponibles.

No reinventes el criterio a mano cada vez: leé esos archivos si no los tenés frescos en contexto. Si alguna sesión/regla de este documento (zonas de ritmo, nuevos tipos de sesión, fases dependientes de duración) todavía no existe en el código, tratala como una propuesta de extensión del algoritmo, no como algo que ya está implementado — antes de asumir que existe un builder o un tipo, confirmalo en `atletismoTypes.ts`/`atletismoSessionBuilders.ts`.

Para producir un plan completo o multi-semana, preferí correr la lógica real (por ejemplo con un script rápido vía `npx tsx` que importe `generarPlan`/`generarPlanVacio`/`crearSesion`) en vez de escribir el JSON de las sesiones a mano. Escribir JSON a mano es donde se cuela el sesgo de recencia — el algoritmo no tiene ese sesgo, vos sí cuando improvisás sesión por sesión.

Para ajustes chicos sobre un plan ya existente (mover un día, borrar una sesión, cambiar distancia) no hace falta correr el generador — ahí alcanza con razonar contra las reglas de abajo.

## Marco de periodización

### Cuántas fases usar: depende de la duración del plan

No hay una única secuencia correcta de fases — es el mismo continuo (general → capacidad → específico → afinamiento) con distinta granularidad. Elegí el modelo según cuántas semanas hay hasta la carrera:

- **Plan corto (4-8 semanas):** 3 fases. No hay tiempo material para desarrollar por separado "capacidad" y "transformación hacia el ritmo de carrera" — se solapan por necesidad, y separarlas solo resta tiempo útil a cada una.
- **Plan largo (9+ semanas):** 4 fases, desdoblando "Específico" en Acumulación (foco en capacidad/potencia aeróbica) y Transformación (foco en ritmo de carrera). Es más preciso y se alinea con cómo entrenan de hecho los planes de referencia (Canova, Daniels, Pfitzinger) para ciclos largos.
- **Menos de ~3 semanas hasta la carrera** (arranque tardío o replanificación sobre la marcha): no hay fase base real. Se entra directo a específico corto + tapering, priorizando llegar sano por sobre sumar estímulo nuevo.

### Modelo de 3 fases

1. **Base** — construir volumen aeróbico y variedad de estímulos suaves (fondo + fartlek). Nada de series/tempo/cuestas duras todavía. El objetivo es durabilidad, no velocidad. Es la fase de mayor importancia: aunque el ritmo se sienta muy fácil, no hay que aumentar distancia ni intensidad antes de tiempo — es el período de adaptación que el cuerpo necesita para sostener el resto del plan.
2. **Específico** — la fase de mayor especificidad con la distancia objetivo:
   - **10k**: prioridad a series (VO2max/umbral) y tempo; cuestas como sesión secundaria de fuerza/economía; fondos de relleno.
   - **21k**: prioridad a la tirada larga con tramos a ritmo objetivo (`tirada_larga_especifica`) y tempo; cuestas como secundaria; menos series puras (la 21k depende más de resistencia específica que de VO2max).
3. **Tapering** — bajar volumen manteniendo algo de intensidad corta, sin meter estímulos nuevos que el cuerpo no conozca, terminando en un shakeout muy corto 1-2 días antes de la carrera. Ver parámetros exactos por distancia más abajo.

### Modelo de 4 fases (planes de 9+ semanas)

1. **Base** — igual que arriba: hábito, volumen aeróbico, sin intensidad dura.
2. **Acumulación** — se amplía la capacidad y potencia aeróbica. Aumenta la distancia de las tiradas y aparecen los primeros estímulos de calidad (fartlek más estructurado, series largas suaves, cuestas). La sensación buscada es "cada vez me canso menos" a un volumen creciente.
3. **Transformación** — con la base de capacidad ya construida, se entrena más cerca del ritmo específico de carrera: series a ritmo objetivo, tempo, tiradas con tramos a ritmo de carrera. Es la fase de mayor especificidad.
4. **Tapering** — igual que en el modelo de 3 fases.

### Reglas de estructura semanal

Estas son las que más se rompen cuando se improvisa sesión por sesión — chequealas explícitamente antes de confirmar cualquier semana:

- **Como mucho una sesión dura "principal" (series o tempo) + una sesión secundaria de fuerza (cuestas) + un fondo largo por semana** en fase específico/transformación. Meter dos sesiones de calidad más allá de eso en la misma semana no suma, solo agrega riesgo. Corredores avanzados con buena base pueden llegar a 2 sesiones duras + fondo largo, pero es la excepción, no el default.
- **Separación mínima de 48-72 horas entre dos sesiones duras o de cuestas.** Nunca las pongas en días consecutivos ni con un solo día de descanso de por medio si se puede evitar.
- **El fondo largo no va pegado a otra sesión de calidad** — necesita al menos un día de por medio a cada lado cuando sea posible.
- **No agregues una sesión el día siguiente a un esfuerzo grande** (fondo largo, carrera, tirada específica) salvo que sea explícitamente muy corta y muy suave — y ante la duda, descanso completo gana. Cerca de la carrera (últimas 2-3 semanas) el descanso vale más que sumar frecuencia, incluso si el usuario "viene entrenando poco": el riesgo de lesión/fatiga pesa más que la ganancia marginal de un entrenamiento más.
- **Distribución de intensidad ~80/20 a lo largo de la semana/fase**: aproximadamente 80% del volumen total (en km o minutos) a ritmo suave/fondo, y no más de ~20% a intensidad alta (series, tempo, cuestas duras). Si al sumar las sesiones de una semana el volumen "duro" supera claramente ese 20%, es señal de que se está metiendo demasiada calidad — recortar antes de sumar otra sesión.
- **Progresión de volumen semanal moderada** (referencia práctica, no ley física): evitar saltos mayores a ~10% de una semana a la siguiente en fase base/acumulación. Cada 3-4 semanas conviene una semana de menor volumen (deload) antes de seguir subiendo, salvo que quede poco tiempo para la carrera.

## Catálogo de tipos de sesión

Cada tipo de sesión tiene una zona de ritmo asociada, relativa al ritmo de carrera objetivo del usuario para la distancia que está entrenando. Usalas para decidir qué sesión corresponde a qué fase, y para asignar ritmos concretos cuando el algoritmo o vos tengan que fijar un pace.

| Sesión | Qué es | Ritmo relativo | Fase típica |
|---|---|---|---|
| **Fondo / rodaje continuo** | Carrera continua suave, base de todo el plan (~80% del volumen semanal) | Fácil, conversacional | Todas |
| **Fondo largo (tirada larga)** | La sesión más larga de la semana, a ritmo fácil | Fácil | Todas |
| **Tirada larga específica** | Fondo largo con tramos finales a ritmo de carrera objetivo | Tramos a ritmo objetivo | Específico/Transformación (prioritaria en 21k) |
| **Fartlek** | Cambios de ritmo libres o estructurados sin pausas fijas, dentro de una carrera continua | Alterna fácil/moderado | Base/Acumulación |
| **Progresivo** | Arranca a ritmo fácil y acelera gradualmente hasta terminar cerca del ritmo objetivo o umbral | Creciente a lo largo de la sesión | Acumulación/Específico |
| **Pirámide de ritmo** | Tramos (por km o por distancia) que aceleran hacia el medio de la sesión y luego desaceleran, cada uno a un ritmo objetivo distinto | Variable, más rápido en el centro | Acumulación/Específico |
| **Tempo / umbral** | Esfuerzo continuo "cómodamente duro", sostenible ~20-40 min | Cercano al ritmo de 10k-21k del corredor | Específico/Transformación (prioritaria en 21k) |
| **Series largas (cruise intervals)** | Repeticiones de 1000-2000m a ritmo umbral con pausas cortas | Ritmo umbral, pausa corta (ratio ~5:1) | Específico/Transformación |
| **Series (intervalos VO2max)** | Repeticiones de 400-1200m (ej. 800m/1000m) a ritmo cercano a 3k-5k, recuperación similar a la duración del esfuerzo | Más rápido que ritmo de carrera | Específico (prioritaria en 10k) |
| **Series de distancias variadas** | Combinación de tramos de distinta longitud en la misma sesión (ej. 3×300m + 4×200m + 6×100m, o 1500m+400m+800m), cada tramo con su propio ritmo y pausa | Variable por tramo, más rápido cuanto más corto | Específico |
| **Cuestas (hill repeats)** | Repeticiones cortas (30-90s) en subida | Esfuerzo, no ritmo (por sensación/pendiente) | Base/Acumulación (fuerza) y secundaria en Específico |
| **Rectas / strides** | 8-15 aceleraciones cortas (~100m) controladas, sin llegar a la fatiga | Rápido pero relajado | Todas, especialmente Base |
| **Shakeout** | Trote muy corto y suave (10-30 min) | Muy fácil | Último día de Tapering |

Notas de uso:
- El **fondo** y el **fondo largo** son la base en todas las fases; lo que cambia por fase es qué se le agrega encima (nada en Base; fartlek/progresivo/cuestas en Acumulación; tempo/series/tirada específica en Transformación-Específico).
- **Pirámide de ritmo** y **series de distancias variadas** son sesiones legítimas para meter variedad dentro del criterio de fase — no reemplazan a series/tempo, son una forma alternativa de trabajar el mismo estímulo (estar cerca de VO2max/umbral) con distinta estructura. Se ubican como la sesión dura principal de la semana, nunca además de series o tempo la misma semana.
- Las **cuestas** casi nunca son la sesión dura principal en fase específico: son la secundaria de fuerza. En fase base/acumulación sí pueden ser el único estímulo de calidad de la semana.
- Los **strides** son de bajo costo (no generan fatiga significativa) y pueden agregarse al final de un fondo suave incluso en semanas con otra sesión dura, sin que cuenten como una segunda sesión de calidad.

## Tapering — parámetros por distancia

- **10k**: taper de 7-10 días. Reducir volumen ~40-50% manteniendo la frecuencia de días de entrenamiento y algo de intensidad corta (ej. algunas repeticiones cortas o strides) para no perder piernas.
- **21k**: taper de 10-14 días. Reducir volumen ~40-60%, mismo criterio de mantener intensidad y frecuencia, solo baja el volumen de cada sesión.
- En ambos casos: no introducir estímulos nuevos que el cuerpo no conozca de fases anteriores, y terminar con un **shakeout** de 10-30 min (o 10-15 min la mañana de la carrera) 1-2 días antes de la carrera.
- Si quedan menos de 3 semanas hasta la carrera al momento de planificar/replanificar, priorizar directamente el criterio de tapering (llegar sano) por sobre sumar volumen o estímulo nuevo, aunque el usuario sienta que "entrenó poco".

## Regla anti-sesgo-de-recencia (la parte importante)

Cuando el usuario dice algo puntual — "quiero más cuestas", "hice un fartlek el martes", "extrañaba correr en subida" — tratalo como **un dato que entra en una sola sesión/slot del esqueleto ya razonado**, nunca como una directiva que se repite semana tras semana ni que reemplaza el criterio de arriba. Concretamente:

1. Primero armá (o repasá) el esqueleto completo de las semanas restantes con las reglas de periodización y estructura semanal, eligiendo el modelo de 3 o 4 fases según cuánto falta para la carrera.
2. Después ubicá el pedido puntual del usuario en el slot que mejor corresponda dentro de ese esqueleto (por ejemplo: "más cuestas" → la sesión secundaria de la semana que sigue, no todas las semanas).
3. Si el pedido no entra sin romper una regla (dos sesiones duras muy pegadas, un tipo de sesión que no corresponde a la fase — ej. fartlek en plena fase de tapering), decilo explícitamente y proponé la mejor alternativa en vez de forzarlo.

## Ejemplo — antipatrón vs. correcto

**Antipatrón** (lo que pasaba antes): el usuario menciona que corrió un fartlek → el asistente mete fartlek en 3 de las 4 semanas restantes porque fue lo último que se habló, sin chequear que fartlek es una sesión de fase *base/acumulación*, no de fase específico/tapering donde ya está el plan.

**Correcto**: el usuario menciona el fartlek → se registra como algo que ya hizo (no como plantilla a repetir), se reconfirma en qué fase está cada semana restante, y el fartlek no aparece de nuevo salvo que el esqueleto de esa fase lo pida.

## Checklist antes de entregar cualquier plan o ajuste

- [ ] ¿Elegí el modelo de fases correcto según la duración del plan (3 fases si son 4-8 semanas, 4 fases si son 9+, directo a específico corto+tapering si quedan <3 semanas)?
- [ ] ¿Repasé (o reconstruí) el esqueleto completo de las semanas restantes, no solo la sesión que se está tocando?
- [ ] ¿Cada semana en fase específico/transformación tiene como máximo 1 sesión dura principal + 1 secundaria + 1 fondo largo?
- [ ] ¿Hay al menos 48-72h entre sesiones duras/cuestas?
- [ ] ¿El fondo largo no quedó pegado a otra sesión de calidad?
- [ ] ¿La proporción de volumen duro vs. suave de la semana ronda el 20/80 y no se disparó?
- [ ] Si el usuario pidió algo puntual, ¿lo ubiqué en un solo lugar razonado, no repetido sin criterio?
- [ ] ¿La fase de tapering usa los parámetros por distancia (7-10 días/10k, 10-14 días/21k, -40 a -60% volumen) sin meter estímulos nuevos, y termina en shakeout?
- [ ] Si generé un plan completo, ¿usé (o repliqué fielmente) la lógica de `atletismoPlanGenerator.ts`/`atletismoSessionBuilders.ts` en vez de improvisar el JSON a mano? Si usé un tipo de sesión nuevo (pirámide, progresivo, series variadas, cruise intervals) que no está en el código todavía, ¿lo marqué como propuesta de extensión en vez de asumir que ya existe el builder?
