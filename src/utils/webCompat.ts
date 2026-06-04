import { Platform, Alert, Vibration } from 'react-native';

/** Alert.alert no muestra botones en web. Usar esta función en su lugar. */
export function confirm(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    } else {
      onCancel?.();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancelar', onPress: onCancel },
      { text: 'Sí', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

/** Alert.alert simple (sin botones de acción) */
export function toast(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

/** Vibration no existe en web */
export function safeVibrate(pattern: number | number[]) {
  if (Platform.OS !== 'web') {
    Vibration.vibrate(pattern);
  }
}

/** Descarga un JSON en web, comparte en mobile */
export async function shareOrDownloadJson(json: string, filename: string) {
  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    const { Share } = require('react-native');
    await Share.share({ message: json, title: filename });
  }
}
