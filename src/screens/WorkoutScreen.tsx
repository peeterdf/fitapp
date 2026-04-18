import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Vibration } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { radius, font } from '../data/theme';
import { useColors } from '../contexts/ThemeContext';
import { useWorkoutTimer } from '../contexts/WorkoutTimerContext';
import { ProgressBar, SetCircle, TimerRing, Btn } from '../components/UI';
import { MediaThumbnail } from '../components/MediaThumbnail';
import { useExercisesContext } from '../contexts/ExercisesContext';
import { useRoutinesContext } from '../contexts/RoutinesContext';
import { useTimer, useCountdown } from '../hooks/useTimer';
import { MUSCLE_EMOJIS } from '../data/data';
import { Exercise, RoutineExercise } from '../data/types';
import { fmtTime } from '../data/utils';

interface WorkoutItem extends Exercise {
  wSets: number;
  wReps: string;
  wWeight: string;
  wRest: number;
  currentSet: number;
  isSuperset: boolean;
}

export default function WorkoutScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { singleExId, routineId } = useLocalSearchParams<{ singleExId?: string; routineId?: string }>();
  const { exercises } = useExercisesContext();
  const { routines } = useRoutinesContext();
  const { startWorkout, stopWorkout } = useWorkoutTimer();
  const clock = useTimer(true);
  const countdown = useCountdown(60);

  const [items, setItems] = useState<WorkoutItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [doneSets, setDoneSets] = useState(0);
  const [mode, setMode] = useState<'exercise' | 'pause'>('exercise');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activateKeepAwakeAsync();
    startWorkout();
    return () => {
      deactivateKeepAwake();
      stopWorkout();
    };
  }, []);

  useEffect(() => {
    if (!exercises.length) return;
    let list: WorkoutItem[];
    if (singleExId) {
      const ex = exercises.find(e => e.id === Number(singleExId));
      if (!ex) return;
      list = [{ ...ex, wSets: ex.sets, wReps: ex.reps, wWeight: ex.weight + ' kg', wRest: ex.rest, currentSet: 1, isSuperset: false }];
    } else {
      const routine = routineId
        ? routines.find(r => r.id === Number(routineId))
        : routines[0];
      const source: RoutineExercise[] = routine?.exercises ?? [];
      list = source.map(item => {
        const ex = exercises.find(e => e.id === item.exId);
        if (!ex) return null;
        return { ...ex, wSets: item.sets, wReps: item.reps, wWeight: item.weight, wRest: item.rest, currentSet: 1, isSuperset: !!item.isSuperset };
      }).filter(Boolean) as WorkoutItem[];
    }
    if (!list.length) {
      Alert.alert(
        'Sin ejercicios',
        'Esta rutina no tiene ejercicios configurados. Agregá al menos uno antes de empezar.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
      return;
    }
    setItems(list);
    setTotalSets(list.reduce((a, i) => a + i.wSets, 0));
    clock.start();
    setReady(true);
  }, [exercises, routines, singleExId, routineId]);

  const startPause = useCallback((secs: number, cb: () => void) => {
    setMode('pause');
    Vibration.vibrate(200);
    countdown.start(secs);
    cbRef.current = cb;
  }, []);

  const cbRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (countdown.seconds === 0 && !countdown.running && mode === 'pause' && cbRef.current) {
      Vibration.vibrate([0, 100, 100, 100]);
      setMode('exercise');
      cbRef.current();
      cbRef.current = null;
    }
  }, [countdown.seconds, countdown.running, mode]);

  function endPause() {
    countdown.stop();
    setMode('exercise');
    if (cbRef.current) { cbRef.current(); cbRef.current = null; }
  }

  function finishWorkout(newDone: number, itemCount: number) {
    clock.stop();
    stopWorkout();
    router.replace({ pathname: '/workout-finish', params: { time: clock.fmt, exCount: itemCount, sets: newDone } });
  }

  function completeSet() {
    const ex = items[idx];
    const newDone = doneSets + 1;
    setDoneSets(newDone);

    const updatedItems = items.map((item, i) =>
      i === idx ? { ...item, currentSet: item.currentSet + 1 } : item
    );
    setItems(updatedItems);

    if (ex.currentSet >= ex.wSets) {
      const nextIdx = idx + 1;
      if (nextIdx >= items.length) {
        finishWorkout(newDone, items.length);
      } else if (ex.isSuperset) {
        // Superset: go directly to next exercise without rest
        Vibration.vibrate(200);
        setIdx(nextIdx);
      } else {
        startPause(ex.wRest, () => setIdx(nextIdx));
      }
    } else {
      startPause(ex.wRest, () => {});
    }
  }

  if (!ready || !items.length) return null;

  const ex = items[idx];
  const pct = Math.round((doneSets / totalSets) * 100);
  const next = items[idx + 1];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Alert.alert('Terminar', '¿Querés terminar el entrenamiento?', [
          { text: 'No' },
          { text: 'Sí', style: 'destructive', onPress: () => { clock.stop(); stopWorkout(); router.back(); } },
        ])} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Ejercicio {idx + 1} de {items.length}</Text>
        <Text style={styles.clock}>{clock.fmt}</Text>
      </View>

      <ProgressBar pct={pct} />
      <Text style={styles.progInfo}>{pct}% completado</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {mode === 'exercise' ? (
          <>
            {/* Exercise hero */}
            <View style={[styles.hero, ex.isSuperset && { borderLeftWidth: 3, borderLeftColor: C.acc2 }]}>
              {ex.isSuperset && (
                <View style={{ backgroundColor: 'rgba(71,255,180,0.1)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'center', marginBottom: 6 }}>
                  <Text style={{ color: C.acc2, fontSize: font.xs, fontWeight: '700' }}>⚡ SUPERSERIE — sin pausa con el siguiente</Text>
                </View>
              )}
              <Text style={styles.heroName}>{ex.name}</Text>
              <Text style={styles.heroInfo}>{ex.wWeight} · Serie {ex.currentSet} de {ex.wSets}</Text>

              {(ex.youtube || ex.imageUri) && (
                <MediaThumbnail youtube={ex.youtube} imageUri={ex.imageUri} fallbackEmoji="" compact={false} />
              )}
              {!ex.youtube && !ex.imageUri && (
                <Text style={{ fontSize: 56, textAlign: 'center', marginVertical: 10 }}>
                  {MUSCLE_EMOJIS[ex.muscle] || '💪'}
                </Text>
              )}

              <View style={styles.heroActions}>
                <TouchableOpacity onPress={completeSet} style={styles.mainBtn} activeOpacity={0.85}>
                  <Text style={styles.mainBtnText}>Serie completada ✓</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  const nextIdx = idx + 1;
                  if (nextIdx >= items.length) { clock.stop(); stopWorkout(); router.replace('/workout-finish'); }
                  else setIdx(nextIdx);
                }} style={styles.skipBtn}>
                  <Text style={styles.skipText}>Saltar ▶</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Set tracker */}
            <View style={styles.tracker}>
              <Text style={styles.trackerHdr}>Series</Text>
              {Array.from({ length: ex.wSets }).map((_, i) => {
                const setNum = i + 1;
                const state = setNum < ex.currentSet ? 'done' : setNum === ex.currentSet ? 'current' : 'pending';
                return (
                  <View key={i} style={[styles.setRow, i === ex.wSets - 1 && { borderBottomWidth: 0 }]}>
                    <SetCircle n={setNum} state={state} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.setLabel}>Serie {setNum}</Text>
                      <Text style={styles.setDetail}>{ex.wWeight} × {ex.wReps} reps</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => { if (state === 'current') completeSet(); }}
                      disabled={state !== 'current'}
                      style={[styles.setBtn, state === 'done' && styles.setBtnDone]}
                    >
                      <Text style={[styles.setBtnText, state === 'done' && { color: C.acc2 }]}>
                        {state === 'done' ? '✓ Hecha' : state === 'current' ? 'Completar' : '—'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Next exercise */}
            {next && (
              <View style={styles.nextCard}>
                <Text style={{ fontSize: 28 }}>{MUSCLE_EMOJIS[next.muscle] || '💪'}</Text>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.nextLbl}>{ex.isSuperset ? '⚡ SUPERSERIE — SIN PAUSA' : 'SIGUIENTE EJERCICIO'}</Text>
                  <Text style={styles.nextName}>{next.name} — {next.wSets}×{next.wReps}</Text>
                </View>
              </View>
            )}
          </>
        ) : (
          /* Pause mode */
          <View style={styles.pauseContainer}>
            <Text style={styles.pauseTitle}>Serie completada ✓</Text>
            <Text style={styles.pauseSub}>Descansá antes de la próxima serie</Text>
            <TimerRing seconds={countdown.seconds} />
            <View style={styles.heroActions}>
              <TouchableOpacity onPress={endPause} style={styles.mainBtn} activeOpacity={0.85}>
                <Text style={styles.mainBtnText}>Continuar ▶</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={endPause} style={styles.skipBtn}>
                <Text style={styles.skipText}>Saltar pausa</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.nextCard, { marginTop: 16 }]}>
              <View>
                <Text style={styles.nextLbl}>PRÓXIMA SERIE</Text>
                <Text style={styles.nextName}>{ex.name} — {ex.wWeight} × {ex.wReps}</Text>
              </View>
            </View>
          </View>
        )}

        <Btn
          label="Terminar entrenamiento"
          variant="danger"
          onPress={() => Alert.alert('Terminar', '¿Seguro?', [
            { text: 'No' },
            { text: 'Sí', style: 'destructive', onPress: () => { clock.stop(); stopWorkout(); router.back(); } },
          ])}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    closeText: { color: C.text, fontSize: 16 },
    subtitle: { flex: 1, fontSize: font.sm, color: C.text2 },
    clock: { fontSize: font.md, color: C.acc, fontWeight: '700', fontVariant: ['tabular-nums'] },
    progInfo: { fontSize: font.xs, color: C.text3, paddingHorizontal: 16, paddingBottom: 6, paddingTop: 2 },
    scroll: { flex: 1, paddingHorizontal: 16 },
    hero: { backgroundColor: C.s1, borderRadius: radius.lg, padding: 16, marginTop: 8, marginBottom: 10 },
    heroName: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 4, textAlign: 'center' },
    heroInfo: { fontSize: font.md, color: C.text2, marginBottom: 12, textAlign: 'center' },
    heroActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
    mainBtn: { flex: 1, backgroundColor: C.acc, borderRadius: radius.sm, paddingVertical: 13, alignItems: 'center' },
    mainBtnText: { fontSize: font.md, fontWeight: '800', color: '#0f0f0f' },
    skipBtn: { backgroundColor: C.s2, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 13, alignItems: 'center' },
    skipText: { fontSize: font.md, color: C.text2, fontWeight: '600' },
    tracker: { backgroundColor: C.s1, borderRadius: radius.lg, marginBottom: 10, overflow: 'hidden' },
    trackerHdr: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6, fontSize: font.xs, color: C.text2, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    setRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.s2 },
    setLabel: { fontSize: font.xs, color: C.text2 },
    setDetail: { fontSize: font.md, color: C.text, fontWeight: '600' },
    setBtn: { backgroundColor: C.s2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    setBtnDone: { backgroundColor: 'rgba(71,255,180,0.13)' },
    setBtnText: { fontSize: font.sm, color: C.text2, fontWeight: '600' },
    nextCard: { backgroundColor: C.s2, borderRadius: radius.sm, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    nextLbl: { fontSize: 10, color: C.text2, letterSpacing: 1, fontWeight: '700' },
    nextName: { fontSize: font.md, fontWeight: '600', color: C.text, marginTop: 2 },
    pauseContainer: { alignItems: 'center', paddingVertical: 10 },
    pauseTitle: { fontSize: font.lg, color: C.acc, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    pauseSub: { fontSize: font.sm, color: C.text2, marginTop: 4 },
  });
}
