import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Btn } from '../components/UI';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DONE = [true, true, false, true, false, false, false];
const TODAY = 3;

export default function WorkoutFinishScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { time, exCount, sets } = useLocalSearchParams<{ time: string; exCount: string; sets: string }>();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>¡Entrenamiento{'\n'}completado!</Text>
        <Text style={styles.sub}>Excelente trabajo.</Text>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{time || '00:00'}</Text>
            <Text style={styles.statLbl}>Tiempo total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{exCount || '—'}</Text>
            <Text style={styles.statLbl}>Ejercicios</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{sets || '—'}</Text>
            <Text style={styles.statLbl}>Series hechas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: C.acc2 }]}>💪</Text>
            <Text style={styles.statLbl}>¡Muy bien!</Text>
          </View>
        </View>

        <View style={styles.rachaBox}>
          <Text style={styles.rachaTitle}>RACHA SEMANAL</Text>
          <View style={styles.rachaDots}>
            {DAYS.map((d, i) => (
              <View key={d} style={styles.rdItem}>
                <View style={[
                  styles.rdCircle,
                  DONE[i] && { backgroundColor: C.acc },
                  i === TODAY && !DONE[i] && { borderWidth: 2, borderColor: C.acc },
                ]}>
                  {DONE[i] && <Text style={{ fontSize: 12, color: C.black }}>✓</Text>}
                </View>
                <Text style={[styles.rdLbl, i === TODAY && { color: C.acc, fontWeight: '700' }]}>{d}</Text>
              </View>
            ))}
          </View>
        </View>

        <Btn label="Volver al inicio" onPress={() => router.replace('/')} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    content: { alignItems: 'center', padding: 24 },
    emoji: { fontSize: 56, marginBottom: 10 },
    title: { fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -1, textAlign: 'center', marginBottom: 4 },
    sub: { fontSize: font.md, color: C.text2, marginBottom: 20 },
    grid: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%', marginBottom: 18 },
    statCard: { flex: 1, minWidth: '45%', backgroundColor: C.s1, borderRadius: radius.sm, padding: 14, alignItems: 'center' },
    statVal: { fontSize: 26, fontWeight: '900', color: C.acc },
    statLbl: { fontSize: font.xs, color: C.text2, marginTop: 2 },
    rachaBox: { backgroundColor: C.s1, borderRadius: radius.sm, padding: 14, width: '100%', marginBottom: 18 },
    rachaTitle: { fontSize: font.xs, fontWeight: '700', color: C.text2, letterSpacing: 1, marginBottom: 12 },
    rachaDots: { flexDirection: 'row', justifyContent: 'space-around' },
    rdItem: { alignItems: 'center', gap: 4 },
    rdCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
    rdLbl: { fontSize: 9, color: C.text3 },
  });
}
