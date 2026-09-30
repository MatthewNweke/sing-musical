import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecorderFrame } from '@/lib/types';

interface UseRecorderResult {
  isRecording: boolean;
  elapsedMs: number;
  inputLevel: number;
  waveform: number[]; // rolling buffer of recent samples, newest last
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const WAVEFORM_BUFFER_SIZE = 40;

/**
 * Drives the Record screen's timer, input meter and live waveform.
 *
 * Today this generates believable fake frames on a rAF loop. To go live:
 * 1. Request `navigator.mediaDevices.getUserMedia({ audio: true })`
 * 2. Feed the stream into an AudioContext + AnalyserNode
 * 3. Replace `generateFakeFrame` below with a read of analyser.getByteTimeDomainData
 * 4. Everything else — state shape, the component using this hook — stays identical,
 *    because RecorderFrame is the same shape either way.
 */
export function useRecorder(): UseRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [inputLevel, setInputLevel] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(Array(WAVEFORM_BUFFER_SIZE).fill(0.08));

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const generateFakeFrame = useCallback((elapsed: number): RecorderFrame => {
    const t = elapsed / 1000;
    const level = 0.25 + 0.35 * Math.abs(Math.sin(t * 2.2)) + 0.15 * Math.random();
    return {
      elapsedMs: elapsed,
      inputLevel: Math.min(1, level),
      waveformSample: Math.min(1, level + Math.random() * 0.1),
    };
  }, []);

  const tick = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    const frame = generateFakeFrame(elapsed);
    setElapsedMs(frame.elapsedMs);
    setInputLevel(frame.inputLevel);
    setWaveform((prev) => [...prev.slice(1), frame.waveformSample]);
    rafRef.current = requestAnimationFrame(tick);
  }, [generateFakeFrame]);

  const start = useCallback(() => {
    startTimeRef.current = performance.now() - elapsedMs;
    setIsRecording(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [elapsedMs, tick]);

  const stop = useCallback(() => {
    setIsRecording(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const reset = useCallback(() => {
    stop();
    setElapsedMs(0);
    setInputLevel(0);
    setWaveform(Array(WAVEFORM_BUFFER_SIZE).fill(0.08));
  }, [stop]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return { isRecording, elapsedMs, inputLevel, waveform, start, stop, reset };
}
