import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAudioPlayerResult {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    play: () => void;
    pause: () => void;
    toggle: () => void;
    seek: (time: number) => void;
    load: (src: string | Blob) => void;
}

export function useAudioPlayer(): UseAudioPlayerResult {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const urlRef = useRef<string | null>(null);

    const getAudio = useCallback(() => {
        if (!audioRef.current) audioRef.current = new Audio();
        return audioRef.current;
    }, []);

    const load = useCallback((src: string | Blob) => {
        const audio = getAudio();
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const url = src instanceof Blob ? URL.createObjectURL(src) : src;
        urlRef.current = src instanceof Blob ? url : null;
        audio.src = url;
        audio.load();
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    }, [getAudio]);

    useEffect(() => {
        const audio = getAudio();

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onDurationChange = () => setDuration(audio.duration || 0);
        const onEnded = () => setIsPlaying(false);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('durationchange', onDurationChange);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('durationchange', onDurationChange);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        };
    }, [getAudio]);

    useEffect(() => () => {
        audioRef.current?.pause();
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    }, []);

    const play = useCallback(() => { getAudio().play().catch(() => { }); }, [getAudio]);
    const pause = useCallback(() => { getAudio().pause(); }, [getAudio]);
    const toggle = useCallback(() => { if (isPlaying) { pause(); } else { play(); } }, [isPlaying, play, pause]);
    const seek = useCallback((time: number) => { getAudio().currentTime = time; }, [getAudio]);

    return { isPlaying, currentTime, duration, play, pause, toggle, seek, load };
}
