import { useCallback, useEffect, useRef, useState } from 'react';

interface UseMetronomeResult {
    isPlaying: boolean;
    beat: number;        // 0-based current beat (0-3)
    countIn: number;     // remaining count-in beats (0 = done)
    start: (bpm: number, onCountInDone?: () => void) => void;
    stop: () => void;
}

const COUNT_IN_BEATS = 4;

export function useMetronome(): UseMetronomeResult {
    const [isPlaying, setIsPlaying] = useState(false);
    const [beat, setBeat] = useState(0);
    const [countIn, setCountIn] = useState(0);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const nextBeatTimeRef = useRef(0);
    const beatIndexRef = useRef(0);
    const countInLeftRef = useRef(0);
    const timerRef = useRef<number | null>(null);
    const onDoneRef = useRef<(() => void) | null>(null);

    const scheduleClick = useCallback((time: number, accented: boolean) => {
        const ctx = audioCtxRef.current!;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = accented ? 1000 : 800;
        gain.gain.setValueAtTime(accented ? 0.4 : 0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        osc.start(time);
        osc.stop(time + 0.07);
    }, []);

    const schedule = useCallback((bpm: number) => {
        const ctx = audioCtxRef.current!;
        const secondsPerBeat = 60 / bpm;
        const lookAhead = 0.1;

        while (nextBeatTimeRef.current < ctx.currentTime + lookAhead) {
            const t = nextBeatTimeRef.current;
            const isFirst = beatIndexRef.current % 4 === 0;

            if (countInLeftRef.current > 0) {
                scheduleClick(t, isFirst);
                const remaining = countInLeftRef.current - 1;
                countInLeftRef.current = remaining;
                setTimeout(() => {
                    setCountIn(remaining);
                    if (remaining === 0) onDoneRef.current?.();
                }, Math.max(0, (t - ctx.currentTime) * 1000));
            } else {
                scheduleClick(t, isFirst);
                const b = beatIndexRef.current % 4;
                setTimeout(() => setBeat(b), Math.max(0, (t - ctx.currentTime) * 1000));
            }

            beatIndexRef.current++;
            nextBeatTimeRef.current += secondsPerBeat;
        }

        timerRef.current = window.setTimeout(() => schedule(bpm), 25);
    }, [scheduleClick]);

    const start = useCallback((bpm: number, onCountInDone?: () => void) => {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
        nextBeatTimeRef.current = audioCtxRef.current.currentTime + 0.1;
        beatIndexRef.current = 0;
        countInLeftRef.current = COUNT_IN_BEATS;
        onDoneRef.current = onCountInDone ?? null;
        setCountIn(COUNT_IN_BEATS);
        setBeat(0);
        setIsPlaying(true);
        schedule(bpm);
    }, [schedule]);

    const stop = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        audioCtxRef.current?.close();
        audioCtxRef.current = null;
        setIsPlaying(false);
        setBeat(0);
        setCountIn(0);
    }, []);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        audioCtxRef.current?.close();
    }, []);

    return { isPlaying, beat, countIn, start, stop };
}
