import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C, radius, font } from '../data/theme';
import { Card, StatBox, Tag, Btn, SectionTitle } from '../components/UI';
import { MediaThumbnail } from '../components/MediaThumbnail';
import { useExercisesContext } from '../contexts/ExercisesContext';
import { MUSCLE_EMOJIS } from '../data/data';

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercises } = useExercisesContext();
  const ex = exercises.find(e => e.id === Number(id));

  if (!ex) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{ex.name}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Media */}
        <MediaThumbnail
          youtube={ex.youtube}
          imageUri={ex.imageUri}
          fallbackEmoji={MUSCLE_EMOJIS[ex.muscle] || '💪'}
        />

        {/* Stats */}
        <View style={styles.stats}>
          <StatBox value={ex.sets} label="Series" />
          <View style={{ width: 8 }} />
          <StatBox value={ex.reps} label="Reps" />
          <View style={{ width: 8 }} />
          <StatBox value={`${ex.rest}s`} label="Pausa" />
        </View>

        {/* Muscles */}
        <Card style={{ marginBottom: 10 }}>
          <SectionTitle label="Músculos" style={{ marginTop: 0 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Tag label={ex.muscle} accent />
            {ex.equip !== 'Peso corporal' && <Tag label={ex.equip} accent />}
            <Tag label={ex.diff} />
          </View>
        </Card>

        {/* Technique */}
        <Card style={{ marginBottom: 10 }}>
          <SectionTitle label="Técnica" style={{ marginTop: 0 }} />
          <Text style={styles.desc}>{ex.desc || 'Sin descripción.'}</Text>
          {ex.notes ? <Text style={[styles.desc, { marginTop: 8, color: C.acc, fontSize: font.sm }]}>💡 {ex.notes}</Text> : null}
        </Card>

        {/* History */}
        <Card style={{ marginBottom: 10 }}>
          <SectionTitle label="Historial" style={{ marginTop: 0 }} />
          {ex.history && ex.history.length > 0
            ? ex.history.map((h, i) => (
                <View key={i} style={[styles.histRow, i === ex.history.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.histDate}>{h.date}</Text>
                  <Text style={{ color: C.text, fontSize: font.md }}>{h.load}</Text>
                </View>
              ))
            : <Text style={{ color: C.text3, fontSize: font.md }}>Sin historial aún.</Text>
          }
        </Card>

        <Btn
          label="▶  Empezar este ejercicio"
          onPress={() => router.push({ pathname: '/workout', params: { singleExId: String(ex.id) } })}
        />
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
  title: { fontSize: font.xxl, fontWeight: '800', color: C.text, flex: 1, letterSpacing: -0.5 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  stats: { flexDirection: 'row', marginBottom: 10 },
  desc: { fontSize: font.md, color: C.text2, lineHeight: 22 },
  histRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.s2 },
  histDate: { color: C.text2, fontSize: font.md },
});
