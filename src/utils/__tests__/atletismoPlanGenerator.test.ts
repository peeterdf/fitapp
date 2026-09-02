// Verificación de calcularFases (bordes de duración) y de los nuevos builders
// de sesión. No hay test runner configurado en el proyecto (ver CLAUDE.md) —
// este script se corre directo con `npx tsc` + `node` (ver comentario al final)
// y usa asserts planos en vez de un framework, siguiendo el mismo criterio.
import assert from 'assert';
import { calcularFases, generarPlan, generarPlanVacio } from '../atletismoPlanGenerator';
import {
  cuerpoCruiseIntervals, cuerpoFondo, cuerpoPiramide, cuerpoProgresivo, cuerpoSeriesVariadas,
  cuerpoStrides, crearSesion, estimarDistanciaCuerpoKm, reconstruirSesion,
} from '../atletismoSessionBuilders';
import { calcularRitmos } from '../atletismoPace';
import { toISODate, addDays, startOfDay } from '../atletismoDate';
import { AtletismoPlanInputs } from '../../data/atletismoTypes';

const ritmos = calcularRitmos('45:00', '10k');

function contarFases(fases: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const f of fases) out[f] = (out[f] ?? 0) + 1;
  return out;
}

// ─── calcularFases: bordes de duración ────────────────────────────────────

{
  // 7 semanas → modelo de 3 fases (4-8 semanas)
  const fases = calcularFases(7, '10k');
  assert.strictEqual(fases.length, 7);
  const c = contarFases(fases);
  assert.ok(c.base >= 1 && c.especifico >= 1 && c.tapering >= 1);
  assert.ok(!c.acumulacion && !c.transformacion, '7 semanas no debería usar el modelo de 4 fases');
  console.log('OK: 7 semanas → 3 fases', c);
}

{
  // 8 semanas → sigue siendo modelo de 3 fases (límite superior del rango 4-8)
  const fases = calcularFases(8, '10k');
  assert.strictEqual(fases.length, 8);
  const c = contarFases(fases);
  assert.ok(c.base >= 1 && c.especifico >= 1 && c.tapering >= 1);
  assert.ok(!c.acumulacion && !c.transformacion, '8 semanas no debería usar el modelo de 4 fases');
  console.log('OK: 8 semanas → 3 fases', c);
}

{
  // 9 semanas → pasa al modelo de 4 fases (desdobla específico)
  const fases9k = calcularFases(9, '10k');
  const fases21 = calcularFases(9, '21k');
  for (const fases of [fases9k, fases21]) {
    assert.strictEqual(fases.length, 9);
    const c = contarFases(fases);
    assert.ok(c.base >= 1 && c.acumulacion >= 1 && c.transformacion >= 1 && c.tapering >= 1);
    assert.ok(!c.especifico, '9 semanas no debería usar la fase "especifico" plana');
  }
  console.log('OK: 9 semanas → 4 fases', contarFases(fases9k), contarFases(fases21));
}

{
  // <3 semanas → sin fase base, directo a específico corto + tapering
  const fases = calcularFases(2, '10k');
  assert.strictEqual(fases.length, 2);
  const c = contarFases(fases);
  assert.ok(!c.base, '2 semanas no debería tener fase base');
  assert.ok(c.especifico >= 1 && c.tapering >= 1);
  console.log('OK: 2 semanas → sin base', c);
}

{
  // Tapering parametrizado por distancia: 21k pide más semanas de taper que 10k
  // cuando el plan es lo bastante largo como para permitirlo.
  const taper10k = contarFases(calcularFases(12, '10k')).tapering;
  const taper21k = contarFases(calcularFases(12, '21k')).tapering;
  assert.ok(taper21k >= taper10k, `taper 21k (${taper21k}) debería ser >= taper 10k (${taper10k})`);
  console.log('OK: taper 21k >= taper 10k en plan de 12 semanas', { taper10k, taper21k });
}

{
  // Toda fase generada es siempre un bloque contiguo (nunca interleaved),
  // precondición de la que depende el cálculo de "progreso" en generarPlan.
  for (const total of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 16, 20]) {
    for (const objetivo of ['10k', '21k'] as const) {
      const fases = calcularFases(total, objetivo);
      assert.strictEqual(fases.length, total, `longitud incorrecta para ${total} semanas / ${objetivo}`);
      const vistos = new Set<string>();
      let anterior = fases[0];
      for (const f of fases) {
        if (f !== anterior) {
          assert.ok(!vistos.has(f), `fase "${f}" no contigua en plan de ${total} semanas / ${objetivo}: ${fases.join(',')}`);
          vistos.add(anterior);
          anterior = f;
        }
      }
    }
  }
  console.log('OK: fases siempre contiguas en todas las duraciones probadas');
}

// ─── Builders nuevos ───────────────────────────────────────────────────────

{
  const c = cuerpoProgresivo(10, ritmos);
  assert.strictEqual(c.distanciaKm, 10);
  assert.strictEqual(c.ritmoObjetivo, `${ritmos.fondo}/km`);
  assert.strictEqual(c.ritmoFinal, `${ritmos.tempo}/km`);
  assert.strictEqual(estimarDistanciaCuerpoKm(c, ritmos), 10);
  console.log('OK: cuerpoProgresivo', c.desc);
}

{
  const c = cuerpoPiramide(10, 5, ritmos);
  assert.ok(c.tramos && c.tramos.length === 5);
  assert.strictEqual(c.distanciaKm, 10);
  // El tramo central debe ser el más rápido (menor segundos/km => pace numérico menor).
  const paceToSec = (p: string) => { const [m, s] = p.replace('/km', '').split(':').map(Number); return m * 60 + s; };
  const paces = c.tramos!.map(t => paceToSec(t.ritmoObjetivo));
  const centro = Math.floor(paces.length / 2);
  assert.ok(paces[centro] <= paces[0] && paces[centro] <= paces[paces.length - 1], 'el tramo central debería ser el más rápido');
  assert.ok(Math.abs(estimarDistanciaCuerpoKm(c, ritmos) - 10) < 0.5);
  console.log('OK: cuerpoPiramide', c.desc);
}

