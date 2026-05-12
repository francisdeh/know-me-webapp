# KnowMe — Technical Specification
**Version:** 1.5  
**Stack:** Next.js 14 · Firebase · Tailwind CSS  
**Purpose:** A turn-based question game for two people to explore values, goals, faith, and life vision together.

---

## 1. Product Overview

KnowMe is an open web platform where two users create or join a shared game session using a room code. Each session presents questions from a curated bank across multiple life categories. Players take turns drawing questions, and both answer each one. Either player can suggest new questions which go live immediately. The full question bank is publicly browsable by any authenticated user outside of gameplay. After a session ends, an AI reflection summarises how both players answered and highlights areas of alignment and difference. The app is fully mobile-friendly with light and dark theme support.

---

## 2. Feature List

### Authentication
- **Google Sign-In** via Firebase Auth (OAuth 2.0) — primary and only auth method
- Display name and avatar pulled automatically from Google profile
- No email/password signup — removes friction, no password management needed
- On first sign-in → Firestore `users` doc created automatically
- Subsequent sign-ins → existing profile loaded

### Session Setup (on Create)
Before a session starts, the creator configures the deck:
- **Category selection** — multi-select from all 8 categories; at least 1 required
- **Depth level** — single select:
  - 🌤 Light — fun, casual, low-stakes questions only
  - 🌥 Mixed — light and medium questions (default)
  - ⛈ Deep — all levels including heavy/vulnerable questions
- Settings saved to session doc and applied when drawing questions
- Player 2 sees the session settings when they join (read-only)

### Game Session
- Shared real-time session between exactly two players
- Turn indicator — whose turn it is to draw
- Draw a card button (only active on your turn)
- Both players see the drawn question simultaneously
- Both players type and submit their answers
- Answers are revealed to both after both have submitted (or one can reveal manually)
- "Next turn" advances to the other player
- Session ends when deck is exhausted or either player ends it
- Answered questions are tracked — no repeats within a session

### Question Bank
- Global shared bank visible to all users
- Organized by category:
  - Faith & Spirituality
  - Family & Roots
  - Marriage & Future
  - Career & Purpose
  - Personal Growth
  - Interests & Lifestyle
  - Money & Finances
  - Health & Fitness
  - Love & Intimacy
  - World & Big Thinking
  - Fun & Random
- Each question tagged with a **depth level**: `light` | `medium` | `deep`
- Any authenticated user can suggest a question (selects category + depth level)
- Suggested questions go live immediately into the bank

### Question Suggestion
- Accessible from within a session and from a standalone page
- Form: Category (dropdown) + Depth level (dropdown) + Question text
- Submitted questions immediately available in the bank for all sessions

### Question Bank Browser (Public, Outside Session)
- Accessible from the home screen and nav — no active session required
- Full question bank browsable by any authenticated user
- Filter by category (multi-select chips) and depth level
- Search by keyword
- Read-only — no answers, no session context
- Useful as a standalone conversation reference outside the app
- Questions displayed as cards with category badge and depth indicator

### Theme & Design System

**Inspiration:** Paired app — vibrant signature purple, warm humanity, playful energy, clean mobile-first layouts.

KnowMe adapts this into its own identity: intimate, grounded, and intentional — reflecting two people genuinely getting to know each other rather than a gamified couples app.

---

#### Colour Palette

**Primary — Deep Violet**
- `#6C3FE8` — primary purple (buttons, active states, key actions)
- `#8B5CF6` — medium purple (hover states, secondary elements)
- `#C4B5FD` — soft lavender (backgrounds, chips, subtle fills)
- `#EDE9FE` — very light lavender (light mode card backgrounds)

**Accent — Warm Rose**
- `#F472B6` — rose pink (highlights, category badges, special moments)
- `#FBCFE8` — pale pink (light accent fills)

**Neutral — Warm Slate**
- `#1E1B2E` — near-black with purple undertone (dark mode background)
- `#2D2A3E` — dark card surface (dark mode cards)
- `#F9F7FF` — off-white with warm tint (light mode background — not pure white)
- `#FFFFFF` — white (light mode cards)
- `#6B7280` — mid grey (secondary text)
- `#D1D5DB` — light grey (borders, dividers)

