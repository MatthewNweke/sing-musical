# Sing Musically — Requirements

## Overview
A browser-based vocal recording and mixing web app. Users sign up, record vocals using their microphone, layer harmonies, mix tracks, and optionally share songs publicly. All data is persisted in Supabase (Postgres + Storage).

---

## Authentication
- Users register with email, password, and display name
- Users log in with email and password
- Sessions persist across browser refreshes via Supabase JWT tokens
- Protected routes redirect unauthenticated users to `/login`
- Sign out clears the session and redirects to `/login`

## Profile & Settings
- Profile page shows display name, handle, avatar initial, follower/following counts, and bio
- Settings page allows editing display name and bio; changes persist to the `profiles` table
- Handle is auto-generated on signup and is read-only

## Record
- Requests microphone access via `navigator.mediaDevices.getUserMedia`
- Shows real-time input level meter and live waveform using Web Audio AnalyserNode
- Records audio via MediaRecorder API (webm/ogg container)
- Playback of recorded take before saving
- On save: audio blob is uploaded to Supabase Storage (`audio/{userId}/{timestamp}.webm`)
- A `songs` row and a `tracks` row (role: lead_vocal) are created in the database
- User is navigated to the Mix screen after saving

## Upload
- Accepts MP3, WAV, M4A (any `audio/*` MIME type) up to 50 MB via drag-and-drop or file picker
- File is uploaded to Supabase Storage
- Waveform is extracted client-side using Web Audio OfflineAudioContext
- A `songs` + `tracks` row (role: upload) is created
- User is navigated to the Mix screen

## Mix
- Loads song and its tracks from Supabase
- Displays per-track volume (0–100) and pan (−50 to +50) sliders that persist to the `tracks` table in real time
- Mute and Solo buttons per track (also persisted)
- If a track has a `storage_path`, a signed URL is fetched and the audio is playable
- Seek bar shown when audio duration is known
- Song can be renamed, deleted, or toggled public/private from the ⋯ menu

## Library
- Lists all songs owned by the logged-in user, ordered by `created_at` descending
- Songs can be renamed inline and deleted
- Empty state with a prompt to start recording

## Explore
- Lists all songs where `is_public = true`, ordered by `created_at` descending
- Search filter on song title (client-side)

## Go Live
- Creates a `live_sessions` row in Supabase when the user taps "Go live"
- Lists all active sessions (`is_live = true`)
- Ending a session sets `is_live = false` and records `ended_at`
- Note: real-time audio broadcast requires a separate WebRTC transport layer

## Backend (Supabase)
- Project URL: `https://ugbecqadahcbkhdbkgjb.supabase.co`
- Auth: Supabase Auth (email/password)
- Database: Postgres with RLS enabled on all tables
- Storage: private `audio` bucket; files served via signed URLs (1-hour expiry)
- Schema: `supabase/schema.sql`
