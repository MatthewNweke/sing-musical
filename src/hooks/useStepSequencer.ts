import { useCallback, useEffect, useRef, useState } from 'react';
import type { InstrumentTrack } from '@/lib/types';

interface UseStepSequencerResult {
    isPlaying: boolean;
    currentStep: number; // 0-15
    start: (bpm: number, instruments: InstrumentTrack[]) => void;
    stop: () => void;
    updateInstruments: (instruments: InstrumentTrack[]) => void;
}

const STEPS = 16;

export function useStepSequencer(): UseStepSequencerResult {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const timerRef = useRef<number | null>(null);
    const nextStepTimeRef = useRef(0);
    const stepIndexRef = useRef(0);
    const instrumentsRef = useRef<InstrumentTrack[]>([]);

    // Frequency map for simple oscillator-based sounds
    const INST_FREQS: Record<string, number> = {
        Kick: 80, '808': 60, Snare: 200, Clap: 1200, 'Hi-Hat': 8000,
        'Open HH': 6000, Shaker: 9000, Ride: 7000, Brush: 300,
        Bass: 120, Guitar: 330, Acoustic: 300, Organ: 260, Piano: 440,
        Strings: 520, Cello: 180, Flute: 880, Fiddle: 660,
        Synth: 440, Pad: 360, Choir: 520, 'Talking Drum': 180,
        'Choir Pad': 520, default: 440,
    };

    const triggerInstrument = useCallback((ctx: AudioContext, name: string, color: string, time: number) => {
        const freq = INST_FREQS[name] ?? INST_FREQS.default;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Percussion-like: short sharp burst
        if (freq > 3000) {
            // Hi-hat / shaker — noise-like
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
            osc.start(time);
            osc.stop(time + 0.05);
        } else if (freq < 150) {
            // Kick / 808 — low thump
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq * 2, time);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.15);
            gain.gain.setValueAtTime(0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
            osc.start(time);
            osc.stop(time + 0.35);
        } else {
            // Melodic / snare
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.25, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
            osc.start(time);
            osc.stop(time + 0.15);
        }
        // Suppress unused param warning
        void color;
    }, []);

    const schedule = useCallback((bpm: number) => {
        const ctx = audioCtxRef.current!;
        const secondsPerStep = (60 / bpm) / 4; // 16th note
        const lookAhead = 0.1;

        while (nextStepTimeRef.current < ctx.currentTime + lookAhead) {
            const step = stepIndexRef.current % STEPS;
            const t = nextStepTimeRef.current;

            instrumentsRef.current.forEach((inst) => {
                if (!inst.muted && inst.pattern[step]) {
                    triggerInstrument(ctx, inst.name, inst.color, t);
                }
            });

            setTimeout(() => setCurrentStep(step), Math.max(0, (t - ctx.currentTime) * 1000));

            stepIndexRef.current++;
            nextStepTimeRef.current += secondsPerStep;
        }

        timerRef.current = window.setTimeout(() => schedule(bpm), 25);
    }, [triggerInstrument]);

    const start = useCallback((bpm: number, instruments: InstrumentTrack[]) => {
        instrumentsRef.current = instruments;
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
        nextStepTimeRef.current = audioCtxRef.current.currentTime + 0.05;
        stepIndexRef.current = 0;
        setIsPlaying(true);
        setCurrentStep(0);
        schedule(bpm);
    }, [schedule]);

    const stop = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        audioCtxRef.current?.close();
        audioCtxRef.current = null;
        setIsPlaying(false);
        setCurrentStep(0);
    }, []);

    const updateInstruments = useCallback((instruments: InstrumentTrack[]) => {
        instrumentsRef.current = instruments;
    }, []);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        audioCtxRef.current?.close();
    }, []);

    return { isPlaying, currentStep, start, stop, updateInstruments };
}
