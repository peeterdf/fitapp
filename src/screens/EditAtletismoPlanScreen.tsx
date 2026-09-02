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
import { ObjetivoCarrera } from '../data/atletismoTypes';
import { agregarSemana } from '../utils/atletismoPlanGenerator';
import { calcularRitmos, isValidDuration } from '../utils/atletismoPace';
import { confirm, toast } from '../utils/webCompat';

function FieldLabel({ text, C }: { text: string; C: ReturnType<typeof useColors> }) {
  return <Text style={{ fontSize: font.xs, color: C.text2, fontWeight: '700', letterSpacing: 0.5, marginBottom: 5, marginTop: 6 }}>{text.toUpperCase()}</Text>;
}

export default function EditAtletismoPlanScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { plans, updatePlan } = useAtletismoContext();

  const plan = id ? plans.find(p => p.id === Number(id)) : undefined;

  const [objetivoPrincipal, setObjetivoPrincipal] = useState<ObjetivoCarrera>(plan?.inputs.objetivo_principal ?? '10k');
  const [fechaObjetivo, setFechaObjetivo] = useState(plan?.inputs.fecha_objetivo ?? '');
  const [tiempoActual10k, setTiempoActual10k] = useState(plan?.inputs.tiempo_actual_10k ?? '');

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={{ color: C.text2, padding: 20 }}>Plan no encontrado.</Text>
      </View>
    );
  }

  function guardar() {
    if (!isValidDuration(tiempoActual10k)) {
      toast('Tiempo inválido', 'Ingresá tu tiempo actual en 10k como MM:SS o HH:MM:SS, ej. 48:30.');
      return;
    }
    const ritmos = calcularRitmos(tiempoActual10k.trim(), objetivoPrincipal);
    updatePlan({
      ...plan!,
      inputs: { ...plan!.inputs, objetivo_principal: objetivoPrincipal, fecha_objetivo: fechaObjetivo.trim(), tiempo_actual_10k: tiempoActual10k.trim() },
      ritmos,
    });
    router.back();
  }

  function agregarSemanaVacia() {
    const nuevaSemana = agregarSemana(plan!);
    updatePlan({ ...plan!, semanas: [...plan!.semanas, nuevaSemana] });
  }

  function eliminarUltimaSemana() {
    if (plan!.semanas.length <= 1) return;
    const ultima = plan!.semanas[plan!.semanas.length - 1];
    confirm(
      'Eliminar última semana',
      ultima.sesiones.length > 0
        ? `La semana ${ultima.numero} tiene ${ultima.sesiones.length} sesión(es) cargada(s). ¿Eliminarla de todos modos?`
        : `¿Eliminar la semana ${ultima.numero} (vacía)?`,
      () => updatePlan({ ...plan!, semanas: plan!.semanas.slice(0, -1) }),
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar plan</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <SectionTitle label="Objetivo" />

          <FieldLabel text="Objetivo principal" C={C} />
          <View style={styles.segmentRow}>
            {(['10k', '21k'] as ObjetivoCarrera[]).map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.segment, objetivoPrincipal === opt && styles.segmentActive]}
                onPress={() => setObjetivoPrincipal(opt)}
              >
                <Text style={[styles.segmentText, objetivoPrincipal === opt && styles.segmentTextActive]}>{opt.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FieldLabel text="Fecha de la carrera (AAAA-MM-DD)" C={C} />
          <TextInput
            style={styles.input}
            placeholder="2026-09-20"
            placeholderTextColor={C.text3}
            value={fechaObjetivo}
            onChangeText={setFechaObjetivo}
          />
          <Text style={styles.hint}>Cambiar esta fecha no reordena ni agrega/quita semanas automáticamente — usá los botones de abajo para eso.</Text>

          <FieldLabel text="Tiempo actual en 10k (MM:SS o HH:MM:SS)" C={C} />
          <TextInput
            style={styles.input}
            placeholder="48:30"
            placeholderTextColor={C.text3}
            value={tiempoActual10k}
            onChangeText={setTiempoActual10k}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.hint}>Recalcula los ritmos del plan (fondo/tempo/series/objetivo). No cambia el texto ya guardado en sesiones existentes.</Text>

          <Btn label="Guardar cambios ✓" onPress={guardar} style={{ marginTop: 16 }} />

          <SectionTitle label="Semanas" />
          <Text style={styles.hint}>El plan tiene {plan.semanas.length} semana(s).</Text>
          <Btn label="+ Agregar semana" variant="secondary" onPress={agregarSemanaVacia} />
          <Btn
            label="Eliminar última semana"
            variant="danger"
            onPress={eliminarUltimaSemana}
            disabled={plan.semanas.length <= 1}
          />

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
  });
}
