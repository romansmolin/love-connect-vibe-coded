# Demo activity simulation (matching + chat)

**Status:** Draft, awaiting review
**Scope:** love-bond only (demo/pitch environment, not production traffic)

## Problem

love-bond has very few real registered users right now, so the app looks
dead in a demo: no one shows up in Who Liked You, no mutual matches, no
chat activity. The goal is to make the product *look* like it's a live,
working dating platform — likes, matches, and message replies appear for a
demo account over time — without ever touching real fotochat users.

This is explicitly for demos/pitches, not for real paying users interacting
with fake people. That framing drives every safety decision below.

## Non-goals

- Not replacing the real fotochat-backed matching/chat flow. Real contacts
  and real messages (fixed earlier this session) keep working exactly as
  they do today.
- Not sending anything to real fotochat accounts. A simulated persona's
  name/photo/bio is borrowed read-only from a real profile; the persona
  never receives a real message, like, or notification. This is a hard
  constraint, not a preference.
- Not simulating the Community Activity feed on the dashboard — that's
  already a real upstream feed (`/api/dashboard/activity`), out of scope.

## Identity gap this design has to solve first

love-bond's own `User` Prisma model (email/password) is dead — sign-up
posts straight to fotochat's `/index_api/subscribe`
(`src/entities/user/api/server/services/auth.service.ts`) and the app's
entire identity is the fotochat numeric id, carried in the
`fotochat_user_id` cookie. There is currently no local table listing "every
love-bond user" for a cron to iterate over. This design adds one
(`AppUser`, below) populated lazily as users hit the API — it doesn't touch
sign-up/sign-in at all.

A second identity problem: fotochat's `/index_api/search` (used by
`matchRepo.discover`) requires a logged-in session, so a cron can't call it
without a session. A dedicated fotochat service account is created via the
existing sign-up flow, and its session is what the cron uses to browse
real profiles for personas. Its `session_id` needs periodic refresh (login
sessions expire — observed firsthand this session); the cron re-logs-in
using stored credentials when a discover call returns `connected: 0`
instead of trying to keep a single long-lived session alive.

## Data model (new Prisma models, additive only)

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

`AppUser.id`/`SimulatedMatch.appUserId`/`SimulatedMessage.appUserId` all
use the fotochat id string, matching the existing convention
(`CreditWallet.userId`, `MatchAction.userId`, etc.) — no relation to the
Prisma `User` model, which stays unused.

## AppUser population (no cron needed)

A tiny middleware-level upsert, throttled so it doesn't write on every
request: when a request carries a valid `fotochat_user_id` cookie and
`AppUser.lastSeenAt` for that id is either missing or older than ~1 hour,
upsert it. Lives next to (or inside) `src/middleware.ts`, since that
already runs on every authenticated route.

## Cron 1 — `seed-activity`

`src/app/api/cron/seed-activity/route.ts`, `GET`, protected by
`Authorization: Bearer $CRON_SECRET`. Suggested schedule: every 6 hours.

1. Get/refresh the service account's fotochat session (stored session_id
   in memory/db; re-login via `/index_api/login` with stored credentials
   if a call comes back `connected: 0`).
2. Call `matchRepo.discover` a few pages under that session with no
   filters, collect real member blocks.
3. Upsert new ones into `SimulatedPersona` (map fields the same way
   `match.service.ts`'s `mapMember` already does — reuse that mapping
   logic rather than duplicating it).
4. For each `AppUser`: 40% chance to pick a `SimulatedPersona` not already
   linked to that user for `LIKE` and insert a `SimulatedMatch`; 15% chance
   to do the same for `MUTUAL_MATCH`. Starting numbers, tune later. The
   `@@unique([appUserId, personaId, kind])` constraint plus "not already
   linked" query keeps this naturally bounded — same trick lovity uses.

## Cron 2 — `process-replies` (safety net)

