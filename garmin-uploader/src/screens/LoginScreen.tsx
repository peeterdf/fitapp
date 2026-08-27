import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { loginToGarmin, GarminSession, LoginRequiresMfaError } from '../garminAuth';

export default function LoginScreen({ onLogin }: { onLogin: (s: GarminSession) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!username.trim() || !password) {
      setError('Completá usuario y contraseña.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const session = await loginToGarmin(username.trim(), password);
      onLogin(session);
    } catch (e) {
      if (e instanceof LoginRequiresMfaError) {
        setError('Esta cuenta tiene verificación en dos pasos (MFA). Todavía no soportado acá — desactivala temporalmente en tu cuenta de Garmin, o esperá a que agreguemos soporte.');
      } else {
        setError(e instanceof Error ? e.message : 'Error desconocido al iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>⌚ Garmin Uploader</Text>
        <Text style={styles.subtitle}>
          App aparte de fitapp. Iniciá sesión con tu cuenta de Garmin para poder subir
          entrenamientos generados en fitapp directo a tu calendario de Garmin Connect.
        </Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Esto usa un método no oficial (no publicado ni soportado por Garmin) para
            iniciar sesión en tu nombre. Tu usuario/contraseña se usan acá mismo, en tu
            teléfono, y no se envían a ningún servidor propio — solo a Garmin. Aun así,
            conlleva cierto riesgo sobre tu cuenta y puede dejar de funcionar si Garmin
            cambia su sistema de login. No soporta cuentas con verificación en dos pasos (MFA).
          </Text>
        </View>

        <Text style={styles.label}>USUARIO / EMAIL</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="tu@email.com"
          placeholderTextColor="#555"
        />

        <Text style={styles.label}>CONTRASEÑA</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#555"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#0f0f0f" /> : <Text style={styles.buttonText}>Iniciar sesión</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0f0f0f', padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: '#f0f0f0', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#999', marginBottom: 16, lineHeight: 19 },
  warningBox: { backgroundColor: 'rgba(255,85,85,0.1)', borderRadius: 12, padding: 12, marginBottom: 20 },
  warningText: { color: '#ff8888', fontSize: 12, lineHeight: 17 },
  label: { fontSize: 11, color: '#888', fontWeight: '700', letterSpacing: 0.5, marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 10, borderWidth: 1.5, borderColor: '#2e2e2e', padding: 12, color: '#f0f0f0', fontSize: 15 },
  error: { color: '#ff5555', fontSize: 13, marginTop: 14, lineHeight: 18 },
  button: { backgroundColor: '#e8ff47', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#0f0f0f', fontSize: 16, fontWeight: '800' },
});
