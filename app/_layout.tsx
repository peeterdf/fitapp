import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ExercisesProvider } from '../src/contexts/ExercisesContext';
import { RoutinesProvider } from '../src/contexts/RoutinesContext';
import ErrorBoundary from '../src/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
    <SafeAreaProvider>
      <ExercisesProvider>
        <RoutinesProvider>
          <StatusBar style="light" backgroundColor="#0f0f0f" />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: '#0f0f0f' } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="workout" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="workout-finish" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="rehab-active" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="rehab-finish" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="exercise-detail" options={{ headerShown: false }} />
            <Stack.Screen name="new-exercise" options={{ headerShown: false }} />
            <Stack.Screen name="routine-detail" options={{ headerShown: false }} />
            <Stack.Screen name="new-routine" options={{ headerShown: false }} />
            <Stack.Screen name="rehab-bloque" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
          </Stack>
        </RoutinesProvider>
      </ExercisesProvider>
    </SafeAreaProvider>
    </ErrorBoundary>
  );
}
