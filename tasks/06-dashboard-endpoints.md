# Dashboard Endpoints and Response Typings

## 1. Internal app endpoints (used by dashboard UI)

| Feature | Method | Endpoint | Query params | Response type |
|---|---|---|---|---|
| Community activity | `GET` | `/api/dashboard/activity` | none | `CommunityActivityResponse` |
| Top members | `GET` | `/api/dashboard/top-members` | `gender=men\|women`, optional: `ageRange`, `age_range`, `page` | `TopMembersResponse` |
| Recent visitors | `GET` | `/api/dashboard/recent-visitors` | optional: `page` | `RecentVisitorsResponse` |

## 2. Upstream Fotochat endpoints (used by server repository)

Base URL: `https://api.fotochat.com`

| Feature | Method | Endpoint | Request params | Raw response type |
|---|---|---|---|---|
| Community activity | `GET` | `/ajax_api/getActivities` | `session_id`, `api_key` | `GetActivitiesResponse` |
| Top members | `POST` | `/index_api/topmembers` | `session_id`, `api_key`, `sex`, `age_range`, optional: `page` | `TopMembersResponse` (raw, repo-level) |
| Recent visitors | `POST` | `/index_api/guest/get/visites` | `session_id`, `api_key`, optional: `page` | `GuestVisitesResponse` |

## 3. Internal normalized response typings

Defined in: `src/entities/dashboard/model/types.ts`

```ts
export type MemberGender = 'man' | 'woman' | 'couple'

export type ActivityAction = 'con' | 'visite' | 'vote' | 'modif' | 'add_tof' | 'birthday' | 'friends'

export interface CommunityActivityItem {
  id: string | number
  username: string
  gender?: MemberGender
  location?: string
  action: ActivityAction
  timestamp?: string
}

export interface CommunityActivityResponse {
  items: CommunityActivityItem[]
}

export interface MemberSummary {
  id: number
  username: string
  gender?: MemberGender
  age?: number
  location?: string
  rating?: number
  visitedAt?: string
}

export interface TopMembersResponse {
  items: MemberSummary[]
  page?: number
  totalPages?: number
}

export interface RecentVisitorsResponse {
  items: MemberSummary[]
  page?: number
  totalPages?: number
}
```

## 4. Raw upstream response typings

Defined in: `src/entities/dashboard/api/server/repositories/dashboard.repo.ts`

```ts
export type WallAddPhotoBlock = {
  user_id?: number
  pseudo?: string
  nb?: number
  jour?: string
  cherche1?: number
}

export type WallBirthdayBlock = {
  id?: number
  pseudo?: string
  sexe1?: number
  cherche1?: number
}

export type WallChangeBlock = {
  id?: number
  pseudo?: string
  date_modification?: string
  cherche1?: number
}

export type WallFriendsBlock = {
  id1?: number
  pseudo1?: string
  id2?: number
  pseudo2?: string
  date?: string
  sexe1?: number
}

export type WallOnlineBlock = {
  id?: number
  pseudo?: string
  sexe1?: number
  date?: string
  cherche1?: number
}

export type GetActivitiesResponse = {
  wall_addPhoto?: WallAddPhotoBlock
  wall_birthday?: WallBirthdayBlock
  wall_change?: WallChangeBlock
  wall_friends?: WallFriendsBlock
  wall_online?: WallOnlineBlock
}

export type MembreBlock = {
  id?: number
  pseudo?: string
  prenom?: string
  sexe1?: number
  age?: number
  zone_name?: string
  moyenne?: number
}

export type TopMembersResponse = {
  connected?: number
  nb_pages?: number
  result?: MembreBlock[]
}

export type GuestVisitesResponse = {
  connected?: number
  nb_pages?: number
  result?: MembreBlock[]
}
```

## 5. Source file references

- UI usage: `src/views/dashboard-page/ui/dashboard-page.tsx`
- App route adapters:
  - `src/app/api/dashboard/activity/route.ts`
  - `src/app/api/dashboard/top-members/route.ts`
  - `src/app/api/dashboard/recent-visitors/route.ts`
- Route exports: `src/entities/dashboard/api/routes/index.ts`
- Controller: `src/entities/dashboard/api/server/controllers/dashboard.controller.ts`
- Service mappings: `src/entities/dashboard/api/server/services/dashboard.service.ts`
- Repository endpoints + raw types: `src/entities/dashboard/api/server/repositories/dashboard.repo.ts`
