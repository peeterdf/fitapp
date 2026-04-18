import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Tag, Badge, Loading } from '../components/UI';
import { MediaThumbnail } from '../components/MediaThumbnail';
import { useExercisesContext } from '../contexts/ExercisesContext';
import { MUSCLE_EMOJIS } from '../data/data';
import { getYouTubeId } from '../data/utils';

const FILTERS: string[] = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core / Abdomen'];

export default function ExercisesScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { exercises, loading } = useExercisesContext();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');

  if (loading) return <Loading />;

  const filtered = exercises.filter(ex => {
    const matchMuscle = filter === 'Todos' || ex.muscle === filter;
    const matchQuery = query === '' || ex.name.toLowerCase().includes(query.toLowerCase());
    return matchMuscle && matchQuery;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Ejercicios</Text></View>
      <View style={styles.searchWrap}>
        <TextInput style={styles.search} placeholder="🔍  Buscar ejercicio..." placeholderTextColor={C.text2} value={query} onChangeText={setQuery} returnKeyType="search" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipOn]}>
            <Text style={[styles.chipText, filter === f && styles.chipTextOn]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={ex => String(ex.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: ex }) => {
          const ytId = getYouTubeId(ex.youtube);
          const hasMedia = ytId || ex.imageUri;
          return (
            <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/exercise-detail', params: { id: ex.id } })} activeOpacity={0.8}>
              <View style={styles.cardRow}>
                <MediaThumbnail youtube={ex.youtube} imageUri={ex.imageUri} fallbackEmoji={MUSCLE_EMOJIS[ex.muscle] || '\ud83d\udcaa'} compact />
                <View style={styles.cardInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.cardTitle}>{ex.name}</Text>
                    {hasMedia && <View style={styles.mediaBadge}><Text style={styles.mediaBadgeText}>{ytId ? '\ud83c\udfa5' : '\ud83d\udcf7'}</Text></View>}
                  </View>
                  <Text style={styles.cardSub}>{ex.muscle} · {ex.equip}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}><Tag label={ex.muscle} accent /></View>
                </View>
                <Badge label={`${ex.sets}×${ex.reps}`} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🏋️</Text>
            <Text style={{ color: C.text2, fontSize: font.md }}>No hay ejercicios. Creá uno con +</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-exercise')}>
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
    searchWrap: { marginHorizontal: 16, marginBottom: 10 },
    search: { backgroundColor: C.s2, borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 10, fontSize: font.md, color: C.text },
    filterScroll: { flexGrow: 0, marginBottom: 10 },
    chip: { backgroundColor: C.s2, borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1.5, borderColor: 'transparent' },
    chipOn: { backgroundColor: 'rgba(232,255,71,0.12)', borderColor: 'rgba(232,255,71,0.3)' },
    chipText: { fontSize: font.sm, color: C.text2 },
    chipTextOn: { color: C.acc, fontWeight: '700' },
    card: { backgroundColor: C.s1, borderRadius: radius.md, padding: 14, marginBottom: 10 },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: C.text },
    cardSub: { fontSize: font.sm, color: C.text2, marginTop: 2 },
    mediaBadge: { backgroundColor: 'rgba(232,255,71,0.12)', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
    mediaBadgeText: { fontSize: 12 },
    empty: { alignItems: 'center', marginTop: 60 },
    fab: { position: 'absolute', bottom: 86, right: 16, width: 54, height: 54, borderRadius: 27, backgroundColor: C.acc, alignItems: 'center', justifyContent: 'center', elevation: 8 },
    fabText: { fontSize: 28, fontWeight: '900', color: C.black },
  });
}
