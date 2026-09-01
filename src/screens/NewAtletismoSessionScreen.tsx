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
import { AtletismoExerciseType, DiaSemana } from '../data/atletismoTypes';
import { NOMBRES_TIPO, crearSesion } from '../utils/atletismoSessionBuilders';
import { DIAS_ORDEN, fechaParaDia, parseISODateLocal, toISODate } from '../utils/atletismoDate';
import { toast } from '../utils/webCompat';

const TIPOS: AtletismoExerciseType[] = ['fondo', 'series', 'fartlek', 'tempo', 'cuestas', 'tirada_larga_especifica'];

function FieldLabel({ text, C }: { text: string; C: ReturnType<typeof useColors> }) {
  return <Text style={{ fontSize: font.xs, color: C.text2, fontWeight: '700', letterSpacing: 0.5, marginBottom: 5, marginTop: 6 }}>{text.toUpperCase()}</Text>;
}

export default function NewAtletismoSessionScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { planId, semanaNumero, dia: diaParam } = useLocalSearchParams<{ planId?: string; semanaNumero?: string; dia?: string }>();
  const { plans, updatePlan } = useAtletismoContext();

  const plan = planId ? plans.find(p => p.id === Number(planId)) : undefined;
  const semanaIdx = plan?.semanas.findIndex(s => s.numero === Number(semanaNumero)) ?? -1;
  const semana = plan && semanaIdx >= 0 ? plan.semanas[semanaIdx] : undefined;

  const [tipo, setTipo] = useState<AtletismoExerciseType>('fondo');
  const [dia, setDia] = useState<DiaSemana>((DIAS_ORDEN.includes(diaParam as DiaSemana) ? diaParam : 'Lun') as DiaSemana);
  const [km, setKm] = useState('8');
  const [minutos, setMinutos] = useState('25');
  const [reps, setReps] = useState('6');
  const [distSerieM, setDistSerieM] = useState('1000');
  const [descansoSeg, setDescansoSeg] = useState('120');
  const [totalKm, setTotalKm] = useState('12');
  const [kmRitmoObjetivo, setKmRitmoObjetivo] = useState('3');
  const [entradaKm, setEntradaKm] = useState('2');
  const [entradaMin, setEntradaMin] = useState('12');
  const [enfriamientoKm, setEnfriamientoKm] = useState('1.2');
  const [enfriamientoMin, setEnfriamientoMin] = useState('8');

  if (!plan || !semana) {
    return (
      <View style={styles.container}>
        <Text style={{ color: C.text2, padding: 20 }}>Semana no encontrada.</Text>
      </View>
    );
  }

  function guardar() {
    const yaHaySesion = semana!.sesiones.some(s => s.dia === dia);
    if (yaHaySesion) {
      toast('Día ocupado', 'Ya hay una sesión ese día. Elegí otro día, o editá/eliminá la existente.');
      return;
    }

    const fecha = toISODate(fechaParaDia(parseISODateLocal(semana!.fechaInicio), dia));
    const idsExistentes = plan!.semanas.flatMap(s => s.sesiones.map(x => x.id));
    const nuevoId = (idsExistentes.length > 0 ? Math.max(...idsExistentes) : 0) + 1;

    const nuevaSesion = crearSesion({
      id: nuevoId,
      tipo,
      semana: semana!.numero,
      fase: semana!.fase,
      fecha,
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

    const nuevasSesiones = [...semana!.sesiones, nuevaSesion].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const nuevaSemana = {
      ...semana!,
      sesiones: nuevasSesiones,
      kilometrajeTotalKm: Math.round(nuevasSesiones.reduce((acc, s) => acc + s.distanciaTotalKm, 0) * 10) / 10,
    };
    const nuevasSemanas = plan!.semanas.map((s, i) => i === semanaIdx ? nuevaSemana : s);
    updatePlan({ ...plan!, semanas: nuevasSemanas });
    router.replace({ pathname: '/atletismo-plan-detail', params: { id: String(plan!.id) } } as any);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nueva sesión · Semana {semana.numero}</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <FieldLabel text="Tipo de sesión" C={C} />
          <View style={styles.diasRow}>
            {TIPOS.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.diaChip, tipo === t && styles.diaChipActive]}
                onPress={() => setTipo(t)}
              >
                <Text style={[styles.diaChipText, tipo === t && styles.diaChipTextActive]}>{NOMBRES_TIPO[t]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FieldLabel text="Día de la semana" C={C} />
          <View style={styles.diasRow}>
            {DIAS_ORDEN.map(d => {
              const ocupado = semana!.sesiones.some(s => s.dia === d);
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.diaChip, dia === d && styles.diaChipActive, ocupado && styles.diaChipDisabled]}
                  onPress={() => setDia(d)}
                >
                  <Text style={[styles.diaChipText, dia === d && styles.diaChipTextActive]}>{d}{ocupado ? ' •' : ''}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {(tipo === 'fondo' || tipo === 'tempo') && (
            <>
              <FieldLabel text="Distancia (km)" C={C} />
              <TextInput style={styles.input} value={km} onChangeText={setKm} keyboardType="numeric" />
            </>
          )}

          {tipo === 'fartlek' && (
            <>
              <FieldLabel text="Duración (min)" C={C} />
              <TextInput style={styles.input} value={minutos} onChangeText={setMinutos} keyboardType="numeric" />
            </>
          )}

          {(tipo === 'series' || tipo === 'cuestas') && (
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

          {tipo === 'tirada_larga_especifica' && (
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

          <Btn label="Agregar sesión ✓" onPress={guardar} style={{ marginTop: 20 }} />
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
    title: { flex: 1, fontSize: font.xl, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
    scroll: { flex: 1, paddingHorizontal: 16 },
    input: { backgroundColor: C.s2, borderRadius: radius.sm, borderWidth: 1.5, borderColor: C.s3, padding: 12, color: C.text, fontSize: font.md, marginBottom: 10 },
    row2: { flexDirection: 'row' },
    diasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    diaChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.full, backgroundColor: C.s2, borderWidth: 1.5, borderColor: C.s2 },
    diaChipActive: { backgroundColor: 'rgba(232,255,71,0.13)', borderColor: C.acc },
    diaChipDisabled: { opacity: 0.5 },
    diaChipText: { color: C.text2, fontWeight: '700', fontSize: font.sm },
    diaChipTextActive: { color: C.acc },
  });
}
