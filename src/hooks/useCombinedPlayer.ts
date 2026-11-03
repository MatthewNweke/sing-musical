import { useCallback, useEffect, useRef, useState } from 'react';
import type { InstrumentTrack } from '@/lib/types';

/**
 * Plays a vocal audio URL and a step-sequencer arrangement through the same
 * AudioContext so they are perfectly time-aligned.
 *
 * Vocal audio is decoded once and played as a BufferSource.
 * Instruments are triggered as oscillator bursts on each 16th-note step.
 */

const STEPS = 16;

const INST_FREQS: Record<string, number> = {
    Kick: 80, '808': 60, Snare: 200, Clap: 1200, 'Hi-Hat': 8000,
    'Open HH': 6000, Shaker: 9000, Ride: 7000, Brush: 300,
    Bass: 120, Guitar: 330, Acoustic: 300, Organ: 260, Piano: 440,
    Strings: 520, Cello: 180, Flute: 880, Fiddle: 660,
    Synth: 440, Pad: 360, Choir: 520, 'Talking Drum': 180,
    'Choir Pad': 520,
};

function triggerInstrument(ctx: AudioContext, name: string, volume: number, time: number) {
    const freq = INST_FREQS[name] ?? 440;
    const gain = volume / 100;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (freq > 3000) {
        osc.type = 'square';
        osc.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.12 * gain, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        osc.start(time); osc.stop(time + 0.05);
    } else if (freq < 150) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 2, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.15);
        gainNode.gain.setValueAtTime(0.45 * gain, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
        osc.start(time); osc.stop(time + 0.35);
    } else {
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.22 * gain, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        osc.start(time); osc.stop(time + 0.15);
    }
}

interface UseCombinedPlayerResult {
    isPlaying: boolean;
    currentStep: number;
    currentTime: number;
    duration: number;
    isLoadingVocal: boolean;
    loadVocal: (url: string) => Promise<void>;
    start: (bpm: number, instruments: InstrumentTrack[]) => void;
    stop: () => void;
    toggle: (bpm: number, instruments: InstrumentTrack[]) => void;
}

export function useCombinedPlayer(): UseCombinedPlayerResult {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoadingVocal, setIsLoadingVocal] = useState(false);

    const ctxRef = useRef<AudioContext | null>(null);
    const vocalBufferRef = useRef<AudioBuffer | null>(null);
    const vocalSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const seqTimerRef = useRef<number | null>(null);
    const nextStepTimeRef = useRef(0);
    const stepIndexRef = useRef(0);
    const instrumentsRef = useRef<InstrumentTrack[]>([]);
    const rafRef = useRef<number | null>(null);
    const startAtRef = useRef(0); // ctx time when playback began

    const getCtx = useCallback(() => {
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
            const AudioCtx = window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            ctxRef.current = new AudioCtx();
        }
        return ctxRef.current;
    }, []);

    const loadVocal = useCallback(async (url: string) => {
        setIsLoadingVocal(true);
        try {
            const ctx = getCtx();
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            vocalBufferRef.current = audioBuffer;
            setDuration(audioBuffer.duration);
        } catch {
            vocalBufferRef.current = null;
        } finally {
            setIsLoadingVocal(false);
        }
    }, [getCtx]);

    const scheduleSeq = useCallback((bpm: number) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        const secondsPerStep = (60 / bpm) / 4;
        const lookAhead = 0.1;

        while (nextStepTimeRef.current < ctx.currentTime + lookAhead) {
            const step = stepIndexRef.current % STEPS;
            const t = nextStepTimeRef.current;

            instrumentsRef.current.forEach((inst) => {
                if (!inst.muted && inst.pattern[step]) {
                    triggerInstrument(ctx, inst.name, inst.volume, t);
                }
            });

            const delay = Math.max(0, (t - ctx.currentTime) * 1000);
            setTimeout(() => setCurrentStep(step), delay);

            stepIndexRef.current++;
            nextStepTimeRef.current += secondsPerStep;
        }

        seqTimerRef.current = window.setTimeout(() => scheduleSeq(bpm), 25);
    }, []);

    const updateTime = useCallback(() => {
        const ctx = ctxRef.current;
        if (!ctx || !isPlaying) return;
        setCurrentTime(ctx.currentTime - startAtRef.current);
        rafRef.current = requestAnimationFrame(updateTime);
    }, [isPlaying]);

    const start = useCallback((bpm: number, instruments: InstrumentTrack[]) => {
        const ctx = getCtx();
        instrumentsRef.current = instruments;

        // Start step sequencer
        nextStepTimeRef.current = ctx.currentTime + 0.05;
        stepIndexRef.current = 0;
        scheduleSeq(bpm);

        // Start vocal if loaded
        if (vocalBufferRef.current) {
            const source = ctx.createBufferSource();
            source.buffer = vocalBufferRef.current;
            // Gentle gain for vocal
            const gainNode = ctx.createGain();
            gainNode.gain.value = 0.9;
            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            source.start(ctx.currentTime + 0.05);
            source.onended = () => {
                if (isPlaying) {
                    // Vocal ended — keep sequencer going (loop or stop gracefully)
                }
            };
            vocalSourceRef.current = source;
        }

        startAtRef.current = ctx.currentTime;
        setIsPlaying(true);
        setCurrentTime(0);
        rafRef.current = requestAnimationFrame(updateTime);
    }, [getCtx, scheduleSeq, updateTime, isPlaying]);

    const stop = useCallback(() => {
        if (seqTimerRef.current) clearTimeout(seqTimerRef.current);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        try { vocalSourceRef.current?.stop(); } catch { /* already stopped */ }
        vocalSourceRef.current = null;

        // Close and recreate context on next start so oscillators clean up
        ctxRef.current?.close().catch(() => { });
        ctxRef.current = null;

        setIsPlaying(false);
        setCurrentStep(0);
    }, []);

    const toggle = useCallback((bpm: number, instruments: InstrumentTrack[]) => {
        if (isPlaying) stop();
        else start(bpm, instruments);
    }, [isPlaying, start, stop]);

    useEffect(() => () => {
        if (seqTimerRef.current) clearTimeout(seqTimerRef.current);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        ctxRef.current?.close().catch(() => { });
    }, []);

    return {
        isPlaying, currentStep, currentTime, duration, isLoadingVocal,
        loadVocal, start, stop, toggle,
    };
}
