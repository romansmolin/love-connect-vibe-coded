# Edit Profile Functionality

## 1. Scope

This document covers backend edit-profile behavior in this project:

- profile read (`GET /api/user/profile`)
- profile update (`PATCH /api/user/profile`)
- upstream Fotochat routes used for those operations
- request/response contracts, models, mapping, and validation

## 2. Internal BFF endpoints

Base URL (internal): `/api`

| Function | Method | Internal route | Auth source | Response type |
|---|---|---|---|---|
| Get current user profile | `GET` | `/user/profile` | Cookies: `fotochat_session_id`, `fotochat_user_id` | `UserProfileResponse` |
| Update current user profile | `PATCH` | `/user/profile` | Cookie: `fotochat_session_id` | `UpdateProfileResponse` |

Adapter file: `src/app/api/user/profile/route.ts`

## 3. Upstream Fotochat endpoints used

Base URL (upstream): `https://api.fotochat.com`

| Internal route | Upstream method | Upstream endpoint | Params sent by repository |
|---|---|---|---|
| `GET /api/user/profile` | `POST` | `/index_api/user` | `session_id`, `api_key`, `id`, `get_picture_430=1` |
| `PATCH /api/user/profile` (main fields) | `POST` | `/index_api/user/modify/informations` | `session_id`, `api_key`, `nom_complet`, optional mapped fields |
| `PATCH /api/user/profile` (description) | `POST` | `/index_api/user/modify/description` | `session_id`, `api_key`, `description` |

## 4. End-to-end behavior

### 4.1 Get profile

1. Route validates method is `GET`.
2. Controller requires:
   - `fotochat_session_id` cookie
   - numeric `fotochat_user_id` cookie
3. Service calls repository `getProfile({ withPhotos: true })`.
4. Service checks upstream:
   - `connected === 0` -> `401`
   - missing `result` -> `404`
5. Service maps upstream `ProfileBlock` to normalized `UserProfile`.
6. Response body:

```json
{
  "user": {
    "id": 123,
    "username": "Member",
    "fullName": "John Doe"
  }
}
```

### 4.2 Update profile

1. Route validates method is `PATCH`.
2. Controller requires `fotochat_session_id` cookie.
3. Controller parses JSON and requires `fullName` to be a string.
4. Controller coerces numeric fields (`string|number -> number`) and drops invalid values.
5. Service performs:
   - first call: `/index_api/user/modify/informations`
   - second call (only if description is non-empty after trim): `/index_api/user/modify/description`
6. Service checks accepted flags:
   - `acceptedInfo === 0` -> `400`
   - description call present and `acceptedDescription === 0` -> `400`
7. Response returns:

```json
{
  "accepted": 1
}
```

## 5. Request/response contracts

### 5.1 `GET /api/user/profile`

Request:

- No query/body.
- Requires cookies:
  - `fotochat_session_id`
  - `fotochat_user_id` (must parse to finite number)

Success (`200`):

```json
{
  "user": {
    "id": 123,
    "username": "jane",
    "fullName": "Jane Doe",
    "age": 29,
    "gender": "woman",
    "location": "Paris, France",
    "email": "jane@example.com",
    "lastVisit": "2026-02-11 09:31:00",
    "avatarUrl": "https://...",
    "photos": [],
    "photoCount": 3,
    "description": "..."
  }
}
```

### 5.2 `PATCH /api/user/profile`

Request body type: `UpdateProfileRequest`

```json
{
  "fullName": "Jane Doe",
  "height": 170,
  "weight": 58,
  "eyeColor": 2,
  "hairColor": 3,
  "situation": 1,
  "silhouette": 2,
  "personality": 4,
  "schedule": 3,
  "orientation": 1,
  "children": 0,
  "education": 5,
  "profession": 7,
  "email": "jane@example.com",
  "langUi": "en",
  "bodyOptions": [1, 2],
  "description": "About me..."
}
```

Success (`200`):

```json
{
  "accepted": 1
}
```

## 6. Field mapping (internal -> upstream)

| Internal payload key | Upstream query param | Notes |
|---|---|---|
| `fullName` | `nom_complet` | Required by controller as string |
| `bodyOptions` | `opts_body[]` | Sent as multi-value array |
| `height` | `taille` | number |
| `weight` | `poids` | number |
| `eyeColor` | `yeux` | number |
| `hairColor` | `cheveux` | number |
| `situation` | `situation` | number |
| `silhouette` | `silhouette` | number |
| `personality` | `personnalite` | number |
| `schedule` | `horaires` | number |
| `orientation` | `sexe2` | number |
| `children` | `child` | number |
| `education` | `etudes` | number |
| `profession` | `travail` | number |
| `email` | `email` | string (api.json marks this incorrectly as number) |
| `langUi` | `lang_ui` | string |
| `description` | `description` | sent in separate `/modify/description` call |

