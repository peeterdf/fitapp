import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, Modal, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Btn, SectionTitle } from '../components/UI';
import { useRoutinesContext } from '../contexts/RoutinesContext';
import { useExercisesContext } from '../contexts/ExercisesContext';
import { MUSCLE_EMOJIS, ROUTINE_TEMPLATES } from '../data/data';
import { Routine, RoutineExercise } from '../data/types';
import { useFeature } from '../hooks/useFeature';

function FieldLabel({ text, C }: { text: string; C: ReturnType<typeof useColors> }) {
  return <Text style={{ fontSize: font.xs, color: C.text2, fontWeight: '700', letterSpacing: 0.5, marginBottom: 5, marginTop: 6 }}>{text.toUpperCase()}</Text>;
}

export default function NewRoutineScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { routines, addRoutine, updateRoutine, deleteRoutine } = useRoutinesContext();
  const { exercises } = useExercisesContext();

  const editing = id ? routines.find(r => r.id === Number(id)) : undefined;
  const canUseTemplates = useFeature('routine.templates');

  const [name, setName] = useState(editing?.name ?? '');
  const [desc, setDesc] = useState(editing?.desc ?? '');
  const [days, setDays] = useState(editing?.days ?? '');
  const [duration, setDuration] = useState(editing?.duration ?? '');
  const [items, setItems] = useState<RoutineExercise[]>(editing?.exercises ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);

  const pickedIds = useMemo(() => new Set(items.map(i => i.exId)), [items]);

  function applyTemplate(templateId: string) {
    const tpl = ROUTINE_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    const validExercises = tpl.exercises.filter(te => exercises.some(e => e.id === te.exId));
    const missing = tpl.exercises.length - validExercises.length;
    setName(tpl.name);
    setDesc(tpl.desc);
    setDays(tpl.days);
    setDuration(tpl.duration);
    setItems(validExercises);
    setTemplateOpen(false);
    if (missing > 0) {
      Alert.alert('Plantilla aplicada', `${missing} ejercicio${missing > 1 ? 's' : ''} de la plantilla no existe${missing > 1 ? 'n' : ''} en tu biblioteca y ${missing > 1 ? 'fueron omitidos' : 'fue omitido'}.`);
    }
  }

  function addExerciseToRoutine(exId: number) {
    const ex = exercises.find(e => e.id === exId);
    if (!ex) return;
    setItems(prev => [...prev, {
      exId,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight ? `${ex.weight} kg` : '—',
      rest: ex.rest,
      restAfterEx: 60,
    }]);
    setPickerOpen(false);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function moveItem(idx: number, dir: -1 | 1) {
    setItems(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function updateItem(idx: number, patch: Partial<RoutineExercise>) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }

  function toggleSuperset(idx: number) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, isSuperset: !it.isSuperset } : it));
  }

  function save() {
    if (!name.trim()) { Alert.alert('Falta el nombre', 'Escribí un nombre para la rutina.'); return; }
    const routine: Routine = {
      id: editing?.id ?? Date.now(),
      name: name.trim(),
      desc: desc.trim(),
      days: days.trim(),
      duration: duration.trim(),
      exercises: items,
    };
    if (editing) updateRoutine(routine); else addRoutine(routine);
    router.back();
  }

  function askDelete() {
    if (!editing) return;
    Alert.alert('Eliminar rutina', `¿Eliminar "${editing.name}"?`, [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { deleteRoutine(editing.id); router.back(); } },
    ]);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{editing ? 'Editar Rutina' : 'Nueva Rutina'}</Text>
          {!editing && canUseTemplates && (
            <TouchableOpacity onPress={() => setTemplateOpen(true)} style={styles.templateBtn}>
              <Text style={styles.templateBtnText}>Plantilla</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <FieldLabel text="Nombre" C={C} />
          <TextInput
            style={styles.input}
            placeholder="ej. Fuerza A — Upper"
            placeholderTextColor={C.text3}
            value={name}
            onChangeText={setName}
          />

          <FieldLabel text="Descripción" C={C} />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Upper body enfocado en fuerza..."
            placeholderTextColor={C.text3}
            value={desc}
            onChangeText={setDesc}
            multiline
            numberOfLines={2}
          />

          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <FieldLabel text="Días" C={C} />
              <TextInput
                style={styles.input}
                placeholder="Lun / Jue"
                placeholderTextColor={C.text3}
                value={days}
                onChangeText={setDays}
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <FieldLabel text="Duración (min)" C={C} />
              <TextInput
                style={styles.input}
                placeholder="45"
                placeholderTextColor={C.text3}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />
            </View>
          </View>

          <SectionTitle label={`Ejercicios (${items.length})`} />

          {items.length === 0 && (
            <Text style={styles.emptyItems}>Agregá ejercicios con el botón de abajo.</Text>
          )}

          {items.map((it, i) => {
            const ex = exercises.find(e => e.id === it.exId);
            const isLastItem = i === items.length - 1;
            return (
              <View key={`${it.exId}-${i}`}>
                <View style={[styles.itemCard, it.isSuperset && styles.itemCardSuperset]}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemEmoji}>{ex ? MUSCLE_EMOJIS[ex.muscle] || '💪' : '❓'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{ex?.name ?? '(ejercicio eliminado)'}</Text>
                      {ex && <Text style={styles.itemMuscle}>{ex.muscle}</Text>}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      <TouchableOpacity onPress={() => moveItem(i, -1)} disabled={i === 0} style={[styles.smallBtn, i === 0 && { opacity: 0.3 }]}>
                        <Text style={styles.smallBtnText}>↑</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => moveItem(i, 1)} disabled={isLastItem} style={[styles.smallBtn, isLastItem && { opacity: 0.3 }]}>
                        <Text style={styles.smallBtnText}>↓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeItem(i)} style={[styles.smallBtn, { backgroundColor: 'rgba(255,85,85,0.13)' }]}>
                        <Text style={[styles.smallBtnText, { color: C.danger }]}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.itemGrid}>
                    <View style={styles.itemField}>
                      <Text style={styles.miniLabel}>SERIES</Text>
                      <TextInput
                        style={styles.miniInput}
                        value={String(it.sets)}
                        onChangeText={v => updateItem(i, { sets: parseInt(v) || 0 })}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.itemField}>
                      <Text style={styles.miniLabel}>REPS</Text>
                      <TextInput
                        style={styles.miniInput}
                        value={it.reps}
                        onChangeText={v => updateItem(i, { reps: v })}
                        placeholder="8-12"
                        placeholderTextColor={C.text3}
                      />
                    </View>
                    <View style={styles.itemField}>
                      <Text style={styles.miniLabel}>PESO</Text>
                      <TextInput
                        style={styles.miniInput}
                        value={it.weight}
                        onChangeText={v => updateItem(i, { weight: v })}
                        placeholder="80 kg"
                        placeholderTextColor={C.text3}
                      />
                    </View>
                    <View style={styles.itemField}>
                      <Text style={styles.miniLabel}>PAUSA SETS (s)</Text>
                      <TextInput
                        style={styles.miniInput}
                        value={String(it.rest)}
                        onChangeText={v => updateItem(i, { rest: parseInt(v) || 0 })}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* Rest after exercise */}
                  {!isLastItem && !it.isSuperset && (
                    <View style={styles.afterExRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.miniLabel}>PAUSA ENTRE EJERCICIOS (s) · 0 = sin pausa</Text>
                        <TextInput
                          style={styles.miniInput}
                          value={String(it.restAfterEx ?? 60)}
                          onChangeText={v => updateItem(i, { restAfterEx: parseInt(v) || 0 })}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  )}

                  {/* Superset toggle — not available for last exercise */}
                  {!isLastItem && (
                    <TouchableOpacity
                      onPress={() => toggleSuperset(i)}
                      style={[styles.supersetBtn, it.isSuperset && styles.supersetBtnOn]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.supersetText, it.isSuperset && { color: C.acc2 }]}>
                        {it.isSuperset ? '⚡ Superserie activa — sin pausa con el siguiente' : '+ Marcar como superserie con el siguiente'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Superset connector line */}
                {it.isSuperset && !isLastItem && (
                  <View style={styles.supersetConnector}>
                    <View style={[styles.supersetLine, { backgroundColor: C.acc2 }]} />
                    <Text style={[styles.supersetLabel, { color: C.acc2, borderColor: C.acc2 }]}>A+B</Text>
                    <View style={[styles.supersetLine, { backgroundColor: C.acc2 }]} />
                  </View>
                )}
              </View>
            );
          })}

          <Btn
            label="+ Agregar ejercicio"
            variant="secondary"
            onPress={() => setPickerOpen(true)}
            style={{ marginTop: 8 }}
          />

          <Btn label={editing ? 'Guardar cambios ✓' : 'Crear rutina ✓'} onPress={save} style={{ marginTop: 20 }} />
          {editing && <Btn label="Eliminar rutina" variant="danger" onPress={askDelete} />}
          <Btn label="Cancelar" variant="ghost" onPress={() => router.back()} />
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Exercise picker */}
        <Modal visible={pickerOpen} animationType="slide" transparent onRequestClose={() => setPickerOpen(false)}>
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar ejercicio</Text>
                <TouchableOpacity onPress={() => setPickerOpen(false)} style={styles.backBtn}>
                  <Text style={styles.backText}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={exercises}
                keyExtractor={ex => String(ex.id)}
                contentContainerStyle={{ padding: 12 }}
                ListEmptyComponent={
                  <Text style={{ color: C.text2, textAlign: 'center', padding: 20 }}>
                    No hay ejercicios. Creá uno primero desde el tab Ejercicios.
                  </Text>
                }
                renderItem={({ item: ex }) => {
                  const already = pickedIds.has(ex.id);
                  return (
                    <TouchableOpacity
                      style={styles.pickerRow}
                      onPress={() => addExerciseToRoutine(ex.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 24, width: 36 }}>{MUSCLE_EMOJIS[ex.muscle] || '💪'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pickerName}>{ex.name}</Text>
                        <Text style={styles.pickerSub}>{ex.muscle} · {ex.equip}</Text>
                      </View>
                      {already && <Text style={{ color: C.acc, fontSize: 22, fontWeight: '900', paddingHorizontal: 8 }}>+</Text>}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </Modal>

        {/* Template picker */}
        <Modal visible={templateOpen} animationType="slide" transparent onRequestClose={() => setTemplateOpen(false)}>
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Plantillas de rutina</Text>
                <TouchableOpacity onPress={() => setTemplateOpen(false)} style={styles.backBtn}>
                  <Text style={styles.backText}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={ROUTINE_TEMPLATES}
                keyExtractor={t => t.id}
                contentContainerStyle={{ padding: 12 }}
                renderItem={({ item: tpl }) => (
                  <TouchableOpacity
                    style={styles.tplRow}
                    onPress={() => applyTemplate(tpl.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 30, width: 44, textAlign: 'center' }}>{tpl.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tplName}>{tpl.name}</Text>
                      <Text style={styles.tplDesc} numberOfLines={1}>{tpl.desc}</Text>
                      <Text style={styles.tplMeta}>{tpl.exercises.length} ejercicios · {tpl.days} · ~{tpl.duration} min</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
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
    templateBtn: { backgroundColor: 'rgba(71,255,180,0.13)', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
    templateBtnText: { color: C.acc2, fontSize: font.sm, fontWeight: '700' },
    scroll: { flex: 1, paddingHorizontal: 16 },
    input: { backgroundColor: C.s2, borderRadius: radius.sm, borderWidth: 1.5, borderColor: C.s3, padding: 12, color: C.text, fontSize: font.md, marginBottom: 10 },
    textarea: { height: 64, textAlignVertical: 'top' },
    row2: { flexDirection: 'row' },

    emptyItems: { color: C.text3, fontSize: font.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
    itemCard: { backgroundColor: C.s1, borderRadius: radius.md, padding: 12, marginBottom: 4 },
    itemCardSuperset: { borderLeftWidth: 3, borderLeftColor: C.acc2 },
    itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    itemEmoji: { fontSize: 28, width: 36, textAlign: 'center' },
    itemName: { color: C.text, fontSize: font.md, fontWeight: '700' },
    itemMuscle: { color: C.text2, fontSize: font.xs, marginTop: 2 },
    smallBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
    smallBtnText: { color: C.text, fontSize: 14, fontWeight: '700' },
    itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    itemField: { flexBasis: '48%', flexGrow: 1 },
    miniLabel: { fontSize: 10, color: C.text3, fontWeight: '700', letterSpacing: 0.5, marginBottom: 3 },
    miniInput: { backgroundColor: C.s2, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 8, color: C.text, fontSize: font.sm },
    afterExRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.s2 },
    supersetBtn: { marginTop: 10, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: C.s2, alignSelf: 'flex-start' },
    supersetBtnOn: { backgroundColor: 'rgba(71,255,180,0.1)' },
    supersetText: { fontSize: font.xs, color: C.text3, fontWeight: '600' },
    supersetConnector: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 4 },
    supersetLine: { flex: 1, height: 1.5 },
    supersetLabel: { fontSize: 10, fontWeight: '900', borderWidth: 1.5, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: C.bg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, maxHeight: '85%', minHeight: '50%' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: C.s2 },
    modalTitle: { fontSize: font.lg, fontWeight: '800', color: C.text },
    pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.s1, borderRadius: radius.sm, padding: 12, marginBottom: 6 },
    pickerName: { color: C.text, fontSize: font.md, fontWeight: '700' },
    pickerSub: { color: C.text2, fontSize: font.sm, marginTop: 2 },
    tplRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: C.s1, borderRadius: radius.sm, padding: 12, marginBottom: 8 },
    tplName: { color: C.text, fontSize: font.md, fontWeight: '800' },
    tplDesc: { color: C.text2, fontSize: font.sm, marginTop: 2 },
    tplMeta: { color: C.acc, fontSize: font.xs, fontWeight: '700', marginTop: 4 },
  });
}
