import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { GarminSession } from './garminAuth';

const KEY = 'garmin_session_v1';

// expo-secure-store no tiene implementación en web. Para poder probar la
// app en el navegador (npx expo start --web) sin depender del teléfono,
// usamos localStorage ahí — solo corre en tu propia compu para testear,
// no es la vía pensada para uso real.
async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function guardarSesion(session: GarminSession): Promise<void> {
  await setItem(KEY, JSON.stringify(session));
}

export async function cargarSesion(): Promise<GarminSession | null> {
  const raw = await getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GarminSession;
  } catch {
    return null;
  }
}

export async function borrarSesion(): Promise<void> {
  await removeItem(KEY);
}
