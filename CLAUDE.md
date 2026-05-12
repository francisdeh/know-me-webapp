@AGENTS.md

# KnowMe — Coding Guidelines

## Stack

- **Framework:** Next.js (App Router, latest)
- **Language:** TypeScript — strict mode, no `any` except at true boundaries
- **Styling:** Tailwind CSS v4 — CSS-custom-property-based theme in `globals.css`; no `tailwind.config.js`
- **Backend:** Firebase (Firestore + Auth) — client SDK in components/hooks, Admin SDK only in API routes
- **Lint/Format:** Biome — run `npm run lint:fix` to auto-fix; pre-commit hook enforces this

## File & Folder Conventions

- Pages live in `/app` using App Router conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Shared components go in `/components/{auth,session,questions,ui}`
- Firebase hooks in `/hooks` — `useAuth`, `useSession`, `useQuestions`, `useTheme`
- Pure helpers (no React) in `/lib` — `firebase.ts`, `firestore.ts`, `auth.ts`, `roomCode.ts`, `anthropic.ts`
- API routes in `/app/api/` — server-only, never import client Firebase SDK here
- One component per file; filename matches the exported component name

## TypeScript

- No `any` — use `unknown` at boundaries and narrow explicitly
- Prefer `type` over `interface` for data shapes; `interface` only when extending
- All Firestore doc shapes defined as types in `/lib/types.ts`
- Server components are async by default; client components need `"use client"` at the top

## React & Next.js

- Prefer Server Components; add `"use client"` only when hooks or browser APIs are needed
- Data fetching: Server Components fetch directly; client components use `onSnapshot` hooks for real-time
- No prop drilling beyond 2 levels — use context or pass data via composition
- Keep components focused: one clear responsibility, under ~150 lines

## Styling

- Tailwind utility classes only — no inline styles, no CSS modules
- Dark mode via `.dark` class (toggled by `useTheme`) — use `dark:` variant for all dark-mode overrides
- Brand tokens defined in `globals.css` — use them as `bg-brand-primary`, `text-brand-accent`, etc.
- All interactive elements: min height 48px (`min-h-12`) for mobile touch targets
- Card pattern: `rounded-2xl p-5 shadow-sm dark:border dark:border-white/10`
- Button pattern: `rounded-full font-semibold min-h-12 px-6`

## Firebase

- Always use the local emulator in development (`NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`)
- Never write to production Firestore from a dev environment
- Firestore writes go through typed helper functions in `/lib/firestore.ts` — no raw `setDoc`/`updateDoc` in components
- Admin SDK (`firebase-admin`) only in `/app/api/` routes — never bundle it client-side
- Security rules live in `firestore.rules` — test changes against the emulator before deploying

## Design System

- Colours: use brand tokens (`brand-primary`, `brand-accent`, `violet-950`, etc.) — never hardcode hex values in components
- Typography scale from spec: `text-2xl font-bold` (page titles), `text-lg font-semibold` (section headers / question text), `text-base` (body), `text-sm` (badges/meta), `text-xs` (labels)
- Category badge colours defined in `components/session/CategoryBadge.tsx` — reference that map, don't duplicate it
- Animations: `duration-200` for transitions, `duration-300 ease-out` for card draw — no bouncy easings

## Git

- Commit messages: imperative, present tense ("add auth provider", "fix turn indicator")
- Never commit `.env.local` — only `.env.local.example` with empty values
- Branch naming: `phase-N/<short-description>` (e.g. `phase-1/google-auth`)

## What to avoid

- No `console.log` in committed code — use `console.error` only for genuine errors at boundaries
- No comments explaining what code does — only comments for non-obvious constraints or workarounds
- No unused imports — Biome will flag these
- No default exports from library files (`/lib/`) — named exports only
