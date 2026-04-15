import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(autoStart = false) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const stop = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => { setSeconds(0); setRunning(false); }, []);

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return { seconds, running, fmt, start, stop, reset };
}

export function useCountdown(initial: number, onDone?: () => void) {
  const [seconds, setSeconds] = useState(initial);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const start = useCallback((from?: number) => {
    if (from !== undefined) setSeconds(from);
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    if (ref.current) clearInterval(ref.current);
  }, []);

  const reset = useCallback((val: number) => {
    stop();
    setSeconds(val);
  }, [stop]);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(ref.current!);
          setRunning(false);
          doneRef.current?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  return { seconds, running, start, stop, reset };
}
