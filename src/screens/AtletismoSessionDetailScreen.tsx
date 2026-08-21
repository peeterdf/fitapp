import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Badge, Btn, Loading } from '../components/UI';
import { useAtletismoContext } from '../contexts/AtletismoContext';
import { AtletismoExercise, AtletismoFase } from '../data/atletismoTypes';
import { generarFitDeSesion } from '../utils/atletismoFitExport';
import { shareFitWorkout } from '../utils/atletismoFitShare';
import { toast } from '../utils/webCompat';

const TIPO_EMOJI: Record<AtletismoExercise['tipo'], string> = {
  fondo: '🏞️',
  series: '⏱️',
  fartlek: '🎲',
  tempo: '🔥',
  cuestas: '⛰️',
  tirada_larga_especifica: '🏁',
};

const FASE_LABEL: Record<AtletismoFase, string> = {
  base: 'Base',
  especifico: 'Específico',
  tapering: 'Tapering',
};

const FASE_BADGE: Record<AtletismoFase, 'acc' | 'green' | 'red'> = {
  base: 'acc',
  especifico: 'green',
  tapering: 'red',
};

export default function AtletismoSessionDetailScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { planId, sessionId } = useLocalSearchParams<{ planId?: string; sessionId?: string }>();
  const { plans } = useAtletismoContext();

  const plan = planId ? plans.find(p => p.id === Number(planId)) : undefined;
  const sesion = plan?.semanas.flatMap(s => s.sesiones).find(s => s.id === Number(sessionId));
  const [enviando, setEnviando] = useState(false);

  if (!plan || !sesion) return <Loading />;

  const c = sesion.cuerpo;

  async function enviarAGarmin() {
    setEnviando(true);
    try {
      const bytes = generarFitDeSesion(sesion!, plan!.ritmos);
      await shareFitWorkout(bytes, `${sesion!.nombre} ${sesion!.fecha}`);
    } catch (e) {
      toast('No se pudo exportar', e instanceof Error ? e.message : 'Error desconocido.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{TIPO_EMOJI[sesion.tipo]} {sesion.nombre}</Text>
          <Text style={styles.subtitle}>Semana {sesion.semana} · {sesion.dia} · {sesion.fecha}</Text>
        </View>
        <Badge label={FASE_LABEL[sesion.fase]} variant={FASE_BADGE[sesion.fase]} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.totalCard}>
          <Text style={styles.totalValue}>{sesion.distanciaTotalKm} km</Text>
          <Text style={styles.totalLabel}>distancia total estimada</Text>
        </View>

        <PhaseCard C={C} styles={styles} emoji="🔥" title="Entrada en calor">
          <Row C={C} label="Distancia" value={`${sesion.entrada_en_calor.distanciaKm} km`} />
          <Row C={C} label="Duración" value={`${sesion.entrada_en_calor.tiempoMin} min`} />
          <Text style={styles.phaseDesc}>{sesion.entrada_en_calor.desc}</Text>
        </PhaseCard>

        <PhaseCard C={C} styles={styles} emoji={TIPO_EMOJI[sesion.tipo]} title="Cuerpo del entrenamiento">
          {c.distanciaKm !== undefined && <Row C={C} label="Distancia" value={`${c.distanciaKm} km`} />}
          {c.tiempoMin !== undefined && <Row C={C} label="Duración" value={`${c.tiempoMin} min`} />}
          {c.series !== undefined && <Row C={C} label="Repeticiones" value={`${c.series} × ${c.distanciaSerieM} m`} />}
          {c.descansoSeg !== undefined && <Row C={C} label="Descanso" value={`${c.descansoSeg}s (${c.descansoTipo})`} />}
          {c.pendiente && <Row C={C} label="Pendiente" value={c.pendiente} />}
          {c.ritmoObjetivo && <Row C={C} label="Ritmo objetivo" value={c.ritmoObjetivo} />}
          {c.tramosRitmoObjetivoKm !== undefined && <Row C={C} label="Tramos a ritmo objetivo" value={`${c.tramosRitmoObjetivoKm} km`} />}
          <Text style={styles.phaseDesc}>{c.desc}</Text>
        </PhaseCard>

        <PhaseCard C={C} styles={styles} emoji="🧊" title="Enfriamiento">
          <Row C={C} label="Distancia" value={`${sesion.enfriamiento.distanciaKm} km`} />
          <Row C={C} label="Duración" value={`${sesion.enfriamiento.tiempoMin} min`} />
          <Text style={styles.phaseDesc}>{sesion.enfriamiento.desc}</Text>
        </PhaseCard>

        <Btn
          label={enviando ? 'Generando...' : '⌚ Enviar a Garmin (.FIT)'}
          onPress={enviarAGarmin}
          disabled={enviando}
          style={{ marginTop: 8 }}
        />
        <Text style={styles.garminHint}>
          Genera el entrenamiento estructurado como archivo .FIT y abre el panel para compartirlo.
          Para llevarlo al reloj: transferilo con Garmin Express, o copialo por USB a la carpeta
          GARMIN/NewFiles del dispositivo.
        </Text>
      </ScrollView>
    </View>
  );
}

function PhaseCard({ C, styles, emoji, title, children }: { C: ReturnType<typeof useColors>; styles: any; emoji: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.phaseCard}>
      <Text style={styles.phaseTitle}>{emoji} {title}</Text>
      {children}
    </View>
  );
}

function Row({ C, label, value }: { C: ReturnType<typeof useColors>; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
      <Text style={{ color: C.text2, fontSize: font.sm }}>{label}</Text>
      <Text style={{ color: C.text, fontSize: font.sm, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
    backText: { color: C.text, fontSize: 18 },
    title: { fontSize: font.xl, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
    subtitle: { fontSize: font.sm, color: C.text2, marginTop: 2 },
    scroll: { flex: 1, paddingHorizontal: 16 },
    totalCard: { backgroundColor: C.acc, borderRadius: radius.lg, padding: 18, alignItems: 'center', marginBottom: 14, marginTop: 4 },
    totalValue: { fontSize: 32, fontWeight: '900', color: C.black },
    totalLabel: { fontSize: font.sm, color: C.black, opacity: 0.7, marginTop: 2 },
    phaseCard: { backgroundColor: C.s1, borderRadius: radius.md, padding: 14, marginBottom: 10 },
    phaseTitle: { color: C.text, fontSize: font.md, fontWeight: '800', marginBottom: 4 },
    phaseDesc: { color: C.text2, fontSize: font.sm, marginTop: 8, lineHeight: 19 },
    garminHint: { color: C.text3, fontSize: font.xs, marginTop: 8, fontStyle: 'italic', lineHeight: 16 },
  });
}
