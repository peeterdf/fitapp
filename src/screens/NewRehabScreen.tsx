import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Btn, SectionTitle } from '../components/UI';
import { useRehabContext } from '../contexts/RehabContext';
import { RehabBloque, RehabExercise } from '../data/types';

const BLANK_EX: RehabExercise = {
  name: '', emoji: '💪', reps: '×10 repeticiones',
  desc: '', equip: [], tip: '', youtube: '',
};

function FieldLabel({ text, C }: { text: string; C: ReturnType<typeof useColors> }) {
  return <Text style={{ fontSize: font.xs, color: C.text2, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4, marginTop: 8 }}>{text.toUpperCase()}</Text>;
}

export default function NewRehabScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { idx: idxParam } = useLocalSearchParams<{ idx?: string }>();
  const { bloques, addBloque, updateBloque, deleteBloque } = useRehabContext();

  const editIdx = idxParam !== undefined ? Number(idxParam) : -1;
  const editing = editIdx >= 0 ? bloques[editIdx] : undefined;

  const [bName, setBName] = useState(editing?.name ?? '');
  const [vueltas, setVueltas] = useState(String(editing?.vueltas ?? 1));
  const [exercises, setExercises] = useState<RehabExercise[]>(
    editing?.exercises ?? [{ ...BLANK_EX }]
  );

  function updateEx(i: number, patch: Partial<RehabExercise>) {
    setExercises(prev => prev.map((ex, j) => j === i ? { ...ex, ...patch } : ex));
  }

  function addEx() {
    setExercises(prev => [...prev, { ...BLANK_EX }]);
  }

  function removeEx(i: number) {
    if (exercises.length <= 1) { Alert.alert('Mínimo 1', 'El bloque necesita al menos un ejercicio.'); return; }
    setExercises(prev => prev.filter((_, j) => j !== i));
  }

  function moveEx(i: number, dir: -1 | 1) {
    setExercises(prev => {
      const next = [...prev];
      const target = i + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  }

  function save() {
    if (!bName.trim()) { Alert.alert('Nombre requerido', 'Escribí un nombre para el bloque.'); return; }
    if (exercises.some(e => !e.name.trim())) { Alert.alert('Nombre requerido', 'Todos los ejercicios necesitan un nombre.'); return; }
    const bloque: RehabBloque = {
      name: bName.trim(),
      vueltas: Math.max(1, parseInt(vueltas) || 1),
      exercises: exercises.map(e => ({
        ...e,
        name: e.name.trim(),
        equip: e.equip,
      })),
    };
    if (editing && editIdx >= 0) updateBloque(editIdx, bloque);
    else addBloque(bloque);
    router.back();
  }

  function askDelete() {
    if (!editing || editIdx < 0) return;
    Alert.alert('Eliminar bloque', `¿Eliminar "${editing.name}"?`, [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { deleteBloque(editIdx); router.back(); } },
    ]);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{editing ? 'Editar bloque' : 'Nuevo bloque'}</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <FieldLabel text="Nombre del bloque" C={C} />
          <TextInput
            style={styles.input}
            placeholder="ej. Activación"
            placeholderTextColor={C.text3}
            value={bName}
            onChangeText={setBName}
          />

          <FieldLabel text="Vueltas (rondas)" C={C} />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor={C.text3}
            value={vueltas}
            onChangeText={setVueltas}
          />

          <SectionTitle label={`Ejercicios (${exercises.length})`} />

          {exercises.map((ex, i) => (
            <View key={i} style={styles.exCard}>
              <View style={styles.exCardHeader}>
                <Text style={styles.exNum}>Ejercicio {i + 1}</Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <TouchableOpacity onPress={() => moveEx(i, -1)} disabled={i === 0} style={[styles.smallBtn, i === 0 && { opacity: 0.3 }]}>
                    <Text style={styles.smallBtnText}>↑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => moveEx(i, 1)} disabled={i === exercises.length - 1} style={[styles.smallBtn, i === exercises.length - 1 && { opacity: 0.3 }]}>
                    <Text style={styles.smallBtnText}>↓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeEx(i)} style={[styles.smallBtn, { backgroundColor: 'rgba(255,85,85,0.13)' }]}>
                    <Text style={[styles.smallBtnText, { color: C.danger }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <FieldLabel text="Nombre" C={C} />
                  <TextInput
                    style={styles.input}
                    placeholder="ej. Movilidad de cadera"
                    placeholderTextColor={C.text3}
                    value={ex.name}
                    onChangeText={v => updateEx(i, { name: v })}
                  />
                </View>
                <View style={{ width: 64 }}>
                  <FieldLabel text="Emoji" C={C} />
                  <TextInput
                    style={[styles.input, { textAlign: 'center' }]}
                    placeholder="💪"
                    placeholderTextColor={C.text3}
                    value={ex.emoji}
                    onChangeText={v => updateEx(i, { emoji: v })}
                  />
                </View>
              </View>

              <FieldLabel text="Repeticiones / Duración" C={C} />
              <TextInput
                style={styles.input}
                placeholder="×10 repeticiones"
                placeholderTextColor={C.text3}
                value={ex.reps}
                onChangeText={v => updateEx(i, { reps: v })}
              />

              <FieldLabel text="Descripción" C={C} />
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                placeholder="Describí la ejecución..."
                placeholderTextColor={C.text3}
                value={ex.desc}
                onChangeText={v => updateEx(i, { desc: v })}
                multiline
              />

              <FieldLabel text="Equipamiento (separado por comas)" C={C} />
              <TextInput
                style={styles.input}
                placeholder="Silla, Banda roja"
                placeholderTextColor={C.text3}
                value={ex.equip.join(', ')}
                onChangeText={v => updateEx(i, { equip: v.split(',').map(s => s.trim()).filter(Boolean) })}
              />

              <FieldLabel text="Consejo (opcional)" C={C} />
              <TextInput
                style={styles.input}
                placeholder="Tip técnico..."
                placeholderTextColor={C.text3}
                value={ex.tip}
                onChangeText={v => updateEx(i, { tip: v })}
              />
            </View>
          ))}

          <Btn label="+ Agregar ejercicio" variant="secondary" onPress={addEx} style={{ marginTop: 4 }} />
          <Btn label={editing ? 'Guardar cambios ✓' : 'Crear bloque ✓'} onPress={save} style={{ marginTop: 20 }} />
          {editing && <Btn label="Eliminar bloque" variant="danger" onPress={askDelete} />}
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
    title: { fontSize: font.xxl, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
    scroll: { flex: 1, paddingHorizontal: 16 },
    input: { backgroundColor: C.s2, borderRadius: radius.sm, borderWidth: 1.5, borderColor: C.s3, padding: 12, color: C.text, fontSize: font.md, marginBottom: 6 },
    exCard: { backgroundColor: C.s1, borderRadius: radius.md, padding: 12, marginBottom: 10 },
    exCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    exNum: { fontSize: font.sm, fontWeight: '800', color: C.acc },
    smallBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
    smallBtnText: { color: C.text, fontSize: 14, fontWeight: '700' },
  });
}
