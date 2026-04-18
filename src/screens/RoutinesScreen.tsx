import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Tag, Loading } from '../components/UI';
import { useRoutinesContext } from '../contexts/RoutinesContext';
import { useExercisesContext } from '../contexts/ExercisesContext';
import { MUSCLE_EMOJIS } from '../data/data';

export default function RoutinesScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { routines, loading } = useRoutinesContext();
  const { exercises } = useExercisesContext();

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rutinas</Text>
        <Text style={styles.subtitle}>{routines.length} {routines.length === 1 ? 'rutina' : 'rutinas'}</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {routines.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text style={styles.emptyTitle}>Aún no tenés rutinas</Text>
            <Text style={styles.emptySub}>Tocá + para crear tu primera rutina</Text>
          </View>
        ) : (
          routines.map(routine => {
            const muscles = Array.from(new Set(
              routine.exercises.map(re => exercises.find(e => e.id === re.exId)?.muscle).filter(Boolean)
            )) as string[];
            return (
              <TouchableOpacity key={routine.id} style={styles.card} activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/routine-detail', params: { id: String(routine.id) } })}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{routine.name}</Text>
                    <Text style={styles.cardSub}>
                      {routine.exercises.length} {routine.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                      {routine.duration ? ` · ${routine.duration} min` : ''}
                      {routine.days ? ` · ${routine.days}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </View>
                {muscles.length > 0 && (
                  <View style={styles.tags}>
                    {muscles.slice(0, 4).map(m => <Tag key={m} label={`${MUSCLE_EMOJIS[m] || ''} ${m}`} />)}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-routine' as any)} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    title: { fontSize: font.xxl, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
    subtitle: { fontSize: font.sm, color: C.text2, marginTop: 2 },
    scroll: { flex: 1, paddingHorizontal: 16 },
    card: { backgroundColor: C.s1, borderRadius: radius.md, padding: 14, marginBottom: 10 },
    cardRow: { flexDirection: 'row', alignItems: 'center' },
    cardTitle: { fontSize: font.lg, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
    cardSub: { fontSize: font.sm, color: C.text2, marginTop: 4 },
    arrow: { color: C.text3, fontSize: 26, marginLeft: 8 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
    empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 24 },
    emptyTitle: { color: C.text, fontSize: font.lg, fontWeight: '700', marginBottom: 4 },
    emptySub: { color: C.text2, fontSize: font.md, textAlign: 'center' },
    fab: { position: 'absolute', bottom: 86, right: 16, width: 54, height: 54, borderRadius: 27, backgroundColor: C.acc, alignItems: 'center', justifyContent: 'center', elevation: 8 },
    fabText: { fontSize: 28, fontWeight: '900', color: C.black },
  });
}
