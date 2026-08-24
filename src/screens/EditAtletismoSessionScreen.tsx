import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Btn, SectionTitle } from '../components/UI';
import { useAtletismoContext } from '../contexts/AtletismoContext';
import { DiaSemana } from '../data/atletismoTypes';
import { parametrosDesdeCuerpo, reconstruirSesion } from '../utils/atletismoSessionBuilders';
import { DIAS_ORDEN, fechaParaDia, parseISODateLocal, toISODate } from '../utils/atletismoDate';
import { confirm, toast } from '../utils/webCompat';

function FieldLabel({ text, C }: { text: string; C: ReturnType<typeof useColors> }) {
  return <Text style={{ fontSize: font.xs, color: C.text2, fontWeight: '700', letterSpacing: 0.5, marginBottom: 5, marginTop: 6 }}>{text.toUpperCase()}</Text>;
}

export default function EditAtletismoSessionScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { planId, sessionId } = useLocalSearchParams<{ planId?: string; sessionId?: string }>();
  const { plans, updatePlan } = useAtletismoContext();

  const plan = planId ? plans.find(p => p.id === Number(planId)) : undefined;
  const semanaIdx = plan?.semanas.findIndex(s => s.sesiones.some(x => x.id === Number(sessionId))) ?? -1;
  const semana = plan && semanaIdx >= 0 ? plan.semanas[semanaIdx] : undefined;
  const sesion = semana?.sesiones.find(s => s.id === Number(sessionId));

  const paramsIniciales = sesion ? parametrosDesdeCuerpo(sesion.tipo, sesion.cuerpo) : undefined;

  const [dia, setDia] = useState<DiaSemana>(sesion?.dia ?? 'Lun');
  const [km, setKm] = useState(String(paramsIniciales?.km ?? 0));
  const [minutos, setMinutos] = useState(String(paramsIniciales?.minutos ?? 0));
  const [reps, setReps] = useState(String(paramsIniciales?.reps ?? 0));
  const [distSerieM, setDistSerieM] = useState(String(paramsIniciales?.distSerieM ?? 0));
  const [descansoSeg, setDescansoSeg] = useState(String(paramsIniciales?.descansoSeg ?? 0));
  const [totalKm, setTotalKm] = useState(String(paramsIniciales?.totalKm ?? 0));
  const [kmRitmoObjetivo, setKmRitmoObjetivo] = useState(String(paramsIniciales?.kmRitmoObjetivo ?? 0));
  const [entradaKm, setEntradaKm] = useState(String(sesion?.entrada_en_calor.distanciaKm ?? 0));
  const [entradaMin, setEntradaMin] = useState(String(sesion?.entrada_en_calor.tiempoMin ?? 0));
  const [enfriamientoKm, setEnfriamientoKm] = useState(String(sesion?.enfriamiento.distanciaKm ?? 0));
  const [enfriamientoMin, setEnfriamientoMin] = useState(String(sesion?.enfriamiento.tiempoMin ?? 0));

  if (!plan || !semana || !sesion) {
    return (
      <View style={styles.container}>
        <Text style={{ color: C.text2, padding: 20 }}>Sesión no encontrada.</Text>
      </View>
    );
  }

  function guardar() {
    const otraSesionMismoDia = semana!.sesiones.some(s => s.id !== sesion!.id && s.dia === dia);
    if (otraSesionMismoDia) {
      toast('Día ocupado', 'Ya hay otra sesión ese día esta semana. Elegí otro día.');
      return;
    }

    const nuevaFecha = toISODate(fechaParaDia(parseISODateLocal(semana!.fechaInicio), dia));

    const sesionActualizada = reconstruirSesion({
      base: sesion!,
      fecha: nuevaFecha,
      params: {
        km: parseFloat(km) || 0,
        minutos: parseFloat(minutos) || 0,
        reps: parseInt(reps, 10) || 0,
        distSerieM: parseFloat(distSerieM) || 0,
        descansoSeg: parseInt(descansoSeg, 10) || 0,
        totalKm: parseFloat(totalKm) || 0,
        kmRitmoObjetivo: parseFloat(kmRitmoObjetivo) || 0,
      },
      entradaKm: parseFloat(entradaKm) || 0,
      entradaMin: parseFloat(entradaMin) || 0,
      enfriamientoKm: parseFloat(enfriamientoKm) || 0,
      enfriamientoMin: parseFloat(enfriamientoMin) || 0,
      ritmos: plan!.ritmos,
    });

    const nuevasSesiones = semana!.sesiones
      .map(s => s.id === sesion!.id ? sesionActualizada : s)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const nuevaSemana = {
      ...semana!,
      sesiones: nuevasSesiones,
      kilometrajeTotalKm: Math.round(nuevasSesiones.reduce((acc, s) => acc + s.distanciaTotalKm, 0) * 10) / 10,
    };

    const nuevasSemanas = plan!.semanas.map((s, i) => i === semanaIdx ? nuevaSemana : s);
    updatePlan({ ...plan!, semanas: nuevasSemanas });
    router.back();
  }

  function eliminarSesion() {
    confirm('Eliminar sesión', '¿Eliminar esta sesión del plan?', () => {
      const nuevasSesiones = semana!.sesiones.filter(s => s.id !== sesion!.id);
      const nuevaSemana = {
        ...semana!,
        sesiones: nuevasSesiones,
        kilometrajeTotalKm: Math.round(nuevasSesiones.reduce((acc, s) => acc + s.distanciaTotalKm, 0) * 10) / 10,
      };
      const nuevasSemanas = plan!.semanas.map((s, i) => i === semanaIdx ? nuevaSemana : s);
      updatePlan({ ...plan!, semanas: nuevasSemanas });
      router.replace({ pathname: '/atletismo-plan-detail', params: { id: String(plan!.id) } } as any);
    });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar sesión</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <SectionTitle label={sesion.nombre} />

          <FieldLabel text="Día de la semana" C={C} />
          <View style={styles.diasRow}>
            {DIAS_ORDEN.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.diaChip, dia === d && styles.diaChipActive]}
                onPress={() => setDia(d)}
              >
                <Text style={[styles.diaChipText, dia === d && styles.diaChipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {(sesion.tipo === 'fondo' || sesion.tipo === 'tempo') && (
            <>
              <FieldLabel text="Distancia (km)" C={C} />
              <TextInput style={styles.input} value={km} onChangeText={setKm} keyboardType="numeric" />
            </>
          )}

          {sesion.tipo === 'fartlek' && (
            <>
              <FieldLabel text="Duración (min)" C={C} />
              <TextInput style={styles.input} value={minutos} onChangeText={setMinutos} keyboardType="numeric" />
            </>
          )}

          {(sesion.tipo === 'series' || sesion.tipo === 'cuestas') && (
            <>
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <FieldLabel text="Repeticiones" C={C} />
                  <TextInput style={styles.input} value={reps} onChangeText={setReps} keyboardType="numeric" />
                </View>
                <View style={{ width: 10 }} />
                <View style={{ flex: 1 }}>
                  <FieldLabel text="Distancia c/u (m)" C={C} />
                  <TextInput style={styles.input} value={distSerieM} onChangeText={setDistSerieM} keyboardType="numeric" />
                </View>
              </View>
              <FieldLabel text="Descanso entre repeticiones (s)" C={C} />
              <TextInput style={styles.input} value={descansoSeg} onChangeText={setDescansoSeg} keyboardType="numeric" />
            </>
          )}

          {sesion.tipo === 'tirada_larga_especifica' && (
            <>
              <FieldLabel text="Distancia total (km)" C={C} />
              <TextInput style={styles.input} value={totalKm} onChangeText={setTotalKm} keyboardType="numeric" />
              <FieldLabel text="Km a ritmo objetivo de carrera" C={C} />
              <TextInput style={styles.input} value={kmRitmoObjetivo} onChangeText={setKmRitmoObjetivo} keyboardType="numeric" />
            </>
          )}

          <SectionTitle label="Entrada en calor" />
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <FieldLabel text="Distancia (km)" C={C} />
              <TextInput style={styles.input} value={entradaKm} onChangeText={setEntradaKm} keyboardType="numeric" />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <FieldLabel text="Duración (min)" C={C} />
              <TextInput style={styles.input} value={entradaMin} onChangeText={setEntradaMin} keyboardType="numeric" />
            </View>
          </View>

          <SectionTitle label="Enfriamiento" />
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <FieldLabel text="Distancia (km)" C={C} />
              <TextInput style={styles.input} value={enfriamientoKm} onChangeText={setEnfriamientoKm} keyboardType="numeric" />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <FieldLabel text="Duración (min)" C={C} />
              <TextInput style={styles.input} value={enfriamientoMin} onChangeText={setEnfriamientoMin} keyboardType="numeric" />
            </View>
          </View>

          <Btn label="Guardar cambios ✓" onPress={guardar} style={{ marginTop: 20 }} />
          <Btn label="Eliminar esta sesión" variant="danger" onPress={eliminarSesion} />
          <Btn label="Cancelar" variant="ghost" onPress={() => router.back()} />
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
    backText: { color: C.text, fontSize: 18 },
    title: { flex: 1, fontSize: font.xxl, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
    scroll: { flex: 1, paddingHorizontal: 16 },
    input: { backgroundColor: C.s2, borderRadius: radius.sm, borderWidth: 1.5, borderColor: C.s3, padding: 12, color: C.text, fontSize: font.md, marginBottom: 10 },
    row2: { flexDirection: 'row' },
    diasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    diaChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.full, backgroundColor: C.s2, borderWidth: 1.5, borderColor: C.s2 },
    diaChipActive: { backgroundColor: 'rgba(232,255,71,0.13)', borderColor: C.acc },
    diaChipText: { color: C.text2, fontWeight: '700', fontSize: font.sm },
    diaChipTextActive: { color: C.acc },
  });
}
