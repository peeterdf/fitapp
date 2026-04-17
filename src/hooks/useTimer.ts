import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * useTimer — elapsed-time stopwatch.
 * Uses Date.now() anchors so that AppState transitions (background/foreground)
 * don't cause drift. The interval only drives re-renders; the actual elapsed
 * time is always recalculated from wall-clock references.
 */
export function useTimer(autoStart = false) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Wall-clock anchor: Date.now() when the timer last (re)started.
  const anchorRef = useRef<number>(Date.now());
  // Seconds accumulated in previous sessions (before stop → start cycles).
  const baseRef = useRef<number>(0);
  const runningRef = useRef(autoStart);
  runningRef.current = running;

  const getTotal = useCallback((): number =>
    baseRef.current + Math.floor((Date.now() - anchorRef.current) / 1000),
  []);

  // Drive re-renders while running.
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(getTotal()), 500);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [running, getTotal]);

  // Re-sync immediately when the app returns to foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active' && runningRef.current) setSeconds(getTotal());
    });
    return () => sub.remove();
  }, [getTotal]);

  const start = useCallback(() => {
    if (!runningRef.current) {
      // Resuming: do NOT reset base — just set a fresh anchor.
      anchorRef.current = Date.now();
    }
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    baseRef.current = getTotal();
    setRunning(false);
  }, [getTotal]);

  const reset = useCallback(() => {
    baseRef.current = 0;
    anchorRef.current = Date.now();
    setSeconds(0);
    setRunning(false);
  }, []);

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return { seconds, running, fmt, start, stop, reset };
}

/**
 * useCountdown — fixed-duration countdown.
 * Stores the absolute end time so the remaining value is always
 * correct even after a long background session.
 */
export function useCountdown(initial: number, onDone?: () => void) {
  const [seconds, setSeconds] = useState(initial);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Absolute epoch (ms) when the countdown should reach zero.
  const endAtRef = useRef<number>(0);
  const doneRef = useRef(onDone);
  const runningRef = useRef(false);
  doneRef.current = onDone;
  runningRef.current = running;

  const tick = useCallback(() => {
    const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
    setSeconds(remaining);
    if (remaining <= 0) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      setRunning(false);
      doneRef.current?.();
    }
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 500);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [running, tick]);

  // Re-sync when app returns to foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active' && runningRef.current) tick();
    });
    return () => sub.remove();
  }, [tick]);

  const start = useCallback((from?: number) => {
    const secs = from !== undefined ? from : initial;
    setSeconds(secs);
    endAtRef.current = Date.now() + secs * 1000;
    setRunning(true);
  }, [initial]);

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setRunning(false);
  }, []);

  const reset = useCallback((val: number) => {
    stop();
    setSeconds(val);
  }, [stop]);

  return { seconds, running, start, stop, reset };
}