**Feedback**
- `#10B981` — green (success, alignment indicators)
- `#F59E0B` — amber (warning, divergence indicators)
- `#EF4444` — red (errors)

**Gradient (used sparingly — headers, login screen, special cards)**
- Light mode: `linear-gradient(135deg, #6C3FE8 0%, #F472B6 100%)`
- Dark mode: `linear-gradient(135deg, #4C1D95 0%, #831843 100%)`

---

#### Typography

- **Font:** Inter (via Google Fonts) — clean, warm, highly readable on mobile
- **Headings:** Inter Bold / Semibold
- **Body:** Inter Regular
- **Scale:**
  - `text-2xl font-bold` — page titles
  - `text-lg font-semibold` — section headers, question text
  - `text-base` — body, answers
  - `text-sm` — badges, metadata, timestamps
  - `text-xs` — labels, hints

---

#### Component Visual Language

**Cards**
- Rounded corners: `rounded-2xl` (16px) consistently
- Light mode: white background, subtle shadow `shadow-sm`
- Dark mode: `#2D2A3E` surface, no shadow — border `border border-white/10`
- Padding: `p-5` or `p-6`

**Buttons**
- Primary: purple gradient background, white text, `rounded-full`, `py-3 px-6`
- Secondary: outlined, purple border, purple text, `rounded-full`
- Ghost: no border, purple text only
- All buttons: `font-semibold`, min height 48px for touch

**Category Badges**
Each category gets a distinct colour pair (background + text) for instant recognition:

| Category | Light bg | Text | Dark bg |
|---|---|---|---|
| Faith & Spirituality | `#EDE9FE` | `#6C3FE8` | `#4C1D95` |
| Family & Roots | `#FEF3C7` | `#D97706` | `#78350F` |
| Marriage & Future | `#FCE7F3` | `#DB2777` | `#831843` |
| Career & Purpose | `#DBEAFE` | `#2563EB` | `#1E3A5F` |
| Personal Growth | `#D1FAE5` | `#059669` | `#064E3B` |
| Interests & Lifestyle | `#FEE2E2` | `#DC2626` | `#7F1D1D` |
| Health & Fitness | `#DCFCE7` | `#16A34A` | `#14532D` |
| World & Big Thinking | `#F3F4F6` | `#374151` | `#1F2937` |
| Fun & Random | `#FFF7ED` | `#EA580C` | `#7C2D12` |

**Depth Badges**
- 🌤 Light — `#D1FAE5` / `#059669`
- 🌥 Mixed — `#FEF3C7` / `#D97706`
- ⛈ Deep — `#FCE7F3` / `#DB2777`

**Question Card (in-session)**
- Large card taking ~70% of screen height on mobile
- Question text: `text-lg font-semibold` centred
- Category badge top-left, depth badge top-right
- Soft gradient border or coloured top-border matching category colour
- Subtle animated entrance on draw (slide up + fade)

**Bottom Navigation (mobile)**
- Background: white (light) / `#1E1B2E` (dark)
- Active icon: primary purple, filled
- Inactive: grey
- Top border: `border-t border-gray-100 dark:border-white/10`
- Icons: Home, Cards (browse), Plus (suggest), Clock (history)

**Avatar**
- Google profile photo, `rounded-full`, `w-10 h-10`
- Ring on active turn: `ring-2 ring-violet-500`
- Fallback: initials on gradient background

---

#### Dark Mode Specifics

- Background: `#1E1B2E` (not pure black — warmer and easier on eyes)
- Card surfaces: `#2D2A3E`
- Primary text: `#F9F7FF`
- Secondary text: `#A78BFA` (soft lavender — keeps the purple identity in dark mode)
- Borders: `border-white/10` — subtle, not harsh
- Gradient adjusted to deeper tones: `#4C1D95 → #831843`

---

#### Motion & Transitions

- Page transitions: fade in `duration-200`
- Question card draw: `translate-y-4 opacity-0 → translate-y-0 opacity-100`, `duration-300 ease-out`
- Answer reveal: cards flip or slide in from bottom, staggered by 150ms per player
- Button press: `scale-95` on active, `duration-100`
- All transitions: `ease-out`, never bouncy or distracting — this is an intimate app, not a game

