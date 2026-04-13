# Project Guidelines

## Build and Validate
- `npm install` installs dependencies and runs `postinstall` (`scripts/copy-ffmpeg.cjs`).
- `npm run dev` starts Vite on port `4173`.
- `npm run build` runs FFmpeg asset copy, then outputs production files to `dist/`.
- `npm run preview` serves the production build locally.
- `docker compose up --build` runs a deployment-like container build.
- There is no automated test suite yet. Before PRs, run `npm run build` and manually verify login, exam flow, answer submission, history, and responsive layout.

## Architecture and Boundaries
- Code lives in `src/`:
	- `src/pages/` route-level screens
	- `src/components/` reusable UI (`src/components/examflow/` for exam flow)
	- `src/services/` API layer and TanStack React Query hooks
	- `src/store/` Redux auth state
	- `src/utils/` shared helpers (audio, storage, configs)
	- `src/i18n/` translations
- Data-fetching rule:
	- Use TanStack React Query hooks from `src/services/hooks.js` for new feature work.
	- Keep Redux usage focused on auth/session state.
	- RTK Query in `src/store/api.ts` is legacy/dev-reference (`src/pages/ApiTest.tsx`); do not introduce new page features with it.
	- Do not mix TanStack React Query and RTK Query in the same page.
- Audio lifecycle rule:
	- `src/pages/ExamFlow.tsx` owns recording/timer orchestration.
	- `src/services/geminiService.ts` owns TTS/beep cleanup (`stopAllAudio`).
	- Any change around exam navigation/audio must preserve cleanup behavior when leaving exam flow.
- Treat `openapi` as the backend contract source.

## Code Style and Conventions
- Use TypeScript and React function components with existing 2-space indentation.
- Naming:
	- Components/pages: `PascalCase`
	- Hooks: `camelCase` with `use` prefix
	- Utility/service functions: clear verb-based names
- Prefer `@/` alias imports for `src` when it improves readability.
- Prefer existing Tailwind utility patterns; use SCSS modules only where the codebase already does.
- Keep i18n consistent when adding user-facing text (uz, en, ru).

## Security and Config
- Never commit secrets.
- Keep environment values (for example `VITE_GEMINI_API_KEY`) in local env files or CI secrets.

## References
- Deep architecture and flow details: [CLAUDE.md](CLAUDE.md)
- Setup and quick start: [README.md](README.md)
- API payload and endpoint contract: [openapi](openapi)
