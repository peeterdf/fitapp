import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Vibration } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { C, radius, font } from '../data/theme';
import { ProgressBar, VueltaDots, TimerRing, Btn, SetCircle } from '../components/UI';
import { useTimer, useCountdown } from '../hooks/useTimer';
import { REHAB_DATA } from '../data/data';

export default function RehabActiveScreen() {
  const router = useRouter();
  const { bloqueIdx: startBloque } = useLocalSearchParams<{ bloqueIdx: string }>();
  const clock = useTimer(true);
  const countdown = useCountdown(30);

  const [bloqueIdx, setBloqueIdx] = useState(Number(startBloque) || 0);
  const [exIdx, setExIdx] = useState(0);
  const [vueltaIdx, setVueltaIdx] = useState(0);
  const [mode, setMode] = useState<'exercise' | 'pause'>('exercise');
  const [pauseTitle, setPauseTitle] = useState('');
  const [pauseSub, setPauseSubText] = useState('');
  const [pauseNext, setPauseNext] = useState('');
  const cbRef = useRef<(() => void) | null>(null);

  useEffect(() => { activateKeepAwakeAsync(); return () => deactivateKeepAwake(); }, []);

  useEffect(() => {
    if (countdown.seconds === 0 && !countdown.running && mode === 'pause' && cbRef.current) {
      Vibration.vibrate([0, 100, 100, 100]);
      setMode('exercise');
      cbRef.current();
      cbRef.current = null;
    }
  }, [countdown.seconds, countdown.running, mode]);

  function startPause(secs: number, title: string, sub: string, next: string, cb: () => void) {
    setPauseTitle(title);
    setPauseSubText(sub);
    setPauseNext(next);
    cbRef.current = cb;
    setMode('pause');
    Vibration.vibrate(200);
    countdown.start(secs);
  }

  function endPause() {
    countdown.stop();
    setMode('exercise');
    if (cbRef.current) { cbRef.current(); cbRef.current = null; }
  }

  function completeEx() {
    const bloque = REHAB_DATA[bloqueIdx];
    const nextExIdx = exIdx + 1;

    if (nextExIdx >= bloque.exercises.length) {
      // vuelta completa
      const nextVuelta = vueltaIdx + 1;
      if (nextVuelta < bloque.vueltas) {
        // hay más vueltas
        const nextBloqueData = REHAB_DATA[bloqueIdx];
        startPause(60,
          `Vuelta ${nextVuelta} completada ✓`,
          'Descansá antes de la próxima vuelta',
          `Vuelta ${nextVuelta + 1} de ${bloque.vueltas} — ${bloque.name}`,
          () => { setExIdx(0); setVueltaIdx(nextVuelta); }
        );
      } else {
        // bloque completo
        const nextBloqueIdx = bloqueIdx + 1;
        if (nextBloqueIdx >= REHAB_DATA.length) {
          // rehab completa!
          clock.stop();
          router.replace({ pathname: '/rehab-finish', params: { time: clock.fmt } });
        } else {
          startPause(90,
            `Bloque ${bloqueIdx + 1} completado ✓`,
            'Descansá antes del siguiente bloque',
            `Bloque ${nextBloqueIdx + 1}: ${REHAB_DATA[nextBloqueIdx].name}`,
            () => { setBloqueIdx(nextBloqueIdx); setExIdx(0); setVueltaIdx(0); }
          );
        }
      }
    } else {
      const nextEx = bloque.exercises[nextExIdx];
      startPause(30, 'Ejercicio completado ✓', 'Pequeña pausa', `${nextEx.name} — ${nextEx.reps}`, () => setExIdx(nextExIdx));
    }
  }

  function skipEx() {
    const bloque = REHAB_DATA[bloqueIdx];
    const nextExIdx = exIdx + 1;
    if (nextExIdx >= bloque.exercises.length) {
      const nextBloqueIdx = bloqueIdx + 1;
      if (nextBloqueIdx >= REHAB_DATA.length) { clock.stop(); router.replace('/rehab-finish'); return; }
      setBloqueIdx(nextBloqueIdx); setExIdx(0); setVueltaIdx(0);
    } else {
      setExIdx(nextExIdx);
    }
  }

  const bloque = REHAB_DATA[bloqueIdx];
  const ex = bloque.exercises[exIdx];
  const totalEx = REHAB_DATA.reduce((a, b) => a + b.exercises.length, 0);
  const doneEx = REHAB_DATA.slice(0, bloqueIdx).reduce((a, b) => a + b.exercises.length, 0) + exIdx;
  const pct = Math.round((doneEx / totalEx) * 100);
  const nextEx = bloque.exercises[exIdx + 1];
  const nextBloque = REHAB_DATA[bloqueIdx + 1];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Alert.alert('Terminar', '¿Querés terminar la rehabilitación?', [
          { text: 'No' },
          { text: 'Sí', style: 'destructive', onPress: () => { clock.stop(); router.back(); } },
        ])} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Bloque {bloqueIdx + 1} · Ejercicio {exIdx + 1}/{bloque.exercises.length}</Text>
        <Text style={styles.clockText}>{clock.fmt}</Text>
      </View>

      <ProgressBar pct={pct} />
      <Text style={styles.progInfo}>Ejercicio {doneEx + 1} de {totalEx}</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {mode === 'exercise' ? (
          <>
            <View style={styles.hero}>
              <Text style={styles.bloqueLabel}>Bloque {bloqueIdx + 1} · {bloque.name}</Text>
              <Text style={{ fontSize: 52, textAlign: 'center', marginVertical: 8 }}>{ex.emoji}</Text>
              <Text style={styles.exName}>{ex.name}</Text>
              <Text style={styles.exReps}>{ex.reps}</Text>
              <Text style={styles.exDesc}>{ex.desc}</Text>
              {ex.tip ? <View style={styles.tip}><Text style={styles.tipText}>💡 {ex.tip}</Text></View> : null}
              {bloque.vueltas > 1 && <VueltaDots total={bloque.vueltas} current={vueltaIdx} />}
              <View style={styles.actions}>
                <TouchableOpacity onPress={completeEx} style={styles.mainBtn} activeOpacity={0.85}>
                  <Text style={styles.mainBtnText}>Completado ✓</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={skipEx} style={styles.skipBtn}>
                  <Text style={styles.skipText}>Saltar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Vuelta tracker */}
            {bloque.vueltas > 1 && (
              <View style={styles.tracker}>
                <Text style={styles.trackerHdr}>Vueltas del bloque</Text>
                {Array.from({ length: bloque.vueltas }).map((_, i) => (
                  <View key={i} style={[styles.setRow, i === bloque.vueltas - 1 && { borderBottomWidth: 0 }]}>
                    <SetCircle n={i + 1} state={i < vueltaIdx ? 'done' : i === vueltaIdx ? 'current' : 'pending'} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.setLabel}>Vuelta {i + 1}</Text>
                      <Text style={styles.setDetail}>
                        {i < vueltaIdx ? 'Completada' : i === vueltaIdx ? 'En curso' : 'Pendiente'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Next */}
            {(nextEx || nextBloque) && (
              <View style={styles.nextCard}>
                <Text style={{ fontSize: 26 }}>{nextEx ? nextEx.emoji : '➡️'}</Text>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.nextLbl}>SIGUIENTE</Text>
                  <Text style={styles.nextName}>
                    {nextEx
                      ? `${nextEx.name} — ${nextEx.reps}`
                      : `Bloque ${bloqueIdx + 2}: ${nextBloque?.name}`}
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.pauseContainer}>
            <Text style={styles.pauseTitle}>{pauseTitle}</Text>
            <Text style={styles.pauseSub}>{pauseSub}</Text>
            <TimerRing seconds={countdown.seconds} />
            <View style={styles.actions}>
              <TouchableOpacity onPress={endPause} style={styles.mainBtn} activeOpacity={0.85}>
                <Text style={styles.mainBtnText}>Continuar ▶</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={endPause} style={styles.skipBtn}>
                <Text style={styles.skipText}>Saltar</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.nextCard, { marginTop: 16 }]}>
              <View>
                <Text style={styles.nextLbl}>A CONTINUACIÓN</Text>
                <Text style={styles.nextName}>{pauseNext}</Text>
              </View>
            </View>
          </View>
        )}

        <Btn label="Terminar rehabilitación" variant="danger"
          onPress={() => Alert.alert('Terminar', '¿Seguro?', [
            { text: 'No' },
            { text: 'Sí', style: 'destructive', onPress: () => { clock.stop(); router.back(); } },
          ])}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  closeText: { color: C.text, fontSize: 16 },
  subtitle: { flex: 1, fontSize: font.xs, color: C.text2 },
  clockText: { fontSize: font.md, color: C.acc, fontWeight: '700' },
  progInfo: { fontSize: font.xs, color: C.text3, paddingHorizontal: 16, paddingVertical: 2 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  hero: { backgroundColor: C.s1, borderRadius: radius.lg, padding: 16, marginTop: 8, marginBottom: 10 },
  bloqueLabel: { fontSize: font.xs, color: C.acc, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  exName: { fontSize: 20, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 4 },
  exReps: { fontSize: font.md, color: C.text2, textAlign: 'center', marginBottom: 10 },
  exDesc: { fontSize: font.sm, color: C.text2, lineHeight: 20, textAlign: 'center', marginBottom: 8 },
  tip: { backgroundColor: 'rgba(232,255,71,0.08)', borderRadius: 8, padding: 9, marginBottom: 10 },
  tipText: { fontSize: font.sm, color: C.acc, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  mainBtn: { flex: 1, backgroundColor: C.acc, borderRadius: radius.sm, paddingVertical: 13, alignItems: 'center' },
  mainBtnText: { fontSize: font.md, fontWeight: '800', color: '#0f0f0f' },
  skipBtn: { backgroundColor: C.s2, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 13, alignItems: 'center' },
  skipText: { fontSize: font.md, color: C.text2, fontWeight: '600' },
  tracker: { backgroundColor: C.s1, borderRadius: radius.lg, marginBottom: 10, overflow: 'hidden' },
  trackerHdr: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6, fontSize: font.xs, color: C.text2, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.s2 },
  setLabel: { fontSize: font.xs, color: C.text2 },
  setDetail: { fontSize: font.sm, color: C.text, fontWeight: '600' },
  nextCard: { backgroundColor: C.s2, borderRadius: radius.sm, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  nextLbl: { fontSize: 10, color: C.text2, letterSpacing: 1, fontWeight: '700' },
  nextName: { fontSize: font.md, fontWeight: '600', color: C.text, marginTop: 2 },
  pauseContainer: { alignItems: 'center', paddingVertical: 10 },
  pauseTitle: { fontSize: font.lg, color: C.acc, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  pauseSub: { fontSize: font.sm, color: C.text2, marginTop: 4 },
});
