# Sing Musically

A voice-first music app: record a vocal, layer harmonies, mix them, upload
existing tracks, or go live — all from the phone in your pocket. This repo
is a **real, running PWA**, not a mockup: every screen is wired to actual
state and a real (swappable) data layer.

## Status: mock-data mode, production architecture

Everything you tap works — timers run, sliders move, songs save — but the
"backend" underneath it is in-memory mock data, and the mic isn't recording
real audio yet. That's a deliberate first phase. The architecture underneath
is built so neither of those things requires a rewrite when you're ready:

- **Supabase**: the full Postgres schema (`supabase/schema.sql`) already
  exists, with Row Level Security policies, storage buckets, and a real
  `supabaseDataService.ts` implementation sitting next to the mock one.
  Flip one env var and the app talks to Postgres instead of memory.
- **Real audio**: `useRecorder` currently generates fake waveform/level
  data on a `requestAnimationFrame` loop, but returns data in the *exact*
  shape the Web Audio API will produce. See the comment at the top of
  `src/hooks/useRecorder.ts` for the 3-line swap.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Runs entirely on mock data out of the box — no `.env` needed. You'll be
"logged in" as a demo user immediately.

## Going live with Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL editor, run `supabase/schema.sql`
3. In Project Settings → API, copy your URL and anon key
4. `cp .env.example .env` and fill in the two values, plus:
   ```
   VITE_USE_SUPABASE=true
   ```
5. In Storage, confirm the `audio` bucket was created by the schema (it is,
   but double-check the bucket policies match your needs)
6. `npm run dev` — the app now reads/writes real Postgres + Auth + Storage

Because every screen imports `dataService` from `src/services/index.ts`
(never the mock or Supabase files directly), this is the *only* step
required. No component changes.

## Architecture

```
src/
├── lib/               Domain types + Supabase client
├── services/
│   ├── dataService.ts         ← the interface (the seam)
│   ├── mockDataService.ts     ← in-memory implementation (active by default)
│   ├── supabaseDataService.ts ← Postgres implementation
│   └── index.ts               ← picks one based on VITE_USE_SUPABASE
├── state/             Zustand stores (session, mixer) — call dataService, never fetch directly
├── hooks/
│   └── useRecorder.ts ← mock audio pipeline, shaped like the real one
├── components/
│   ├── ui/            Design-system primitives (Card, Pill, Waveform, MixerSlider…)
│   └── layout/        AppShell (sidebar + content), Sidebar, MobileNav (narrow-viewport fallback)
├── screens/           One file per route
└── data/mockData.ts   Seed data for mock mode
```

**The one rule that keeps this maintainable**: screens never import
`mockDataService` or `supabaseDataService` directly, and never call
`fetch`/`supabase.from(...)` themselves. Everything goes through
`dataService`. This is what makes "swap the backend" a one-file change
instead of a rewrite touching every screen.

## Layout: a real web app, not a mobile app in a browser

This is built desktop-first, the way a normal web app is: a persistent left
sidebar for navigation, wide multi-column layouts that use the available
screen width (the Mix screen puts the master panel and track list
side-by-side; the Library is a card grid, not a single-column list), and
hover states throughout. On a narrow browser window the sidebar collapses
into a top bar with a slide-out drawer (`MobileNav.tsx`) so it still works
on a phone's browser — but the design target is the browser, not an app
store icon. There's no phone-frame chrome, no bottom tab bar, and no
touch-first single-column assumption baked into the components.

It's still an installable PWA (offline shell caching, a manifest), which is
a legitimate web-app feature on both desktop and mobile Chrome/Edge — that's
independent of the "is this a mobile app" question and was left in.

## What's built vs. what's a known gap

| Screen | Built | Known gap |
|---|---|---|
| Home | Full — matches design exactly | — |
| Record | Full — timer, live waveform, level meter, save flow | Mic input is simulated; see `useRecorder.ts` |
| Mix | Full — master waveform, per-track vol/pan/mute/solo, persists edits | Real audio playback/mixing engine not wired (Web Audio `GainNode`/`StereoPannerNode` per track is the natural next step) |
| Upload | Full — drag/drop, file validation, upload flow | Server-side (or client-side `OfflineAudioContext`) key/BPM detection isn't implemented; placeholder values are inserted |
| Go Live | Full — session lifecycle (start/end/list) against real DB rows | No actual audio broadcast — needs a WebRTC/media-server layer (LiveKit, Agora, etc.) on top of this session bookkeeping |
| Library, Profile, Login/Signup | Full and functional | — |

None of these are stubs that say "coming soon" — they're real, working
screens with mock data behind the parts that need hardware access or
infrastructure this repo doesn't provision on its own.

## Design system

Colors, type, and layout follow the source designs exactly (dark
near-black/forest green base, mint-teal accent for primary actions and
live/positive states, warm gold for the brand accent and lead-vocal
tracks). Tokens live in `tailwind.config.ts`; don't hardcode hex values in
components — extend the token set instead.

## Suggested next milestones

1. Wire `useRecorder` to `navigator.mediaDevices.getUserMedia` + `MediaRecorder`
2. Build the Web Audio mixing graph (per-track `GainNode` + `StereoPannerNode` → master)
3. Real waveform extraction on upload (`OfflineAudioContext` decode + peak sampling)
4. Pick a live-audio transport for Go Live and wire it behind the existing session rows
5. Push notifications for followers going live (Supabase Edge Functions + Web Push)
