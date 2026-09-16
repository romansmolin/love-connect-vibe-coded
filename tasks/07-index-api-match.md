# Matching Workflow Documentation

This document describes the full matching workflow used in this project, including:

- discovery (swipe cards feed)
- like/dislike actions
- mutual matches list
- dependent flows using matches (gift sending validation)

## 1. Workflow at a glance

1. User opens matching screen.
2. Client calls `GET /api/match/discover`.
3. Server maps query params and calls upstream `POST /index_api/search`.
4. UI shows current candidate card.
5. User clicks Like or Nope.
6. Client calls `POST /api/match/action` with `{ action, userId }`.
7. Server maps action and calls upstream `GET /index_api/match` with `action=set_like` or `action=set_dislike`.
8. If upstream result is `match`, UI gets `isMatch: true` and shows match success feedback.
9. User opens matches screen.
10. Client calls `GET /api/match/list`.
11. Server calls upstream `GET /index_api/match?action=get_matches`.
12. UI renders mutual matches list.

## 2. Internal app endpoints

| Internal endpoint | Method | Purpose | Upstream endpoint | Internal response type |
|---|---|---|---|---|
| `/api/match/discover` | `GET` | Load swipe cards | `POST /index_api/search` | `DiscoverMatchesResponse` |
| `/api/match/action` | `POST` | Like/dislike candidate | `GET /index_api/match` with `action=set_like|set_dislike` | `MatchActionResponse` |
| `/api/match/list` | `GET` | Load mutual matches | `GET /index_api/match` with `action=get_matches` | `MatchListResponse` |

## 3. Upstream endpoints and params

Base URL: `https://api.fotochat.com`

### 3.1 Discovery endpoint

`POST /index_api/search`

Params this project sends:

| Param | Required | Source |
|---|---|---|
| `session_id` | yes | session cookie |
| `api_key` | yes | app config |
| `page` | optional | client query (`page`) |
| `pas` | optional | client query (`perPage`) |
| `age_from` | optional | client query (`ageFrom`) |
| `age_to` | optional | client query (`ageTo`) |
| `sex` | optional | mapped from `gender` (`men` -> `1`, `women` -> `2`, `couple` -> `3`) |
| `get_picture_430=1` | yes | forced by controller |
| `searchAction=Last` | conditional | only when no explicit filters are provided |

### 3.2 Match endpoint

`GET /index_api/match`

Common params:

| Param | Required | Description |
|---|---|---|
| `session_id` | yes | authenticated user session |
| `api_key` | yes | API key |
| `action` | yes in this project | `get_matches`, `set_like`, `set_dislike` |
| `id_user` | required for actions | target user id for like/dislike |

Supported upstream actions:

| Action | Purpose | Used here |
|---|---|---|
| `get_matches` | Return mutual matches | yes |
| `set_like` | Like target profile | yes |
| `set_dislike` | Dislike target profile | yes |
| `get_profile` | Upstream option for profiles feed | no (`/index_api/search` is used instead) |

## 4. End-to-end workflow details

### 4.1 Start matching (load swipe cards)

Client call:

```http
GET /api/match/discover?page={N}&perPage={M}&gender={men|women|couple}&ageFrom={X}&ageTo={Y}
```

Server behavior:

1. Validates session cookie.
2. Normalizes incoming query params.
3. Converts UI params to upstream params (`perPage` -> `pas`, `gender` -> `sex`).
4. Calls upstream `POST /index_api/search`.
5. Maps upstream members to `MatchCandidate[]`.
6. Returns `DiscoverMatchesResponse`.

### 4.2 Swipe action (like/dislike)

Client call:

```http
POST /api/match/action
Content-Type: application/json

{ "action": "like" | "dislike", "userId": 123 }
```

Server behavior:

1. Validates session.
2. Validates payload (`action`, numeric `userId`).
3. Maps action:
   - `like` -> `set_like`
   - `dislike` -> `set_dislike`
4. Calls upstream `GET /index_api/match` with mapped action and `id_user`.
5. Returns:
   - `result` from upstream
   - derived `isMatch = (result === "match")`

### 4.3 Mutual matches list

Client call:

```http
GET /api/match/list
```

Server behavior:

1. Validates session.
2. Calls upstream `GET /index_api/match?action=get_matches`.
3. Handles multiple upstream payload shapes.
4. Maps to normalized `MatchListResponse`.

### 4.4 Gift flow dependency

Before sending a gift, backend verifies recipient is in current matches:

1. Calls `matchService.listMatches(sessionId)`.
2. Checks recipient id exists in `items`.
3. If not found, returns `403` with message:
   `Match not found. Gifts can be sent only to matched users.`

## 5. Internal typings (normalized API surface)

Defined in `src/entities/match/model/types.ts`

