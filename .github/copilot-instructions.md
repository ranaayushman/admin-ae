# Admin AE - AI Coding Agent Instructions

## Project Overview

Admin portal for Aspiring Engineers platform. Next.js 16 app for managing educational content (questions, tests, packages) for JEE/NEET exam preparation. Uses React 19, TypeScript, Tailwind CSS 4, and TipTap for rich text editing.

## Architecture & Organization

### Path Alias

- `@/` → project root (e.g., `@/lib`, `@/components`)
- Different from test-portal-client which uses `@/` → `./src/`

### Route Structure (Next.js App Router)

- `app/(auth)/login/` - Authentication (unprotected)
- `app/(dashboard)/` - All protected admin pages (questions, tests, packages, enrollments)
- Layout-based auth: `(dashboard)/layout.tsx` enforces authentication, redirects to `/login?returnUrl=...`

### Component Organization

- `components/ui/` - shadcn/ui primitives (button, card, input, select, etc.)
- `components/AddQuestions/` - Question creation forms (TipTapEditor, PyqForm, QuestionMetaForm)
- `components/TestSeries/` - Test management components
- `components/Sidebar.tsx` - Main navigation (collapsed state, route highlighting)

### State & Context

- **AuthContext** (`lib/contexts/AuthContext.tsx`) - User session, JWT tokens, login/logout
  - Auto token refresh on 401 errors
  - Stores: `auth_token`, `refresh_token`, `user` in localStorage
- **No global state library** - Uses React Context and local state

### Data Services

- `lib/api-client.ts` - Axios instance with interceptors for auth tokens and refresh
- `lib/services/` - API service modules (auth.service.ts, question.service.ts, user.service.ts)
- Service pattern: Transform API responses to match frontend types
- Base URL: `https://aspiring-engineers-api-dbbcfdascdezgvcx.centralindia-01.azurewebsites.net/api/v1`

## Critical Patterns

### Authentication Flow

1. Login → `authService.login()` → Stores tokens + user in localStorage
2. All API calls auto-include `Authorization: Bearer <token>` via interceptor
3. On 401 → Auto refresh with `refresh_token` → Retry original request
4. Protected routes check `isAuthenticated` in layout, redirect with returnUrl

### Rich Text with LaTeX

- **TipTap Editor** (`components/AddQuestions/TipTapEditor.tsx`) for questions/solutions
- Custom `MathBlock` extension for LaTeX formulas
- Use `insertMathBlock()` to prompt user for LaTeX, renders with KaTeX
- Images via URL insertion with `insertImageFromUrl()`

### Styling Convention

- Use `cn()` utility from `lib/utils.ts` to merge Tailwind classes (clsx + tailwind-merge)
- Example: `cn("base-classes", conditionalClass && "extra-class", className)`
- shadcn/ui components: import from `@/components/ui/`
- Dark sidebar: `bg-[#0f172a]`, accent: `#2596be`

### Form Handling

- react-hook-form with Zod validation (`lib/validations/`)
- Validation schemas in separate files, imported into forms
- Error display via form state errors

## Developer Workflows

### Development

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
```

### Adding New Questions

1. Navigate to `/pyq` route
2. Use `PyqForm` component with `TipTapEditor` for question text
3. Select question type (MCQ Single/Multiple, Numerical, Integer)
4. Add options with correct answers marked
5. Include solution with LaTeX support

### Key Files for New Features

- New UI component → `components/ui/` (use shadcn/ui CLI if possible)
- New page → `app/(dashboard)/new-page/page.tsx`
- New API integration → Create service in `lib/services/`, use `apiClient`
- New type → `lib/types/` (maintain type safety)

## Integration Points

### Backend API

- REST API with JWT authentication
- Token refresh endpoint: `POST /auth/refresh`
- All endpoints prefixed with `/api/v1`
- Response format: `{ success: boolean, data: T, message?: string }`

### External Dependencies

- **TipTap** - WYSIWYG editor with custom math extension
- **KaTeX** - LaTeX rendering in questions
- **Axios** - HTTP client with interceptors
- **Motion (Framer Motion)** - Animations (sidebar collapse, transitions)
- **Lucide React** - Icon library

## Common Gotchas

- Path alias `@/` points to root, NOT `src/` (unlike test-portal-client)
- Always wrap API calls with try-catch; interceptor handles 401 but not all errors
- TipTap editor requires `immediatelyRender: false` for Next.js hydration
- Sidebar collapse state is local to component; add to context if persistence needed
- Form components should handle their own loading/error states
