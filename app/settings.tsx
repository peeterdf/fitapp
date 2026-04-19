import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, Share, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { radius, font } from '../src/data/theme';
import { useColors, useTheme } from '../src/contexts/ThemeContext';
import { Card, SectionTitle, Btn } from '../src/components/UI';
import { useExercisesContext } from '../src/contexts/ExercisesContext';
import { useRoutinesContext } from '../src/contexts/RoutinesContext';
import { useRehabContext } from '../src/contexts/RehabContext';
import { useAppMode } from '../src/contexts/AppModeContext';
import { useFeature } from '../src/hooks/useFeature';
import { Exercise, MuscleGroup, Routine, RehabBloque } from '../src/data/types';

type Mode = 'idle' | 'import-ex' | 'import-full';

const VALID_MUSCLES: MuscleGroup[] = [
  'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core / Abdomen', 'Full Body',
];
const VALID_DIFFS: Exercise['diff'][] = ['Principiante', 'Intermedio', 'Avanzado'];

function normalizeExercise(raw: Record<string, any>, fallbackId: number): Exercise | null {
  if (typeof raw !== 'object' || !raw || typeof raw.name !== 'string' || !raw.name.trim()) return null;
  const muscle: MuscleGroup = VALID_MUSCLES.includes(raw.muscle) ? raw.muscle : 'Full Body';
  const diff: Exercise['diff'] = VALID_DIFFS.includes(raw.diff) ? raw.diff : 'Principiante';
  let weight: string;
  if (raw.weight !== undefined && raw.weight !== null) weight = String(raw.weight);
  else if (raw.startWeight !== undefined && raw.startWeight !== null) weight = String(raw.startWeight);
  else weight = '—';
  return {
    id: typeof raw.id === 'number' ? raw.id : fallbackId,
    name: raw.name.trim(),
    desc: raw.desc ?? raw.description ?? '',
    sets: typeof raw.sets === 'number' ? raw.sets : 3,
    reps: raw.reps ?? raw.startReps ?? '10',
    weight,
    rest: typeof raw.rest === 'number' ? raw.rest : 60,
    muscle, equip: raw.equip ?? raw.equipment ?? 'Peso corporal', diff,
    notes: raw.notes ?? '', youtube: raw.youtube ?? '', imageUri: raw.imageUri ?? '',
    history: Array.isArray(raw.history) ? raw.history : [],
  };
}