---

#### Tailwind Config Additions

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        violet: {
          950: '#1E1B2E',
          900: '#2D2A3E',
        },
        brand: {
          primary: '#6C3FE8',
          secondary: '#8B5CF6',
          accent: '#F472B6',
          light: '#EDE9FE',
          bg: '#F9F7FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    }
  }
}
```

### Mobile
- All pages designed mobile-first — primary use case is two people on their phones
- No horizontal scrolling, no truncated content
- Touch-friendly tap targets (min 44px)
- Bottom navigation bar on mobile for key actions (Home, Browse Questions, Suggest, History)
- Smooth transitions between states optimised for mobile feel

### Post-Session AI Reflection
- Triggered from the session history page after a session ends
- Either player can generate the reflection
- Feeds the full session Q&A history into the Anthropic API (claude-sonnet-4-20250514)
- Returns a warm, conversational summary covering:
  - Areas of clear alignment between both players' answers
  - Areas where answers diverged or showed different perspectives
  - Questions that sparked the most interesting contrast
  - 2–3 themes worth exploring further in real conversation
- Framed as an observation, not a verdict or compatibility score
- Generated once and saved to the session doc so both players can read it
- Regeneration allowed if either player wants a fresh take

---

## 3. Firestore Data Model

### `users/{userId}`
```
{
  uid: string,
  displayName: string,
  email: string,
  photoURL: string,           // from Google profile
  createdAt: timestamp
}
```

### `questions/{questionId}`
```
{
  id: string,
  text: string,
  category: string,           // 'faith' | 'family' | 'marriage' | 'career' | 'growth' | 'interests' | 'money' | 'health' | 'intimacy' | 'world' | 'fun'
  depth: string,              // 'light' | 'medium' | 'deep'
  suggestedBy: string,        // userId
  createdAt: timestamp
}
```

### `sessions/{sessionCode}`
```
{
  code: string,               // e.g. "GRACE-42" — used as document ID
  createdBy: string,          // userId
  players: [userId, userId],  // max 2
  playerNames: { [userId]: displayName },
  playerAvatars: { [userId]: photoURL },
  status: 'waiting' | 'active' | 'ended',
  currentTurn: string,        // userId of whose turn it is
  settings: {
    categories: [string],     // selected category keys e.g. ['faith', 'fun', 'marriage']
    depth: string             // 'light' | 'mixed' | 'deep'
  },
  answeredQuestionIds: [string],
  currentQuestion: {
    questionId: string,
    text: string,
    category: string,
    depth: string,
    drawnAt: timestamp,
    answers: {
      [userId]: {
        text: string,
        submittedAt: timestamp
      }
    },
    revealed: boolean
  } | null,
  createdAt: timestamp,
  endedAt: timestamp | null,
  aiReflection: {
    content: string,          // generated reflection text
    generatedAt: timestamp,
    generatedBy: string       // userId who triggered it
  } | null
}
```

### `sessions/{sessionCode}/history/{questionId}`
```
{
  questionId: string,
  questionText: string,
  category: string,
  drawnBy: string,            // userId
  answers: {
    [userId]: string
  },
  drawnAt: timestamp
}
```

---

## 4. Authentication Flow

1. User lands on `/` — redirected to `/login` if not authenticated
2. `/login` — single "Continue with Google" button → Firebase GoogleAuthProvider popup
3. On first sign-in → Firestore `users` doc created with `uid`, `displayName`, `email`, `photoURL`, `createdAt`
4. On subsequent sign-ins → existing `users` doc loaded, `photoURL` and `displayName` synced if changed
5. On success → redirect to `/home`
6. Auth state managed via Firebase `onAuthStateChanged` in a React context
7. Protected routes — all routes except `/login` require auth

**Firebase setup required:**
- Enable Google provider in Firebase Console → Authentication → Sign-in methods
- Add authorised domains (localhost + production domain)

---

## 5. Real-Time Sync Architecture

All real-time features use **Firestore `onSnapshot` listeners.**

### Session sync:
- When a session is active, both clients subscribe to `sessions/{sessionCode}`
- Any write (draw card, submit answer, advance turn) triggers an update to the session document
- Both clients react to the snapshot update and re-render accordingly

### Key real-time events:
| Event | Who writes | What changes |
|---|---|---|
| Player 2 joins | Player 2 | `players`, `playerNames`, `status: active` |
| Card drawn | Current turn player | `currentQuestion`, `answeredQuestionIds` |
| Answer submitted | Either player | `currentQuestion.answers[userId]` |
| Answers revealed | Either player | `currentQuestion.revealed: true` |
| Turn advanced | Either player | `currentTurn`, `currentQuestion: null`, history subcollection |
| Session ended | Either player | `status: ended`, `endedAt` |

---

## 6. Room Code Generation

- Format: `WORD-NUMBER` e.g. `GRACE-42`, `LIGHT-07`
- Word pool: positive/meaningful words (Grace, Hope, Faith, Joy, Peace, Love, Truth, etc.)
- Number: random 2-digit
- On session creation: generate code → check Firestore for collision → retry if taken → write session doc
- Codes are case-insensitive on join input

---

## 7. Game Flow (Step by Step)

```
Player 1 creates session
  → Session setup screen: select categories (multi-select) + depth level
  → Firestore session doc created (status: waiting, settings saved)
  → Room code displayed — share with Player 2

