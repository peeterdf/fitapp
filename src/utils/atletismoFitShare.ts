import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// RN/Hermes has no global Buffer/btoa for arbitrary binary data.
function base64Encode(bytes: Uint8Array): string {
  let result = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    result += BASE64_CHARS[(chunk >> 18) & 63];
    result += BASE64_CHARS[(chunk >> 12) & 63];
    result += BASE64_CHARS[(chunk >> 6) & 63];
    result += BASE64_CHARS[chunk & 63];
  }
  const remaining = bytes.length - i;
  if (remaining === 1) {
    const chunk = bytes[i] << 16;
    result += BASE64_CHARS[(chunk >> 18) & 63] + BASE64_CHARS[(chunk >> 12) & 63] + '==';
  } else if (remaining === 2) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8);
    result += BASE64_CHARS[(chunk >> 18) & 63] + BASE64_CHARS[(chunk >> 12) & 63] + BASE64_CHARS[(chunk >> 6) & 63] + '=';
  }
  return result;
}

function slugify(name: string): string {
  return name
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'entrenamiento';
}

export async function shareFitWorkout(bytes: Uint8Array, workoutName: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error('Compartir archivos no está disponible en este dispositivo.');

  const uri = `${FileSystem.cacheDirectory}${slugify(workoutName)}.fit`;
  await FileSystem.writeAsStringAsync(uri, base64Encode(bytes), { encoding: FileSystem.EncodingType.Base64 });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/vnd.ant.fit',
    dialogTitle: 'Enviar entrenamiento a Garmin (.FIT)',
    UTI: 'com.io.fit',
  });
}
