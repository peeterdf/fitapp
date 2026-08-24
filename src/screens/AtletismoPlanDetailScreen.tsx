import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Badge, Loading } from '../components/UI';
import { useAtletismoContext } from '../contexts/AtletismoContext';
import { AtletismoExercise, AtletismoFase, DiaSemana } from '../data/atletismoTypes';
import { confirm } from '../utils/webCompat';
import { DIAS_ORDEN, todayISO } from '../utils/atletismoDate';

const TIPO_EMOJI: Record<AtletismoExercise['tipo'], string> = {
  fondo: '🏞️',
  series: '⏱️',
  fartlek: '🎲',
  tempo: '🔥',
  cuestas: '⛰️',
  tirada_larga_especifica: '🏁',
};

const DIA_CORTO: Record<DiaSemana, string> = {
  Lun: 'L', Mar: 'M', Mié: 'X', Jue: 'J', Vie: 'V', Sáb: 'S', Dom: 'D',
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

export default function AtletismoPlanDetailScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { plans, deletePlan } = useAtletismoContext();

  const plan = id ? plans.find(p => p.id === Number(id)) : undefined;

  if (!plan) return <Loading />;

  const hoy = todayISO();
  const totalSesiones = plan.semanas.reduce((acc, s) => acc + s.sesiones.length, 0);
  const totalKm = Math.round(plan.semanas.reduce((acc, s) => acc + s.kilometrajeTotalKm, 0));

  function askDelete() {
    confirm('Eliminar plan', '¿Eliminar este plan de atletismo?', () => {
      deletePlan(plan!.id);
      router.back();
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Plan {plan.inputs.objetivo_principal.toUpperCase()}</Text>
        <TouchableOpacity onPress={askDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryMeta}>Carrera objetivo: {plan.inputs.fecha_objetivo}</Text>
          <Text style={styles.summaryMeta}>{plan.semanas.length} semanas · {totalSesiones} sesiones · ~{totalKm} km totales</Text>
          {plan.inputs.objetivo_secundario && (
            <Text style={styles.summaryMeta}>Objetivo secundario: {plan.inputs.objetivo_secundario.toUpperCase()}</Text>
          )}
          <View style={styles.ritmosGrid}>
            <RitmoBox label="Fondo" value={`${plan.ritmos.fondo}/km`} />
            <RitmoBox label="Tempo" value={`${plan.ritmos.tempo}/km`} />
            <RitmoBox label="Series" value={`${plan.ritmos.series}/km`} />
            <RitmoBox label="Objetivo" value={`${plan.ritmos.ritmoObjetivoCarrera}/km`} />
          </View>
          <Text style={styles.vdotText}>VDOT estimado: {plan.ritmos.vdot}</Text>
        </View>

        {plan.semanas.map(semana => {
          const esSemanaActual = hoy >= semana.fechaInicio && hoy <= semana.fechaFin;
          return (
            <View key={semana.numero} style={[styles.weekCard, esSemanaActual && styles.weekCardActual]}>
              <View style={styles.weekHeader}>
                <Text style={styles.weekTitle}>Semana {semana.numero}</Text>
                <Badge label={FASE_LABEL[semana.fase]} variant={FASE_BADGE[semana.fase]} />
              </View>
              <Text style={styles.weekMeta}>{semana.fechaInicio} → {semana.fechaFin} · {semana.kilometrajeTotalKm} km</Text>

              <View style={styles.grid}>
                {DIAS_ORDEN.map(dia => {
                  const sesion = semana.sesiones.find(s => s.dia === dia);
                  const esHoy = sesion?.fecha === hoy;
                  return (
                    <TouchableOpacity
                      key={dia}
                      style={[styles.dayCell, esHoy && styles.dayCellHoy]}
                      activeOpacity={sesion ? 0.7 : 1}
                      disabled={!sesion}
                      onPress={() => sesion && router.push({ pathname: '/atletismo-session-detail', params: { planId: String(plan.id), sessionId: String(sesion.id) } } as any)}
                    >
                      <Text style={[styles.dayLabel, esHoy && styles.dayLabelHoy]}>{DIA_CORTO[dia]}</Text>
                      {sesion ? (
                        <>
                          <Text style={styles.dayEmoji}>{TIPO_EMOJI[sesion.tipo]}</Text>
                          <Text style={styles.dayKm}>{sesion.distanciaTotalKm}k</Text>
                        </>
                      ) : (
                        <Text style={styles.dayRest}>—</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function RitmoBox({ label, value }: { label: string; value: string }) {
  const C = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: C.s2, borderRadius: radius.sm, padding: 10, alignItems: 'center' }}>
      <Text style={{ color: C.acc, fontWeight: '900', fontSize: font.md }}>{value}</Text>
      <Text style={{ color: C.text2, fontSize: font.xs, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
    backText: { color: C.text, fontSize: 18 },
    title: { flex: 1, fontSize: font.xxl, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
    deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,85,85,0.13)', alignItems: 'center', justifyContent: 'center' },
    deleteText: { color: C.danger, fontSize: 16, fontWeight: '700' },
    scroll: { flex: 1, paddingHorizontal: 16 },
    summaryCard: { backgroundColor: C.s1, borderRadius: radius.md, padding: 14, marginBottom: 14 },
    summaryMeta: { color: C.text2, fontSize: font.sm, marginBottom: 2 },
    ritmosGrid: { flexDirection: 'row', gap: 8, marginTop: 10 },
    vdotText: { color: C.text3, fontSize: font.xs, marginTop: 8, fontStyle: 'italic' },
    weekCard: { backgroundColor: C.s1, borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent' },
    weekCardActual: { borderColor: C.acc },
    weekHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    weekTitle: { color: C.text, fontSize: font.lg, fontWeight: '800' },
    weekMeta: { color: C.text2, fontSize: font.xs, marginTop: 2, marginBottom: 10 },
    grid: { flexDirection: 'row', justifyContent: 'space-between' },
    dayCell: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.sm, backgroundColor: C.s2, marginHorizontal: 2 },
    dayCellHoy: { backgroundColor: 'rgba(232,255,71,0.13)', borderWidth: 1.5, borderColor: C.acc },
    dayLabel: { fontSize: font.xs, color: C.text3, fontWeight: '700' },
    dayLabelHoy: { color: C.acc },
    dayEmoji: { fontSize: 18, marginTop: 4 },
    dayKm: { fontSize: 9, color: C.text2, marginTop: 2, fontWeight: '600' },
    dayRest: { fontSize: 14, color: C.text3, marginTop: 8, opacity: 0.5 },
  });
}
