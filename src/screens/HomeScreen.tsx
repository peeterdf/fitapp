import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { SectionTitle, Loading } from '../components/UI';
import { useRoutinesContext } from '../contexts/RoutinesContext';
import { useExercisesContext } from '../contexts/ExercisesContext';
import { useRehabContext } from '../contexts/RehabContext';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function todayName(): string {
  return DAYS[new Date().getDay()];
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function matchesToday(days: string): boolean {
  if (!days) return false;
  const today = normalize(todayName());
  return days.split(/[\/,]/).some(d => today.startsWith(normalize(d.trim()).slice(0, 3)));
}

export default function HomeScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { routines, loading: rLoading } = useRoutinesContext();
  const { exercises, loading: eLoading } = useExercisesContext();
  const { bloques } = useRehabContext();

  const today = todayName();
  const quickRoutine = useMemo(
    () => routines.find(r => matchesToday(r.days)) ?? routines[0],
    [routines]
  );

  if (rLoading || eLoading) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.greeting}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hey}>💪 ¡Hola!</Text>
            <Text style={styles.title}>Hoy es <Text style={{ color: C.acc }}>{today}</Text></Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings' as any)} style={styles.settingsBtn}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {quickRoutine ? (
          <TouchableOpacity
            style={styles.quickStart}
            onPress={() => router.push({ pathname: '/workout', params: { routineId: String(quickRoutine.id) } })}
            activeOpacity={0.85}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.qsLabel}>EMPEZAR HOY</Text>
              <Text style={styles.qsName} numberOfLines={1}>{quickRoutine.name}</Text>
              <Text style={styles.qsMeta}>
                {quickRoutine.exercises.length} ej
                {quickRoutine.duration ? ` · ~${quickRoutine.duration} min` : ''}
              </Text>
            </View>
            <Text style={styles.qsPlay}>▶</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyQuick}>
            <Text style={styles.emptyQuickTitle}>Aún no tenés rutinas</Text>
            <Text style={styles.emptyQuickSub}>Creá una desde el tab Rutinas</Text>
          </View>
        )}

        <SectionTitle label="Esta semana" />
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>—</Text>
            <Text style={styles.statLbl}>sesiones</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: C.acc2 }]}>—</Text>
            <Text style={styles.statLbl}>tiempo</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>—</Text>
            <Text style={styles.statLbl}>volumen</Text>
          </View>
        </View>
        <Text style={styles.statsHint}>Se activará cuando registres entrenamientos.</Text>

        <SectionTitle label="Accesos rápidos" />
        <View style={styles.shortcutsGrid}>
          <Shortcut C={C} styles={styles} emoji="🏋️" label="Ejercicios" sub={`${exercises.length}`} onPress={() => router.push('/(tabs)/exercises')} />
          <Shortcut C={C} styles={styles} emoji="📋" label="Rutinas" sub={`${routines.length}`} onPress={() => router.push('/(tabs)/routines')} />
          <Shortcut C={C} styles={styles} emoji="🩹" label="Rehab" sub={`${bloques.length} bloques`} onPress={() => router.push('/(tabs)/rehab')} />
          <Shortcut C={C} styles={styles} emoji="⚙️" label="Ajustes" sub="Importar" onPress={() => router.push('/settings' as any)} />
        </View>
      </ScrollView>
    </View>
  );
}

function Shortcut({ C, styles, emoji, label, sub, onPress }: { C: ReturnType<typeof useColors>; styles: any; emoji: string; label: string; sub: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.shortcut} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.shortcutEmoji}>{emoji}</Text>
      <Text style={styles.shortcutLabel}>{label}</Text>
      <Text style={styles.shortcutSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    greeting: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    settingsBtn: { padding: 8, marginRight: -8 },
    settingsIcon: { fontSize: 24 },
    hey: { fontSize: font.md, color: C.text2 },
    title: { fontSize: font.xxxl, fontWeight: '900', color: C.text, letterSpacing: -1 },
    scroll: { flex: 1, paddingHorizontal: 16, marginTop: 4 },
    quickStart: {
      marginTop: 12, backgroundColor: C.acc,
      borderRadius: radius.lg, padding: 18,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    qsLabel: { fontSize: font.xs, fontWeight: '700', color: C.black, opacity: 0.65, marginBottom: 2, letterSpacing: 1 },
    qsName: { fontSize: font.xl, fontWeight: '900', color: C.black, letterSpacing: -0.3 },
    qsMeta: { fontSize: font.sm, color: C.black, opacity: 0.7, marginTop: 2 },
    qsPlay: { fontSize: 24, color: C.black, marginLeft: 10 },
    emptyQuick: {
      marginTop: 12, backgroundColor: C.s1, borderRadius: radius.lg,
      padding: 20, alignItems: 'center', borderWidth: 1.5, borderColor: C.s2, borderStyle: 'dashed',
    },
    emptyQuickTitle: { color: C.text, fontSize: font.lg, fontWeight: '700' },
    emptyQuickSub: { color: C.text2, fontSize: font.sm, marginTop: 4 },
    statsRow: { flexDirection: 'row', gap: 8 },
    statBox: { flex: 1, backgroundColor: C.s1, borderRadius: radius.md, padding: 14, alignItems: 'center' },
    statVal: { fontSize: 22, fontWeight: '900', color: C.acc },
    statLbl: { fontSize: font.xs, color: C.text2, marginTop: 2 },
    statsHint: { fontSize: font.xs, color: C.text3, marginTop: 6, fontStyle: 'italic' },
    shortcutsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    shortcut: { width: '48%', backgroundColor: C.s1, borderRadius: radius.md, padding: 14, alignItems: 'flex-start' },
    shortcutEmoji: { fontSize: 28, marginBottom: 6 },
    shortcutLabel: { fontSize: font.md, fontWeight: '800', color: C.text },
    shortcutSub: { fontSize: font.xs, color: C.text2, marginTop: 2 },
  });
}