Player 2 enters code and joins
  → Added to players array
  → status → active
  → currentTurn set to Player 1

Both players land on /session/[code]
  → onSnapshot listener active for both

Player 1's turn:
  → "Draw a Question" button active for Player 1 only
  → Player 1 draws → random question selected from bank filtered by:
       - category in session.settings.categories
       - depth ≤ session.settings.depth (light→light only, mixed→light+medium, deep→all)
       - questionId not in answeredQuestionIds
  → currentQuestion written to Firestore
  → Both screens show the question

Both players type their answers independently
  → Each submits their answer
  → Answer written to currentQuestion.answers[userId]

When both answers submitted → auto-reveal (or manual reveal button)
  → currentQuestion.revealed = true
  → Both see each other's answers

Player 2 clicks "Next" (or either player)
  → Current Q+A saved to history subcollection
  → questionId added to answeredQuestionIds
  → currentQuestion reset to null
  → currentTurn flips to Player 2

Repeat until deck exhausted or session ended
```

---

## 8. Page & Component Structure

```
/app
  /login                  → LoginPage (Google Sign-In)
  /home                   → HomePage (create/join session, past sessions)
  /questions              → QuestionBrowserPage (browse full bank, filter, search)
  /session/[code]         → SessionPage (main game)
  /session/[code]/end     → SessionEndPage (summary + AI reflection trigger)
  /suggest                → SuggestQuestionPage
  /history/[code]         → SessionHistoryPage (read-only past session + reflection)

/components
  /auth
    AuthProvider.tsx      → Firebase auth context
    ProtectedRoute.tsx
  /session
    QuestionCard.tsx      → Displays current question with category + depth badges
    AnswerInput.tsx       → Text input + submit for each player
    AnswerReveal.tsx      → Shows both answers after reveal
    TurnIndicator.tsx     → Whose turn it is + player avatars
    DrawButton.tsx        → Active only on current player's turn
    CategoryBadge.tsx     → Coloured badge per category
    DepthBadge.tsx        → Light / Medium / Deep indicator
    AIReflection.tsx      → Reflection display + generate button
  /questions
    QuestionCard.tsx      → Read-only card for browser
    FilterBar.tsx         → Category chips + depth filter + search input
  /ui
    Button.tsx
    Input.tsx
    Modal.tsx
    Toast.tsx
    ThemeToggle.tsx       → Light/dark toggle
    BottomNav.tsx         → Mobile bottom navigation

/lib
  firebase.ts             → Firebase app init
  firestore.ts            → Firestore helpers
  auth.ts                 → Auth helpers
  questions.ts            → Question bank queries
  roomCode.ts             → Room code generator
  anthropic.ts            → Anthropic API call for AI reflection
  theme.ts                → Theme preference helpers

/hooks
  useSession.ts           → onSnapshot hook for session doc
  useAuth.ts              → Current user context
  useQuestions.ts         → Fetch + filter questions from Firestore
  useTheme.ts             → Dark/light mode state + localStorage sync
