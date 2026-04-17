import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C, radius, font } from '../data/theme';
import { Btn, SectionTitle } from '../components/UI';
import { useExercisesContext } from '../contexts/ExercisesContext';
import { useRoutinesContext } from '../contexts/RoutinesContext';
import { MUSCLE_EMOJIS } from '../data/data';

export default function RoutineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { exercises } = useExercisesContext();
  const { routines, deleteRoutine } = useRoutinesContext();

  const routine = id ? routines.find(r => r.id === Number(id)) : routines[0];

  if (!routine) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Rutina</Text>
        </View>
        <View style={styles.empty}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>🤷</Text>
          <Text style={{ color: C.text2, fontSize: font.md }}>No se encontró la rutina.</Text>
        </View>
      </View>
    );
  }

  const items = routine.exercises.map(item => ({
    ...item,
    ex: exercises.find(e => e.id === item.exId),
  })).filter(i => i.ex);

  function askDelete() {
    Alert.alert('Eliminar rutina', `¿Seguro que querés eliminar "${routine!.name}"?`, [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { deleteRoutine(routine!.id); router.back(); } },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{routine.name}</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/new-routine' as any, params: { id: String(routine.id) } })}
          style={styles.editBtn}
        >
          <Text style={styles.editText}>✎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{items.length}</Text>
            <Text style={styles.statLbl}>ejercicios</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: C.acc2 }]}>{routine.duration || '—'}</Text>
            <Text style={styles.statLbl}>min aprox</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { fontSize: 16 }]}>{routine.days || '—'}</Text>
            <Text style={styles.statLbl}>días</Text>
          </View>
        </View>
        {!!routine.desc && <Text style={styles.routineDesc}>{routine.desc}</Text>}

        <SectionTitle label="Ejercicios en orden" />

        {items.map((item, i) => (
          <View key={i} style={styles.exRow}>
            <Text style={styles.exEmoji}>{MUSCLE_EMOJIS[item.ex!.muscle] || '💪'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.exName}>{item.ex!.name}</Text>
              <Text style={styles.exSub}>{item.sets}×{item.reps} · {item.weight} · {item.rest}s pausa</Text>
            </View>
            <Text style={styles.drag}>⠿</Text>
          </View>
        ))}

        {items.length === 0 && (
          <Text style={{ color: C.text3, textAlign: 'center', marginVertical: 20 }}>
            Esta rutina no tiene ejercicios todavía.
          </Text>
        )}

        <Btn
          label="▶  Empezar Rutina"
          onPress={() => router.push({ pathname: '/workout', params: { routineId: String(routine.id) } })}
          style={{ marginTop: 16 }}
          disabled={items.length === 0}
        />
        <Btn
          label="✎ Editar rutina"
          variant="secondary"
          onPress={() => router.push({ pathname: '/new-routine' as any, params: { id: String(routine.id) } })}
        />
        <Btn label="Eliminar rutina" variant="danger" onPress={askDelete} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
  backText: { color: C.text, fontSize: 18 },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
  editText: { color: C.text, fontSize: 16 },
  title: { flex: 1, fontSize: font.xxl, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  statsCard: { backgroundColor: C.s1, borderRadius: radius.md, padding: 16, flexDirection: 'row', gap: 20, marginBottom: 8 },
  statItem: {},
  statVal: { fontSize: 22, fontWeight: '900', color: C.acc },
  statLbl: { fontSize: font.xs, color: C.text2 },
  routineDesc: { fontSize: font.sm, color: C.text2, marginBottom: 4 },
  exRow: { backgroundColor: C.s1, borderRadius: radius.sm, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  exEmoji: { fontSize: 28, width: 40, textAlign: 'center' },
  exName: { fontSize: font.md, fontWeight: '700', color: C.text },
  exSub: { fontSize: font.sm, color: C.text2, marginTop: 2 },
  drag: { color: C.text3, fontSize: 18 },
  empty: { alignItems: 'center', marginTop: 80 },
});
