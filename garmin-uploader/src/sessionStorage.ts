import * as SecureStore from 'expo-secure-store';
import { GarminSession } from './garminAuth';

const KEY = 'garmin_session_v1';

export async function guardarSesion(session: GarminSession): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(session));
}

export async function cargarSesion(): Promise<GarminSession | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GarminSession;
  } catch {
    return null;
  }
}

export async function borrarSesion(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
