import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Badge, Btn, Loading } from '../components/UI';
import { useRehabContext } from '../contexts/RehabContext';

const BORDER_OPACITY = ['rgba(232,255,71,0.4)', 'rgba(232,255,71,0.7)', '#e8ff47'];

export default function RehabScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { bloques, loading } = useRehabContext();

  if (loading) return <Loading />;

  const totalExercises = bloques.reduce((a, b) => a + b.exercises.length, 0);
  const durationEstimate = Math.max(10, Math.round(totalExercises * 3.5));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>🩹 Recuperación</Text>
          <Text style={styles.title}>
            Rehab <Text style={{ color: C.acc }}>Cadera</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/new-rehab' as any)}
          style={styles.addHeaderBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.addHeaderBtnText}>+ Bloque</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>CADERA · FUNCIONAL</Text>
          </View>
          <Text style={styles.heroTitle}>Rutina de Rehabilitación</Text>
          <Text style={styles.heroSub}>{bloques.length} bloque{bloques.length !== 1 ? 's' : ''} · ~{durationEstimate} min</Text>
          <View style={styles.heroStats}>
            <View>
              <Text style={styles.heroVal}>{bloques.length}</Text>
              <Text style={styles.heroLbl}>bloques</Text>
            </View>
            <View>
              <Text style={styles.heroVal}>{totalExercises}</Text>
              <Text style={styles.heroLbl}>ejercicios</Text>
            </View>
            <View>
              <Text style={[styles.heroVal, { color: C.acc2 }]}>{durationEstimate}</Text>
              <Text style={styles.heroLbl}>min aprox</Text>
            </View>
          </View>
        </View>

        {bloques.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🩹</Text>
            <Text style={styles.emptyTitle}>Aún no hay bloques</Text>
            <Text style={styles.emptySub}>Tocá "+ Bloque" arriba para crear tu primer bloque.</Text>
          </View>
        ) : (
          bloques.map((bloque, i) => (
            <View key={i} style={[styles.bloqueCard, { borderLeftColor: BORDER_OPACITY[i % BORDER_OPACITY.length] }]}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/rehab-bloque', params: { idx: i } })}
                activeOpacity={0.8}
              >
                <View style={styles.bloqueHdr}>
                  <Text style={styles.bloqueName}>Bloque {i + 1} — {bloque.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <Badge label={`${bloque.vueltas} vuelta${bloque.vueltas > 1 ? 's' : ''}`} variant="yellow" />
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/new-rehab' as any, params: { idx: String(i) } })}
                      style={styles.editBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.editBtnText}>✎</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {bloque.exercises.map((ex, j) => (
                  <View key={j} style={styles.miniRow}>
                    <View style={styles.miniDot} />
                    <Text style={styles.miniName}>{ex.name}</Text>
                    <Text style={styles.miniReps}>{ex.reps}</Text>
                  </View>
                ))}
              </TouchableOpacity>
            </View>
          ))
        )}

        {bloques.length > 0 && (
          <Btn
            label="▶  Iniciar Rehabilitación"
            onPress={() => router.push({ pathname: '/rehab-active', params: { bloqueIdx: 0 } })}
            style={{ marginTop: 10 }}
          />
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
    headerSub: { fontSize: font.sm, color: C.text2 },
    title: { fontSize: font.xxl, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
    addHeaderBtn: { backgroundColor: 'rgba(232,255,71,0.13)', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
    addHeaderBtnText: { color: C.acc, fontWeight: '700', fontSize: font.sm },
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
    editBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
    editBtnText: { color: C.text, fontSize: 14 },
    miniRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
    miniDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.acc, opacity: 0.5 },
    miniName: { flex: 1, fontSize: font.sm, color: C.text2 },
    miniReps: { fontSize: font.xs, color: C.text3 },
    empty: { alignItems: 'center', padding: 32 },
    emptyTitle: { color: C.text, fontSize: font.lg, fontWeight: '700', marginBottom: 4 },
    emptySub: { color: C.text2, fontSize: font.sm, textAlign: 'center' },
  });
}