{
  const c = cuerpoSeriesVariadas([
    { reps: 3, distM: 300, descansoSeg: 90 },
    { reps: 4, distM: 200, descansoSeg: 60 },
    { reps: 6, distM: 100, descansoSeg: 45 },
  ], ritmos);
  assert.ok(c.tramos && c.tramos.length === 3);
  const paceToSec = (p: string) => { const [m, s] = p.replace('/km', '').split(':').map(Number); return m * 60 + s; };
  const [t300, t200, t100] = c.tramos!;
  // Más corto el tramo => ritmo más rápido (menos segundos/km).
  assert.ok(paceToSec(t100.ritmoObjetivo) <= paceToSec(t200.ritmoObjetivo));
  assert.ok(paceToSec(t200.ritmoObjetivo) <= paceToSec(t300.ritmoObjetivo));
  const kmEsperado = (3 * 300 + 4 * 200 + 6 * 100) / 1000;
  assert.ok(Math.abs(estimarDistanciaCuerpoKm(c, ritmos) - kmEsperado) < 0.01);
  console.log('OK: cuerpoSeriesVariadas', c.desc);
}

{
  const c = cuerpoCruiseIntervals(4, 1200, ritmos);
  assert.strictEqual(c.series, 4);
  assert.strictEqual(c.distanciaSerieM, 1200);
  assert.strictEqual(c.ritmoObjetivo, `${ritmos.tempo}/km`);
  assert.ok(c.descansoSeg! > 0 && c.descansoSeg! < 200, 'pausa corta esperada para cruise intervals');
  console.log('OK: cuerpoCruiseIntervals', c.desc);
}

{
  const c = cuerpoStrides(10, 100);
  assert.strictEqual(c.series, 10);
  assert.strictEqual(c.distanciaSerieM, 100);
  assert.strictEqual(estimarDistanciaCuerpoKm(c, ritmos), 1);
  console.log('OK: cuerpoStrides', c.desc);
}

// ─── crearSesion/reconstruirSesion siguen funcionando con tipos nuevos ────

{
  const s = crearSesion({
    id: 1, tipo: 'piramide', semana: 1, fase: 'transformacion', fecha: '2026-09-10',
    params: { km: 0, minutos: 0, reps: 5, distSerieM: 0, descansoSeg: 0, totalKm: 10, kmRitmoObjetivo: 0 },
    entradaKm: 2, entradaMin: 12, enfriamientoKm: 1.2, enfriamientoMin: 8, ritmos,
  });
  assert.strictEqual(s.tipo, 'piramide');
  assert.ok(s.cuerpo.tramos && s.cuerpo.tramos.length === 5);
  assert.ok(s.distanciaTotalKm > 10);

  const s2 = reconstruirSesion({
    base: s, fecha: '2026-09-11',
    params: { km: 0, minutos: 0, reps: 8, distSerieM: 100, descansoSeg: 60, totalKm: 0, kmRitmoObjetivo: 0 },
    entradaKm: 2, entradaMin: 12, enfriamientoKm: 1.2, enfriamientoMin: 8, ritmos,
  });
  console.log('OK: crearSesion/reconstruirSesion con tipo "piramide" no rompen', s.distanciaTotalKm, s2.fecha);
}

// ─── generarPlan/generarPlanVacio no rompen su interfaz pública ──────────

{
  const inputs: AtletismoPlanInputs = {
    objetivo_principal: '21k',
    fecha_objetivo: toISODate(addDays(startOfDay(new Date()), 70)), // ~10 semanas
    tiempo_actual_10k: '48:00',
    dias_disponibles_por_semana: 5,
  };
  const plan = generarPlan(inputs);
  assert.ok(plan.semanas.length >= 9);
  assert.ok(plan.semanas.some(s => s.fase === 'acumulacion'));
  assert.ok(plan.semanas.some(s => s.fase === 'transformacion'));

  // La última sesión antes de la carrera debe ser un shakeout corto.
  const todas = plan.semanas.flatMap(s => s.sesiones);
  const ultima = todas[todas.length - 1];
  assert.ok(ultima.distanciaTotalKm <= 6, `la última sesión debería ser un shakeout corto, fue ${ultima.distanciaTotalKm}km`);
  console.log('OK: generarPlan (21k, ~10 semanas) — última sesión', ultima.fecha, ultima.distanciaTotalKm, 'km');

  const vacio = generarPlanVacio(inputs);
  assert.strictEqual(vacio.semanas.length, plan.semanas.length);
  assert.deepStrictEqual(vacio.semanas.map(s => s.fase), plan.semanas.map(s => s.fase));
  console.log('OK: generarPlanVacio coincide en semanas/fases con generarPlan');
}

{
  // Replanificación muy tardía (carrera en 5 días): no debería tirar y no
  // debería meter fase base.
  const inputs: AtletismoPlanInputs = {
    objetivo_principal: '10k',
    fecha_objetivo: toISODate(addDays(startOfDay(new Date()), 5)),
    tiempo_actual_10k: '48:00',
    dias_disponibles_por_semana: 4,
  };
  const plan = generarPlan(inputs);
  assert.ok(!plan.semanas.some(s => s.fase === 'base'), 'una carrera en 5 días no debería tener fase base');
  console.log('OK: replanificación a 5 días de la carrera no rompe y no mete fase base');
}

console.log('\nTodos los checks pasaron.');
