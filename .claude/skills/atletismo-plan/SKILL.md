---
name: atletismo-plan
description: Usar siempre que se cree, genere, ajuste, edite o revise un plan de entrenamiento de atletismo/running (fitapp, sección Atletismo) — pedidos como "armame un plan", "ajustá el plan para la carrera", "qué corro esta semana", "mové esta sesión", o cuando el usuario cuenta qué corrió realmente y hay que reacomodar lo que queda. Consultar esta skill INCLUSO para un cambio de una sola sesión o un solo día — el riesgo que resuelve es exactamente el de tratar un ajuste puntual como si fuera el criterio general del plan.
---

# Armar y ajustar planes de atletismo

## El problema que esto evita

Cuando se ajusta un plan conversacionalmente, sesión por sesión, es fácil sobre-indexar en lo último que dijo el usuario: si menciona cuestas, aparecen cuestas todas las semanas; si cuenta que hizo un fartlek, el fartlek se repite sin criterio. Eso no es periodización, es reaccionar al último mensaje. Un plan de carrera tiene que sostener una lógica de semanas completas (qué estímulo mete cada semana y por qué, cuánto se separan los esfuerzos duros), y un pedido puntual del usuario es un dato que se acomoda *dentro* de esa lógica, no un reemplazo de la lógica.

**Regla de oro: antes de tocar una sesión puntual, reconstruí el esqueleto completo de las semanas que quedan (fase por semana, qué slot ocupa cada tipo de sesión) y recién ahí encajá el pedido específico en un solo lugar de ese esqueleto.** Si el pedido no encaja sin romper las reglas de abajo (por ejemplo, dos sesiones duras muy pegadas), decílo y proponé la mejor ubicación en vez de forzarlo donde el usuario lo puso.

## Fuente de verdad: el algoritmo ya está en el repo

Este proyecto (`peeterdf/fitapp`) ya tiene codificada una periodización razonable en:

- `src/utils/atletismoPlanGenerator.ts` — `calcularFases` (cuánto dura cada fase según las semanas totales) y `construirSesionesSemana` (qué tipo de sesión va en cada slot según fase y objetivo).
- `src/utils/atletismoSessionBuilders.ts` — constructores de cada tipo de sesión (`cuerpoFondo`, `cuerpoSeries`, `cuerpoFartlek`, `cuerpoTempo`, `cuerpoCuestas`, `cuerpoTiradaLargaEspecifica`) y `crearSesion`/`reconstruirSesion` para armar sesiones sueltas.
- `src/data/atletismoTypes.ts` — los tipos de sesión y fases disponibles.

No reinventes el criterio a mano cada vez: leé esos archivos si no los tenés frescos en contexto, y cuando haya que producir un plan completo o multi-semana, preferí correr la lógica real (por ejemplo con un script rápido vía `npx tsx` que importe `generarPlan`/`generarPlanVacio`/`crearSesion`, como se hizo en sesiones anteriores) en vez de escribir el JSON de las sesiones a mano. Escribir JSON a mano es donde se cuela el sesgo de recencia — el algoritmo no tiene ese sesgo, vos sí cuando improvisás sesión por sesión.

Para ajustes chicos sobre un plan ya existente (mover un día, borrar una sesión, cambiar distancia) no hace falta correr el generador — ahí alcanza con razonar contra las reglas de abajo.

## Marco de periodización

Tres fases, en este orden, entre "hoy" y la fecha de la carrera:

1. **Base** — construir volumen aeróbico y variedad de estímulos suaves (fondo + fartlek). Nada de series/tempo/cuestas duras todavía. El objetivo es durabilidad, no velocidad.
2. **Específico** — la fase de mayor especificidad con la distancia objetivo:
   - **10k**: prioridad a series (VO2max/umbral) y tempo; cuestas como sesión secundaria de fuerza/economía; fondos de relleno.
   - **21k**: prioridad a la tirada larga con tramos a ritmo objetivo (`tirada_larga_especifica`) y tempo; cuestas como secundaria; menos series puras (la 21k depende más de resistencia específica que de VO2max).
