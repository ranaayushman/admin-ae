# Admin AE - Copilot Instructions

## Big Picture

- Next.js 16 (App Router) admin portal for managing question bank + test series.
- Routes: public auth under `app/(auth)/…`, protected admin under `app/(dashboard)/…`.
- Auth gating happens in `app/(dashboard)/layout.tsx` and redirects to `/login?returnUrl=…`.

## Auth, Tokens, API Calls

- Auth state lives in `lib/contexts/AuthContext.tsx`.
- Tokens are persisted via `lib/utils/tokenManager.ts` + `lib/utils/storage.ts` (prefix: `admin_ae_`).
- New service modules should use the axios client at `lib/services/api.client.ts`:
  - Adds `Authorization: Bearer …` from `tokenManager`
  - On `401`, refreshes via `POST /auth/refresh`, stores new tokens, retries request
  - Logs requests/responses (useful for debugging backend payload mismatches)
- API base URL comes from `NEXT_PUBLIC_API_URL` (falls back to the Azure URL in the api client).

## Question Bank Content Format (TipTap → HTML → KaTeX)

- Editors store **HTML strings** (question/solution/options), not plain text.
- Math is serialized as `<div data-type="math-block" data-latex="…"></div>` via `components/AddQuestions/MathBlock.tsx`.
- Always render stored HTML via `components/QuestionRenderer.tsx` so math blocks are converted to KaTeX.
- Validation must treat HTML as “real content”: use `lib/utils/htmlUtils.ts` (`hasTextContent`) as done in `lib/validations/add-pyq-schema.ts`.
- MCQ options use a mini TipTap editor: `components/AddQuestions/OptionEditor.tsx`.

## State + Service Conventions

- Prefer small Zustand stores in `lib/stores/` when UI needs reusable server lists (e.g. `lib/stores/questionStore.ts`).
- Service modules in `lib/services/` normalize backend quirks (examples: difficulty casing in `lib/services/question.service.ts`, defensive list parsing in `lib/services/test.service.ts`).

## Dev Workflows

- `npm run dev` / `npm run build` / `npm run lint` (see `package.json`).

## Reference Docs (repo-specific)

- `QUESTION_BANK_FIXES.md`, `QUESTION_BANK_GUIDE.md`, `TEST_API_INTEGRATION.md` explain recent implementation decisions and common gotchas.
