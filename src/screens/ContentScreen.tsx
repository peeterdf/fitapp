import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { useBranding } from '../hooks/useFeature';
import { CONTENT_ARTICLES, CONTENT_CATEGORIES, CATEGORY_COLORS, ContentCategory } from '../data/content';

export default function ContentScreen() {
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const branding = useBranding();
  const [activeCategory, setActiveCategory] = useState<ContentCategory | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const articles = activeCategory
    ? CONTENT_ARTICLES.filter(a => a.category === activeCategory)
    : CONTENT_ARTICLES;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{branding.emoji}</Text>
        <View>
          <Text style={styles.title}>Guía</Text>
          <Text style={styles.tagline}>{branding.tagline}</Text>
        </View>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
        <TouchableOpacity
          onPress={() => setActiveCategory(null)}
          style={[styles.chip, !activeCategory && styles.chipActive]}
        >
          <Text style={[styles.chipText, !activeCategory && styles.chipTextActive]}>Todos</Text>
        </TouchableOpacity>
        {CONTENT_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(activeCategory === cat ? null : cat)}
            style={[styles.chip, activeCategory === cat && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
        {articles.map(article => {
          const isOpen = expanded === article.id;
          const catColor = CATEGORY_COLORS[article.category];
          return (
            <TouchableOpacity
              key={article.id}
              activeOpacity={0.9}
              onPress={() => setExpanded(isOpen ? null : article.id)}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardEmoji}>{article.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={[styles.catBadge, { backgroundColor: catColor + '22' }]}>
                    <Text style={[styles.catText, { color: catColor }]}>{article.category}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{article.title}</Text>
                </View>
                <Text style={[styles.chevron, isOpen && { transform: [{ rotate: '90deg' }] }]}>›</Text>
              </View>

              {isOpen && (
                <View style={styles.cardBody}>
                  <View style={styles.divider} />
                  <Text style={styles.bodyText}>{article.body}</Text>
                  {article.tip && (
                    <View style={styles.tipBox}>
                      <Text style={styles.tipText}>💡 {article.tip}</Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    emoji: { fontSize: 36 },
    title: { fontSize: font.xxl, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
    tagline: { fontSize: font.sm, color: C.acc, fontWeight: '600', marginTop: 1 },
    filterRow: { flexGrow: 0 },
    chip: { backgroundColor: C.s2, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: 'transparent' },
    chipActive: { backgroundColor: 'rgba(106,191,106,0.12)', borderColor: 'rgba(106,191,106,0.35)' },
    chipText: { fontSize: font.sm, color: C.text2, fontWeight: '600' },
    chipTextActive: { color: C.acc, fontWeight: '700' },
    scroll: { flex: 1 },
    card: { backgroundColor: C.s1, borderRadius: radius.md, marginBottom: 10, overflow: 'hidden' },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    cardEmoji: { fontSize: 30, width: 38, textAlign: 'center' },
    catBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
    catText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
    cardTitle: { fontSize: font.md, fontWeight: '700', color: C.text, flexShrink: 1 },
    chevron: { fontSize: 22, color: C.text3, fontWeight: '300', marginLeft: 4 },
    cardBody: { paddingHorizontal: 14, paddingBottom: 14 },
    divider: { height: 1, backgroundColor: C.s2, marginBottom: 12 },
    bodyText: { fontSize: font.sm, color: C.text2, lineHeight: 22 },
    tipBox: { marginTop: 12, backgroundColor: C.s2, borderRadius: radius.sm, padding: 10, borderLeftWidth: 3, borderLeftColor: C.acc },
    tipText: { fontSize: font.sm, color: C.acc, lineHeight: 20 },
  });
}
