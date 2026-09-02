import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Btn, SectionTitle } from '../components/UI';
import { useAtletismoContext } from '../contexts/AtletismoContext';
import { parseImportPlanJSON } from '../utils/atletismoPlanJsonExport';
import { toast } from '../utils/webCompat';

export default function ImportAtletismoPlanScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { addPlan } = useAtletismoContext();

  const [json, setJson] = useState('');

  async function pegarDelPortapapeles() {
    try {
      const texto = await Clipboard.getStringAsync();
      setJson(texto);
    } catch (e) {
      toast('No se pudo pegar', e instanceof Error ? e.message : 'Error desconocido.');
    }
  }

  function importar() {
    try {
      const plan = parseImportPlanJSON(json);
      addPlan(plan);
      router.replace({ pathname: '/atletismo-plan-detail', params: { id: String(plan.id) } } as any);
    } catch (e) {
      toast('No se pudo importar', e instanceof Error ? e.message : 'El JSON no es válido.');
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Importar plan</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <SectionTitle label="JSON del plan" />
          <Text style={styles.hint}>
            Pegá acá el JSON exportado desde "Exportar plan" en el detalle de otro plan (de este dispositivo o de otro).
            Se agrega como un plan nuevo, no reemplaza ninguno existente.
          </Text>

          <Btn label="📋 Pegar del portapapeles" variant="secondary" onPress={pegarDelPortapapeles} />

          <TextInput
            style={styles.textarea}
            placeholder='{ "version": 1, "plan": { ... } }'
            placeholderTextColor={C.text3}
            value={json}
            onChangeText={setJson}
            multiline
            textAlignVertical="top"
          />

          <Btn label="Importar plan ✓" onPress={importar} disabled={json.trim().length === 0} style={{ marginTop: 8 }} />
          <Btn label="Cancelar" variant="ghost" onPress={() => router.back()} />
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
    backText: { color: C.text, fontSize: 18 },
    title: { flex: 1, fontSize: font.xxl, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
    scroll: { flex: 1, paddingHorizontal: 16 },
    hint: { fontSize: font.xs, color: C.text3, marginBottom: 10, fontStyle: 'italic', lineHeight: 16 },
    textarea: {
      backgroundColor: C.s2, borderRadius: radius.sm, borderWidth: 1.5, borderColor: C.s3,
      padding: 12, color: C.text, fontSize: font.sm, marginTop: 10, minHeight: 220,
    },
  });
}
