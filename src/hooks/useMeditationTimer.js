import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';

const BREATHE_PHASES = ['Breathe in…', 'Hold…', 'Breathe out…', 'Rest…'];
const BREATHE_DURATIONS = [4000, 2000, 6000, 2000];

export function useMeditationTimer(onComplete) {
  const { forcePlay } = useAudio();
  const [durationMins, setDurationMins] = useState(5);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [breathePhase, setBreathePhase] = useState('Find stillness…');
  const [breatheScale, setBreatheScale] = useState(1);
  const [complete, setComplete] = useState(false);

  const intervalRef = useRef(null);
  const breatheTimeoutRef = useRef(null);
  const breatheIdxRef = useRef(0);
  const totalSeconds = durationMins * 60;

  const clearAll = useCallback(() => {
    clearInterval(intervalRef.current);
    clearTimeout(breatheTimeoutRef.current);
  }, []);

  const runBreathe = useCallback(function step() {
    const idx = breatheIdxRef.current;
    setBreathePhase(BREATHE_PHASES[idx]);
    if (idx === 0) setBreatheScale(1.5);
    else if (idx === 2) setBreatheScale(1);
    else setBreatheScale(1.25);

    breatheTimeoutRef.current = setTimeout(() => {
      breatheIdxRef.current = (idx + 1) % 4;
      step();
    }, BREATHE_DURATIONS[idx]);
  }, []);

  const start = useCallback(() => {
    forcePlay();
    setRunning(true);
    setComplete(false);
    breatheIdxRef.current = 0;
    runBreathe();
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearAll();
          setRunning(false);
          setComplete(true);
          setBreathePhase('Session complete 🙏');
          if (onComplete) {
            onComplete(durationMins);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [runBreathe, clearAll, onComplete, durationMins, forcePlay]);

  const pause = useCallback(() => {
    clearAll();
    setRunning(false);
    setBreathePhase('Paused');
  }, [clearAll]);

  const reset = useCallback(() => {
    clearAll();
    setRunning(false);
    setComplete(false);
    setTimeLeft(durationMins * 60);
    setBreathePhase('Find stillness…');
    setBreatheScale(1);
    breatheIdxRef.current = 0;
  }, [durationMins, clearAll]);

  const setDuration = useCallback(
    (mins) => {
      if (running) return;
      setDurationMins(mins);
      setTimeLeft(mins * 60);
      setComplete(false);
      setBreathePhase('Find stillness…');
    },
    [running]
  );

  useEffect(() => () => clearAll(), [clearAll]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const progress = totalSeconds > 0 ? 1 - timeLeft / totalSeconds : 0;
  const circumference = 2 * Math.PI * 100;
  const dashOffset = circumference * (1 - progress);

  return {
    durationMins,
    timeLeft,
    running,
    complete,
    breathePhase,
    breatheScale,
    displayTime,
    dashOffset,
    circumference,
    start,
    pause,
    reset,
    setDuration,
  };
}