export default function SettingsScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { isDark, toggleTheme } = useTheme();
  const { exercises, save: saveExercises } = useExercisesContext();
  const { routines, save: saveRoutines } = useRoutinesContext();
  const { bloques, save: saveRehab } = useRehabContext();
  const { mode: appMode, setMode: setAppMode, modes: appModes } = useAppMode();
  const canImport = useFeature('settings.import');
  const canExport = useFeature('settings.export');

  const [mode, setMode] = useState<Mode>('idle');
  const [jsonText, setJsonText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function exportBackup() {
    try {
      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        exercises,
        routines,
        rehab: bloques,
      };
      const json = JSON.stringify(backup, null, 2);
      await Share.share({
        message: json,
        title: 'fitapp-backup.json',
      });
    } catch (err) {
      Alert.alert('Error', 'No se pudo exportar el backup.');
    }
  }

  function importExercises() {
    try {
      setIsLoading(true);
      if (!jsonText.trim()) { Alert.alert('Error', 'Pegá el JSON.'); setIsLoading(false); return; }
      const data = JSON.parse(jsonText);
      if (!Array.isArray(data)) { Alert.alert('Error', 'El JSON debe ser un array.'); setIsLoading(false); return; }
      const maxId = exercises.reduce((m, e) => Math.max(m, e.id), 0);
      let idCounter = maxId + 1;
      const normalized = data.map(raw => normalizeExercise(raw, idCounter++)).filter(Boolean) as Exercise[];
      if (normalized.length === 0) { Alert.alert('Error', 'No se encontraron ejercicios válidos.'); setIsLoading(false); return; }
      saveExercises(normalized);
      setJsonText(''); setMode('idle');
      Alert.alert('Éxito', `${normalized.length} ejercicio${normalized.length !== 1 ? 's' : ''} importados.`);
    } catch {
      Alert.alert('Error', 'JSON inválido.');
    } finally {
      setIsLoading(false);
    }
  }

  function importFullBackup() {
    try {
      setIsLoading(true);
      if (!jsonText.trim()) { Alert.alert('Error', 'Pegá el JSON.'); setIsLoading(false); return; }
      const data = JSON.parse(jsonText);
      if (typeof data !== 'object' || !data) { Alert.alert('Error', 'Formato inválido.'); setIsLoading(false); return; }

      const hasExercises = Array.isArray(data.exercises);
      const hasRoutines = Array.isArray(data.routines);
      const hasRehab = Array.isArray(data.rehab);

      if (!hasExercises && !hasRoutines && !hasRehab) {
        Alert.alert('Error', 'El backup no contiene datos válidos. Esperaba "exercises", "routines" o "rehab".');
        setIsLoading(false); return;
      }

      Alert.alert(
        'Confirmar importación',
        `Se reemplazará:\n${hasExercises ? `• ${data.exercises.length} ejercicios\n` : ''}${hasRoutines ? `• ${data.routines.length} rutinas\n` : ''}${hasRehab ? `• ${data.rehab.length} bloques rehab\n` : ''}\nLos datos actuales se perderán.`,
        [
          { text: 'Cancelar' },
          {
            text: 'Reemplazar',
            style: 'destructive',
            onPress: () => {
              if (hasExercises) {
                let idCounter = 1;
                const exs = (data.exercises as any[]).map(raw => normalizeExercise(raw, idCounter++)).filter(Boolean) as Exercise[];
                saveExercises(exs);
              }
              if (hasRoutines) saveRoutines(data.routines as Routine[]);
              if (hasRehab) saveRehab(data.rehab as RehabBloque[]);
              setJsonText(''); setMode('idle');
              Alert.alert('Éxito', 'Backup importado correctamente.');
            },
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'JSON inválido.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <SectionTitle label="Modo de la app" />
        <View style={styles.modesGrid}>
          {appModes.map(m => {
            const active = m.id === appMode.id;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setAppMode(m.id)}
                style={[styles.modeCard, active && { borderColor: C.acc, borderWidth: 2 }]}
                activeOpacity={0.8}
              >
                <Text style={styles.modeEmoji}>{m.branding.emoji}</Text>
                <Text style={[styles.modeLabel, active && { color: C.acc }]}>{m.label}</Text>
                {m.branding.tagline ? <Text style={styles.modeTagline}>{m.branding.tagline}</Text> : null}
                {active && <Text style={styles.modeActive}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionTitle label="Apariencia" />
        <Card>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Tema oscuro</Text>
              <Text style={styles.cardDescription}>
                {isDark ? 'Modo oscuro activo' : 'Modo claro activo'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: C.s3, true: C.acc }}
              thumbColor={C.white}
            />
          </View>
        </Card>

        {(canImport || canExport) && <SectionTitle label="Backup completo" />}
        {canExport && (
          <Card>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Exportar backup</Text>
              <Text style={styles.cardDescription}>
                Descargá un JSON con ejercicios, rutinas, rehab e historial.
              </Text>
              <Text style={styles.miniStats}>
                {exercises.length} ejercicios · {routines.length} rutinas · {bloques.length} bloques rehab
              </Text>
              <Btn label="📤 Exportar backup" variant="primary" onPress={exportBackup} />
            </View>
          </Card>
        )}

        {canImport && (
          <Card>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Importar backup completo</Text>
            <Text style={styles.cardDescription}>
              Reemplaza todos los datos. Incluí al menos "exercises", "routines" o "rehab" en el JSON.
            </Text>
            {mode !== 'import-full' ? (
              <Btn label="📥 Importar backup" variant="secondary" onPress={() => { setMode('import-full'); setJsonText(''); }} />
            ) : (
              <View>
                <TextInput
                  style={styles.jsonInput}
                  placeholder='{"exercises": [...], "routines": [...], "rehab": [...]}'
                  placeholderTextColor={C.text3}
                  multiline
                  value={jsonText}
                  onChangeText={setJsonText}
                />
                <View style={styles.buttonRow}>
                  <Btn label="Importar" variant="primary" onPress={importFullBackup} disabled={isLoading || !jsonText.trim()} />
                  <Btn label="Cancelar" variant="secondary" onPress={() => { setMode('idle'); setJsonText(''); }} />
                </View>
              </View>
            )}
            </View>
          </Card>
        )}

        {canImport && (
          <>
            <Card>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Importar ejercicios</Text>
                <Text style={styles.cardDescription}>
                  Copiá el contenido JSON de tu archivo de ejercicios (array).
                </Text>
                {mode !== 'import-ex' ? (
                  <Btn label="📋 Pegar JSON" variant="primary" onPress={() => { setMode('import-ex'); setJsonText(''); }} />
                ) : (
                  <View>
                    <TextInput
                      style={styles.jsonInput}
                      placeholder="[ { ... } ]"
                      placeholderTextColor={C.text3}
                      multiline
                      value={jsonText}
                      onChangeText={setJsonText}
                    />
                    <View style={styles.buttonRow}>
                      <Btn label="Importar" variant="primary" onPress={importExercises} disabled={isLoading || !jsonText.trim()} />
                      <Btn label="Cancelar" variant="secondary" onPress={() => { setMode('idle'); setJsonText(''); }} />
                    </View>
                  </View>
                )}
              </View>
            </Card>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Formato backup completo</Text>
              <Text style={styles.codeBlock}>{`{
  "version": 1,
  "exercises": [...],
  "routines": [...],
  "rehab": [...]
}`}</Text>
            </View>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: {
      paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    backButton: { fontSize: font.md, color: C.acc, fontWeight: '600', width: 60 },
    title: { fontSize: font.xl, fontWeight: '700', color: C.text },
    scroll: { flex: 1, paddingHorizontal: 16 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardContent: { gap: 12 },
    cardTitle: { fontSize: font.lg, fontWeight: '700', color: C.text },
    cardDescription: { fontSize: font.sm, color: C.text2, lineHeight: 20 },
    miniStats: { fontSize: font.xs, color: C.acc, fontWeight: '600' },
    jsonInput: {
      backgroundColor: C.s1, borderRadius: radius.md, padding: 12, color: C.text,
      fontSize: font.sm, minHeight: 120, borderWidth: 1, borderColor: C.s3, marginBottom: 12,
    },
    buttonRow: { flexDirection: 'row', gap: 8 },
    modesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    modeCard: {
      width: '47%', backgroundColor: C.s1, borderRadius: radius.md,
      padding: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
    },
    modeEmoji: { fontSize: 28, marginBottom: 4 },
    modeLabel: { fontSize: font.md, fontWeight: '800', color: C.text },
    modeTagline: { fontSize: font.xs, color: C.text2, marginTop: 2, textAlign: 'center' },
    modeActive: { fontSize: font.xs, color: C.acc, fontWeight: '900', marginTop: 4 },
    infoBox: {
      marginTop: 24, padding: 12, backgroundColor: C.s3, borderRadius: radius.md,
      borderLeftWidth: 3, borderLeftColor: C.acc,
    },
    infoTitle: { fontSize: font.md, fontWeight: '600', color: C.text, marginBottom: 8 },
    codeBlock: {
      fontSize: 11, fontFamily: 'monospace', color: C.text2,
      backgroundColor: C.bg, padding: 8, borderRadius: radius.sm, lineHeight: 16,
    },
  });
}
