import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Btn, Tag } from '../components/UI';
import { useRehabContext } from '../contexts/RehabContext';

export default function RehabBloqueScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { idx } = useLocalSearchParams<{ idx: string }>();
  const { bloques } = useRehabContext();
  const bloqueIdx = Number(idx);
  const bloque = bloques[bloqueIdx];
  if (!bloque) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>Bloque {bloqueIdx + 1} · {bloque.vueltas} vuelta{bloque.vueltas > 1 ? 's' : ''}</Text>
          <Text style={styles.title}>{bloque.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/new-rehab' as any, params: { idx: String(bloqueIdx) } })}
          style={styles.editBtn}
        >
          <Text style={styles.editBtnText}>✎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {bloque.exercises.map((ex, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHdr}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 30 }}>{ex.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exReps}>{ex.reps}</Text>
                </View>
              </View>
              <View style={styles.repsBadge}>
                <Text style={styles.repsBadgeText}>{ex.reps.split(' ')[0]}</Text>
              </View>
            </View>
            <Text style={styles.desc}>{ex.desc}</Text>
            {ex.equip.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                {ex.equip.map((e, j) => <Tag key={j} label={e} />)}
              </View>
            )}
            {ex.tip ? (
              <View style={styles.tip}>
                <Text style={styles.tipText}>💡 {ex.tip}</Text>
              </View>
            ) : null}
          </View>
        ))}

        <Btn
          label={`▶  Empezar Bloque ${bloqueIdx + 1}`}
          onPress={() => router.push({ pathname: '/rehab-active', params: { bloqueIdx } })}
          style={{ marginTop: 8 }}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
    backText: { color: C.text, fontSize: 18 },
    editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
    editBtnText: { color: C.text, fontSize: 16 },
    headerSub: { fontSize: font.xs, color: C.acc, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
    title: { fontSize: font.xl, fontWeight: '800', color: C.text },
    scroll: { flex: 1, paddingHorizontal: 16 },
    card: { backgroundColor: C.s1, borderRadius: radius.md, padding: 14, marginBottom: 10 },
    cardHdr: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
    exName: { fontSize: font.md, fontWeight: '700', color: C.text },
    exReps: { fontSize: font.sm, color: C.text2, marginTop: 2 },
    repsBadge: { backgroundColor: 'rgba(232,255,71,0.12)', borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 3 },
    repsBadgeText: { fontSize: font.xs, color: C.acc, fontWeight: '700' },
    desc: { fontSize: font.sm, color: C.text2, lineHeight: 20 },
    tip: { marginTop: 8, backgroundColor: 'rgba(232,255,71,0.07)', borderRadius: 8, padding: 9 },
    tipText: { fontSize: font.sm, color: C.acc },
  });
}
