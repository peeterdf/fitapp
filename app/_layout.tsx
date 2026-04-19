import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ExercisesProvider } from '../src/contexts/ExercisesContext';
import { RoutinesProvider } from '../src/contexts/RoutinesContext';
import { RehabProvider } from '../src/contexts/RehabContext';
import { AppModeProvider } from '../src/contexts/AppModeContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { WorkoutTimerProvider } from '../src/contexts/WorkoutTimerContext';
import ErrorBoundary from '../src/components/ErrorBoundary';

function AppStack() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={isDark ? '#0f0f0f' : '#f0f0f0'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: isDark ? '#0f0f0f' : '#f0f0f0' } }}>
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
        <Stack.Screen name="new-rehab" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppModeProvider>
        <ThemeProvider>
          <WorkoutTimerProvider>
            <ExercisesProvider>
              <RoutinesProvider>
                <RehabProvider>
                  <AppStack />
                </RehabProvider>
              </RoutinesProvider>
            </ExercisesProvider>
          </WorkoutTimerProvider>
        </ThemeProvider>
        </AppModeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
