# Sing Musically — Technical Design

## Stack
| Layer | Technology |
|---|---|
| UI | React 18 + TypeScript |
| Routing | React Router v6 |
| State | Zustand (session, mixer) |
| Styling | Tailwind CSS (custom ink/mint/gold palette) |
| Build | Vite |
| Backend | Supabase (Auth, Postgres, Storage) |
| Audio capture | Web Audio API + MediaRecorder |
| Audio playback | HTMLAudioElement via `useAudioPlayer` hook |

---

## Supabase Integration

### Client (`src/lib/supabaseClient.ts`)
Single `createClient` instance exported. `isSupabaseConfigured` guards the app from running without credentials — shows `SetupScreen` if env vars are missing.

```
VITE_SUPABASE_URL=https://ugbecqadahcbkhdbkgjb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ft5bHY1Oxy8xSHuOvDEEpA_bP2xDbfu
```

### Service layer (`src/services/`)
All Supabase calls are isolated in `supabaseDataService.ts` behind the `DataService` interface. Screens import `dataService` from `src/services/index.ts` and never touch Supabase directly.

### Auth flow
1. `signUp` → `supabase.auth.signUp` → DB trigger creates `profiles` row → `waitForProfile` polls until row exists
2. `signIn` → `supabase.auth.signInWithPassword` → fetches profile row
3. `hydrate` (called on app mount) → `supabase.auth.getUser` → re-establishes session from stored JWT

---

## Database Schema

### `profiles`
Auto-created by `handle_new_user` trigger on `auth.users` insert.
RLS: anyone can SELECT; only owner can UPDATE.

### `songs`
Core content unit. Has `master_waveform` (JSONB array) and `mix_quality`.
RLS: owner has full access; public songs are SELECT-able by anyone.

### `tracks`
Child of `songs`. Stores mixer state (volume, pan, muted, soloed) and a `storage_path` pointing to the audio file in the `audio` bucket.
RLS: access follows parent song's owner/public rules.

### `live_sessions`
Lifecycle rows only; no actual audio stream stored.
RLS: anyone can SELECT; only host can INSERT/UPDATE/DELETE.

### `follows`
Simple join table. RLS: anyone reads; follower manages own rows.

---

## Audio Pipeline

### Recording
```
getUserMedia → MediaStream
  → AudioContext → AnalyserNode  (drives live waveform + level meter)
  → MediaRecorder                (captures encoded audio chunks)
       ↓ on stop
  Blob (webm/ogg)
       ↓ on save
  supabase.storage.upload(audio/{userId}/{timestamp}.webm)
       ↓
  INSERT songs + INSERT tracks (storage_path = bucket path)
```

### Upload
```
File (mp3/wav/m4a)
  → OfflineAudioContext.decodeAudioData  (client-side waveform extraction)
  → supabase.storage.upload
  → INSERT songs + INSERT tracks
```

### Playback
```
track.storage_path
  → supabase.storage.createSignedUrl (1h TTL)
  → HTMLAudioElement.src = signedUrl
  → useAudioPlayer hook exposes { play, pause, toggle, seek, currentTime, duration }
```

---

## State Architecture

### `useSessionStore` (Zustand)
Holds `user: UserProfile | null` and `isLoading`. Methods: `hydrate`, `signIn`, `signUp`, `signOut`, `updateProfile`.

### `useMixerStore` (Zustand)
Holds `song: Song | null`. Slider/mute/solo actions update local state immediately (optimistic) then persist to `tracks` table asynchronously.

---

## Folder Structure
```
src/
  components/
    layout/   AppShell, Sidebar, MobileNav
    ui/        Card, Pill, Waveform, MixerSlider, LevelMeter, Toast, TopBar
  hooks/       useRecorder, useAudioPlayer
  lib/         supabaseClient, types
  screens/     Home, Login, Signup, Record, Mix, Upload, Library,
               Explore, GoLive, Profile, Settings, Setup
  services/    dataService (interface), supabaseDataService, index
  state/       sessionStore, mixerStore
  data/        mockData (kept for fakeWaveform utility only)
```
