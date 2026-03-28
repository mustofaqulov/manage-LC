# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Manage LC is a React/TypeScript web application for language learning mock exams with AI-powered scoring. Built for IELTS/CEFR-style speaking practice with audio recording and Google Gemini AI evaluation. Backend API at `https://api.managelc.uz`.

## Tech Stack

- React 19.2.3 + TypeScript + Vite 6.2.0
- Redux Toolkit 2.11.2 + RTK Query (auth & API state)
- TanStack React Query 5.90.20 (server state)
- React Router DOM 7.12.0
- Google Generative AI (Gemini) 0.21.0
- Tailwind CSS 3 (PostCSS plugin) + SCSS modules
- @breezystack/lamejs 1.2.7 (MP3 encoding via Web Worker — replaced FFmpeg WASM)
- @ffmpeg/ffmpeg 0.12.15 + @ffmpeg/core + @ffmpeg/util (still in deps + build script, but no longer used in source)
- lucide-react 0.562.0 (icons)
- swiper 12.0.3 (carousels)
- i18n: 3 languages (uz, en, ru) via custom context

## Development Commands

```bash
npm install           # Install dependencies
npm run dev           # Dev server at http://localhost:4173
npm run build         # Production build (vite build)
npm run preview       # Preview production build
```

No test runner or linter is configured.

## Docker Deployment

```bash
VITE_GEMINI_API_KEY=your_key docker compose up --build
```

Uses multi-stage build (`node:22-alpine` → `nginx:alpine`). `nginx.conf` in project root handles SPA routing. Runs on port 80.

> **Note**: `vite-plugin-imagemin` is in `optionalDependencies` — it's skipped in Docker/CI builds automatically. The vite config already detects CI and skips it at runtime too.

## Environment Configuration

Create `.env.local` file with:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

Vite config injects `VITE_GEMINI_API_KEY` as `__VITE_GEMINI_API_KEY__` at build time via `define` plugin. The geminiService reads it from `window.__VITE_GEMINI_API_KEY__` with fallback to `import.meta.env.VITE_GEMINI_API_KEY`.

## Architecture

### Path Aliases

`@/*` resolves to `src/` (configured in both `tsconfig.json` and `vite.config.ts`).

### Entry Point & App Structure

