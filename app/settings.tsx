import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { C, radius, font } from '../src/data/theme';
import { Card, SectionTitle, Btn } from '../src/components/UI';
import { useExercisesContext } from '../src/contexts/ExercisesContext';
import { Exercise, MuscleGroup } from '../src/data/types';

// ─── Normalizer ────────────────────────────────────────────────────────────────
// Accepts both the canonical Exercise fields AND common alternate names so that
// hand-crafted JSON files don't have to match the internal schema exactly.

const VALID_MUSCLES: MuscleGroup[] = [
  'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core / Abdomen', 'Full Body',
];
const VALID_DIFFS: Exercise['diff'][] = ['Principiante', 'Intermedio', 'Avanzado'];

function normalizeExercise(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: Record<string, any>,
  fallbackId: number,
): Exercise | null {
  if (typeof raw !== 'object' || !raw || typeof raw.name !== 'string' || !raw.name.trim()) {
    return null;
  }

  const muscle: MuscleGroup = VALID_MUSCLES.includes(raw.muscle) ? raw.muscle : 'Full Body';
  const diff: Exercise['diff'] = VALID_DIFFS.includes(raw.diff) ? raw.diff : 'Principiante';

  // weight: accept number or string; map legacy `startWeight` field.
  let weight: string;
  if (raw.weight !== undefined && raw.weight !== null) {
    weight = String(raw.weight);
  } else if (raw.startWeight !== undefined && raw.startWeight !== null) {
    weight = String(raw.startWeight);
  } else {
    weight = '—';
  }

  return {
    id: typeof raw.id === 'number' ? raw.id : fallbackId,
    name: raw.name.trim(),
    desc: raw.desc ?? raw.description ?? '',
    sets: typeof raw.sets === 'number' ? raw.sets : 3,
    reps: raw.reps ?? raw.startReps ?? '10',
    weight,
    rest: typeof raw.rest === 'number' ? raw.rest : 60,
    muscle,
    equip: raw.equip ?? raw.equipment ?? 'Peso corporal',
    diff,
    notes: raw.notes ?? '',
    youtube: raw.youtube ?? '',
    imageUri: raw.imageUri ?? '',
    history: Array.isArray(raw.history) ? raw.history : [],
  };
}

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const { exercises, save } = useExercisesContext();
  const [isLoading, setIsLoading] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [showInput, setShowInput] = useState(false);

  const importExercises = async () => {
    try {
      setIsLoading(true);

      if (!jsonText.trim()) {
        Alert.alert('Error', 'Por favor pega el contenido JSON');
        setIsLoading(false);
        return;
      }

      const data = JSON.parse(jsonText);

      if (!Array.isArray(data)) {
        Alert.alert('Error', 'El contenido debe ser un array de ejercicios');
        setIsLoading(false);
        return;
      }

      // Generate fallback IDs starting after the highest existing ID.
      const maxId = exercises.reduce((m, e) => Math.max(m, e.id), 0);
      let idCounter = maxId + 1;

      const normalized = data
        .map((raw) => normalizeExercise(raw, idCounter++))
        .filter(Boolean) as Exercise[];

      if (normalized.length === 0) {
        Alert.alert('Error', 'No se encontraron ejercicios válidos. Revisá que cada objeto tenga al menos "name".');
        setIsLoading(false);
        return;
      }

      const skipped = data.length - normalized.length;

      save(normalized);
      setJsonText('');
      setShowInput(false);

      Alert.alert(
        'Éxito',
        `Se importaron ${normalized.length} ejercicio${normalized.length !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} omitido${skipped !== 1 ? 's' : ''} por falta de nombre)` : ''}.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (error) {
      console.error('Error importing exercises:', error);
      Alert.alert('Error', 'El JSON no es válido. Verificá el formato.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <SectionTitle label="Datos" />

        <Card>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Importar ejercicios</Text>
            <Text style={styles.cardDescription}>
              Copia el contenido JSON de tu archivo de ejercicios
            </Text>
            {!showInput ? (
              <Btn
                label="📋 Pegar JSON"
                variant="primary"
                onPress={() => setShowInput(true)}
              />
            ) : (
              <View>
                <TextInput
                  style={styles.jsonInput}
                  placeholder="Pega aquí el contenido JSON..."
                  placeholderTextColor={C.text3}
                  multiline
                  value={jsonText}
                  onChangeText={setJsonText}
                />
                <View style={styles.buttonRow}>
                  <Btn
                    label="Importar"
                    variant="primary"
                    onPress={importExercises}
                    disabled={isLoading || !jsonText.trim()}
                  />
                  <Btn
                    label="Cancelar"
                    variant="secondary"
                    onPress={() => { setShowInput(false); setJsonText(''); }}
                  />
                </View>
              </View>
            )}
          </View>
        </Card>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>¿Cómo obtener el JSON?</Text>
          <Text style={styles.infoText}>
            1. Copiá el contenido del archivo JSON que creaste{'\n'}
            2. Presioná "Pegar JSON"{'\n'}
            3. Pegá el contenido en el campo de texto{'\n'}
            4. Presioná "Importar"
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Formato esperado:</Text>
          <Text style={styles.infoText}>
            Array de objetos. Solo se requiere <Text style={{ color: C.acc }}>name</Text>; los demás campos son opcionales y se completan con valores por defecto.
            {'\n\n'}Campos aceptados:
          </Text>
          <Text style={styles.codeBlock}>{`[
  {
    "name": "Press de banca",       // requerido
    "muscle": "Pecho",              // opcional — ver lista abajo
    "equip": "Barra olímpica",      // opcional (o "equipment")
    "sets": 4,                      // opcional (default 3)
    "reps": "8-10",                 // opcional (o "startReps")
    "weight": "80",                 // opcional (o "startWeight")
    "rest": 90,                     // opcional, en segundos
    "diff": "Intermedio",           // opcional
    "desc": "Descripción...",       // opcional (o "description")
    "notes": "Consejo técnico",     // opcional
    "youtube": "https://youtu.be/…" // opcional
  }
]`}</Text>
          <Text style={[styles.infoText, { marginTop: 8, marginBottom: 0 }]}>
            Músculos válidos: Pecho · Espalda · Piernas · Hombros · Brazos · Core / Abdomen · Full Body
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { fontSize: font.md, color: C.acc, fontWeight: '600', width: 60 },
  title: { fontSize: font.xl, fontWeight: '700', color: C.text },
  scroll: { flex: 1, paddingHorizontal: 16 },
  cardContent: { gap: 12 },
  cardTitle: { fontSize: font.lg, fontWeight: '700', color: C.text },
  cardDescription: { fontSize: font.sm, color: C.text2, lineHeight: 20 },
  jsonInput: {
    backgroundColor: C.s1,
    borderRadius: radius.md,
    padding: 12,
    color: C.text,
    fontSize: font.sm,
    minHeight: 120,
    borderWidth: 1,
    borderColor: C.s3,
    marginBottom: 12,
  },
  buttonRow: { flexDirection: 'row', gap: 8 },
  infoBox: {
    marginTop: 24,
    padding: 12,
    backgroundColor: C.s3,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: C.acc,
  },
  infoTitle: { fontSize: font.md, fontWeight: '600', color: C.text, marginBottom: 8 },
  infoText: { fontSize: font.sm, color: C.text2, marginBottom: 8, lineHeight: 18 },
  codeBlock: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: C.text2,
    backgroundColor: '#0a0a0a',
    padding: 8,
    borderRadius: radius.sm,
    lineHeight: 16,
  },
});