```

---

## 9. Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Questions — anyone authenticated can read or create
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.suggestedBy == request.auth.uid;
      allow update, delete: if false; // no edits or deletes
    }

    // Sessions — players in the session can read/write
    match /sessions/{sessionCode} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid in resource.data.players
        || resource.data.players.size() < 2; // allow joining

      match /history/{questionId} {
        allow read: if request.auth != null;
        allow create: if request.auth.uid in get(/databases/$(database)/documents/sessions/$(sessionCode)).data.players;
      }
    }
  }
}
```

---

## 10. Starter Question Bank (Seed Data)

Seed these into Firestore on first deploy via a seed script.

---

### Faith & Spirituality
1. 🌤 Which part of a church service do you enjoy or connect with the most and why?
2. 🌤 How do you approach prayer — privately, together, or both?
3. 🌤 If you could ask God one question and get a direct answer, what would it be?
4. 🌥 What does your faith look like in your daily life — not just on Sundays?
5. 🌥 How important is it that your partner shares your exact denomination or beliefs?
6. 🌥 What is one lesson you learned from the Bible that applies to your life beyond your spiritual walk?
7. 🌥 What do you think is happening in the world right now that could be a fulfilment of biblical prophecy?
8. 🌥 How do you think faith should show up in how a couple handles conflict?
9. ⛈ How do you handle seasons when God feels distant?
10. ⛈ What does a spiritually healthy home look like to you?

---

### Family & Roots
1. 🌤 Describe your family growing up in three words.
2. 🌤 What is your relationship like with your siblings, if you have any?
3. 🌤 Is there a family name — first or last — you feel strongly about passing on?
4. 🌥 How was love expressed — or not expressed — in your home growing up?
5. 🌥 What is one family ritual or tradition that meant a lot to you?
6. 🌥 What does your family think makes a good partner or spouse?
7. 🌥 How much influence do you think extended family should have in your relationship?
8. 🌥 How do you handle family members who overstep boundaries?
9. ⛈ What is one thing your parents did that you want to carry into your own home?
10. ⛈ What is one thing your parents did that you want to do differently?

---

### Marriage & Future
1. 🌤 What does your dream wedding look like — big, intimate, destination, traditional?
2. 🌤 Where in the world would you want to honeymoon?
3. 🌤 Would you prefer boys or girls, and what is your honest reason?
4. 🌥 How many children do you want, if any? And at what pace?
5. 🌥 How do you think finances should be handled in a marriage — joint, separate, or both?
6. 🌥 How do you feel about a spouse who travels frequently for work?
7. 🌥 Is there a place you want to live long term, or are you open to moving?
8. 🌥 What is one lifetime experience you want to share with your partner before you are old?
9. 🌥 What does a healthy division of household responsibilities look like to you?
10. ⛈ What do you expect marriage to feel like on an ordinary Tuesday — not just the highlights?
11. ⛈ What role do you see yourself playing in the home — practically and emotionally?
12. ⛈ How do you think a couple should handle disagreements about extended family expectations?

---

### Career & Purpose
1. 🌤 What are three skills you believe will survive the AI wave and remain valuable?
2. 🌤 How do you define success in your career five years from now?
3. 🌥 What problem do you most want your work to solve in the world?
4. 🌥 How do you balance ambition with rest and presence at home?
5. 🌥 What would you do with your time if money was completely off the table?
6. 🌥 How do you feel about your partner earning significantly more or less than you?
7. ⛈ Would you ever sacrifice career advancement for family — under what conditions?
8. ⛈ If your career had to have a legacy, what would you want it to be?

---

### Personal Growth
1. 🌤 What is one area of your life you are actively working to improve right now?
2. 🌤 What is the most recent thing that genuinely changed how you think?
3. 🌤 What is one habit you have tried to build and failed at? What happened?
4. 🌥 How do you respond when you are wrong — in private and in public?
5. 🌥 Who has shaped who you are the most, and how?
6. 🌥 What does lifelong improvement look like practically in your day to day?
7. 🌥 How do you handle criticism — from people close to you versus strangers?
8. ⛈ What has been your hardest season in life and what did it teach you?

