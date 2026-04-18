import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { Btn } from '../components/UI';
import { useExercisesContext } from '../contexts/ExercisesContext';
import { Exercise, MuscleGroup } from '../data/types';

const MUSCLES: MuscleGroup[] = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core / Abdomen', 'Full Body'];
const EQUIPS = ['Barra olímpica', 'Mancuernas', 'Máquina', 'Peso corporal', 'Polea / Cable', 'Banda elástica', 'Otro'];
const RESTS = [{ label: '30 seg', val: 30 }, { label: '45 seg', val: 45 }, { label: '60 seg', val: 60 }, { label: '90 seg', val: 90 }, { label: '2 min', val: 120 }, { label: '3 min', val: 180 }];
const DIFFS: Exercise['diff'][] = ['Principiante', 'Intermedio', 'Avanzado'];

export default function NewExerciseScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { addExercise } = useExercisesContext();

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [sets, setSets] = useState('4');
  const [reps, setReps] = useState('8');
  const [weight, setWeight] = useState('');
  const [rest, setRest] = useState(60);
  const [muscle, setMuscle] = useState<MuscleGroup>('Pecho');
  const [equip, setEquip] = useState('Barra olímpica');
  const [diff, setDiff] = useState<Exercise['diff']>('Intermedio');
  const [notes, setNotes] = useState('');
  const [youtube, setYoutube] = useState('');
  const [imageUri, setImageUri] = useState('');

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: false });
    if (!res.canceled && res.assets[0]) setImageUri(res.assets[0].uri);
  }

  function save() {
    if (!name.trim()) { Alert.alert('Falta el nombre', 'Escribí un nombre para el ejercicio.'); return; }
    const ex: Exercise = {
      id: Date.now(), name: name.trim(), desc, sets: parseInt(sets) || 3,
      reps: reps || '10', weight: weight || '0', rest,
      muscle, equip, diff: diff as Exercise['diff'], notes,
      youtube: youtube.trim(), imageUri, history: [],
    };
    addExercise(ex);
    router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo Ejercicio</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>NOMBRE DEL EJERCICIO</Text>
          <TextInput style={styles.input} placeholder="ej. Press Banca Inclinado" placeholderTextColor={C.text3} value={name} onChangeText={setName} />

          <Text style={styles.label}>DESCRIPCIÓN / TÉCNICA</Text>
          <TextInput style={[styles.input, styles.textarea]} placeholder="Describí la ejecución correcta..." placeholderTextColor={C.text3} value={desc} onChangeText={setDesc} multiline numberOfLines={3} />

          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>SERIES</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={sets} onChangeText={setSets} />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>REPETICIONES</Text>
              <TextInput style={styles.input} placeholder="8-12" placeholderTextColor={C.text3} value={reps} onChangeText={setReps} />
            </View>
          </View>

          <Text style={styles.label}>PESO (KG)</Text>
          <TextInput style={styles.input} keyboardType="numeric" placeholder="80" placeholderTextColor={C.text3} value={weight} onChangeText={setWeight} />

          <Text style={styles.label}>PAUSA ENTRE SERIES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ gap: 6 }}>
            {RESTS.map(r => (
              <TouchableOpacity key={r.val} onPress={() => setRest(r.val)} style={[styles.selChip, rest === r.val && styles.selChipOn]}>
                <Text style={[styles.selText, rest === r.val && styles.selTextOn]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>GRUPO MUSCULAR</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ gap: 6 }}>
            {MUSCLES.map(m => (
              <TouchableOpacity key={m} onPress={() => setMuscle(m)} style={[styles.selChip, muscle === m && styles.selChipOn]}>
                <Text style={[styles.selText, muscle === m && styles.selTextOn]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>EQUIPO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ gap: 6 }}>
            {EQUIPS.map(e => (
              <TouchableOpacity key={e} onPress={() => setEquip(e)} style={[styles.selChip, equip === e && styles.selChipOn]}>
                <Text style={[styles.selText, equip === e && styles.selTextOn]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>DIFICULTAD</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ gap: 6 }}>
            {DIFFS.map(d => (
              <TouchableOpacity key={d} onPress={() => setDiff(d)} style={[styles.selChip, diff === d && styles.selChipOn]}>
                <Text style={[styles.selText, diff === d && styles.selTextOn]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>NOTAS</Text>
          <TextInput style={[styles.input, styles.textarea]} placeholder="Puntos clave, errores comunes..." placeholderTextColor={C.text3} value={notes} onChangeText={setNotes} multiline numberOfLines={2} />

          <Text style={styles.label}>VIDEO DE YOUTUBE</Text>
          <TextInput style={styles.input} placeholder="https://youtube.com/watch?v=..." placeholderTextColor={C.text3} value={youtube} onChangeText={setYoutube} autoCapitalize="none" keyboardType="url" />
          <Text style={styles.hint}>Pegá el link completo del video de referencia</Text>

          <Text style={styles.label}>IMAGEN DE REFERENCIA</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imgPicker} activeOpacity={0.8}>
            {imageUri
              ? <Image source={{ uri: imageUri }} style={styles.imgPreview} resizeMode="cover" />
              : (
                <View style={styles.imgPlaceholder}>
                  <Text style={{ fontSize: 32 }}>🖼️</Text>
                  <Text style={{ color: C.text3, marginTop: 8, fontSize: font.md }}>Tocá para subir una imagen</Text>
                  <Text style={{ color: C.text3, fontSize: font.sm, marginTop: 3 }}>JPG, PNG, WEBP</Text>
                </View>
              )
            }
          </TouchableOpacity>

          <Btn label="Guardar Ejercicio ✓" onPress={save} style={{ marginTop: 16 }} />
          <Btn label="Cancelar" variant="secondary" onPress={() => router.back()} />
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
    title: { fontSize: font.xxl, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
    scroll: { flex: 1, paddingHorizontal: 16 },
    label: { fontSize: font.xs, color: C.text2, fontWeight: '700', letterSpacing: 0.5, marginBottom: 5 },
    input: { backgroundColor: C.s2, borderRadius: radius.sm, borderWidth: 1.5, borderColor: C.s3, padding: 12, color: C.text, fontSize: font.md, marginBottom: 14 },
    textarea: { height: 72, textAlignVertical: 'top' },
    row2: { flexDirection: 'row' },
    selChip: { backgroundColor: C.s2, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: 'transparent' },
    selChipOn: { backgroundColor: 'rgba(232,255,71,0.12)', borderColor: 'rgba(232,255,71,0.3)' },
    selText: { fontSize: font.sm, color: C.text2 },
    selTextOn: { color: C.acc, fontWeight: '700' },
    hint: { fontSize: font.xs, color: C.text3, marginTop: -10, marginBottom: 14 },
    imgPicker: { borderRadius: radius.md, overflow: 'hidden', marginBottom: 14, backgroundColor: C.s2, borderWidth: 2, borderColor: C.s3, borderStyle: 'dashed' },
    imgPreview: { width: '100%', aspectRatio: 16 / 9 },
    imgPlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  });
}
