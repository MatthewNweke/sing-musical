import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAudioPlayerResult {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isReady: boolean;
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
    const [isReady, setIsReady] = useState(false);
    const blobUrlRef = useRef<string | null>(null);

    const getAudio = useCallback((): HTMLAudioElement => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.preload = 'metadata';
        }
        return audioRef.current;
    }, []);

    useEffect(() => {
        const audio = getAudio();

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onDurationChange = () => {
            if (isFinite(audio.duration)) setDuration(audio.duration);
        };
        const onEnded = () => setIsPlaying(false);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onCanPlay = () => setIsReady(true);
        const onError = () => setIsReady(false);
        const onLoadStart = () => setIsReady(false);

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('durationchange', onDurationChange);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('error', onError);
        audio.addEventListener('loadstart', onLoadStart);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('durationchange', onDurationChange);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('loadstart', onLoadStart);
        };
    }, [getAudio]);

    // Cleanup on unmount
    useEffect(() => () => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.src = '';
        }
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }
    }, []);

    const load = useCallback((src: string | Blob) => {
        const audio = getAudio();

        // Stop current playback
        audio.pause();

        // Revoke previous blob URL to free memory
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }

        const url = src instanceof Blob ? URL.createObjectURL(src) : src;
        if (src instanceof Blob) blobUrlRef.current = url;

        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setIsReady(false);

        audio.src = url;
        audio.load();
    }, [getAudio]);

    const play = useCallback(() => {
        getAudio().play().catch(() => {
            // Autoplay blocked or not ready — silently ignore, user can retry
        });
    }, [getAudio]);

    const pause = useCallback(() => {
        getAudio().pause();
    }, [getAudio]);

    const toggle = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

    const seek = useCallback((time: number) => {
        const audio = getAudio();
        if (isFinite(time)) audio.currentTime = time;
    }, [getAudio]);

    return { isPlaying, currentTime, duration, isReady, play, pause, toggle, seek, load };
}