---

### Interests & Lifestyle
1. 🌤 What genre of music do you listen to most, and what does it do for you?
2. 🌤 What sport do you play or follow, and how seriously do you take it?
3. 🌤 What is the last movie or series that genuinely moved you?
4. 🌤 Do you bake or cook? What is your signature dish?
5. 🌤 What is your favourite food — and what is one meal you would love someone to cook for you?
6. 🌤 Do you play games — board games, video games, card games? What is your favourite?
7. 🌤 Do you have any unusual or niche hobbies? Bird watching, collecting, something people wouldn't guess?
8. 🌥 What does a perfect weekend look like to you from Friday evening to Sunday night?
9. 🌥 How do you recharge — alone, with a few close people, or in a crowd?
10. 🌥 What kind of environment do you thrive in — city, suburb, rural, or somewhere else?
11. 🌥 Is there something you want to learn or experience in the next two years?
12. ⛈ How do you manage money — are you a saver, a spender, or an investor?

---

### Money & Finances
1. 🌤 Would you describe yourself as a saver, a spender, or somewhere in between?
2. 🌤 Do you have a budget — formal or informal — that you actually follow?
3. 🌤 What is your current relationship with money — is it a source of stress, security, or something else?
4. 🌥 What did money look like growing up in your home — was it talked about openly or kept quiet?
5. 🌥 Do you invest? If yes, where — stocks, real estate, business, savings plans?
6. 🌥 How do you think about building wealth — is it something you actively plan for or something you hope happens?
7. 🌥 How important is it that your partner is financially disciplined?
8. 🌥 Do you believe in giving — tithing, charity, supporting family? How do you practice that currently?
9. 🌥 How do you think finances should be structured in a marriage — fully joint, fully separate, or a hybrid?
10. 🌥 How do you feel about one partner earning significantly more than the other long term?
11. 🌥 What does financial freedom mean to you practically — what does that life look like?
12. ⛈ Do you currently have any debt — loans, credit cards, family obligations? How are you managing it?
13. ⛈ Have you ever been in serious financial difficulty? What happened and what did you learn?
14. ⛈ How do you feel about supporting extended family financially — parents, siblings, relatives?
15. ⛈ If your partner had significant debt coming into a marriage, how would you approach that?
16. ⛈ What is your honest money weakness — overspending, avoidance, impulsive decisions, something else?
17. ⛈ How do you think a couple should handle financial disagreements — who has the final say, or is it always consensus?

---

### Health & Fitness
1. 🌤 How active are you day to day — do you exercise regularly or is it something you're working on?
2. 🌤 Do you have a sport, workout routine, or physical activity you genuinely enjoy?
3. 🌤 Are you more of a gym person, an outdoor person, or neither?
4. 🌤 How important is it to you that your partner is physically active?
5. 🌥 How do you think about food — is it fuel, culture, pleasure, or all three?
6. 🌥 Do you have any dietary preferences or restrictions — vegetarian, clean eating, anything faith-based?
7. 🌥 How do you handle stress physically — does it affect your sleep, appetite, or energy?
8. 🌥 How important is physical health to you as a value, not just a habit?
9. 🌥 Do you think couples should work out together, or is that personal territory?
10. 🌥 How do you feel about a partner who has very different energy levels or fitness habits than you?
11. 🌥 Do you know your blood group? Is that something you think couples should share early on?
12. 🌥 Do you know your rhesus factor — and do you understand what it could mean for pregnancy?
13. ⛈ Do you know your sickle cell status — AS, AA, SS? Have you ever been tested?
14. ⛈ How do you think a couple should approach the sickle cell conversation before deciding to have children?
15. ⛈ Is there a hereditary condition or significant medical history in your family you feel a serious partner should know about?
16. ⛈ Have you ever struggled with your body image — how do you relate to your body now?
17. ⛈ How do you handle seasons of low motivation, poor sleep, or burnout — what does that look like for you?
18. ⛈ How do you think a couple should approach health decisions together — personal autonomy or shared accountability?
19. ⛈ If your partner gained significant weight or let their health go, how would you handle that conversation?

---

