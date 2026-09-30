import type { DataService } from './dataService';
import type { Song, UserProfile, LiveSession, MixTrack, TrackRole } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

// Real implementation against the schema in supabase/schema.sql.
// Row shapes are snake_case (Postgres convention); we map to the
// camelCase domain types here so nothing outside this file ever
// sees a raw DB row.

// Raw Postgres rows come back untyped from supabase-js's generic client
// (we haven't generated typed schema bindings here) — the mappers below
// are the one place that's allowed to know that.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>;

function mapProfile(row: DbRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    handle: row.handle,
    avatarUrl: row.avatar_url,
    bio: row.bio ?? '',
    followerCount: row.follower_count ?? 0,
    followingCount: row.following_count ?? 0,
    createdAt: row.created_at,
  };
}

function mapTrack(row: DbRow): MixTrack {
  return {
    id: row.id,
    role: row.role as TrackRole,
    label: row.label,
    sublabel: row.sublabel ?? '',
    color: row.color,
    volume: row.volume,
    pan: row.pan,
    muted: row.muted,
    soloed: row.soloed,
    waveform: row.waveform ?? [],
  };
}

function mapSong(row: DbRow): Song {
  return {
    id: row.id,
    title: row.title,
    key: row.key,
    bpm: row.bpm,
    durationSeconds: row.duration_seconds,
    createdAt: row.created_at,
    coverColor: row.cover_color,
    masterWaveform: row.master_waveform ?? [],
    masterLevelDb: Number(row.master_level_db),
    mixQuality: row.mix_quality,
    ownerId: row.owner_id,
    isPublic: row.is_public,
    plays: row.plays,
    tracks: (row.tracks ?? []).map(mapTrack),
  };
}

const SONG_SELECT = '*, tracks(*)';

export const supabaseDataService: DataService = {
  async getCurrentUser() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', auth.user.id).single();
    if (error) throw error;
    return mapProfile(data);
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError) throw profileError;
    return mapProfile(profile);
  },

  async signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
    // profiles row is created by the on_auth_user_created trigger
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user!.id)
      .single();
    if (profileError) throw profileError;
    return mapProfile(profile);
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSongs(ownerId) {
    const { data, error } = await supabase.from('songs').select(SONG_SELECT).eq('owner_id', ownerId);
    if (error) throw error;
    return data.map(mapSong);
  },

  async getSong(songId) {
    const { data, error } = await supabase.from('songs').select(SONG_SELECT).eq('id', songId).maybeSingle();
    if (error) throw error;
    return data ? mapSong(data) : null;
  },

  async createSong({ title, key, bpm, ownerId }) {
    const { data, error } = await supabase
      .from('songs')
      .insert({ title, key, bpm, owner_id: ownerId })
      .select(SONG_SELECT)
      .single();
    if (error) throw error;
    return mapSong(data);
  },

  async updateTrack(_songId, trackId, patch) {
    const dbPatch: Record<string, unknown> = {};
    if (patch.volume !== undefined) dbPatch.volume = patch.volume;
    if (patch.pan !== undefined) dbPatch.pan = patch.pan;
    if (patch.muted !== undefined) dbPatch.muted = patch.muted;
    if (patch.soloed !== undefined) dbPatch.soloed = patch.soloed;
    const { data, error } = await supabase.from('tracks').update(dbPatch).eq('id', trackId).select().single();
    if (error) throw error;
    return mapTrack(data);
  },

  async deleteSong(songId) {
    const { error } = await supabase.from('songs').delete().eq('id', songId);
    if (error) throw error;
  },

  async uploadAudioFile(file, songTitle, ownerId) {
    const path = `${ownerId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('audio').upload(path, file);
    if (uploadError) throw uploadError;

    // NOTE: bpm/key detection and waveform extraction need a real analysis
    // step (client-side via Web Audio OfflineAudioContext, or a server-side
    // job). This inserts a placeholder row so the rest of the app has
    // something to render immediately; wire the analysis step in before
    // relying on these numbers.
    const { data, error } = await supabase
      .from('songs')
      .insert({
        title: songTitle || file.name.replace(/\.[^/.]+$/, ''),
        owner_id: ownerId,
        cover_color: 'gold',
      })
      .select(SONG_SELECT)
      .single();
    if (error) throw error;

    await supabase.from('tracks').insert({
      song_id: data.id,
      role: 'upload',
      label: 'Uploaded track',
      sublabel: file.name,
      color: 'mint',
      storage_path: path,
    });

    return mapSong(data);
  },

  async getLiveSessions() {
    const { data, error } = await supabase.from('live_sessions').select('*').eq('is_live', true);
    if (error) throw error;
    return data.map((row: DbRow) => ({
      id: row.id,
      hostId: row.host_id,
      title: row.title,
      isLive: row.is_live,
      listenerCount: row.listener_count,
      startedAt: row.started_at,
    })) as LiveSession[];
  },

  async startLiveSession(hostId, title) {
    // NOTE: this creates the session row. Actual audio broadcast needs a
    // realtime transport (e.g. LiveKit, Agora, or Supabase Realtime purely
    // for signaling + WebRTC for media) — not in scope of this data layer.
    const { data, error } = await supabase
      .from('live_sessions')
      .insert({ host_id: hostId, title })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      hostId: data.host_id,
      title: data.title,
      isLive: data.is_live,
      listenerCount: data.listener_count,
      startedAt: data.started_at,
    };
  },

  async endLiveSession(sessionId) {
    const { error } = await supabase
      .from('live_sessions')
      .update({ is_live: false, ended_at: new Date().toISOString() })
      .eq('id', sessionId);
    if (error) throw error;
  },

  async followUser(followerId, targetId) {
    const { error } = await supabase.from('follows').insert({ follower_id: followerId, followee_id: targetId });
    if (error) throw error;
  },

  async getFeed() {
    const { data, error } = await supabase.from('songs').select(SONG_SELECT).eq('is_public', true).limit(50);
    if (error) throw error;
    return data.map(mapSong);
  },
};
