import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { C, radius, font } from '../data/theme';
import { Badge, Btn } from '../components/UI';
import { REHAB_DATA } from '../data/data';

const BORDER_OPACITY = ['rgba(232,255,71,0.4)', 'rgba(232,255,71,0.7)', '#e8ff47'];

export default function RehabScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>🩹 Recuperación</Text>
        <Text style={styles.title}>
          Rehab <Text style={{ color: C.acc }}>Cadera</Text>
        </Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>CADERA · FUNCIONAL</Text>
          </View>
          <Text style={styles.heroTitle}>Rutina de Rehabilitación</Text>
          <Text style={styles.heroSub}>3 bloques · ~40 min · Bloques 2 y 3 = 3 vueltas</Text>
          <View style={styles.heroStats}>
            <View>
              <Text style={styles.heroVal}>3</Text>
              <Text style={styles.heroLbl}>bloques</Text>
            </View>
            <View>
              <Text style={styles.heroVal}>11</Text>
              <Text style={styles.heroLbl}>ejercicios</Text>
            </View>
            <View>
              <Text style={[styles.heroVal, { color: C.acc2 }]}>40</Text>
              <Text style={styles.heroLbl}>min aprox</Text>
            </View>
          </View>
        </View>

        {/* Bloques */}
        {REHAB_DATA.map((bloque, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.bloqueCard, { borderLeftColor: BORDER_OPACITY[i] }]}
            onPress={() => router.push({ pathname: '/rehab-bloque', params: { idx: i } })}
            activeOpacity={0.8}
          >
            <View style={styles.bloqueHdr}>
              <Text style={styles.bloqueName}>Bloque {i + 1} — {bloque.name}</Text>
              <Badge label={`${bloque.vueltas} vuelta${bloque.vueltas > 1 ? 's' : ''}`} variant="yellow" />
            </View>
            {bloque.exercises.map((ex, j) => (
              <View key={j} style={styles.miniRow}>
                <View style={styles.miniDot} />
                <Text style={styles.miniName}>{ex.name}</Text>
                <Text style={styles.miniReps}>{ex.reps}</Text>
              </View>
            ))}
          </TouchableOpacity>
        ))}

        <Btn
          label="▶  Iniciar Rehabilitación"
          onPress={() => router.push({ pathname: '/rehab-active', params: { bloqueIdx: 0 } })}
          style={{ marginTop: 10 }}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  headerSub: { fontSize: font.sm, color: C.text2 },
  title: { fontSize: font.xxl, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  hero: { backgroundColor: C.s1, borderRadius: radius.md, padding: 16, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: C.acc },
  heroTag: { backgroundColor: 'rgba(232,255,71,0.12)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  heroTagText: { fontSize: font.xs, fontWeight: '700', color: C.acc, letterSpacing: 0.8 },
  heroTitle: { fontSize: 17, fontWeight: '800', color: C.text, marginBottom: 4 },
  heroSub: { fontSize: font.sm, color: C.text2, marginBottom: 10 },
  heroStats: { flexDirection: 'row', gap: 16 },
  heroVal: { fontSize: 20, fontWeight: '900', color: C.acc },
  heroLbl: { fontSize: 10, color: C.text3 },
  bloqueCard: { backgroundColor: C.s1, borderRadius: radius.md, padding: 12, marginBottom: 8, borderLeftWidth: 3 },
  bloqueHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bloqueName: { fontSize: font.md, fontWeight: '800', color: C.acc, flex: 1 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  miniDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.acc, opacity: 0.5 },
  miniName: { flex: 1, fontSize: font.sm, color: '#cccccc' },
  miniReps: { fontSize: font.xs, color: C.text3 },
});