### Love & Intimacy
1. 🌤 What is your love language — and do you feel it is actually met in your close relationships?
2. 🌤 How do you prefer to communicate day to day — calls, texts, voice notes, in person?
3. 🌤 How often do you need to talk to someone you care about to feel connected?
4. 🌤 What is one small thing someone can do consistently that makes you feel valued?
5. 🌤 What kind of quality time means the most to you — doing something together or just being present?
6. 🌥 How do you show love — what does affection naturally look like from you?
7. 🌥 How do you like to be comforted when you are going through something difficult?
8. 🌥 Do you find it easy or hard to express how you feel — and has that changed over time?
9. 🌥 How do you handle it when the person you care about goes quiet or pulls back emotionally?
10. 🌥 What does emotional safety mean to you in a relationship — what does it feel like when it is present?
11. 🌥 How important is physical touch and affection in a relationship to you — daily, occasional, or only when it feels right?
12. 🌥 What is one thing that makes you feel genuinely understood by another person?
13. 🌥 How do you like to spend time with someone you are close to — active, social, quiet, creative?
14. 🌥 How do you navigate the balance between independence and closeness in a relationship?
15. ⛈ Have you ever felt emotionally neglected in a relationship — what did that look like and how did you handle it?
16. ⛈ What is your communication style when there is tension — do you confront, withdraw, or process alone first?
17. ⛈ How do you repair after a disagreement — what does reconciliation look like for you?
18. ⛈ What is one thing you have needed in past relationships that you never quite knew how to ask for?
19. ⛈ How do you feel about vulnerability — is it something that comes naturally or something you have had to work at?
20. ⛈ What does a deeply connected relationship look like to you at its best — what is present that most relationships don't have?

---

### World & Big Thinking
1. 🌤 What is one thing you genuinely like or find fascinating about pandas?
2. 🌤 What is one thing you find interesting about snakes — even if they scare you?
3. 🌤 Do you think humans will ever live on Mars? Would you go if you could?
4. 🌥 What are three things you know are happening globally or nationally right now that matter to you?
5. 🌥 If you could fix one broken system in your country, what would it be and how?
6. 🌥 What is one unpopular opinion you hold about society that you are willing to defend?
7. 🌥 Do you think social media is doing more harm than good to relationships? Why?
8. 🌥 What is one invention or technology you think the world is not ready for?
9. ⛈ How do you think the world will end — scientifically, spiritually, or both?
10. ⛈ If you had to make one case — just one — in defence of Lucifer, what would it be?

---

### Fun & Random
1. 🌤 What is a skill you have that would genuinely surprise people?
2. 🌤 If you could live anywhere in the world for exactly one year, where and why?
3. 🌤 What is something small that consistently makes your day better?
4. 🌤 If someone were to cook you one meal to win your heart, what would it be?
5. 🌤 What is the most spontaneous thing you have ever done?
6. 🌤 What is a film, book, or song that you think everyone should experience once?
7. 🌥 What is your love language — and do you actually think it fits you?
8. 🌥 How do you feel about makeup — do you wear it, when, and why or why not?
9. 🌥 What does femininity mean to you — how do you express or define it in your own life?
10. 🌥 What is one thing about yourself that takes people time to understand?
11. ⛈ Is there a version of yourself you performed for the world that is different from who you are privately?
12. ⛈ What is a question you wish someone would ask you that nobody ever does?

---

## 11. Seed Script

Create a script at `/scripts/seedQuestions.ts` to populate the question bank on first deploy:

```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { firebaseConfig } from '../lib/firebase'

const questions = [ /* paste full question bank here */ ]

async function seed() {
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  for (const q of questions) {
    await addDoc(collection(db, 'questions'), {
      ...q,
      suggestedBy: 'system',
      createdAt: serverTimestamp()
    })
  }
  console.log('Seeded successfully')
}

seed()
```

---

