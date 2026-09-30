import { useCallback, useEffect, useRef, useState } from 'react';

interface UseRecorderResult {
  isRecording: boolean;
  elapsedMs: number;
  inputLevel: number;
  waveform: number[];
  audioBlob: Blob | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
  permissionDenied: boolean;
}

const WAVEFORM_BUFFER_SIZE = 40;

export function useRecorder(): UseRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [inputLevel, setInputLevel] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(Array(WAVEFORM_BUFFER_SIZE).fill(0.08));
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const tick = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    setElapsedMs(elapsed);

    if (analyserRef.current) {
      const analyser = analyserRef.current;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const level = Math.min(1, rms * 4);

      setInputLevel(level);
      setWaveform((prev) => [...prev.slice(1), Math.max(0.08, level)]);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionDenied(false);

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start(100);

      startTimeRef.current = performance.now();
      setIsRecording(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setPermissionDenied(true);
    }
  }, [tick]);

  const stop = useCallback(() => {
    setIsRecording(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
  }, []);

  const reset = useCallback(() => {
    stop();
    setElapsedMs(0);
    setInputLevel(0);
    setWaveform(Array(WAVEFORM_BUFFER_SIZE).fill(0.08));
    setAudioBlob(null);
  }, [stop]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
  }, []);

  return { isRecording, elapsedMs, inputLevel, waveform, audioBlob, start, stop, reset, permissionDenied };
}
