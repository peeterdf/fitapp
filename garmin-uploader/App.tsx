import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GarminSession, isSessionExpired, refreshGarminSession } from './src/garminAuth';
import { cargarSesion, guardarSesion, borrarSesion } from './src/sessionStorage';
import LoginScreen from './src/screens/LoginScreen';
import UploadScreen from './src/screens/UploadScreen';

export default function App() {
  const [session, setSession] = useState<GarminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarSesion().then(async s => {
      if (s) {
        if (isSessionExpired(s)) {
          try {
            const refreshed = await refreshGarminSession(s);
            await guardarSesion(refreshed);
            setSession(refreshed);
          } catch {
            await borrarSesion();
            setSession(null);
          }
        } else {
          setSession(s);
        }
      }
      setLoading(false);
    });
  }, []);

  async function handleLogin(s: GarminSession) {
    await guardarSesion(s);
    setSession(s);
  }

  async function handleLogout() {
    await borrarSesion();
    setSession(null);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <ActivityIndicator color="#e8ff47" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <StatusBar style="light" />
      {session ? (
        <UploadScreen session={session} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', justifyContent: 'center' },
});
