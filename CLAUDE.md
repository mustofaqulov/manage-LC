# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Manage LC is a React/TypeScript web application for language learning mock exams with AI-powered scoring. Built for IELTS/CEFR-style speaking practice with audio recording and Google Gemini AI evaluation.

## Tech Stack

- React 19.2.3 + TypeScript + Vite 6.2.0
- React Router DOM 7.12.0
- Google Generative AI (Gemini) 0.21.0
- Tailwind CSS

## Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build


# Preview production build
npm preview
```

## Environment Configuration

Create `.env.local` file with:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

Note: Vite config injects `VITE_GEMINI_API_KEY` as `__VITE_GEMINI_API_KEY__` at build time via `define` plugin.

## Architecture

### Application Flow

1. **App.tsx**: Root component managing user state, lazy-loaded routes, and authentication checks
2. **Layout.tsx**: Wraps all pages with Header/Footer
3. **Protected Routes**: `/exam-flow/*` and `/history` require authenticated user

### State Management

- **User State**: Managed in App.tsx, persisted via localStorage (userService)
- **Exam State**: Local state in ExamFlow.tsx with complex timer/audio orchestration
- No global state library - uses React context via props

### Audio System Architecture

ExamFlow.tsx orchestrates a complex audio workflow:

1. **Microphone Access**: Requests getUserMedia on mount, stores stream in ref
2. **Timer Engine**: Custom RAF-based timer (startTimer) for precise countdown
3. **Question Flow** (runQuestion async):
   - READING status → TTS reads question → beep
   - PREPARING status → countdown timer (prepTime) → beep
   - RECORDING status → countdown timer (recordTime) → beep
   - Auto-advances to next question or ends exam
4. **Cleanup**: Critical cleanup function (cleanupAll) stops all audio, MediaRecorder, and RAF timers
5. **Audio Services**:
   - geminiService.ts: TTS (uses native Speech Synthesis API), beep generation (Web Audio API)
   - scoringService.ts: Transcription (placeholder) + AI scoring via Gemini

**Important**: Audio/timer resources MUST be cleaned up properly. cleanupAll() is called on unmount and navigation.

### Exam Modes

- **FULL**: All parts sequentially (PART_1_1, PART_1_2, PART_2, PART_3)
- **RANDOM**: Shuffles questions from all parts, limits to 3 per part
- **CUSTOM**: Not implemented (placeholder route shows "coming soon")

### Services Layer

**userService.ts**:
- localStorage wrapper with fallback for SSR/disabled storage
- Key: `manage_lc_user`
- Subscription validation logic (date-based expiry check)

**geminiService.ts**:
- Native browser TTS (SpeechSynthesis API) - Gemini TTS removed due to quota
- Beep generation via Web Audio API OscillatorNode
- Critical: stopAllAudio() and stopBeep() for cleanup

**scoringService.ts**:
- transcribeAudio: Placeholder (returns mock text)
- scoreAnswer: Uses Gemini Pro model with prompt engineering for IELTS-style scoring
- Returns ExamScore with 4 metrics + feedback

### Data Structure

**Question Types** (constants.tsx):
- PART_1_1: Short questions (5s prep, 30s record)
- PART_1_2: Image comparison (5s prep, 45s record)
- PART_2: Long description (60s prep, 120s record)
- PART_3: Benefits/drawbacks discussion (60s prep, 120s record)

### Known Limitations

- Custom exam mode not implemented
- Audio transcription is placeholder (not real STT)
- Scoring fallback returns fixed 65% if Gemini fails
- No backend - all data in localStorage
- Subscription validation is client-side only

## Codebase Conventions

- Uzbek comments throughout codebase (mixed with English)
- Primary color: `#ff7300` (orange brand color)
- Lazy-loaded routes via React.lazy
- ErrorBoundary wraps entire app
- MediaRecorder stores to window for debugging: `window.mediaRecorder`

## Common Tasks

**Adding New Question Part**:
1. Add enum to ExamPart in types.ts
2. Add questions array to MOCK_QUESTIONS in constants.tsx
3. Update parts logic in ExamFlow.tsx

**Modifying Gemini Scoring**:
- Edit prompt in scoringService.ts scoreAnswer function
- Scoring criteria: fluency, pronunciation, vocabulary, grammar (0-100 each)

**Testing Audio Flow**:
- Open browser DevTools console (verbose logging)
- Check MediaRecorder state: `window.mediaRecorder.state`
- Inspect audio chunks: `window.audioChunks`
