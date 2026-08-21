import { Tabs, useRouter } from 'expo-router';
import { Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../src/contexts/ThemeContext';
import { useWorkoutTimer } from '../../src/contexts/WorkoutTimerContext';
import { useFeature } from '../../src/hooks/useFeature';

function WorkoutBanner() {
  const C = useColors();
  const { isActive, elapsed } = useWorkoutTimer();
  const router = useRouter();
  if (!isActive) return null;
  return (
    <TouchableOpacity
      onPress={() => router.push('/workout' as any)}
      activeOpacity={0.85}
      style={{
        backgroundColor: C.acc,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ color: '#0f0f0f', fontWeight: '800', fontSize: 13 }}>🏋️  Entrenamiento en curso</Text>
      <Text style={{ color: '#0f0f0f', fontWeight: '900', fontSize: 13, fontVariant: ['tabular-nums'] }}>
        {elapsed}  ▶
      </Text>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const showExercises = useFeature('tab.exercises');
  const showRoutines = useFeature('tab.routines');
  const showRehab = useFeature('tab.rehab');
  const showContent = useFeature('tab.content');
  const showAtletismo = useFeature('tab.atletismo');

  return (
    <View style={{ flex: 1 }}>
      <WorkoutBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: C.s1,
            borderTopColor: C.s2,
            borderTopWidth: 1,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom + 4,
            paddingTop: 6,
          },
          tabBarActiveTintColor: C.acc,
          tabBarInactiveTintColor: '#666',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>🏠</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="exercises"
          options={{
            title: 'Ejercicios',
            tabBarButton: showExercises ? undefined : () => null,
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>🏋️</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="routines"
          options={{
            title: 'Rutinas',
            tabBarButton: showRoutines ? undefined : () => null,
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>📋</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="rehab"
          options={{
            title: 'Rehab',
            tabBarButton: showRehab ? undefined : () => null,
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>🩹</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="content"
          options={{
            title: 'Guía',
            tabBarButton: showContent ? undefined : () => null,
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>📖</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="atletismo"
          options={{
            title: 'Atletismo',
            tabBarButton: showAtletismo ? undefined : () => null,
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>🏃</Text>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
