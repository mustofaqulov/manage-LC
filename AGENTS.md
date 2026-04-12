# Repository Guidelines

## Project Structure & Module Organization
Application code lives in `src/`. Use `src/pages/` for route-level screens, `src/components/` for reusable UI, and `src/components/examflow/` for exam-specific layouts and controls. Keep API access in `src/services/` and global state in `src/store/`. Shared helpers belong in `src/utils/`, translations in `src/i18n/`, and generated or shared types in `src/api/`, `src/types/`, or root-level `types/`. Static assets belong in `public/` or `src/assets/`. Deployment files are in `.github/workflows/`, `Dockerfile`, and `docker-compose.yml`. Treat `openapi.md` as the backend contract reference.

## Build, Test, and Development Commands
- `npm install`: install dependencies and run the FFmpeg asset copy step.
- `npm run dev`: start the Vite dev server on port `4173`.
- `npm run build`: copy FFmpeg assets and create a production build in `dist/`.
- `npm run preview`: serve the production build locally.
- `docker compose up --build`: build and run the containerized app for deployment checks.

## Coding Style & Naming Conventions
Use TypeScript and React function components throughout. Follow the existing 2-space indentation style and prefer small, focused components. Name pages and components in `PascalCase` (`ExamFlow.tsx`), hooks in `camelCase` with a `use` prefix (`useGetTests`), and utility/service functions in clear verb-based names. Keep imports stable by using the `@` alias for `src` where it improves readability. Reuse existing Tailwind utility patterns and SCSS only where the codebase already does so.

## Testing Guidelines
There is no dedicated automated test suite in this repository yet. At minimum, run `npm run build` before opening a PR and manually verify the affected flow in the browser, especially exam start, answer submission, history, and responsive layouts. If you add tests, use `*.test.ts` or `*.test.tsx` naming and keep them close to the feature they validate.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit style: `feat: ...`, `fix: ...`, `ci: ...`. Keep commit messages short, imperative, and scoped to one change. PRs should include a concise summary, linked issue or task if available, and screenshots or short recordings for UI changes. When backend payloads or exam flow logic change, note the API impact explicitly and reference `openapi.md`.

## Security & Configuration Tips
Do not commit secrets. Keep environment values such as `VITE_GEMINI_API_KEY` in local env files or CI secrets, not in source code.