```ts
export type MatchGender = 'man' | 'woman' | 'couple'

export interface MatchCandidate {
  id: number
  username: string
  age?: number
  gender?: MatchGender
  location?: string
  rating?: number
  photoUrl?: string
  photoCount?: number
}

export interface DiscoverMatchesResponse {
  items: MatchCandidate[]
  page?: number
  totalPages?: number
  total?: number
}

export interface MatchListResponse {
  items: MatchCandidate[]
  total: number
}

export type MatchAction = 'like' | 'dislike'

export interface MatchActionRequest {
  userId: number
  action: MatchAction
}

export interface MatchActionResponse {
  result?: string
  isMatch?: boolean
}
```

## 6. Upstream raw typings used in this project

Defined in `src/entities/match/api/server/repositories/match.repo.ts`

```ts
export type PhotoBlock = {
  url_middle?: string
  url_small?: string
  url_big?: string
}

export type PhotoBlockV2 = {
  normal?: string
  sq_430?: string
  sq_middle?: string
  sq_small?: string
}

export type MembreBlock = {
  id?: number
  pseudo?: string
  prenom?: string
  sexe1?: number
  age?: number
  zone_name?: string
  moyenne?: number
  photo?: number
  photos?: PhotoBlock[]
  photos_v2?: PhotoBlockV2[]
}

export type SearchResponse = {
  connected?: number
  nb_pages?: number
  total?: number
  result?: MembreBlock[]
}

export type MatchListApiResponse =
  | {
      connected?: number
      result?: MembreBlock[] | { nb_total?: number; tab_profils?: MembreBlock[] }
      tab_profils?: MembreBlock[]
      nb_total?: number
    }
  | MembreBlock[]

export type MatchActionApiResponse = {
  result?: string
}
```

## 7. Mapping rules and edge cases

### 7.1 Member mapping

- `username`: `pseudo` -> `prenom` -> `'Member'`
- `gender`: `sexe1` mapped to `'man' | 'woman' | 'couple'`
- `photoUrl`: first available URL by priority:
  1. `photos_v2[0].sq_430`
  2. `photos_v2[0].sq_middle`
  3. `photos_v2[0].sq_small`
  4. `photos_v2[0].normal`
  5. `photos[0].url_middle`
  6. `photos[0].url_small`
  7. `photos[0].url_big`

### 7.2 Matches payload shapes

For `action=get_matches`, parser accepts:

- array payload (`MembreBlock[]`)
- object with `tab_profils`
- object with `result` as array
- object with `result.tab_profils`

`total` resolution priority:

1. top-level `nb_total`
2. nested `result.nb_total`
3. fallback `items.length`

### 7.3 Connected flag behavior

- Discover (`/index_api/search`): if `connected === 0` => `401 Unauthorized`
- Match list (`/index_api/match?action=get_matches`): if object payload and `connected === 0` => `401 Unauthorized`
- Action calls: response is passed through and interpreted via `result`; `isMatch` is computed from `result === 'match'`

Example empty-success response:

```json
{ "connected": 1, "result": { "nb_total": 0, "tab_profils": [] }, "error": 0 }
```

Normalized result in this project:

```json
{ "items": [], "total": 0 }
```

## 8. Reusable request examples

Discover cards:

```http
POST /index_api/search?session_id={SESSION_ID}&api_key={API_KEY}&page=0&pas=12&get_picture_430=1&searchAction=Last
```

Get matches:

```http
GET /index_api/match?session_id={SESSION_ID}&api_key={API_KEY}&action=get_matches
```

Like profile:

```http
GET /index_api/match?session_id={SESSION_ID}&api_key={API_KEY}&action=set_like&id_user={USER_ID}
```

Dislike profile:

```http
GET /index_api/match?session_id={SESSION_ID}&api_key={API_KEY}&action=set_dislike&id_user={USER_ID}
```

## 9. Source file references

- Upstream endpoints + raw types:
  - `src/entities/match/api/server/repositories/match.repo.ts`
- Controller validation/param mapping:
  - `src/entities/match/api/server/controllers/match.controller.ts`
- Service normalization:
  - `src/entities/match/api/server/services/match.service.ts`
- Route handlers:
  - `src/entities/match/api/server/routes/match.route.ts`
- App API adapters:
  - `src/app/api/match/discover/route.ts`
  - `src/app/api/match/action/route.ts`
  - `src/app/api/match/list/route.ts`
- Client API layer:
  - `src/entities/match/api/client/match.api.ts`
- Matching feature flow:
  - `src/features/matching/hooks/use-match-flow.ts`
  - `src/features/matching/ui/MatchingPanel.tsx`
- Matches list feature:
  - `src/features/matches/hooks/use-matches-list.ts`
  - `src/widgets/matches/ui/MatchesOverview.tsx`
- Gift flow dependency:
  - `src/entities/gift/api/server/gift.service.ts`
- Upstream API spec present in repo:
  - `api.json`