## 7. Models used

### 7.1 Internal models (normalized)

Defined in `src/entities/user/model/types.ts`:

- `UserProfile`
- `UserProfileResponse`
- `UpdateProfileRequest`
- `UpdateProfileResponse`

Key fields:

```ts
export interface UserProfileResponse {
  user: UserProfile
}

export interface UpdateProfileRequest {
  fullName: string
  height?: number
  weight?: number
  eyeColor?: number
  hairColor?: number
  situation?: number
  silhouette?: number
  personality?: number
  schedule?: number
  orientation?: number
  children?: number
  education?: number
  profession?: number
  email?: string
  langUi?: string
  bodyOptions?: number[]
  description?: string
}

export interface UpdateProfileResponse {
  accepted?: number
  error?: string
}
```

### 7.2 Raw repository models (upstream)

Defined in `src/entities/user/api/server/repositories/user.repo.ts`:

- `ProfileBlock`
- `UserProfileResponse` (raw)
- `UpdateProfileResponse` (raw, accepted/error)

## 8. Read mapping rules (`ProfileBlock` -> `UserProfile`)

- `id`: `profile.id ?? 0`
- `username`: `profile.pseudo ?? 'Member'`
- `fullName`: `profile.nom_complet ?? profile.prenom`
- `gender`: `sexe1` mapped `1|2|3 -> man|woman|couple`
- `location`: `zone_name`
- `lastVisit`: `visite`
- `photoCount`: `photo`
- `description`: `description`
- physical/profile fields:
  - `taille -> height`
  - `poids -> weight`
  - `yeux -> eyeColor`
  - `cheveux -> hairColor`
  - `situation -> situation`
  - `silhouette -> silhouette`
  - `personnalite -> personality`
  - `horaires -> schedule`
  - `child -> children`
  - `etudes -> education`
  - `travail -> profession`
  - `sexe2 -> orientation`
- photos:
  - prefers `photos_v2` over legacy `photos`
  - avatar picks first available in priority: large -> medium -> small

## 9. Validation and error contract

Route-level validation:

- Missing session cookie -> `401 { "message": "Unauthorized" }`
- Missing/invalid user id cookie (GET) -> `401`
- Invalid PATCH payload (`fullName` missing/non-string) -> `400 { "message": "Invalid request payload" }`

Service-level errors:

- Upstream `connected === 0` (GET) -> `401`
- Upstream profile `result` missing (GET) -> `404 { "message": "Profile not found" }`
- Upstream update rejected (`accepted === 0`) -> `400` with upstream error text if present

Generic:

- wrong method -> `405 { "message": "Method Not Allowed" }`
- unexpected -> `500 { "message": "Unexpected server error" }`

Error envelope from route handlers:

```json
{
  "message": "Error text",
  "data": {}
}
```

## 10. Important implementation notes

- PATCH calls two upstream endpoints; description update is conditional.
- Description cannot be cleared to empty string through this flow because `/modify/description` is skipped when `description.trim()` is empty.
- Controller accepts numeric fields as either strings or numbers and drops invalid values.
- For GET profile, this BFF always fetches with `get_picture_430=1`.

## 11. `api.json` alignment notes

- Used endpoints in `api.json`:
  - `/index_api/user`
  - `/index_api/user/modify/informations`
  - `/index_api/user/modify/description`
- Edit-related upstream endpoints present in `api.json` but not wired by this project:
  - `/index_api/user/modify/age_sexe_ville`
  - `/index_api/user/modify/wanttomeet`
  - `/index_api/user/modify/rdv`
- `api.json` marks both `id` and `pseudo` as required on `/index_api/user`, but its own descriptions indicate either one can be used; project uses `id`.
- `api.json` lists `email` under modify/informations as `number`; project and actual usage treat it as `string`.

## 12. Source references

- `src/app/api/user/profile/route.ts`
- `src/entities/user/api/routes/index.ts`
- `src/entities/user/api/server/routes/profile.route.ts`
- `src/entities/user/api/server/controllers/user.controller.ts`
- `src/entities/user/api/server/services/user.service.ts`
- `src/entities/user/api/server/repositories/user.repo.ts`
- `src/entities/user/model/types.ts`
- `src/entities/user/api/client/user.api.ts`
- `src/shared/api/fotochat.ts`
- `api.json`
