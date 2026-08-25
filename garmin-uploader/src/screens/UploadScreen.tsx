import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { GarminSession, isSessionExpired, refreshGarminSession } from '../garminAuth';
import { crearWorkout, programarWorkout } from '../garminApi';
import { construirWorkoutGarmin } from '../garminWorkoutBuilder';
import { AtletismoSessionExport, parseSessionExport } from '../atletismoExportTypes';
import { guardarSesion } from '../sessionStorage';

export default function UploadScreen({ session, onLogout }: { session: GarminSession; onLogout: () => void }) {
  const [texto, setTexto] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState(session);

  const parsed: { data?: AtletismoSessionExport; error?: string } = useMemo(() => {
    if (!texto.trim()) return {};
    try {
      return { data: parseSessionExport(texto) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'JSON inválido.' };
    }
  }, [texto]);

  async function pegar() {
    const clip = await Clipboard.getStringAsync();
    setTexto(clip);
    setResultado(null);
  }

  async function subir() {
    if (!parsed.data) return;
    setSubiendo(true);
    setResultado(null);
    try {
      let activeSession = currentSession;
      if (isSessionExpired(activeSession)) {
        activeSession = await refreshGarminSession(activeSession);
        await guardarSesion(activeSession);
        setCurrentSession(activeSession);
      }

      const workout = construirWorkoutGarmin(parsed.data.session, parsed.data.ritmos);
      const created = await crearWorkout(activeSession, workout);
      await programarWorkout(activeSession, created.workoutId, parsed.data.session.fecha);

      setResultado(`✅ Subido y programado para el ${parsed.data.session.fecha}.`);
      setTexto('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido.';
      setResultado(`❌ No se pudo subir: ${msg}`);
    } finally {
      setSubiendo(false);
    }
  }

  function confirmarLogout() {
    Alert.alert('Cerrar sesión', '¿Cerrar sesión de Garmin en esta app?', [
      { text: 'Cancelar' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: onLogout },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>⌚ Garmin Uploader</Text>
        <TouchableOpacity onPress={confirmarLogout}>
          <Text style={styles.logout}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        En fitapp: abrí la sesión, tocá "Copiar JSON (para Garmin Uploader)". Después volvé
        acá y pegalo.
      </Text>

      <TouchableOpacity style={styles.pasteBtn} onPress={pegar}>
        <Text style={styles.pasteBtnText}>📋 Pegar del portapapeles</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.textarea}
        value={texto}
        onChangeText={t => { setTexto(t); setResultado(null); }}
        placeholder="...o pegá el JSON acá manualmente"
        placeholderTextColor="#555"
        multiline
        numberOfLines={8}
      />

      {parsed.error && <Text style={styles.error}>{parsed.error}</Text>}

      {parsed.data && (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>{parsed.data.session.nombre}</Text>
          <Text style={styles.previewSub}>
            {parsed.data.session.tipo} · {parsed.data.session.fecha}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, (!parsed.data || subiendo) && { opacity: 0.5 }]}
        onPress={subir}
        disabled={!parsed.data || subiendo}
      >
        {subiendo ? <ActivityIndicator color="#0f0f0f" /> : <Text style={styles.buttonText}>Subir a Garmin</Text>}
      </TouchableOpacity>

      {resultado && <Text style={styles.resultado}>{resultado}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0f0f0f', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  title: { fontSize: 22, fontWeight: '900', color: '#f0f0f0' },
  logout: { color: '#888', fontSize: 13 },
  subtitle: { fontSize: 13, color: '#999', marginTop: 10, marginBottom: 16, lineHeight: 19 },
  pasteBtn: { backgroundColor: '#1a1a1a', borderRadius: 10, borderWidth: 1.5, borderColor: '#2e2e2e', paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  pasteBtnText: { color: '#e8ff47', fontWeight: '700', fontSize: 14 },
  textarea: { backgroundColor: '#1a1a1a', borderRadius: 10, borderWidth: 1.5, borderColor: '#2e2e2e', padding: 12, color: '#ccc', fontSize: 12, minHeight: 160, textAlignVertical: 'top' },
  error: { color: '#ff5555', fontSize: 13, marginTop: 10 },
  preview: { backgroundColor: 'rgba(232,255,71,0.1)', borderRadius: 10, padding: 12, marginTop: 12 },
  previewTitle: { color: '#f0f0f0', fontWeight: '800', fontSize: 15 },
  previewSub: { color: '#999', fontSize: 12, marginTop: 2 },
  button: { backgroundColor: '#e8ff47', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#0f0f0f', fontSize: 16, fontWeight: '800' },
  resultado: { color: '#ccc', fontSize: 13, marginTop: 14, textAlign: 'center', lineHeight: 18 },
});
