# Demo Activity Simulation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make love-bond look like a live dating platform for demos by generating local-only simulated likes, mutual matches, and chat replies for real registered users, sourced from real fotochat profiles but never sent to real fotochat accounts.

**Architecture:** Two Vercel cron jobs (`seed-activity` every 6h, `process-replies` hourly as a safety net) plus a lazy "generate due replies" trigger inside the chat read path. A new `AppUser` table tracks every local user (populated lazily from existing controllers, no new middleware). A dedicated fotochat service account browses real profiles to source `SimulatedPersona` rows. `SimulatedMatch`/`SimulatedMessage` rows are private per-`AppUser` data, merged into the real API responses at four existing merge points (`getVoters`, `listMatches`, `listContacts`, `listMessages`/`sendMessage`) without ever calling `chatRepo.sendMessage` or any other real fotochat mutation for a persona.

**Tech Stack:** Next.js 15.5 route handlers, Prisma 6 + Postgres, OpenAI SDK (`openai` npm package) for reply generation, existing FSD entity structure (`repositories` → `services` → `controllers` → `routes`).

**Spec:** `docs/superpowers/specs/2026-09-15-demo-activity-simulation-design.md`

## Global Constraints

- Simulated matches/messages are visible **only** to the owning `AppUser` in love-bond's own local database — never call `chatRepo.sendMessage`, `matchRepo.sendAction`, or any other real upstream fotochat mutation on behalf of a `SimulatedPersona`.
- A persona's name/photo/bio is borrowed **read-only** from a real fotochat profile (via the service account's `discoverPool` call) — the real account behind that profile never receives a message, like, or notification.
- Not simulating the dashboard's Community Activity feed (`/api/dashboard/activity`) — that stays a real upstream feed, out of scope.
- Real fotochat-backed matching/chat flows (fixed earlier this session) keep working unchanged for non-persona contacts.
- New Prisma models are **additive only**. `AppUser.id` / `SimulatedMatch.appUserId` / `SimulatedMessage.appUserId` are the fotochat numeric user id as a `String`, matching the existing `CreditWallet.userId` / `MatchAction.userId` convention — no relation to the dead Prisma `User` (email/password) model.
- Required env vars, all local-only (`.env*` is gitignored, never commit them): `OPENAI_API_KEY`, `CRON_SERVICE_USERNAME`, `CRON_SERVICE_PASSWORD`, `CRON_SECRET`.
- **Deviation from the spec's suggested wiring, noted here for the record:** the spec suggested populating `AppUser` "next to (or inside)" `src/middleware.ts`. This plan instead touches `AppUser` from inside the existing Node.js API route controllers (`matchController.discover`, `chatController.contacts`) instead of middleware, because `src/middleware.ts` runs on the Edge runtime by default in this project and Prisma's `PrismaClient` (used everywhere else in this codebase, see `src/shared/lib/prisma.ts`) requires the Node.js runtime. Controllers already run in Node.js API routes and already read the `fotochat_user_id` cookie (`getAppUserId`), so this achieves the same lazy-population goal without any Edge/Prisma risk.
- There is a **second, unrelated, uncommitted work-in-progress** in this repo right now (a payment-refactor session touching `prisma/schema.prisma`, `payment.service.ts`, `secure-processor` routes, and several untracked directories under `src/entities/payment/`, `src/shared/config/`, `src/shared/errors/`, `src/shared/lib/auth/`, `src/shared/lib/i18n/`). **Never** stage, commit, revert, or edit any file that WIP touches. `prisma/schema.prisma` is one of the files it has modified — Task 1 below uses a stash-isolate-commit-restore technique to add this feature's models without disturbing or committing that WIP.

---

## File Structure

New FSD entity `src/entities/demo-activity/`:

```
src/entities/demo-activity/
  lib/                                   # pure, dependency-free helpers (unit tested)
    persona-mapper.ts
    persona-mapper.test.ts
    reply-timing.ts
    reply-timing.test.ts
    seed-roll.ts
    seed-roll.test.ts
    system-prompt.ts
    system-prompt.test.ts
  api/server/
    repositories/
      app-user.repo.ts                   # AppUser Prisma access
      simulated-persona.repo.ts          # SimulatedPersona Prisma access
      simulated-match.repo.ts            # SimulatedMatch Prisma access
      simulated-message.repo.ts          # SimulatedMessage Prisma access
    services/
      service-session.service.ts         # cron fotochat service-account session cache/login
      reply-generation.service.ts        # OpenAI call
      reply-scheduler.service.ts         # "find due replies, claim, generate" (shared by cron 2 + lazy trigger)
      seed-activity.service.ts           # cron 1 orchestration
      persona-match.service.ts           # public API consumed by the 4 merge points
    lib/
      cron-auth.ts                       # Bearer $CRON_SECRET guard
    routes/
      cron.route.ts                      # seedActivityRoute / processRepliesRoute
```

New top-level routes:
```
src/app/api/cron/seed-activity/route.ts
src/app/api/cron/process-replies/route.ts
vercel.json
```

Modified (existing files, additive changes only):
```
prisma/schema.prisma                                                  # + AppUser, SimulatedPersona, SimulatedMatchKind, SimulatedMatch, SimulatedMessage
src/entities/match/api/server/services/match.service.ts               # getVoters/listMatches merge simulated rows in
src/entities/match/api/server/controllers/match.controller.ts         # touch AppUser on discover; pass appUserId through
src/entities/chat/api/server/services/chat.service.ts                 # listContacts/listMessages/sendMessage merge/redirect to personas
src/entities/chat/api/server/controllers/chat.controller.ts           # touch AppUser on contacts; pass appUserId through
package.json                                                          # + openai dependency
```

---

### Task 1: Prisma schema — add the demo-activity models

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_demo_activity_models/migration.sql` (generated by Prisma)

**Interfaces:**
- Produces: Prisma Client types `AppUser`, `SimulatedPersona`, `SimulatedMatch`, `SimulatedMatchKind`, `SimulatedMessage` from `@prisma/client`, used by every later task.

This repo currently has an unrelated, uncommitted WIP sitting in `prisma/schema.prisma` (a 3-hunk diff adding `@unique` to a few payment fields) plus an untracked migration folder for it. We must add our models without ever committing that WIP. Use this exact sequence.

- [ ] **Step 1: Confirm the current dirty state matches what this plan expects**

Run: `git status --short prisma/`
Expected output includes exactly:
```
 M prisma/schema.prisma
?? prisma/migrations/20260418120000_add_unique_payment_token_refs/
```
If the modified/untracked paths differ from this, STOP and tell the user — do not proceed with the stash below on an assumption that no longer holds.

- [ ] **Step 2: Stash only the schema.prisma WIP and its migration folder**

```bash
git stash push -u -m "wip: payment schema tweaks (not mine)" -- prisma/schema.prisma prisma/migrations/20260418120000_add_unique_payment_token_refs/
```

Verify: `git status --short prisma/` now shows nothing (schema.prisma is back to clean HEAD, the migration folder is gone from the working tree). `git stash list` shows the new stash entry.

- [ ] **Step 3: Append the new models to the now-clean schema.prisma**

Open `prisma/schema.prisma`, find the last model in the file (`MatchAction`, ending in `@@index([userId])\n}`), and append this block after it:

```prisma

model AppUser {
  id         String   @id // fotochat numeric user id, as string
  username   String?
  lastSeenAt DateTime @default(now()) @updatedAt
  createdAt  DateTime @default(now())
}

model SimulatedPersona {
  id             String   @id @default(cuid())
  fotochatUserId Int      @unique
  username       String
  age            Int?
  location       String?
  gender         String?
  photoUrl       String?
  bio            String?
  createdAt      DateTime @default(now())
}

enum SimulatedMatchKind {
  LIKE
  MUTUAL_MATCH
}

model SimulatedMatch {
  id        String             @id @default(cuid())
  appUserId String
  personaId String
  kind      SimulatedMatchKind
  createdAt DateTime           @default(now())

  @@unique([appUserId, personaId, kind])
  @@index([appUserId, kind, createdAt(sort: Desc)])
}

