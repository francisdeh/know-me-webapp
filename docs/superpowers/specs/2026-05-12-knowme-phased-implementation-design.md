# KnowMe — Phased Implementation Design

**Date:** 2026-05-12
**App:** KnowMe — a turn-based question game for two people
**Stack:** Next.js 14 · Firebase · Tailwind CSS · Biome · Railway
**Source spec:** `Techspec.md` (v1.7)

---

## Overview

KnowMe is built across 9 phases grouped into three blocks:

| Block | Phases | Purpose |
|---|---|---|
| Foundation | 0–1 | Infrastructure, tooling, auth, theme |
| Feature Sprints | 2–5 | Shippable increments, each demo-able |
| Closing | 6–7 | AI reflection, history, end screen |
| Deploy | 8 | Railway CI/CD, production launch |

**Decisions locked in:**
- Biome for lint + format (replaces ESLint + Prettier)
- Husky + lint-staged for pre-commit enforcement
- GitHub Actions for CI (lint + type-check on every push/PR; deploy on merge to `main`)
- Railway for deployment
- Firebase local emulator for Auth + Firestore during development
- No automated tests in this plan — revisit when app is stable
- No visual companion — text-only spec

---

## Phase 0 — Project Infrastructure

**Goal:** A clean, well-configured repo that every subsequent phase builds on. No feature work starts until this is solid.

### Deliverables

- Next.js 14 app scaffolded with App Router, TypeScript, Tailwind CSS
- Folder structure: `/app`, `/components`, `/hooks`, `/lib`, `/scripts`
- `biome.json` configured for lint + format
- Husky + lint-staged wired to run Biome on pre-commit
- `.gitignore` covering `.env.local`, `.next`, `node_modules`, Firebase emulator data
- `.env.local.example` with all 7 env var keys (no values):
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `ANTHROPIC_API_KEY`
- Firebase project created; SDK config wired via env vars; `lib/firebase.ts` initialised
- Firebase local emulator configured for Auth + Firestore (`firebase.json`, `.firebaserc`)
- `npm run emulate` script to boot the emulator suite
- GitHub Actions CI: lint + type-check on every push and PR
- Tailwind config extended with KnowMe brand colours and Inter font (from `Techspec.md` Section 2)
- `README.md` with local setup instructions and emulator usage

---

## Phase 1 — Auth + Theme

**Goal:** Any user can sign in with Google and land on a protected home screen. Dark/light theme persists across sessions.

### Deliverables

- `AuthProvider` context + `useAuth` hook via Firebase `onAuthStateChanged`
- `ProtectedRoute` wrapper — redirects unauthenticated users to `/login`
- `/login` page — single "Continue with Google" button, gradient background (`#6C3FE8 → #F472B6`)
- On first sign-in: Firestore `users` doc created with `uid`, `displayName`, `email`, `photoURL`, `createdAt`
- On subsequent sign-ins: `photoURL` and `displayName` synced if changed
- `useTheme` hook — reads from `localStorage`, falls back to system preference
- `ThemeToggle` component in nav header
- Placeholder `/home` page ("Welcome, [name]" + sign out) to confirm auth works end-to-end
- Firestore security rules for `users` collection deployed to emulator

### Auth flow
1. User lands on `/` → redirected to `/login` if unauthenticated
2. Google popup → Firebase `GoogleAuthProvider`
3. First sign-in → create `users` doc; subsequent → sync profile fields
4. Redirect to `/home` on success
5. All routes except `/login` require auth

---

## Phase 2 — Question Bank + Browser

**Goal:** The full question bank exists in Firestore. Any authenticated user can browse, filter, and search it. Any user can suggest a question.

### Deliverables

- Seed script at `/scripts/seedQuestions.ts` — all questions from `Techspec.md` Section 10, tagged with `category` + `depth`
- `useQuestions` hook — fetches from Firestore, supports filtering by category array and depth array
- `CategoryBadge` component — colour pairs per category as defined in spec
- `DepthBadge` component — green=light, amber=mixed, rose=deep
- `/questions` page — card grid with `FilterBar`:
  - Category chip multi-select
  - Depth filter
  - Keyword search
- `/suggest` page — form: category dropdown + depth dropdown + question text input, writes to Firestore immediately
- `BottomNav` component — Home, Browse Questions, Suggest, History links; mobile bottom bar
- Firestore security rules for `questions` collection deployed to emulator

---

## Phase 3 — Session Creation + Join

**Goal:** Two players can create and join a shared session using a room code. Session settings (categories + depth) are saved and visible to both players.

### Deliverables

- Room code generator (`lib/roomCode.ts`) — `WORD-NUMBER` format (e.g. `GRACE-42`), collision check against Firestore
- `/home` page — "Create Session" and "Join Session" flows
- Session setup screen (on create):
  - Category multi-select chips (at least 1 required)
  - Depth single-select: 🌤 Light / 🌥 Mixed / ⛈ Deep
- Firestore session doc created on confirm, `status: waiting`, settings saved
- Join flow: room code input (case-insensitive); on submit: check code exists in Firestore, check session has fewer than 2 players and `status: waiting` — show inline error if either check fails; on success: player added, `status → active`, `currentTurn` set to Player 1
- Redirect both players to `/session/[code]` after join
- Player 2 sees session settings read-only on join screen
- Waiting screen for Player 1 while Player 2 hasn't joined yet
- `useSession` hook with `onSnapshot` listener on `sessions/{sessionCode}`
- Firestore security rules for `sessions` collection deployed to emulator

---

## Phase 4 — Core Game Loop

**Goal:** Two players can play a full game end-to-end in real time. All state changes sync instantly to both screens.

