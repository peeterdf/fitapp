import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { C, radius, font } from '../data/theme';
import { Card, Badge, Tag, SectionTitle, Btn } from '../components/UI';
import { useExercisesContext } from '../contexts/ExercisesContext';

export default function HomeScreen() {
  const router = useRouter();
  const { exercises } = useExercisesContext();

  return (
    <View style={styles.container}>
      <View style={styles.greeting}>
        <Text style={styles.hey}>💪 ¡Hola!</Text>
        <Text style={styles.title}>
          Mis <Text style={{ color: C.acc }}>Rutinas</Text>
        </Text>
      </View>

      {/* Quick start */}
      <TouchableOpacity
        style={styles.quickStart}
        onPress={() => router.push('/workout')}
        activeOpacity={0.85}
      >
        <View>
          <Text style={styles.qsLabel}>EMPEZAR HOY</Text>
          <Text style={styles.qsName}>Fuerza A — Upper</Text>
        </View>
        <Text style={{ fontSize: 22, color: '#0f0f0f' }}>▶</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <SectionTitle label="Mis rutinas" />

        <Card onPress={() => router.push('/routine-detail')}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Fuerza A — Upper</Text>
              <Text style={styles.cardSub}>6 ejercicios · 45-55 min</Text>
            </View>
            <Badge label="Hoy" variant="yellow" />
          </View>
          <View style={styles.tags}>
            <Tag label="Pecho" /><Tag label="Triceps" /><Tag label="Hombros" />
          </View>
        </Card>

        <Card>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Fuerza B — Lower</Text>
              <Text style={styles.cardSub}>5 ejercicios · 40 min</Text>
            </View>
            <Badge label="Mañana" variant="green" />
          </View>
          <View style={styles.tags}>
            <Tag label="Cuádriceps" /><Tag label="Isquios" /><Tag label="Glúteos" />
          </View>
        </Card>

        <Card>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Cardio HIIT</Text>
              <Text style={styles.cardSub}>8 ejercicios · 25 min</Text>
            </View>
            <Badge label="3 días" variant="red" />
          </View>
          <View style={styles.tags}>
            <Tag label="Full body" /><Tag label="Cardio" />
          </View>
        </Card>

        <SectionTitle label="Nueva rutina" />
        <Btn label="+ Crear rutina" variant="secondary" onPress={() => {}} />
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-exercise')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  greeting: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  hey: { fontSize: font.md, color: C.text2 },
  title: { fontSize: font.xxxl, fontWeight: '900', color: C.text, letterSpacing: -1 },
  quickStart: {
    marginHorizontal: 16, marginTop: 12, backgroundColor: C.acc,
    borderRadius: radius.lg, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  qsLabel: { fontSize: font.xs, fontWeight: '700', color: '#0f0f0f', opacity: 0.65, marginBottom: 2 },
  qsName: { fontSize: font.lg, fontWeight: '800', color: '#0f0f0f' },
  scroll: { flex: 1, paddingHorizontal: 16, marginTop: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  cardSub: { fontSize: font.sm, color: C.text2, marginTop: 3 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  fab: {
    position: 'absolute', bottom: 86, right: 16,
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: C.acc, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.acc, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { fontSize: 28, fontWeight: '900', color: '#0f0f0f' },
});