model SimulatedMessage {
  id               String    @id @default(cuid())
  appUserId        String
  personaId        String
  senderIsPersona  Boolean
  text             String
  sentAt           DateTime  @default(now())
  scheduledReplyAt DateTime?
  repliedAt        DateTime?

  @@index([appUserId, personaId, sentAt])
  @@index([senderIsPersona, scheduledReplyAt, repliedAt])
}
```

- [ ] **Step 4: Generate and apply the migration**

```bash
npx prisma migrate dev --name add_demo_activity_models
```

Expected: prompts complete, prints `Your database is now in sync with your schema`, creates `prisma/migrations/<timestamp>_add_demo_activity_models/migration.sql`, and regenerates the Prisma Client.

- [ ] **Step 5: Restore the other session's WIP on top of your change**

```bash
git stash pop
```

Expected: no conflicts (your addition is a pure append at the end of the file; the stashed diff is 3 hunks earlier in the file, non-overlapping). `git status --short prisma/` now shows `prisma/schema.prisma` modified (both your models and the other session's 3-hunk diff) and both migration folders untracked.

If git reports a conflict, STOP — do not resolve it by guessing. Show the user the conflict and ask how to proceed.

- [ ] **Step 6: Commit only your addition, in isolation**

```bash
cp prisma/schema.prisma /tmp/love-bond-schema-merged.prisma
git show HEAD:prisma/schema.prisma > prisma/schema.prisma
```

Now re-append the exact model block from Step 3 to this clean `prisma/schema.prisma` (same content, appended after `MatchAction`).

```bash
git add prisma/schema.prisma prisma/migrations/*_add_demo_activity_models/
git status --short prisma/
```

Expected: only `prisma/schema.prisma` (staged, containing HEAD + your models only) and your new migration folder are staged — the payment migration folder and the payment schema hunks must NOT be staged.

```bash
git commit -m "$(cat <<'EOF'
feat: add demo-activity Prisma models (AppUser, SimulatedPersona, SimulatedMatch, SimulatedMessage)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

- [ ] **Step 7: Restore the merged working tree (your commit + the other session's still-uncommitted WIP)**

```bash
cp /tmp/love-bond-schema-merged.prisma prisma/schema.prisma
rm /tmp/love-bond-schema-merged.prisma
git status --short prisma/
```

Expected: `prisma/schema.prisma` shows modified again — `git diff prisma/schema.prisma` now shows **only** the other session's 3-hunk payment diff (your models are committed and no longer appear in the diff). The payment migration folder is untracked again, exactly as it was before Step 2. This confirms the other session's WIP is intact and undisturbed.

- [ ] **Step 8: Verify the generated client compiles**

```bash
npx tsc --noEmit
```

Expected: no new type errors introduced (any pre-existing errors from the untracked WIP files are not your concern — only confirm nothing about `AppUser`/`SimulatedPersona`/`SimulatedMatch`/`SimulatedMessage` fails).

---

### Task 2: Pure helper — reply delay randomizer

**Files:**
- Create: `src/entities/demo-activity/lib/reply-timing.ts`
- Test: `src/entities/demo-activity/lib/reply-timing.test.ts`

**Interfaces:**
- Produces: `randomReplyDelayMs(rng?: () => number): number` — used by Task 12 (`persona-match.service.ts`) to schedule a persona's reply 30s–5min after a user sends a message.

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { randomReplyDelayMs } from './reply-timing'

test('randomReplyDelayMs returns the minimum bound when rng returns 0', () => {
    assert.equal(randomReplyDelayMs(() => 0), 30_000)
})

test('randomReplyDelayMs stays within the 30s-5min window for any rng in [0,1)', () => {
    const value = randomReplyDelayMs(() => 0.999999)
    assert.ok(value >= 30_000 && value < 300_000)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register --test src/entities/demo-activity/lib/reply-timing.test.ts`
Expected: FAIL — `Cannot find module './reply-timing'`.

- [ ] **Step 3: Implement**

```ts
const MIN_DELAY_MS = 30_000
const MAX_DELAY_MS = 5 * 60_000

export const randomReplyDelayMs = (rng: () => number = Math.random): number =>
    Math.floor(MIN_DELAY_MS + rng() * (MAX_DELAY_MS - MIN_DELAY_MS))
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register --test src/entities/demo-activity/lib/reply-timing.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/entities/demo-activity/lib/reply-timing.ts src/entities/demo-activity/lib/reply-timing.test.ts
git commit -m "$(cat <<'EOF'
feat: add reply-delay randomizer for simulated persona replies

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 3: Pure helper — seed probability roll

**Files:**
- Create: `src/entities/demo-activity/lib/seed-roll.ts`
- Test: `src/entities/demo-activity/lib/seed-roll.test.ts`

**Interfaces:**
- Produces: `rollProbability(rate: number, rng?: () => number): boolean` — used by Task 15 (`seed-activity.service.ts`) for the 40%/15% LIKE/MUTUAL_MATCH rolls per `AppUser` per tick.

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { rollProbability } from './seed-roll'

test('rollProbability returns true when rng is below the rate', () => {
    assert.equal(rollProbability(0.4, () => 0.1), true)
})

test('rollProbability returns false when rng is at or above the rate', () => {
    assert.equal(rollProbability(0.4, () => 0.4), false)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register --test src/entities/demo-activity/lib/seed-roll.test.ts`
Expected: FAIL — `Cannot find module './seed-roll'`.

- [ ] **Step 3: Implement**

```ts
export const rollProbability = (rate: number, rng: () => number = Math.random): boolean => rng() < rate
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register --test src/entities/demo-activity/lib/seed-roll.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/entities/demo-activity/lib/seed-roll.ts src/entities/demo-activity/lib/seed-roll.test.ts
git commit -m "$(cat <<'EOF'
feat: add seed probability roll helper for demo-activity cron

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 4: Pure helper — persona system prompt builder

**Files:**
- Create: `src/entities/demo-activity/lib/system-prompt.ts`
- Test: `src/entities/demo-activity/lib/system-prompt.test.ts`

**Interfaces:**
- Produces: `buildSystemPrompt(persona: PersonaPromptInput): string` and `PersonaPromptInput { username: string; age?: number | null; location?: string | null; bio?: string | null }` — used by Task 10 (`reply-generation.service.ts`).

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildSystemPrompt } from './system-prompt'

test('buildSystemPrompt always includes the persona username', () => {
    const prompt = buildSystemPrompt({ username: 'Mila' })
    assert.match(prompt, /Mila/)
})

test('buildSystemPrompt includes age and location when provided', () => {
    const prompt = buildSystemPrompt({ username: 'Mila', age: 27, location: 'Lisbon' })
    assert.match(prompt, /27 years old/)
    assert.match(prompt, /live in Lisbon/)
})

test('buildSystemPrompt omits age/location lines when absent', () => {
    const prompt = buildSystemPrompt({ username: 'Mila' })
    assert.doesNotMatch(prompt, /years old/)
    assert.doesNotMatch(prompt, /live in/)
})

test('buildSystemPrompt tells the model to stay in character and never admit being an AI', () => {
    const prompt = buildSystemPrompt({ username: 'Mila' })
    assert.match(prompt, /never say you are an ai/i)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register --test src/entities/demo-activity/lib/system-prompt.test.ts`
Expected: FAIL — `Cannot find module './system-prompt'`.

- [ ] **Step 3: Implement**

```ts
export interface PersonaPromptInput {
    username: string
    age?: number | null
    location?: string | null
    bio?: string | null
}

export const buildSystemPrompt = (persona: PersonaPromptInput): string => {
    const parts = [`You are ${persona.username}, a real person chatting with someone on a dating app.`]

    if (persona.age) parts.push(`You are ${persona.age} years old.`)
    if (persona.location) parts.push(`You live in ${persona.location}.`)
    if (persona.bio) parts.push(`About you: ${persona.bio}`)

    parts.push(
        'Reply casually and briefly, like a real text message - 1 to 3 short sentences, no lists. Stay in character as a real person. Never say you are an AI, a bot, or a simulation.'
    )

    return parts.join(' ')
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register --test src/entities/demo-activity/lib/system-prompt.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/entities/demo-activity/lib/system-prompt.ts src/entities/demo-activity/lib/system-prompt.test.ts
git commit -m "$(cat <<'EOF'
feat: add persona system-prompt builder for reply generation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 5: Pure helper — persona/candidate mappers

**Files:**
- Create: `src/entities/demo-activity/lib/persona-mapper.ts`
- Test: `src/entities/demo-activity/lib/persona-mapper.test.ts`

**Interfaces:**
- Consumes: `MatchCandidate`, `MatchGender` from `@/entities/match/model/types`; `ContactPreview` from `@/entities/chat/model/types` (both existing, types only).
- Produces: `PersonaLike` (structural interface — a `SimulatedPersona` from `@prisma/client` satisfies it), `PersonaUpsertInput`, `mapPersonaToMatchCandidate(persona: PersonaLike): MatchCandidate`, `mapPersonaToContactPreview(persona: PersonaLike, lastMessagePreview?: string): ContactPreview`, `mapCandidateToPersonaInput(candidate: MatchCandidate): PersonaUpsertInput`. Used by Task 7 (`simulated-persona.repo.ts` for `PersonaUpsertInput`), Task 12 (`persona-match.service.ts`), and Task 15 (`seed-activity.service.ts`).

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { mapCandidateToPersonaInput, mapPersonaToContactPreview, mapPersonaToMatchCandidate } from './persona-mapper'

const persona = {
    fotochatUserId: 4242,
    username: 'Nora',
    age: 29,
    location: 'Berlin',
    gender: 'woman',
    photoUrl: 'https://example.com/nora.jpg',
}

test('mapPersonaToMatchCandidate maps fotochatUserId to id and passes a valid gender through', () => {
    const candidate = mapPersonaToMatchCandidate(persona)
    assert.equal(candidate.id, 4242)
    assert.equal(candidate.username, 'Nora')
    assert.equal(candidate.gender, 'woman')
    assert.equal(candidate.location, 'Berlin')
})

test('mapPersonaToMatchCandidate drops an invalid gender value instead of passing it through', () => {
    const candidate = mapPersonaToMatchCandidate({ ...persona, gender: 'unknown' })
    assert.equal(candidate.gender, undefined)
})

test('mapPersonaToContactPreview marks the persona as an online friend with the given preview', () => {
    const contact = mapPersonaToContactPreview(persona, 'Hey there!')
    assert.equal(contact.id, 4242)
    assert.equal(contact.isFriend, true)
    assert.equal(contact.onlineStatus, 'online')
    assert.equal(contact.lastMessagePreview, 'Hey there!')
})

test('mapCandidateToPersonaInput round-trips a MatchCandidate into persona upsert fields', () => {
    const input = mapCandidateToPersonaInput({
        id: 4242,
        username: 'Nora',
        age: 29,
        gender: 'woman',
        location: 'Berlin',
        photoUrl: 'https://example.com/nora.jpg',
    })
    assert.deepEqual(input, {
        fotochatUserId: 4242,
        username: 'Nora',
        age: 29,
        location: 'Berlin',
        gender: 'woman',
        photoUrl: 'https://example.com/nora.jpg',
    })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register --test src/entities/demo-activity/lib/persona-mapper.test.ts`
Expected: FAIL — `Cannot find module './persona-mapper'`.

- [ ] **Step 3: Implement**

```ts
import type { ContactPreview } from '@/entities/chat/model/types'
import type { MatchCandidate, MatchGender } from '@/entities/match/model/types'

export interface PersonaLike {
    fotochatUserId: number
    username: string
    age?: number | null
    location?: string | null
    gender?: string | null
    photoUrl?: string | null
}

export interface PersonaUpsertInput {
    fotochatUserId: number
    username: string
    age?: number
    location?: string
    gender?: string
    photoUrl?: string
}

const MATCH_GENDERS: MatchGender[] = ['man', 'woman', 'couple']

const asMatchGender = (value?: string | null): MatchGender | undefined =>
    value && (MATCH_GENDERS as string[]).includes(value) ? (value as MatchGender) : undefined

export const mapPersonaToMatchCandidate = (persona: PersonaLike): MatchCandidate => ({
    id: persona.fotochatUserId,
    username: persona.username,
    age: persona.age ?? undefined,
    gender: asMatchGender(persona.gender),
    location: persona.location ?? undefined,
    photoUrl: persona.photoUrl ?? undefined,
})

export const mapPersonaToContactPreview = (persona: PersonaLike, lastMessagePreview?: string): ContactPreview => ({
    id: persona.fotochatUserId,
    username: persona.username,
    avatarUrl: persona.photoUrl ?? undefined,
    onlineStatus: 'online',
    isFriend: true,
    lastMessagePreview,
})

export const mapCandidateToPersonaInput = (candidate: MatchCandidate): PersonaUpsertInput => ({
    fotochatUserId: candidate.id,
    username: candidate.username,
    age: candidate.age,
    location: candidate.location,
    gender: candidate.gender,
    photoUrl: candidate.photoUrl,
})
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register --test src/entities/demo-activity/lib/persona-mapper.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/entities/demo-activity/lib/persona-mapper.ts src/entities/demo-activity/lib/persona-mapper.test.ts
git commit -m "$(cat <<'EOF'
feat: add persona <-> MatchCandidate/ContactPreview mappers

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 6: AppUser repository + lazy population wiring

**Files:**
- Create: `src/entities/demo-activity/api/server/repositories/app-user.repo.ts`
- Modify: `src/entities/match/api/server/controllers/match.controller.ts`
- Modify: `src/entities/chat/api/server/controllers/chat.controller.ts`

**Interfaces:**
- Consumes: `prisma` from `@/shared/lib/prisma` (Task 1's `AppUser` model).
- Produces: `appUserRepo.touch(appUserId: string): Promise<void>`, `appUserRepo.listAll(): Promise<AppUser[]>` — `listAll` is used by Task 15 (`seed-activity.service.ts`); `touch` is called here.

No automated test (this is a thin, side-effecting Prisma wrapper with no pure logic to isolate — verified manually below, matching the spec's testing plan which limits automated coverage to pure mapping/timing helpers).

- [ ] **Step 1: Implement the repository**

```ts
import type { AppUser } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

const STALE_AFTER_MS = 60 * 60 * 1000

export const appUserRepo = {
    async touch(appUserId: string): Promise<void> {
        const existing = await prisma.appUser.findUnique({
            where: { id: appUserId },
            select: { lastSeenAt: true },
        })

        const isStale = !existing || Date.now() - existing.lastSeenAt.getTime() > STALE_AFTER_MS

        if (!isStale) return

        await prisma.appUser.upsert({
            where: { id: appUserId },
            update: { lastSeenAt: new Date() },
            create: { id: appUserId },
        })
    },
    listAll(): Promise<AppUser[]> {
        return prisma.appUser.findMany()
    },
}
```

- [ ] **Step 2: Wire `touch` into `matchController.discover`**

In `src/entities/match/api/server/controllers/match.controller.ts`, add the import:

```ts
import { appUserRepo } from '@/entities/demo-activity/api/server/repositories/app-user.repo'
```

Change the end of the `discover` method from:

```ts
        const appUserId = getAppUserId(request)

        return isPoolRequest
            ? matchService.discoverPool(sessionId, params, excludedIds, cityParam, appUserId)
            : matchService.discover(sessionId, params, appUserId)
    },
```

to:

```ts
        const appUserId = getAppUserId(request)

        if (appUserId) {
            await appUserRepo.touch(appUserId)
        }

        return isPoolRequest
            ? matchService.discoverPool(sessionId, params, excludedIds, cityParam, appUserId)
            : matchService.discover(sessionId, params, appUserId)
    },
```

- [ ] **Step 3: Wire `touch` into `chatController.contacts`**

Replace the full contents of `src/entities/chat/api/server/controllers/chat.controller.ts` with:

```ts
import type { NextRequest } from 'next/server'

import { appUserRepo } from '@/entities/demo-activity/api/server/repositories/app-user.repo'
import { SESSION_COOKIE_NAME, USER_COOKIE_NAME } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

import type { SendMessageRequest } from '../../../model/types'
import { chatService } from '../services/chat.service'

const requireSessionId = (request: NextRequest) => {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionId) throw new HttpError('Unauthorized', 401)
    return sessionId
}

const getAppUserId = (request: NextRequest) => request.cookies.get(USER_COOKIE_NAME)?.value

export const chatController = {
    async contacts(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const appUserId = getAppUserId(request)

        if (appUserId) {
            await appUserRepo.touch(appUserId)
        }

        return chatService.listContacts(sessionId)
    },
    async messages(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const { searchParams } = new URL(request.url)
        const contactId = Number(searchParams.get('contactId'))
        const contact = searchParams.get('contact') ?? undefined

        if (!Number.isFinite(contactId)) {
            throw new HttpError('contactId is required', 400)
        }

        return chatService.listMessages(sessionId, contactId, contact)
    },
    async send(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const body = (await request.json().catch(() => null)) as Partial<SendMessageRequest> | null

        if (!body || typeof body !== 'object' || !body.contactId || !body.contact) {
            throw new HttpError('Invalid payload', 400)
        }

        return chatService.sendMessage(sessionId, {
            contactId: Number(body.contactId),
            contact: body.contact,
            message: body.message ?? '',
        })
    },
}
```

(`messages` and `send` are unchanged here — their `appUserId` plumbing lands in Task 14, together with the `chatService` signature changes it depends on, so each task stays independently buildable.)

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```

In another terminal, sign in as any existing test user in the browser, load the dashboard (which calls `/api/match/discover` and `/api/chat/contacts`), then:

```bash
npx prisma studio
```

Open the `AppUser` table and confirm a row exists with `id` equal to your test user's fotochat numeric id and a recent `lastSeenAt`.

- [ ] **Step 6: Commit**

```bash
git add src/entities/demo-activity/api/server/repositories/app-user.repo.ts src/entities/match/api/server/controllers/match.controller.ts src/entities/chat/api/server/controllers/chat.controller.ts
git commit -m "$(cat <<'EOF'
feat: lazily track every local user in AppUser via existing controllers

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 7: SimulatedPersona + SimulatedMatch repositories

**Files:**
- Create: `src/entities/demo-activity/api/server/repositories/simulated-persona.repo.ts`
- Create: `src/entities/demo-activity/api/server/repositories/simulated-match.repo.ts`

**Interfaces:**
- Consumes: `PersonaUpsertInput` from Task 5's `../../../lib/persona-mapper`; `prisma` from `@/shared/lib/prisma`; `SimulatedPersona`, `SimulatedMatch`, `SimulatedMatchKind` from `@prisma/client`.
- Produces: `simulatedPersonaRepo.upsertMany(personas: PersonaUpsertInput[]): Promise<void>`, `simulatedPersonaRepo.findByFotochatId(fotochatUserId: number): Promise<SimulatedPersona | null>`, `simulatedPersonaRepo.findById(id: string): Promise<SimulatedPersona | null>`, `simulatedPersonaRepo.pickRandomUnlinked(appUserId: string, kind: SimulatedMatchKind): Promise<SimulatedPersona | null>`; `simulatedMatchRepo.create(appUserId: string, personaId: string, kind: SimulatedMatchKind): Promise<SimulatedMatch>`, `simulatedMatchRepo.listWithPersonas(appUserId: string, kind: SimulatedMatchKind): Promise<{ match: SimulatedMatch; persona: SimulatedPersona }[]>`. Used by Task 12 and Task 15.

No automated test — thin Prisma wrappers, verified manually via the seed-activity dry run in Task 15.

- [ ] **Step 1: Implement `simulated-persona.repo.ts`**

```ts
import type { SimulatedMatchKind, SimulatedPersona } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

import type { PersonaUpsertInput } from '../../../lib/persona-mapper'

export const simulatedPersonaRepo = {
    async upsertMany(personas: PersonaUpsertInput[]): Promise<void> {
        if (personas.length === 0) return

        await prisma.$transaction(
            personas.map((persona) =>
                prisma.simulatedPersona.upsert({
                    where: { fotochatUserId: persona.fotochatUserId },
                    update: {
                        username: persona.username,
                        age: persona.age,
                        location: persona.location,
                        gender: persona.gender,
                        photoUrl: persona.photoUrl,
                    },
                    create: persona,
                })
            )
        )
    },
    findByFotochatId(fotochatUserId: number): Promise<SimulatedPersona | null> {
        return prisma.simulatedPersona.findUnique({ where: { fotochatUserId } })
    },
    findById(id: string): Promise<SimulatedPersona | null> {
        return prisma.simulatedPersona.findUnique({ where: { id } })
    },
    async pickRandomUnlinked(appUserId: string, kind: SimulatedMatchKind): Promise<SimulatedPersona | null> {
        const linked = await prisma.simulatedMatch.findMany({
            where: { appUserId, kind },
            select: { personaId: true },
        })
        const linkedIds = linked.map((row) => row.personaId)

        const candidates = await prisma.simulatedPersona.findMany({
            where: linkedIds.length > 0 ? { id: { notIn: linkedIds } } : undefined,
        })

        if (candidates.length === 0) return null

        return candidates[Math.floor(Math.random() * candidates.length)]
    },
}
```

- [ ] **Step 2: Implement `simulated-match.repo.ts`**

```ts
import type { SimulatedMatch, SimulatedMatchKind, SimulatedPersona } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

export const simulatedMatchRepo = {
    create(appUserId: string, personaId: string, kind: SimulatedMatchKind): Promise<SimulatedMatch> {
        return prisma.simulatedMatch.upsert({
            where: { appUserId_personaId_kind: { appUserId, personaId, kind } },
            update: {},
            create: { appUserId, personaId, kind },
        })
    },
    async listWithPersonas(
        appUserId: string,
        kind: SimulatedMatchKind
    ): Promise<{ match: SimulatedMatch; persona: SimulatedPersona }[]> {
        const matches = await prisma.simulatedMatch.findMany({
            where: { appUserId, kind },
            orderBy: { createdAt: 'desc' },
        })

        if (matches.length === 0) return []

        const personas = await prisma.simulatedPersona.findMany({
            where: { id: { in: matches.map((match) => match.personaId) } },
        })
        const personaById = new Map(personas.map((persona) => [persona.id, persona]))

        return matches
            .map((match) => {
                const persona = personaById.get(match.personaId)
                return persona ? { match, persona } : null
            })
            .filter((row): row is { match: SimulatedMatch; persona: SimulatedPersona } => row !== null)
    },
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/entities/demo-activity/api/server/repositories/simulated-persona.repo.ts src/entities/demo-activity/api/server/repositories/simulated-match.repo.ts
git commit -m "$(cat <<'EOF'
feat: add SimulatedPersona and SimulatedMatch repositories

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 8: SimulatedMessage repository

**Files:**
- Create: `src/entities/demo-activity/api/server/repositories/simulated-message.repo.ts`

**Interfaces:**
- Consumes: `prisma` from `@/shared/lib/prisma`; `SimulatedMessage` from `@prisma/client`.
- Produces: `simulatedMessageRepo.listByConversation(appUserId, personaId, limit): Promise<SimulatedMessage[]>` (chronological order), `.insertInbound(appUserId, personaId, text, scheduledReplyAt): Promise<SimulatedMessage>`, `.insertPersonaReply(appUserId, personaId, text): Promise<SimulatedMessage>`, `.findDueForReply(now, limit): Promise<SimulatedMessage[]>`, `.findDueForConversation(appUserId, personaId, now): Promise<SimulatedMessage[]>`, `.claimReply(id, now): Promise<boolean>` (atomic compare-and-swap on `repliedAt: null`). Used by Task 11 and Task 12.

No automated test — thin Prisma wrapper; the atomic-claim behavior is verified manually in Task 15's end-to-end check.

- [ ] **Step 1: Implement**

```ts
import type { SimulatedMessage } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'

export const simulatedMessageRepo = {
    async listByConversation(appUserId: string, personaId: string, limit: number): Promise<SimulatedMessage[]> {
        const rows = await prisma.simulatedMessage.findMany({
            where: { appUserId, personaId },
            orderBy: { sentAt: 'desc' },
            take: limit,
        })
        return rows.reverse()
    },
    insertInbound(
        appUserId: string,
        personaId: string,
        text: string,
        scheduledReplyAt: Date
    ): Promise<SimulatedMessage> {
        return prisma.simulatedMessage.create({
            data: { appUserId, personaId, senderIsPersona: false, text, scheduledReplyAt },
        })
    },
    insertPersonaReply(appUserId: string, personaId: string, text: string): Promise<SimulatedMessage> {
        return prisma.simulatedMessage.create({
            data: { appUserId, personaId, senderIsPersona: true, text },
        })
    },
    findDueForReply(now: Date, limit: number): Promise<SimulatedMessage[]> {
        return prisma.simulatedMessage.findMany({
            where: { senderIsPersona: false, scheduledReplyAt: { lte: now }, repliedAt: null },
            orderBy: { scheduledReplyAt: 'asc' },
            take: limit,
        })
    },
    findDueForConversation(appUserId: string, personaId: string, now: Date): Promise<SimulatedMessage[]> {
        return prisma.simulatedMessage.findMany({
            where: {
                appUserId,
                personaId,
                senderIsPersona: false,
                scheduledReplyAt: { lte: now },
                repliedAt: null,
            },
        })
    },
    async claimReply(id: string, now: Date): Promise<boolean> {
        const result = await prisma.simulatedMessage.updateMany({
            where: { id, repliedAt: null },
            data: { repliedAt: now },
        })
        return result.count === 1
    },
}
```

`claimReply` is the "atomic updateMany" claim from the spec: the `WHERE id = ... AND repliedAt IS NULL` clause means only one caller's `updateMany` can ever match and set `repliedAt`, so if the lazy trigger and `process-replies` race on the same row, exactly one of them proceeds to generate a reply — this is what makes double-processing impossible without needing an explicit lock.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/entities/demo-activity/api/server/repositories/simulated-message.repo.ts
git commit -m "$(cat <<'EOF'
feat: add SimulatedMessage repository with atomic reply-claim query

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 9: Service-account session management + registration

**Files:**
- Create: `src/entities/demo-activity/api/server/services/service-session.service.ts`
- Modify: `.env` (local only, not committed)

**Interfaces:**
- Consumes: `authService.signIn` from `@/entities/user/api/server/services/auth.service.ts` (existing — `signIn(payload: { username: string; password: string }): Promise<{ sessionId: string; userId: number; ... }>`).
- Produces: `serviceSessionService.getSessionId(forceRefresh?: boolean): Promise<string>` — used by Task 15 (`seed-activity.service.ts`).

- [ ] **Step 1: Register the fotochat service account**

With the dev server running (`npm run dev`), register a dedicated account through the app's existing real sign-up flow:

```bash
curl -s -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Activity Bot",
    "email": "demo-activity-bot@love-bond.local",
    "password": "REPLACE_WITH_A_STRONG_PASSWORD",
    "username": "demo_activity_bot",
    "gender": "woman",
    "lookingFor": "man",
    "dateOfBirth": "1995-01-01",
    "city": "Paris"
  }'
```

Expected: `{"accepted":true,...}` (per `SignUpResponse`). Replace `REPLACE_WITH_A_STRONG_PASSWORD` with a real generated password before running this — do not reuse a password from anywhere else.

- [ ] **Step 2: Store the credentials and cron secret locally**

Append to `.env` (already gitignored via `.env*`):

```
CRON_SERVICE_USERNAME=demo_activity_bot
CRON_SERVICE_PASSWORD=<the password you used above>
CRON_SECRET=<output of: openssl rand -hex 32>
```

- [ ] **Step 3: Implement the session cache/login service**

```ts
import { authService } from '@/entities/user/api/server/services/auth.service'

let cachedSession: { sessionId: string; userId: number; obtainedAt: number } | null = null

const SESSION_TTL_MS = 5 * 60 * 60 * 1000

const requireEnv = (name: string): string => {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

export const serviceSessionService = {
    async getSessionId(forceRefresh = false): Promise<string> {
        const isFresh = cachedSession !== null && Date.now() - cachedSession.obtainedAt < SESSION_TTL_MS

        if (!forceRefresh && isFresh && cachedSession) {
            return cachedSession.sessionId
        }

        const username = requireEnv('CRON_SERVICE_USERNAME')
        const password = requireEnv('CRON_SERVICE_PASSWORD')

        const result = await authService.signIn({ username, password })

        cachedSession = { sessionId: result.sessionId, userId: result.userId, obtainedAt: Date.now() }

        return cachedSession.sessionId
    },
}
```

This mirrors the in-memory, module-level session cache pattern already verified working in the sibling `heartoria` project this session (explicitly a prototype-grade pattern — acceptable here since it's a single-process demo cron, not production infrastructure). `forceRefresh: true` is used by Task 15 to force a re-login when a call comes back `connected: 0` (session expired), per the spec.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual verification**

```bash
TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register -e "
require('dotenv').config()
const { serviceSessionService } = require('./src/entities/demo-activity/api/server/services/service-session.service')
serviceSessionService.getSessionId().then((id) => console.log('session:', id))
"
```

Expected: prints a non-empty `session:` string. If it throws `Invalid credentials`, re-check the username/password stored in `.env` against what was registered in Step 1.

- [ ] **Step 6: Commit**

```bash
git add src/entities/demo-activity/api/server/services/service-session.service.ts
git commit -m "$(cat <<'EOF'
feat: add fotochat service-account session cache for demo-activity crons

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

(`.env` is gitignored and is not part of this commit — do not add it.)

---

### Task 10: OpenAI dependency + reply generation service

**Files:**
- Modify: `package.json` (via `npm install`)
- Create: `src/entities/demo-activity/api/server/services/reply-generation.service.ts`

**Interfaces:**
- Consumes: `buildSystemPrompt` from Task 4's `../../../lib/system-prompt`; `SimulatedMessage`, `SimulatedPersona` from `@prisma/client`.
- Produces: `replyGenerationService.generateReply(persona: SimulatedPersona, history: SimulatedMessage[]): Promise<string>` — used by Task 11.

- [ ] **Step 1: Install the OpenAI SDK**

```bash
npm install openai
```

Expected: `package.json`'s `dependencies` gains an `"openai"` entry; `package-lock.json` updates.

- [ ] **Step 2: Add the required env var**

Append to `.env`:

```
OPENAI_API_KEY=<your OpenAI API key>
```

- [ ] **Step 3: Implement the reply generation service**

```ts
import type { SimulatedMessage, SimulatedPersona } from '@prisma/client'
import OpenAI from 'openai'

import { buildSystemPrompt } from '../../../lib/system-prompt'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FALLBACK_REPLY = "Hey, sorry, got pulled away! What's up?"

export const replyGenerationService = {
    async generateReply(persona: SimulatedPersona, history: SimulatedMessage[]): Promise<string> {
        const completion = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.8,
            max_tokens: 200,
            messages: [
                { role: 'system', content: buildSystemPrompt(persona) },
                ...history.map((message) => ({
                    role: message.senderIsPersona ? ('assistant' as const) : ('user' as const),
                    content: message.text,
                })),
            ],
        })

        return completion.choices[0]?.message?.content?.trim() || FALLBACK_REPLY
    },
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual verification**

```bash
TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register -e "
require('dotenv').config()
const { replyGenerationService } = require('./src/entities/demo-activity/api/server/services/reply-generation.service')
replyGenerationService
  .generateReply(
    { username: 'Mila', age: 27, location: 'Lisbon', bio: 'Coffee and hiking' },
    [{ senderIsPersona: false, text: 'Hey! How was your weekend?' }]
  )
  .then((reply) => console.log('reply:', reply))
"
```

Expected: prints a short, in-character `reply:` string (not the fallback text, confirming `OPENAI_API_KEY` works).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/entities/demo-activity/api/server/services/reply-generation.service.ts
git commit -m "$(cat <<'EOF'
feat: add OpenAI-backed reply generation for simulated personas

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 11: Reply scheduler (shared by cron 2 and the lazy trigger)

**Files:**
- Create: `src/entities/demo-activity/api/server/services/reply-scheduler.service.ts`

**Interfaces:**
- Consumes: `simulatedMessageRepo` (Task 8), `simulatedPersonaRepo` (Task 7), `replyGenerationService` (Task 10).
- Produces: `replySchedulerService.processDueReplies(limit: number): Promise<number>` (returns count processed, used by Task 15's `process-replies` cron route), `replySchedulerService.processDueForConversation(appUserId: string, personaId: string): Promise<void>` (used by Task 12's `listSimulatedMessages`, the lazy trigger).

- [ ] **Step 1: Implement**

```ts
import type { SimulatedMessage } from '@prisma/client'

import { simulatedMessageRepo } from '../repositories/simulated-message.repo'
import { simulatedPersonaRepo } from '../repositories/simulated-persona.repo'
import { replyGenerationService } from './reply-generation.service'

const generateAndStoreReply = async (message: SimulatedMessage): Promise<void> => {
    const persona = await simulatedPersonaRepo.findById(message.personaId)
    if (!persona) return

    const history = await simulatedMessageRepo.listByConversation(message.appUserId, message.personaId, 10)
    const text = await replyGenerationService.generateReply(persona, history)

    await simulatedMessageRepo.insertPersonaReply(message.appUserId, message.personaId, text)
}

export const replySchedulerService = {
    async processDueReplies(limit: number): Promise<number> {
        const now = new Date()
        const due = await simulatedMessageRepo.findDueForReply(now, limit)

        let processed = 0
        for (const message of due) {
            const claimed = await simulatedMessageRepo.claimReply(message.id, now)
            if (!claimed) continue

            await generateAndStoreReply(message)
            processed += 1
        }

        return processed
    },
    async processDueForConversation(appUserId: string, personaId: string): Promise<void> {
        const now = new Date()
        const due = await simulatedMessageRepo.findDueForConversation(appUserId, personaId, now)

        for (const message of due) {
            const claimed = await simulatedMessageRepo.claimReply(message.id, now)
            if (!claimed) continue

            await generateAndStoreReply(message)
        }
    },
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/entities/demo-activity/api/server/services/reply-scheduler.service.ts
git commit -m "$(cat <<'EOF'
feat: add shared reply scheduler for lazy-trigger and safety-net cron

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 12: Persona-match service (the public API the merge points call)

**Files:**
- Create: `src/entities/demo-activity/api/server/services/persona-match.service.ts`

**Interfaces:**
- Consumes: `simulatedMatchRepo`, `simulatedMessageRepo`, `simulatedPersonaRepo` (Tasks 7-8), `replySchedulerService` (Task 11), `mapPersonaToMatchCandidate`/`mapPersonaToContactPreview` (Task 5), `randomReplyDelayMs` (Task 2); `MatchCandidate` from `@/entities/match/model/types`; `ChatMessage`, `ContactPreview`, `SendMessageResponse` from `@/entities/chat/model/types`; `HttpError` from `@/shared/http-client`.
- Produces: `personaMatchService.listSimulatedLikes(appUserId): Promise<(MatchCandidate & { vote?: number })[]>`, `.listSimulatedMutualMatches(appUserId): Promise<MatchCandidate[]>`, `.listSimulatedContacts(appUserId): Promise<ContactPreview[]>`, `.findPersonaByFotochatId(fotochatUserId): Promise<SimulatedPersona | null>`, `.listSimulatedMessages(appUserId, personaId): Promise<ChatMessage[]>`, `.sendSimulatedMessage(appUserId, personaId, text): Promise<SendMessageResponse>` — all four consumed by Task 13 and Task 14's merge points.

- [ ] **Step 1: Implement**

```ts
import type { ChatMessage, ContactPreview, SendMessageResponse } from '@/entities/chat/model/types'
import type { MatchCandidate } from '@/entities/match/model/types'
import { HttpError } from '@/shared/http-client'

import { mapPersonaToContactPreview, mapPersonaToMatchCandidate } from '../../../lib/persona-mapper'
import { randomReplyDelayMs } from '../../../lib/reply-timing'
import { simulatedMatchRepo } from '../repositories/simulated-match.repo'
import { simulatedMessageRepo } from '../repositories/simulated-message.repo'
import { simulatedPersonaRepo } from '../repositories/simulated-persona.repo'
import { replySchedulerService } from './reply-scheduler.service'

const LIKE_VOTE_VALUE = 5

export const personaMatchService = {
    async listSimulatedLikes(appUserId: string): Promise<(MatchCandidate & { vote?: number })[]> {
        const rows = await simulatedMatchRepo.listWithPersonas(appUserId, 'LIKE')
        return rows.map(({ persona }) => ({ ...mapPersonaToMatchCandidate(persona), vote: LIKE_VOTE_VALUE }))
    },
    async listSimulatedMutualMatches(appUserId: string): Promise<MatchCandidate[]> {
        const rows = await simulatedMatchRepo.listWithPersonas(appUserId, 'MUTUAL_MATCH')
        return rows.map(({ persona }) => mapPersonaToMatchCandidate(persona))
    },
    async listSimulatedContacts(appUserId: string): Promise<ContactPreview[]> {
        const rows = await simulatedMatchRepo.listWithPersonas(appUserId, 'MUTUAL_MATCH')

        return Promise.all(
            rows.map(async ({ persona }) => {
                const recent = await simulatedMessageRepo.listByConversation(appUserId, persona.id, 1)
                return mapPersonaToContactPreview(persona, recent[0]?.text)
            })
        )
    },
    findPersonaByFotochatId(fotochatUserId: number) {
        return simulatedPersonaRepo.findByFotochatId(fotochatUserId)
    },
    async listSimulatedMessages(appUserId: string, personaId: string): Promise<ChatMessage[]> {
        await replySchedulerService.processDueForConversation(appUserId, personaId)

        const persona = await simulatedPersonaRepo.findById(personaId)
        const rows = await simulatedMessageRepo.listByConversation(appUserId, personaId, 50)

        return rows.map((row) => ({
            id: row.id,
            senderId: row.senderIsPersona ? persona?.fotochatUserId : undefined,
            text: row.text,
            sentAt: row.sentAt.toISOString(),
        }))
    },
    async sendSimulatedMessage(appUserId: string, personaId: string, text: string): Promise<SendMessageResponse> {
        if (!text.trim()) {
            throw new HttpError('Message cannot be empty', 400)
        }

        const scheduledReplyAt = new Date(Date.now() + randomReplyDelayMs())
        const message = await simulatedMessageRepo.insertInbound(appUserId, personaId, text, scheduledReplyAt)

        return { message: message.text, date: message.sentAt.toISOString() }
    },
}
```

Note `sendSimulatedMessage` never calls `chatRepo.sendMessage` or any other fotochat repository — this is the hard safety boundary from the spec, enforced by construction: the merge point in Task 14 branches to this function instead of the real send path as soon as it recognizes the recipient as a `SimulatedPersona`.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/entities/demo-activity/api/server/services/persona-match.service.ts
git commit -m "$(cat <<'EOF'
feat: add persona-match service — the merge-point-facing demo-activity API

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 13: Merge into Who Liked You / Matches

**Files:**
- Modify: `src/entities/match/api/server/services/match.service.ts`
- Modify: `src/entities/match/api/server/controllers/match.controller.ts`

**Interfaces:**
- Consumes: `personaMatchService.listSimulatedLikes`/`.listSimulatedMutualMatches` (Task 12).

- [ ] **Step 1: Add the import to `match.service.ts`**

At the top of `src/entities/match/api/server/services/match.service.ts`, add:

```ts
import { personaMatchService } from '@/entities/demo-activity/api/server/services/persona-match.service'
```

- [ ] **Step 2: Merge simulated likes into `getVoters`**

Change:

```ts
    async getVoters(sessionId: string, page?: number): Promise<VotersResponse> {
        const response = await matchRepo.getVoters(sessionId, page)

        if (response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        return {
            items: response.result?.map(mapVoter) ?? [],
            page,
            totalPages: response.nb_pages,
        }
    },
```

to:

```ts
    async getVoters(sessionId: string, page?: number, appUserId?: string): Promise<VotersResponse> {
        const response = await matchRepo.getVoters(sessionId, page)

        if (response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        const realItems = response.result?.map(mapVoter) ?? []
        const simulatedItems = appUserId ? await personaMatchService.listSimulatedLikes(appUserId) : []

        return {
            items: [...simulatedItems, ...realItems],
            page,
            totalPages: response.nb_pages,
        }
    },
```

- [ ] **Step 3: Merge simulated mutual matches into `listMatches`**

Change:

```ts
    async listMatches(sessionId: string): Promise<MatchListResponse> {
        const response = await matchRepo.listMatches(sessionId)

        if (!Array.isArray(response) && response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        const members = extractMembers(response)
        const items = members.map((member) => mapMember(member))

        const total = extractTotal(response) ?? items.length

        return {
            items,
            total,
        }
    },
```

to:

```ts
    async listMatches(sessionId: string, appUserId?: string): Promise<MatchListResponse> {
        const response = await matchRepo.listMatches(sessionId)

        if (!Array.isArray(response) && response.connected === 0) {
            throw new HttpError('Unauthorized', 401)
        }

        const members = extractMembers(response)
        const realItems = members.map((member) => mapMember(member))
        const simulatedItems = appUserId ? await personaMatchService.listSimulatedMutualMatches(appUserId) : []

        const total = (extractTotal(response) ?? realItems.length) + simulatedItems.length

        return {
            items: [...simulatedItems, ...realItems],
            total,
        }
    },
```

- [ ] **Step 4: Pass `appUserId` through in `match.controller.ts`**

Change:

```ts
    async listMatches(request: NextRequest) {
        const sessionId = requireSessionId(request)

        return matchService.listMatches(sessionId)
    },
```

to:

```ts
    async listMatches(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const appUserId = getAppUserId(request)

        return matchService.listMatches(sessionId, appUserId)
    },
```

Change:

```ts
    async getVoters(request: NextRequest): Promise<VotersResponse> {
        const sessionId = requireSessionId(request)
        const { searchParams } = new URL(request.url)
        const page = toOptionalNumber(searchParams.get('page'))

        return matchService.getVoters(sessionId, page)
    },
```

to:

```ts
    async getVoters(request: NextRequest): Promise<VotersResponse> {
        const sessionId = requireSessionId(request)
        const { searchParams } = new URL(request.url)
        const page = toOptionalNumber(searchParams.get('page'))
        const appUserId = getAppUserId(request)

        return matchService.getVoters(sessionId, page, appUserId)
    },
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Manual verification**

Requires at least one `SimulatedMatch` row to exist for your test user — if Task 15 (the seed cron) hasn't run yet, insert one directly for now:

```bash
TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register -e "
require('dotenv').config()
const { prisma } = require('./src/shared/lib/prisma')
async function run() {
  const persona = await prisma.simulatedPersona.upsert({
    where: { fotochatUserId: 999001 },
    update: {},
    create: { fotochatUserId: 999001, username: 'TestPersona', age: 28, location: 'Paris', gender: 'woman' },
  })
  await prisma.simulatedMatch.upsert({
    where: { appUserId_personaId_kind: { appUserId: 'YOUR_TEST_USER_FOTOCHAT_ID', personaId: persona.id, kind: 'LIKE' } },
    update: {},
    create: { appUserId: 'YOUR_TEST_USER_FOTOCHAT_ID', personaId: persona.id, kind: 'LIKE' },
  })
  console.log('seeded')
  process.exit(0)
}
run()
"
```

Replace `YOUR_TEST_USER_FOTOCHAT_ID` with the fotochat numeric id (as a string) of the test user created earlier this session. Log in as that user, open `/who-liked`, and confirm `TestPersona` appears in the list.

- [ ] **Step 7: Commit**

```bash
git add src/entities/match/api/server/services/match.service.ts src/entities/match/api/server/controllers/match.controller.ts
git commit -m "$(cat <<'EOF'
feat: merge simulated likes and mutual matches into Who Liked You / Matches

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 14: Merge into Chat (contacts, messages, send)

**Files:**
- Modify: `src/entities/chat/api/server/services/chat.service.ts`
- Modify: `src/entities/chat/api/server/controllers/chat.controller.ts`

**Interfaces:**
- Consumes: `personaMatchService.listSimulatedContacts`/`.findPersonaByFotochatId`/`.listSimulatedMessages`/`.sendSimulatedMessage` (Task 12).

- [ ] **Step 1: Replace `chat.service.ts`**

Replace the full contents of `src/entities/chat/api/server/services/chat.service.ts` with:

```ts
import { personaMatchService } from '@/entities/demo-activity/api/server/services/persona-match.service'
import { HttpError } from '@/shared/http-client'

import type {
    ChatMessage,
    ContactsResponse,
    MessagesResponse,
    SendMessageRequest,
    SendMessageResponse,
} from '../../../model/types'
import { chatRepo } from '../repositories/chat.repo'
import type { ContactBlock, EclairBlock } from '../repositories/chat.repo'

const mapOnline = (online?: string): 'online' | 'recent' | 'offline' | undefined => {
    if (!online) return undefined
    if (online === 'green') return 'online'
    if (online === 'yellow') return 'recent'
    return 'offline'
}

const getLastMessagePreview = (value: ContactBlock['tab_last_msg']): string | undefined => {
    if (!value) return undefined
    const last = Array.isArray(value) ? value[0] : value
    if (typeof last === 'string') return last
    if (typeof last === 'object') return last.message ?? last.msg
    return undefined
}

const mapContact = (contact: ContactBlock) => ({
    id: contact.m_id ?? 0,
    username: contact.pseudo ?? 'Member',
    avatarUrl: contact.photo ?? undefined,
    unreadCount: contact.nb_new,
    onlineStatus: mapOnline(contact.online),
    isFriend: contact.is_friend === 1,
    lastMessagePreview: getLastMessagePreview(contact.tab_last_msg),
})

const mapMessage = (message: EclairBlock): ChatMessage => ({
    id: message.id ?? `${message.exp ?? 'msg'}-${message.date ?? Date.now()}`,
    senderId: message.exp_id,
    text: message.message ?? message.msg,
    sentAt: message.date,
    extra: message.p_extra ?? message.album_share,
})

export const chatService = {
    async listContacts(sessionId: string, appUserId?: string): Promise<ContactsResponse> {
        const response = await chatRepo.loadContacts(sessionId)

        const realContacts = (response.contacts ?? []).map(mapContact)
        const simulatedContacts = appUserId ? await personaMatchService.listSimulatedContacts(appUserId) : []
        const realIds = new Set(realContacts.map((contact) => contact.id))
        const extraSimulated = simulatedContacts.filter((contact) => !realIds.has(contact.id))

        return { contacts: [...extraSimulated, ...realContacts] }
    },
    async listMessages(
        sessionId: string,
        contactId: number,
        contact?: string,
        appUserId?: string
    ): Promise<MessagesResponse> {
        if (appUserId) {
            const persona = await personaMatchService.findPersonaByFotochatId(contactId)
            if (persona) {
                return { messages: await personaMatchService.listSimulatedMessages(appUserId, persona.id) }
            }
        }

        const response = await chatRepo.loadMessages(sessionId, contactId, contact)
        const messages = response.eclairs ?? []

        return { messages: messages.map(mapMessage) }
    },
    async sendMessage(
        sessionId: string,
        payload: SendMessageRequest,
        appUserId?: string
    ): Promise<SendMessageResponse> {
        if (!payload.message.trim()) {
            throw new HttpError('Message cannot be empty', 400)
        }

        if (appUserId) {
            const persona = await personaMatchService.findPersonaByFotochatId(payload.contactId)
            if (persona) {
                return personaMatchService.sendSimulatedMessage(appUserId, persona.id, payload.message)
            }
        }

        if (!payload.contact?.trim()) {
            throw new HttpError('Recipient username is required', 400)
        }

        const response = await chatRepo.sendMessage(sessionId, {
            contact: payload.contact,
            message: payload.message,
        })

        if (response.notification) {
            const message =
                response.notification === 'alert1'
                    ? 'You need an active subscription to send messages.'
                    : response.notification
            throw new HttpError(message, 402)
        }

        return { message: response.msg, date: response.date }
    },
}
```

- [ ] **Step 2: Replace `chat.controller.ts`**

Replace the full contents of `src/entities/chat/api/server/controllers/chat.controller.ts` with:

```ts
import type { NextRequest } from 'next/server'

import { appUserRepo } from '@/entities/demo-activity/api/server/repositories/app-user.repo'
import { SESSION_COOKIE_NAME, USER_COOKIE_NAME } from '@/shared/api/fotochat'
import { HttpError } from '@/shared/http-client'

import type { SendMessageRequest } from '../../../model/types'
import { chatService } from '../services/chat.service'

const requireSessionId = (request: NextRequest) => {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionId) throw new HttpError('Unauthorized', 401)
    return sessionId
}

const getAppUserId = (request: NextRequest) => request.cookies.get(USER_COOKIE_NAME)?.value

export const chatController = {
    async contacts(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const appUserId = getAppUserId(request)

        if (appUserId) {
            await appUserRepo.touch(appUserId)
        }

        return chatService.listContacts(sessionId, appUserId)
    },
    async messages(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const { searchParams } = new URL(request.url)
        const contactId = Number(searchParams.get('contactId'))
        const contact = searchParams.get('contact') ?? undefined

        if (!Number.isFinite(contactId)) {
            throw new HttpError('contactId is required', 400)
        }

        const appUserId = getAppUserId(request)

        return chatService.listMessages(sessionId, contactId, contact, appUserId)
    },
    async send(request: NextRequest) {
        const sessionId = requireSessionId(request)
        const body = (await request.json().catch(() => null)) as Partial<SendMessageRequest> | null

        if (!body || typeof body !== 'object' || !body.contactId || !body.contact) {
            throw new HttpError('Invalid payload', 400)
        }

        const appUserId = getAppUserId(request)

        return chatService.sendMessage(
            sessionId,
            {
                contactId: Number(body.contactId),
                contact: body.contact,
                message: body.message ?? '',
            },
            appUserId
        )
    },
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Using the same `TestPersona`/`SimulatedMatch(kind: LIKE)` row from Task 13's verification (or seed one with `kind: 'MUTUAL_MATCH'` instead, using the same script pattern), log in as the test user and:

1. Open `/chat` — confirm `TestPersona` appears in the contact list (requires a `MUTUAL_MATCH` row, not `LIKE` — re-run Task 13's seed script with `kind: 'MUTUAL_MATCH'` if needed).
2. Click into the conversation, send a message.
3. Watch the terminal running `npm run dev` — confirm there is **no** outbound request log to fotochat's `/ajax_api/send_message` for this send (real sends go through `chatRepo.sendMessage` → `fotochatHttpClient`; a persona send never reaches that code path, so nothing should appear).
4. Confirm the message appears in the thread immediately (from `sendSimulatedMessage`'s local insert).
5. Force the reply to be due now and reload the conversation to see it appear:

```bash
TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' node --require ts-node/register -e "
require('dotenv').config()
const { prisma } = require('./src/shared/lib/prisma')
async function run() {
  await prisma.simulatedMessage.updateMany({
    where: { senderIsPersona: false, repliedAt: null },
    data: { scheduledReplyAt: new Date(0) },
  })
  console.log('backdated')
  process.exit(0)
}
run()
"
```

Reload the chat conversation in the browser — the lazy trigger inside `listSimulatedMessages` should generate and show the persona's reply.

- [ ] **Step 5: Commit**

```bash
git add src/entities/chat/api/server/services/chat.service.ts src/entities/chat/api/server/controllers/chat.controller.ts
git commit -m "$(cat <<'EOF'
feat: merge simulated personas into Chat contacts/messages/send

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

### Task 15: Cron routes, seed-activity orchestration, Vercel scheduling

**Files:**
- Create: `src/entities/demo-activity/api/server/lib/cron-auth.ts`
- Create: `src/entities/demo-activity/api/server/services/seed-activity.service.ts`
- Create: `src/entities/demo-activity/api/server/routes/cron.route.ts`
- Create: `src/app/api/cron/seed-activity/route.ts`
- Create: `src/app/api/cron/process-replies/route.ts`
- Create: `vercel.json`

**Interfaces:**
- Consumes: `matchService.discoverPool` (existing, `@/entities/match/api/server/services/match.service`), `serviceSessionService.getSessionId` (Task 9), `simulatedPersonaRepo`/`simulatedMatchRepo` (Task 7), `appUserRepo.listAll` (Task 6), `mapCandidateToPersonaInput` (Task 5), `rollProbability` (Task 3), `replySchedulerService.processDueReplies` (Task 11).

- [ ] **Step 1: Implement the cron auth guard**

```ts
import type { NextRequest } from 'next/server'

import { HttpError } from '@/shared/http-client'

export const requireCronSecret = (request: NextRequest): void => {
    const secret = process.env.CRON_SECRET
    const header = request.headers.get('authorization')

    if (!secret || header !== `Bearer ${secret}`) {
        throw new HttpError('Unauthorized', 401)
    }
}
```

- [ ] **Step 2: Implement `seed-activity.service.ts`**

```ts
import { matchService } from '@/entities/match/api/server/services/match.service'
import { HttpError } from '@/shared/http-client'

import { mapCandidateToPersonaInput } from '../../../lib/persona-mapper'
import { rollProbability } from '../../../lib/seed-roll'
import { appUserRepo } from '../repositories/app-user.repo'
import { simulatedMatchRepo } from '../repositories/simulated-match.repo'
import { simulatedPersonaRepo } from '../repositories/simulated-persona.repo'
import { serviceSessionService } from './service-session.service'

const LIKE_RATE = 0.4
const MUTUAL_MATCH_RATE = 0.15

const discoverProfiles = async () => {
    const sessionId = await serviceSessionService.getSessionId()

    try {
        return await matchService.discoverPool(sessionId, {}, new Set())
    } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
            const freshSessionId = await serviceSessionService.getSessionId(true)
            return matchService.discoverPool(freshSessionId, {}, new Set())
        }
        throw error
    }
}

export const seedActivityService = {
    async run(): Promise<{ personas: number; likes: number; mutualMatches: number }> {
        const discovered = await discoverProfiles()
        const personaInputs = discovered.items.map(mapCandidateToPersonaInput)
        await simulatedPersonaRepo.upsertMany(personaInputs)

        const appUsers = await appUserRepo.listAll()
        let likes = 0
        let mutualMatches = 0

        for (const appUser of appUsers) {
            if (rollProbability(LIKE_RATE)) {
                const persona = await simulatedPersonaRepo.pickRandomUnlinked(appUser.id, 'LIKE')
                if (persona) {
                    await simulatedMatchRepo.create(appUser.id, persona.id, 'LIKE')
                    likes += 1
                }
            }

            if (rollProbability(MUTUAL_MATCH_RATE)) {
                const persona = await simulatedPersonaRepo.pickRandomUnlinked(appUser.id, 'MUTUAL_MATCH')
                if (persona) {
                    await simulatedMatchRepo.create(appUser.id, persona.id, 'MUTUAL_MATCH')
                    mutualMatches += 1
                }
            }
        }

        return { personas: personaInputs.length, likes, mutualMatches }
    },
}
```

- [ ] **Step 3: Implement the cron routes**

```ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { HttpError } from '@/shared/http-client'

import { requireCronSecret } from '../lib/cron-auth'
import { replySchedulerService } from '../services/reply-scheduler.service'
import { seedActivityService } from '../services/seed-activity.service'

const handleError = (error: unknown) => {
    if (error instanceof HttpError) {
        return NextResponse.json({ message: error.message }, { status: error.status ?? 500 })
    }

    console.error('[demo-activity-cron] Unexpected error', error)
    return NextResponse.json({ message: 'Unexpected server error' }, { status: 500 })
}

export const seedActivityRoute = async (request: NextRequest) => {
    try {
        requireCronSecret(request)
        const result = await seedActivityService.run()
        return NextResponse.json(result)
    } catch (error) {
        return handleError(error)
    }
}

export const processRepliesRoute = async (request: NextRequest) => {
    try {
        requireCronSecret(request)
        const processed = await replySchedulerService.processDueReplies(50)
        return NextResponse.json({ processed })
    } catch (error) {
        return handleError(error)
    }
}
```

- [ ] **Step 4: Wire the Next.js route files**

`src/app/api/cron/seed-activity/route.ts`:

```ts
import { seedActivityRoute } from '@/entities/demo-activity/api/server/routes/cron.route'

export const GET = seedActivityRoute
```

`src/app/api/cron/process-replies/route.ts`:

```ts
import { processRepliesRoute } from '@/entities/demo-activity/api/server/routes/cron.route'

export const GET = processRepliesRoute
```

- [ ] **Step 5: Add Vercel cron scheduling**

Create `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/seed-activity", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/process-replies", "schedule": "0 * * * *" }
  ]
}
```

> **Deployment note:** these sub-daily schedules require a **Vercel Pro** plan. On Hobby, cron jobs
> are capped at once per day and anything more frequent is rejected/downgraded at deploy time. On a
> Hobby project either move both to a daily schedule (e.g. `0 3 * * *`) or trigger the routes from an
> external scheduler with the `Authorization: Bearer $CRON_SECRET` header.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Manual verification — auth guard**

```bash
npm run dev
curl -i http://localhost:3000/api/cron/seed-activity
```

Expected: `HTTP/1.1 401` with `{"message":"Unauthorized"}` (no `Authorization` header sent).

- [ ] **Step 8: Manual verification — full seed run**

```bash
source .env
curl -s http://localhost:3000/api/cron/seed-activity -H "Authorization: Bearer $CRON_SECRET"
```

Expected: `{"personas":<n>,"likes":<n>,"mutualMatches":<n>}` with `personas` > 0 (assuming the service account's `discoverPool` call found real profiles) and `likes`/`mutualMatches` roughly matching a 40%/15% roll across however many `AppUser` rows exist (0 if there's only one seeded `AppUser` and the roll didn't hit — re-run a couple of times to see it vary).

- [ ] **Step 9: Manual verification — process-replies cron**

```bash
curl -s http://localhost:3000/api/cron/process-replies -H "Authorization: Bearer $CRON_SECRET"
```

Expected: `{"processed":<n>}`. Combine with Task 14 Step 4's "backdate `scheduledReplyAt`" script and confirm `processed` counts those rows and inserts persona reply rows for them.

- [ ] **Step 10: End-to-end manual pass**

With the seed cron having run at least once for your logged-in test user (re-run Step 8 a few times if the probability rolls didn't hit), in the browser:

1. `/who-liked` shows one or more simulated profiles mixed with any real ones.
2. `/matches` shows any simulated mutual matches.
3. `/chat` shows simulated contacts, and opening one shows a working conversation where sending a message and waiting (or backdating `scheduledReplyAt` as in Task 14) produces a reply.
4. Confirm in the `npm run dev` terminal logs that no `/ajax_api/send_message`, `/ajax_api/setIgnore`, or other real fotochat mutation was ever issued for a persona interaction.

- [ ] **Step 11: Commit**

```bash
git add src/entities/demo-activity/api/server/lib/cron-auth.ts src/entities/demo-activity/api/server/services/seed-activity.service.ts src/entities/demo-activity/api/server/routes/cron.route.ts src/app/api/cron/seed-activity/route.ts src/app/api/cron/process-replies/route.ts vercel.json
git commit -m "$(cat <<'EOF'
feat: add seed-activity and process-replies cron endpoints with Vercel scheduling

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019YZCF3d331bpoBJ8rP4u9f
EOF
)"
```

---

## Post-plan spec coverage check

- Identity gap (`AppUser`, service account) — Tasks 1, 6, 9.
- Data model — Task 1.
- AppUser population (no cron) — Task 6.
- Cron 1 `seed-activity` — Task 15.
- Cron 2 `process-replies` — Task 11, Task 15.
- Reply generation (lazy trigger + shared logic) — Tasks 10, 11, 12 (`listSimulatedMessages`).
- Merge points (`getVoters`, `listMatches`, `listContacts`, `listMessages`, `sendMessage`) — Tasks 13, 14.
- Scheduling (`vercel.json`, `CRON_SECRET`) — Task 15.
- Dependencies (`OPENAI_API_KEY`, service account credentials, `openai` package) — Tasks 9, 10.
- Testing plan (pure mapping/timing unit tests; manual seed/chat/no-real-send verification) — Tasks 2-5 (unit), Tasks 6, 13, 14, 15 (manual).
