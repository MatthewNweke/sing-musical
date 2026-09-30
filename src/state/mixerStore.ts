import { create } from 'zustand';
import type { MixTrack, Song } from '@/lib/types';
import { dataService } from '@/services';

interface MixerState {
  song: Song | null;
  isLoading: boolean;
  loadSong: (songId: string) => Promise<void>;
  setVolume: (trackId: string, volume: number) => void;
  setPan: (trackId: string, pan: number) => void;
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
}

// Slider drags update local state immediately (so the UI never feels
// laggy) and persist to the data layer in the background.
export const useMixerStore = create<MixerState>((set, get) => ({
  song: null,
  isLoading: false,

  loadSong: async (songId) => {
    set({ isLoading: true });
    const song = await dataService.getSong(songId);
    set({ song, isLoading: false });
  },

  setVolume: (trackId, volume) => {
    updateTrackLocally(set, get, trackId, { volume });
    void dataService.updateTrack(get().song!.id, trackId, { volume });
  },

  setPan: (trackId, pan) => {
    updateTrackLocally(set, get, trackId, { pan });
    void dataService.updateTrack(get().song!.id, trackId, { pan });
  },

  toggleMute: (trackId) => {
    const track = get().song?.tracks.find((t) => t.id === trackId);
    if (!track) return;
    updateTrackLocally(set, get, trackId, { muted: !track.muted });
    void dataService.updateTrack(get().song!.id, trackId, { muted: !track.muted });
  },

  toggleSolo: (trackId) => {
    const track = get().song?.tracks.find((t) => t.id === trackId);
    if (!track) return;
    updateTrackLocally(set, get, trackId, { soloed: !track.soloed });
    void dataService.updateTrack(get().song!.id, trackId, { soloed: !track.soloed });
  },
}));

function updateTrackLocally(
  set: (partial: Partial<MixerState>) => void,
  get: () => MixerState,
  trackId: string,
  patch: Partial<MixTrack>,
) {
  const song = get().song;
  if (!song) return;
  set({
    song: {
      ...song,
      tracks: song.tracks.map((t) => (t.id === trackId ? { ...t, ...patch } : t)),
    },
  });
}
