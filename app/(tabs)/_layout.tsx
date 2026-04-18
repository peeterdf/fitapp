import { Tabs, useRouter } from 'expo-router';
import { Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../src/contexts/ThemeContext';
import { useWorkoutTimer } from '../../src/contexts/WorkoutTimerContext';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.35 }}>{emoji}</Text>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  const C = useColors();
  return (
    <Text style={{ fontSize: 10, color: focused ? C.acc : '#666', fontWeight: focused ? '700' : '400' }}>
      {label}
    </Text>
  );
}

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
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 6,
          },
          tabBarActiveTintColor: C.acc,
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
            tabBarLabel: ({ focused }) => <TabLabel label="Inicio" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="exercises"
          options={{
            title: 'Ejercicios',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏋️" focused={focused} />,
            tabBarLabel: ({ focused }) => <TabLabel label="Ejercicios" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="routines"
          options={{
            title: 'Rutinas',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
            tabBarLabel: ({ focused }) => <TabLabel label="Rutinas" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="rehab"
          options={{
            title: 'Rehab',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🩹" focused={focused} />,
            tabBarLabel: ({ focused }) => <TabLabel label="Rehab" focused={focused} />,
          }}
        />
      </Tabs>
    </View>
  );
}