### Deliverables

- `TurnIndicator` — player avatars (Google profile photos), active turn ring (`ring-2 ring-violet-500`), whose turn label
- `DrawButton` — active only on the current player's turn
- Question draw logic:
  - Filter questions by `session.settings.categories`
  - Filter by depth (`light` → `['light']`, `mixed` → `['light','medium']`, `deep` → all)
  - Exclude `answeredQuestionIds`
  - Select randomly client-side
  - Write to `currentQuestion` in Firestore
- `QuestionCard` — question text (`text-lg font-semibold`, centred), `CategoryBadge`, `DepthBadge`
- `AnswerInput` — per-player text input + submit; writes to `currentQuestion.answers[userId]`
- `AnswerReveal` — auto-reveal when both answers submitted; manual reveal button as fallback; `currentQuestion.revealed = true`
- "Next" button advances turn:
  - Saves Q&A to `sessions/{code}/history/{questionId}` subcollection
  - Adds `questionId` to `answeredQuestionIds`
  - Resets `currentQuestion` to `null`
  - Flips `currentTurn` to the other player
- Session end: deck exhausted or either player clicks "End Session" → `status: ended`, `endedAt` set, redirect to `/session/[code]/end`
- All writes trigger `onSnapshot` updates on both clients simultaneously

### Real-time event map (from spec)

| Event | Writer | What changes |
|---|---|---|
| Player 2 joins | Player 2 | `players`, `playerNames`, `status: active` |
| Card drawn | Current turn player | `currentQuestion`, `answeredQuestionIds` |
| Answer submitted | Either player | `currentQuestion.answers[userId]` |
| Answers revealed | Either player | `currentQuestion.revealed: true` |
| Turn advanced | Either player | `currentTurn`, `currentQuestion: null`, history subcollection |
| Session ended | Either player | `status: ended`, `endedAt` |

---

## Phase 5 — UI Polish

**Goal:** The app looks and feels like a finished product. Mobile-first, warm, intentional — consistent with the KnowMe design system from `Techspec.md` Section 2.

### Deliverables

- All pages audited against KnowMe design system (colours, typography, spacing, radii)
- Question card: large centred card (~70% screen height mobile), gradient border matching category colour, slide-up-fade animation on draw (`translate-y-4 opacity-0 → translate-y-0 opacity-100`, `duration-300 ease-out`)
- Answer reveal: staggered slide-in per player (150ms offset)
- Button styles: primary gradient, secondary outlined, ghost — all `rounded-full`, min 48px height
- Category badge colour pairs applied per spec table
- Depth badges: green=light, amber=mixed, rose=deep
- Dark mode: `#1E1B2E` background, `#2D2A3E` cards, `white/10` borders, `#A78BFA` secondary text
- Avatar ring on active turn: `ring-2 ring-violet-500`
- Bottom nav: active icon purple-filled, inactive grey, `border-t border-gray-100 dark:border-white/10`
- Page transitions: fade in `duration-200`
- Mobile verified: no horizontal scroll, all tap targets ≥ 44px, no truncated content

---

## Phase 6 — AI Reflection

**Goal:** After a session ends, either player can generate a warm AI-written reflection on how they both answered.

### Deliverables

- Firebase Admin SDK configured server-side (`lib/firebaseAdmin.ts`)
- `/api/reflect` Next.js API route:
  - Accepts `sessionCode`
  - Fetches `sessions/{code}/history` subcollection server-side
  - Formats all Q&A pairs into a prompt
  - Calls Anthropic API (`claude-sonnet-4-20250514`)
  - Saves result to `session.aiReflection` (`content`, `generatedAt`, `generatedBy`)
- Reflection prompt covers:
  - Areas of clear alignment
  - Areas of divergence
  - Questions that sparked the most interesting contrast
  - 2–3 themes worth exploring further in real conversation
  - Framed as observation, not verdict or score
- `AIReflection` component:
  - "Generate Reflection" button if none exists
  - Displays reflection text if it does
  - "Regenerate" option for a fresh take
- `ANTHROPIC_API_KEY` required in Railway env vars

---

## Phase 7 — Session History + End Screen

**Goal:** Players can review past sessions and read their AI reflection any time after the session ends.

### Deliverables

- `/session/[code]/end` — session summary:
  - Number of questions answered
  - Categories covered
  - Links to full history and AI reflection
- `/history/[code]` — full read-only Q&A history:
  - Each question with `CategoryBadge`, `DepthBadge`
  - Both player answers displayed side by side
  - `AIReflection` component embedded at bottom
- Past sessions listed on `/home`:
  - Date, partner display name, question count
  - Link to `/history/[code]`

---

## Phase 8 — Railway Deploy + CI/CD

**Goal:** The app is live, env vars are set, and every push to `main` deploys automatically.

### Deliverables

- Railway project created, GitHub repo connected
- All env vars from `.env.local.example` set in Railway dashboard
- Firebase Admin SDK service account credentials added to Railway as env var
- GitHub Actions CI extended: build + deploy to Railway on merge to `main`
- Firebase security rules deployed to production Firestore (not just emulator)
- Seed script run against production Firestore
- Production domain added to Firebase Auth authorised domains
- Smoke test: two-player session played end-to-end on production URL

---

## Appendix — Key Constraints

- **No email/password auth** — Google Sign-In only
- **Exactly two players per session** — no observer mode, no solo play
- **Questions go live immediately** on suggest — no moderation queue
- **AI reflection generated once, saved to session doc** — both players read the same reflection
- **No automated tests in this plan** — revisit post-launch
- **Emulator-first development** — all Firebase work done against local emulator until Phase 8
