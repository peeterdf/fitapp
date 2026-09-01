import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Tag, Loading } from '../components/UI';
import { useAtletismoContext } from '../contexts/AtletismoContext';

export default function AtletismoScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { plans, loading } = useAtletismoContext();

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.title}>Atletismo</Text>
            <Text style={styles.subtitle}>{plans.length} {plans.length === 1 ? 'plan' : 'planes'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/import-atletismo-plan' as any)} style={styles.importBtn} activeOpacity={0.8}>
            <Text style={styles.importText}>📥 Importar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {plans.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🏃</Text>
            <Text style={styles.emptyTitle}>Aún no tenés planes</Text>
            <Text style={styles.emptySub}>Tocá + para generar tu plan de 10k o 21k</Text>
          </View>
        ) : (
          [...plans].reverse().map(plan => {
            const totalSemanas = plan.semanas.length;
            const totalKm = Math.round(plan.semanas.reduce((acc, s) => acc + s.kilometrajeTotalKm, 0));
            return (
              <TouchableOpacity key={plan.id} style={styles.card} activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/atletismo-plan-detail', params: { id: String(plan.id) } } as any)}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Plan {plan.inputs.objetivo_principal.toUpperCase()}</Text>
                    <Text style={styles.cardSub}>
                      {totalSemanas} {totalSemanas === 1 ? 'semana' : 'semanas'} · ~{totalKm} km totales
                    </Text>
                    <Text style={styles.cardSub}>Carrera: {plan.inputs.fecha_objetivo}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </View>
                <View style={styles.tags}>
                  <Tag label={`🎯 ${plan.inputs.dias_disponibles_por_semana} días/sem`} />
                  <Tag label={`⏱ ${plan.ritmos.ritmoObjetivoCarrera}/km objetivo`} />
                  {plan.inputs.objetivo_secundario && <Tag label={`+ ${plan.inputs.objetivo_secundario.toUpperCase()}`} />}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-atletismo-plan' as any)} activeOpacity={0.85}>
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
    importBtn: { backgroundColor: C.s1, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 8, marginTop: 2 },
    importText: { color: C.text2, fontSize: font.sm, fontWeight: '700' },
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