## 12. Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
ANTHROPIC_API_KEY=
```

---

## 13. Claude Code Prompting Strategy

Use Claude Code in stages. Do not prompt everything at once.

**Stage 1 — Project setup + Google Auth + Theme**
> "Set up a Next.js 14 app with Tailwind CSS and Firebase. Configure Firebase with environment variables. Enable Google Sign-In using Firebase Auth GoogleAuthProvider. Create an AuthProvider context with useAuth hook. On first sign-in, create a Firestore users doc with uid, displayName, email, photoURL, and createdAt. Create a protected route wrapper that redirects unauthenticated users to /login. The /login page should have a single 'Continue with Google' button. Implement dark/light theme: useTheme hook that reads from localStorage and falls back to system preference, ThemeToggle component in the nav header, Tailwind dark: classes throughout."

**Stage 2 — Question bank with depth levels + browser page**
> "Create a Firestore questions collection. Each question has: text, category, depth ('light' | 'medium' | 'deep'), suggestedBy, createdAt. Build a useQuestions hook that supports filtering by category array and depth array. Build the SuggestQuestionPage with category dropdown, depth dropdown, and question text input. Build the QuestionBrowserPage at /questions: display all questions as cards with CategoryBadge and DepthBadge, FilterBar with category chip multi-select, depth filter, and keyword search. Mobile-friendly card grid layout."

**Stage 3 — Session creation with category and depth settings**
> "Build the HomePage with Create Session and Join Session flows. Create Session: session setup screen with category multi-select chips and depth single-select (🌤 Light, 🌥 Mixed, ⛈ Deep). On confirm: generate room code, write session doc to Firestore with settings, redirect to /session/[code]. Join Session: room code input, validate, add player, redirect. Mobile bottom navigation bar with links to Home, Browse Questions, Suggest, History."

**Stage 4 — Core game loop with filtered drawing**
> "Build the SessionPage with onSnapshot listener. Draw a question: query questions filtered by session.settings.categories and depth (light→['light'], mixed→['light','medium'], deep→all), exclude answeredQuestionIds, select randomly client-side, write to currentQuestion. Implement answer submission, auto-reveal when both answers submitted, turn advancement with history subcollection write. Show player avatars from Google profile in TurnIndicator. CategoryBadge and DepthBadge on each QuestionCard."

**Stage 5 — UI polish (mobile-first, Paired-inspired)**
> "Polish all pages using the KnowMe design system. Colour palette: primary purple #6C3FE8, accent rose #F472B6, dark bg #1E1B2E, card surface #2D2A3E, light bg #F9F7FF. Font: Inter via Google Fonts. All cards rounded-2xl with consistent padding. Buttons rounded-full, min 48px height. Category badges use the defined colour pairs per category. Depth badges: green=light, amber=mixed, rose=deep. Question card: large centred card with gradient border matching category, category+depth badges, slide-up-fade animation on draw. Answer reveal: staggered slide-in per player. Dark mode: #1E1B2E background, #2D2A3E cards, white/10 borders, lavender secondary text. Bottom nav on mobile with active purple icons. Player avatars from Google with violet ring on active turn. Overall feel: warm, intimate, intentional — inspired by Paired's vibrant purple + warmth but with KnowMe's own identity."

**Stage 6 — Post-session AI Reflection**
> "Create a Next.js API route at /api/reflect that accepts a sessionCode, fetches the session history subcollection from Firestore (server-side using Firebase Admin SDK), formats all Q&A pairs, and calls the Anthropic API (claude-sonnet-4-20250514) with a prompt asking for a warm conversational reflection covering: alignment areas, divergence areas, most interesting contrasts, and 2-3 themes worth exploring further. Save the result to session.aiReflection in Firestore. Build the AIReflection component on the SessionHistoryPage: shows a 'Generate Reflection' button if none exists, displays the reflection text if it does, allows regeneration. Frame the UI warmly — this is a thoughtful summary, not a score."

**Stage 7 — Session history and end screen**
> "Build /session/[code]/end: shown when session status is 'ended', displays a summary of how many questions were answered across which categories, and a prompt to view full history or generate AI reflection. Build /history/[code]: full read-only Q&A history with CategoryBadge, DepthBadge, both player answers per question, and the AIReflection component at the bottom."

---

## 14. Suggested Folder Structure for Claude Code

```
/knowme
  /app
  /components
  /hooks
  /lib
  /scripts
  .env.local
  firestore.rules
  README.md
```

---

*Spec version 1.7 — built for Claude Code implementation*