3. **Tapering** — bajar volumen 40-60% mientras se mantiene algo de intensidad corta (para no perder piernas), sin meter estímulos nuevos que el cuerpo no conozca, terminando en un shakeout muy corto 1-2 días antes de la carrera.

Con menos de ~3 semanas hasta la carrera (como puede pasar si el usuario arranca tarde o hay que replanificar sobre la marcha), no hay tiempo para una fase base real: se entra directo a específico corto + tapering, priorizando llegar sano por sobre sumar estímulo nuevo.

## Reglas de estructura semanal

Estas son las que más se rompen cuando se improvisa sesión por sesión — chequealas explícitamente antes de confirmar cualquier semana:

- **Como mucho una sesión dura "principal" (series o tempo) + una sesión secundaria de fuerza (cuestas) + un fondo largo por semana** en fase específico. Meter dos sesiones de calidad más allá de eso en la misma semana no suma, solo agrega riesgo.
- **Separación mínima de 48-72 horas entre dos sesiones duras o de cuestas.** Nunca las pongas en días consecutivos ni con un solo día de descanso de por medio si se puede evitar.
- **El fondo largo no va pegado a otra sesión de calidad** — necesita al menos un día de por medio a cada lado cuando sea posible.
- **No agregues una sesión el día siguiente a un esfuerzo grande** (fondo largo, carrera, tirada específica) salvo que sea explícitamente muy corta y muy suave — y ante la duda, descanso completo gana. Cerca de la carrera (últimas 2-3 semanas) el descanso vale más que sumar frecuencia, incluso si el usuario "viene entrenando poco": el riesgo de lesión/fatiga pesa más que la ganancia marginal de un entrenamiento más.

## Regla anti-sesgo-de-recencia (la parte importante)

Cuando el usuario dice algo puntual — "quiero más cuestas", "hice un fartlek el martes", "extrañaba correr en subida" — tratalo como **un dato que entra en una sola sesión/slot del esqueleto ya razonado**, nunca como una directiva que se repite semana tras semana ni que reemplaza el criterio de arriba. Concretamente:

1. Primero armá (o repasá) el esqueleto completo de las semanas restantes con las reglas de periodización y estructura semanal.
2. Después ubicá el pedido puntual del usuario en el slot que mejor corresponda dentro de ese esqueleto (por ejemplo: "más cuestas" → la sesión secundaria de la semana que sigue, no todas las semanas).
3. Si el pedido no entra sin romper una regla (dos sesiones duras muy pegadas, un tipo de sesión que no corresponde a la fase), decilo explícitamente y proponé la mejor alternativa en vez de forzarlo.

## Ejemplo — antipatrón vs. correcto

**Antipatrón** (lo que pasaba antes): el usuario menciona que corrió un fartlek → el asistente mete fartlek en 3 de las 4 semanas restantes porque fue lo último que se habló, sin chequear que fartlek es una sesión de fase *base*, no de fase específico/tapering donde ya está el plan.

**Correcto**: el usuario menciona el fartlek → se registra como algo que ya hizo (no como plantilla a repetir), se reconfirma en qué fase está cada semana restante, y el fartlek no aparece de nuevo salvo que el esqueleto de esa fase lo pida.

## Checklist antes de entregar cualquier plan o ajuste

- [ ] ¿Repasé (o reconstruí) el esqueleto completo de las semanas restantes, no solo la sesión que se está tocando?
- [ ] ¿Cada semana en fase específico tiene como máximo 1 sesión dura principal + 1 secundaria + 1 fondo largo?
- [ ] ¿Hay al menos 48-72h entre sesiones duras/cuestas?
- [ ] ¿El fondo largo no quedó pegado a otra sesión de calidad?
- [ ] Si el usuario pidió algo puntual, ¿lo ubiqué en un solo lugar razonado, no repetido sin criterio?
- [ ] ¿La fase de tapering baja volumen sin meter estímulos nuevos?
- [ ] Si generé un plan completo, ¿usé (o repliqué fielmente) la lógica de `atletismoPlanGenerator.ts`/`atletismoSessionBuilders.ts` en vez de improvisar el JSON a mano?
