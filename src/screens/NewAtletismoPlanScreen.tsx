import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Btn, SectionTitle } from '../components/UI';
import { useAtletismoContext } from '../contexts/AtletismoContext';
import { AtletismoPlanInputs, DiaSemana, ObjetivoCarrera } from '../data/atletismoTypes';
import { generarPlan } from '../utils/atletismoPlanGenerator';
import { isValidDuration } from '../utils/atletismoPace';

const DIAS: DiaSemana[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function FieldLabel({ text, C }: { text: string; C: ReturnType<typeof useColors> }) {
  return <Text style={{ fontSize: font.xs, color: C.text2, fontWeight: '700', letterSpacing: 0.5, marginBottom: 5, marginTop: 6 }}>{text.toUpperCase()}</Text>;
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isValidFutureDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  if (parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed.getTime() > today.getTime();
}

export default function NewAtletismoPlanScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { addPlan } = useAtletismoContext();

  const [objetivoPrincipal, setObjetivoPrincipal] = useState<ObjetivoCarrera>('10k');
  const [fechaObjetivo, setFechaObjetivo] = useState(todayPlus(56));
  const [objetivoSecundario, setObjetivoSecundario] = useState<ObjetivoCarrera | undefined>(undefined);
  const [tiempoActual10k, setTiempoActual10k] = useState('');
  const [diasPorSemana, setDiasPorSemana] = useState('3');
  const [diasPreferidos, setDiasPreferidos] = useState<DiaSemana[]>([]);

  function toggleDiaPreferido(dia: DiaSemana) {
    setDiasPreferidos(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
  }

  function crearPlan() {
    if (!isValidFutureDate(fechaObjetivo)) {
      Alert.alert('Fecha inválida', 'Ingresá la fecha objetivo como AAAA-MM-DD, en el futuro.');
      return;
    }
    if (!isValidDuration(tiempoActual10k)) {
      Alert.alert('Tiempo inválido', 'Ingresá tu tiempo actual en 10k como MM:SS o HH:MM:SS, ej. 48:30.');
      return;
    }
    const dias = parseInt(diasPorSemana, 10);
    if (!Number.isFinite(dias) || dias < 1 || dias > 7) {
      Alert.alert('Días inválidos', 'Ingresá entre 1 y 7 días disponibles por semana.');
      return;
    }

    const inputs: AtletismoPlanInputs = {
      objetivo_principal: objetivoPrincipal,
      fecha_objetivo: fechaObjetivo,
      objetivo_secundario: objetivoSecundario,
      tiempo_actual_10k: tiempoActual10k.trim(),
      dias_disponibles_por_semana: dias,
      dias_preferidos: diasPreferidos.length > 0 ? diasPreferidos : undefined,
    };

    const plan = generarPlan(inputs);
    addPlan(plan);
    router.replace({ pathname: '/atletismo-plan-detail', params: { id: String(plan.id) } } as any);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo Plan de Atletismo</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <SectionTitle label="Objetivo" />

          <FieldLabel text="Objetivo principal" C={C} />
          <View style={styles.segmentRow}>
            {(['10k', '21k'] as ObjetivoCarrera[]).map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.segment, objetivoPrincipal === opt && styles.segmentActive]}
                onPress={() => {
                  setObjetivoPrincipal(opt);
                  if (objetivoSecundario === opt) setObjetivoSecundario(undefined);
                }}
              >
                <Text style={[styles.segmentText, objetivoPrincipal === opt && styles.segmentTextActive]}>{opt.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FieldLabel text="Fecha objetivo (AAAA-MM-DD)" C={C} />
          <TextInput
            style={styles.input}
            placeholder="2026-11-15"
            placeholderTextColor={C.text3}
            value={fechaObjetivo}
            onChangeText={setFechaObjetivo}
          />

          <FieldLabel text="Objetivo secundario (opcional)" C={C} />
          <View style={styles.segmentRow}>
            <TouchableOpacity
              style={[styles.segment, !objetivoSecundario && styles.segmentActive]}
              onPress={() => setObjetivoSecundario(undefined)}
            >
              <Text style={[styles.segmentText, !objetivoSecundario && styles.segmentTextActive]}>Ninguno</Text>
            </TouchableOpacity>
            {(['10k', '21k'] as ObjetivoCarrera[]).filter(o => o !== objetivoPrincipal).map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.segment, objetivoSecundario === opt && styles.segmentActive]}
                onPress={() => setObjetivoSecundario(opt)}
              >
                <Text style={[styles.segmentText, objetivoSecundario === opt && styles.segmentTextActive]}>{opt.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionTitle label="Nivel actual" />

          <FieldLabel text="Tiempo actual en 10k (MM:SS o HH:MM:SS)" C={C} />
          <TextInput
            style={styles.input}
            placeholder="48:30"
            placeholderTextColor={C.text3}
            value={tiempoActual10k}
            onChangeText={setTiempoActual10k}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.hint}>Se usa para calcular tus ritmos de fondo, tempo, series y ritmo objetivo de carrera.</Text>

          <SectionTitle label="Disponibilidad" />

          <FieldLabel text="Días disponibles por semana" C={C} />
          <TextInput
            style={styles.input}
            placeholder="3"
            placeholderTextColor={C.text3}
            value={diasPorSemana}
            onChangeText={setDiasPorSemana}
            keyboardType="numeric"
          />

          <FieldLabel text="Días preferidos (opcional)" C={C} />
          <View style={styles.diasRow}>
            {DIAS.map(dia => {
              const active = diasPreferidos.includes(dia);
              return (
                <TouchableOpacity
                  key={dia}
                  style={[styles.diaChip, active && styles.diaChipActive]}
                  onPress={() => toggleDiaPreferido(dia)}
                >
                  <Text style={[styles.diaChipText, active && styles.diaChipTextActive]}>{dia}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.hint}>Si no elegís días, el plan los distribuye automáticamente.</Text>

          <Btn label="Generar plan ✓" onPress={crearPlan} style={{ marginTop: 24 }} />
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
    input: { backgroundColor: C.s2, borderRadius: radius.sm, borderWidth: 1.5, borderColor: C.s3, padding: 12, color: C.text, fontSize: font.md, marginBottom: 6 },
    hint: { fontSize: font.xs, color: C.text3, marginBottom: 10, fontStyle: 'italic' },
    segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    segment: { flex: 1, backgroundColor: C.s2, borderRadius: radius.sm, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: C.s2 },
    segmentActive: { backgroundColor: 'rgba(232,255,71,0.13)', borderColor: C.acc },
    segmentText: { color: C.text2, fontWeight: '700', fontSize: font.md },
    segmentTextActive: { color: C.acc },
    diasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
    diaChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.full, backgroundColor: C.s2, borderWidth: 1.5, borderColor: C.s2 },
    diaChipActive: { backgroundColor: 'rgba(232,255,71,0.13)', borderColor: C.acc },
    diaChipText: { color: C.text2, fontWeight: '700', fontSize: font.sm },
    diaChipTextActive: { color: C.acc },
  });
}