- **src/index.tsx**: Mounts app, wraps with `I18nProvider`, disables `console.log` in production
- **src/App.tsx**: Redux Provider + QueryClientProvider + React Router with lazy-loaded routes + ErrorBoundary
- **src/components/Layout.tsx**: Wraps all pages with Header, Footer, and PhoneFloating widget. Calls `stopAllAudio()` automatically when navigating away from `/exam-flow`
- **types/**: Root-level type declarations (`images.d.ts`, `styles.d.ts`, `globals.d.ts`)

### State Management (Dual System)

The app uses two parallel state management systems:

1. **Redux Toolkit + RTK Query** (`src/store/`):
   - `src/store/slices/authSlice.ts`: Auth state (user, token, isAuthenticated, legacyUser for backward compat)
   - `src/store/api.ts`: RTK Query endpoints for all backend API calls (base URL: `https://api.managelc.uz`)
   - `src/store/hooks.ts`: Typed Redux hooks
   - localStorage keys: `auth_token`, `user_data`, `manage_lc_user`

2. **TanStack React Query** (`src/services/hooks.js`, `src/services/queries.js`, `src/services/mutations.js`):
   - Query hooks for tests, attempts, sections, assets with configured stale times
   - Upload/download hooks for S3 presigned URLs

3. **Local state**: `src/pages/ExamFlow.tsx` uses React state + refs for timer/audio orchestration

### Authentication Flow

1. User enters phone number (9 digits)
2. App opens Telegram bot (`@managelcbot`) with `?start=login_+998{phone}`
3. User receives 5-digit code from Telegram
4. Code submitted → API login → Redux stores JWT token
5. Protected routes (`/exam-flow/:testId`, `/history`) check `isAuthenticated || legacyUser`
6. Premium access check via `src/hooks/useHasExamAccess.ts` — redirects to `/subscribe` if no access

### Audio System Architecture

`src/pages/ExamFlow.tsx` orchestrates the audio workflow:

1. **Microphone Access**: Requests `getUserMedia` on mount, stores stream in ref
2. **Timer Engine**: Custom RAF-based timer (`startTimer`) for precise countdown
3. **Question Flow** (`runQuestion` async):
   - READING → TTS reads question → beep
   - PREPARING → countdown timer (prepTime) → beep
   - RECORDING → MediaRecorder captures → countdown timer (recordTime) → beep
   - Auto-advances to next question or ends exam
4. **Upload Flow**: After recording, audio blob is presign-uploaded to S3, then response saved with `answer: { audio: { assetId, bucket, key } }`
5. **Cleanup**: `cleanupAll()` stops all audio, MediaRecorder, microphone stream, and RAF timers. Called on unmount, `beforeunload`, `visibilitychange`, and before navigating to `/history`.

**Critical**: Audio/timer resources MUST be cleaned up properly. Any new audio feature must integrate with `cleanupAll()`. Always call `cleanupAll()` before navigating away from ExamFlow.

### Audio Services

- **src/services/geminiService.ts**: Native browser TTS (`SpeechSynthesis` API, rate 0.9), beep via Web Audio API `OscillatorNode` (440Hz, 300ms). `stopAllAudio()` cancels speech, stops oscillator, closes AudioContext.
- **src/utils/audioConverter.ts**: Combines multiple WebM audio blobs into a single MP3. Uses native `AudioContext`/`OfflineAudioContext` to decode WebM → PCM, then sends PCM via transferable `Float32Array` buffers to `src/utils/mp3Encoder.worker.ts` (a Vite Web Worker). The worker uses `@breezystack/lamejs` to encode at 128kbps. ~1–2s for 1 min of audio. MIME type: `audio/mpeg`.
- **src/utils/mp3Encoder.worker.ts**: Web Worker that receives `{ channelData, sampleRate, numChannels }`, converts Float32 → Int16, encodes with lamejs `Mp3Encoder`, and posts back `{ mp3Data: Uint8Array[] }`.

### Audio Download (History page)

Audio responses stored as `answer.audio = { assetId, bucket, key }`. Download flow in `History.tsx`:
1. **IndexedDB first**: `getRecordingsForAttempt(attemptId)` from `audioStore.ts` — instant, no network
2. **S3 fallback** (if IndexedDB empty):
   - If `bucket` + `key` present: `POST /assets/presign-download` → fetch presigned URL
   - If only `assetId`: `GET /assets/{assetId}/download-url` → fetch presigned URL
   - If `assetId` returns 404: falls back to `presignDownload` with `bucket`/`key`

### Exam Modes

- **FULL**: All parts sequentially (PART_1_1, PART_1_2, PART_2, PART_3)
- **RANDOM**: Shuffles questions from all parts, limits to 3 per part
- **CUSTOM**: Not implemented (placeholder route)

### ExamBody — Part-specific Option Rendering

`src/components/examflow/ExamBody.tsx` renders options differently per part (detected via `sectionTitle`):

- **Part 2**: ONE card with all `option.content` as bullet points (vocabulary words for monologue)
- **Part 3**: Options grouped into TWO cards by label:
  - Labels containing "FOR/BENEFIT/ADVANTAGE" → green "For" card
  - Labels containing "AGAINST/DRAWBACK/DISADVANTAGE" → red "Against" card
- **Part 3** also supports `question.settings.benefits[]` / `question.settings.drawbacks[]` as an alternative data format (separate Benefits/Drawbacks cards)

### API Layer (`src/store/api.ts`)

RTK Query endpoints with auto-injected Bearer token:
- **Auth**: `login(phone, pinCode)`
- **Users**: `getMe()`, `updateMe()`
- **Tests**: `getTests()`, `getTest(id)`, `getSection(testId, sectionId)`
- **Attempts**: `startAttempt()`, `getAttemptHistory()`, `upsertResponse()`, `submitSection()`, `submitAttempt()`
- **Assets**: `presignUpload()`, `presignDownload()`, `getDownloadUrl(assetId)` (S3 presigned URL flow)

`presignDownload` in `src/services/mutations.js` accepts `{ assetId?, bucket?, s3Key? }` matching the `PresignDownloadRequest` type.

### Data Structure

**Generated API types** in `src/api/types.ts` (enums: Role, CefrLevel, SkillType, QuestionType, AttemptStatus, etc.)

### Internationalization

- Context-based i18n in `src/i18n/` directory
- Languages: uz (default), en, ru — each with translation file
- `useTranslation()` hook returns `{ t, language }`
- Language preference stored in localStorage key `manage_lc_language`

### Utilities

- **src/utils/audioStore.ts**: IndexedDB store (`manage-lc-audio` DB, `recordings` object store) for persisting recorded audio blobs locally. Keys are `${attemptId}-${index}`. Used by History page to retrieve recordings without hitting S3.
- **src/utils/configs/axiosConfig.js**: Axios instance with base URL `https://api.managelc.uz` and auth interceptors
- **src/utils/configs/toastConfig.js**: react-toastify configuration

## Codebase Conventions

- Uzbek comments throughout codebase (mixed with English)
- Primary color: `#ff7300` (orange brand color), secondary: `#222222`
- Lazy-loaded routes via `React.lazy` with `Suspense` + simple loading div fallback
- ErrorBoundary wraps entire app — "Oops!" screen shown on uncaught JS errors
- MediaRecorder exposed on `window.mediaRecorder` for debugging
- Verbose console logs with emoji prefixes in exam flow
- Services mix `.ts` and `.js` files (hooks.js, queries.js, mutations.js are plain JS)
- Styling: Tailwind CSS via PostCSS (`tailwind.config.js` + `postcss.config.js`), SCSS modules for component styles, global CSS in `src/index.css`

## Common Tasks

**Adding a New API Endpoint**:
1. Add endpoint in `src/store/api.ts` using `builder.query` or `builder.mutation`
2. Add corresponding React Query hook in `src/services/hooks.js` if needed
3. Add types in `src/api/types.ts`

**Testing Audio Flow**:
- Open browser DevTools console (verbose logging)
- Check MediaRecorder state: `window.mediaRecorder.state`
- Inspect audio chunks: `window.audioChunks`

### Routing

**Protected routes** (require `isAuthenticated || legacyUser`):
- `/exam-flow/:testId`, `/history`

**Public routes**:
- `/`, `/login`, `/mock-exam`, `/about`, `/leaderboard`, `/courses/english`, `/subscribe`
- `/custom-exam` — placeholder, not implemented

All routes are lazy-loaded via `React.lazy` with `Suspense` + simple loading div fallback.

### Data Fetching Strategy
- **Primary**: TanStack React Query via `src/services/hooks.js` — ALL production pages use this
- **Secondary**: RTK Query via `src/store/api.ts` — ONLY used in `src/pages/ApiTest.tsx` (dev tool)
- **Auth state**: Redux Toolkit `authSlice` — used across the app
- New features MUST use TanStack React Query hooks from `src/services/hooks.js`
- Do NOT mix RTK Query and TanStack React Query in the same page

## Known Limitations

- Custom exam mode not implemented
- Subscription validation is client-side only
- Gemini API key is exposed client-side (should use backend proxy in production)
- No TypeScript type-checking in the build script (only `vite build`, no `tsc`)
