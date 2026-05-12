# KnowMe

A turn-based question game for two people to explore values, goals, faith, and life vision together.

**Stack:** Next.js · Firebase · Tailwind CSS · TypeScript · Biome

---

## Local Setup

### Prerequisites

- Node.js 20+
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- Java 11+ (required by the Firebase emulator)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Firebase project values. For local development, the emulator handles Auth and Firestore so you only need the project ID and public keys (the emulator will intercept all calls).

Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` in `.env.local` to route to the emulator.

### 3. Start the Firebase emulator

```bash
npm run emulate
```

This starts:
- **Auth emulator** on `http://localhost:9099`
- **Firestore emulator** on `http://localhost:8080`
- **Emulator UI** on `http://localhost:4000`

### 4. Run the dev server

In a separate terminal:

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome lint + format check |
| `npm run lint:fix` | Auto-fix Biome issues |
| `npm run format` | Format all files with Biome |
| `npm run type-check` | TypeScript type check |
| `npm run emulate` | Start Firebase Auth + Firestore emulators |

---

## Project Structure

```
/app               Next.js App Router pages and layouts
/components
  /auth            AuthProvider, ProtectedRoute
  /session         Game session components
  /questions       Question browser components
  /ui              Shared UI primitives
/hooks             Custom React hooks
/lib               Firebase, Firestore helpers, utilities
/scripts           Seed scripts (question bank)
/docs              Design specs and documentation
firestore.rules    Firestore security rules
firebase.json      Firebase + emulator config
```

---

## Deployment

Deployed on [Railway](https://railway.app). Push to `main` triggers an automatic deploy via GitHub Actions.

Required environment variables in Railway match `.env.local.example`.
