# Manage LC

Mock exam platform for English language learning centers. Supports IELTS/CEFR-style speaking practice with audio recording and AI-powered scoring via Google Gemini.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 6
- **State**: Redux Toolkit + RTK Query, TanStack React Query
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 3 (PostCSS) + SCSS modules
- **AI**: Google Generative AI (Gemini) for scoring
- **i18n**: Uzbek, English, Russian

## Features

- IELTS-style speaking exam with 4 parts (Part 1.1, 1.2, 2, 3)
- Audio recording via MediaRecorder API
- Text-to-speech question reading
- AI-powered scoring (fluency, pronunciation, vocabulary, grammar)
- Full, Random, and Custom exam modes
- Exam history with score trends and detailed feedback
- Telegram-based authentication

## Getting Started

**Prerequisites**: Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` in the project root:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

   App runs at `http://localhost:5173`.

## Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
```

## Docker

Build and run with Docker Compose:

```bash
VITE_GEMINI_API_KEY=your_key docker compose up --build
```

The app will be available on port 80.

## Project Structure

```
src/
  App.tsx              # Root component with routing
  index.tsx            # Entry point
  assets/              # Images, icons used by the app
  components/          # Reusable UI components (examflow/*)
  i18n/                # Translation files (uz, en, ru)
  pages/               # Route pages (Home, Login, ExamFlow, History, etc.)
  services/            # React Query hooks, queries, mutations
  utils/               # Axios/toast configs and helpers
  api/                 # Generated API types
  hooks/               # Custom hooks (useAuth)
  store/               # Redux store, RTK Query API, auth slice
public/
  assets/images/main.jpg  # Social share image + favicon
types/                 # Global type declarations
```

## API

Backend API: `https://api.managelc.uz`

Authentication uses JWT tokens obtained via Telegram bot verification.