`src/app/api/cron/process-replies/route.ts`, same auth, hourly. Finds
`SimulatedMessage` rows with `senderIsPersona: false`,
`scheduledReplyAt <= now`, `repliedAt: null`; claims them with an atomic
`updateMany` (guards against double-processing if the lazy trigger below
fires at the same time); generates and stores a reply for each. This cron
mostly exists for users who never reopen the chat — the primary trigger is
the lazy one described next.

## Reply generation (shared by both triggers)

Lazy trigger: inside `chatService.listMessages`/`listContacts`, before
building the response, run the same "find due replies for this
appUserId, claim, generate" step synchronously. This is what gives the
"typing..." illusion without websockets — matches the pattern already
verified in both lovity and heartoria this session.

Generation: OpenAI call, system prompt built from the persona's
username/age/location/bio, last ~10 `SimulatedMessage` rows as
conversation history, temperature ~0.8. New `entities/simulated-chat`
slice (or similar) owns this — a thin client wrapping the OpenAI SDK, not
mixed into the existing `chatService`.

## Merge points (existing files, additive changes only)

- `matchService.getVoters` (`src/entities/match/api/server/services/match.service.ts`) —
  after the real fetch, fetch `SimulatedMatch(kind=LIKE)` for the
  `appUserId`, map to the same `MatchCandidate & { vote }` shape, prepend.
- `matchService.listMatches` — same for `kind=MUTUAL_MATCH`.
- `chatService.listContacts` (`src/entities/chat/api/server/services/chat.service.ts`) —
  append every `MUTUAL_MATCH` persona as a contact (visible immediately,
  not only after a message — mirrors lovity's behavior, more convincing
  for a demo).
- `chatService.listMessages(contactId)` — if `contactId` matches a
  `SimulatedPersona.fotochatUserId`, return local `SimulatedMessage` rows
  instead of calling `chatRepo.loadMessages`.
- `chatService.sendMessage` — if the recipient is a simulated persona:
  insert a `SimulatedMessage(senderIsPersona: false)`, set
  `scheduledReplyAt = now + random(30s, 5min)`, return success — **never**
  call `chatRepo.sendMessage` (the real upstream `dest`/`msg` call fixed
  earlier this session). Any other recipient: unchanged real-send path.

All four of these need the requesting `appUserId` (from the
`fotochat_user_id` cookie). Checked the actual controllers while writing
this: `match.controller.ts`'s `getVoters`/`listMatches` and all of
`chat.controller.ts` currently only read `SESSION_COOKIE_NAME` — none of
them extract the user id today (only `discover`/`action` do, from the
earlier match-action-history work). So each of the four merge points needs
a small addition — a `getAppUserId(request)` read from
`USER_COOKIE_NAME`, same one-liner already used in `match.controller.ts`
— not a given, just a small, well-understood addition.

## Scheduling

`vercel.json` (new file, project has none today):

```json
{
  "crons": [
    { "path": "/api/cron/seed-activity", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/process-replies", "schedule": "0 * * * *" }
  ]
}
```

`CRON_SECRET` env var, checked the same way in both routes.

## Dependencies / open items before implementation

- `OPENAI_API_KEY` needs to be added to `.env` — not present today.
- Service account credentials: to be created via the existing sign-up
  flow during implementation, credentials stored in `.env`
  (`CRON_SERVICE_USERNAME`/`CRON_SERVICE_PASSWORD`), not committed.
- No UI changes required — Who Liked You, Matches, and Chat render
  whatever their existing queries return; simulated rows just show up
  mixed in with real ones, using the same components already built this
  session.

## Testing plan

- Unit-level: mapping functions (persona → `MatchCandidate` shape) and the
  "due reply" claim query (`updateMany` with the right filter) are pure
  enough to test without hitting OpenAI or fotochat.
- Manual: seed a fresh `AppUser`, run `seed-activity` once by hand, confirm
  Who Liked You / Matches show the new personas; open Chat, send a
  message to a persona, confirm it never hits `chatRepo.sendMessage`
  (check server logs / fotochat isn't called), wait or force
  `scheduledReplyAt` into the past and reload to see the reply appear.
