# Task: Build **Home Dashboard** (`/dashboard`) using Next.js API proxy (JetSetRDV)

## Context

We have a Swagger/OpenAPI JSON file: `api.json` (in repo root). The upstream API base URL is **`https://api.jetsetrdv.com/`**.

Environment variables:

* `API_URL` = `https://api.jetsetrdv.com/` (already set)
* `API_KEY` = secret key used to authenticate requests to the upstream API

We **must not** call `https://api.jetsetrdv.com/` directly from the browser. Instead, Next.js server acts as a **proxy**:

`Client (dashboard page) → Next.js Route Handler (/api/...) → JetSetRDV API → Next.js → Client`

## Goal

Implement `/dashboard` page that shows:

1. **Start matching** button
2. **Community Activity** feed
3. **Top Members** (tabs/sections: **Men**, **Women**)
4. **Recent Visitors** list

All data must be fetched through Next.js backend proxy endpoints.

## Requirements

### 1) Read and use Swagger (`api.json`)

* Identify the **exact upstream endpoints** needed for:

  * community activity feed
  * top members (men/women)
  * recent visitors
* Identify:

  * auth header format (e.g. `Authorization: Bearer <API_KEY>` or `x-api-key: <API_KEY>`)
  * required query params (pagination, gender filter, ordering)
  * response schemas

> Implementation should be grounded in `api.json`. If multiple endpoints exist for the same widget, choose the one that best matches the UI needs (sorted, paginated, minimal payload).

### 2) Next.js server proxy

Use **Next.js App Router route handlers** (preferred): `src/app/api/.../route.ts`.

Create proxy routes (names can be adjusted, but keep a clean public API):

* `GET /api/dashboard/activity`
* `GET /api/dashboard/top-members?gender=men|women`
* `GET /api/dashboard/recent-visitors`

Each route handler:

* builds upstream URL from `process.env.API_URL`
* adds authentication header using `process.env.API_KEY`
* forwards safe query params
* returns JSON to client
* normalizes errors to a consistent shape

### 3) A single upstream fetch utility

Create a small reusable server-side utility (no new class needed):

* `src/shared/api/jetsetrdv/fetch-jetsetrdv.ts`

Responsibilities:

* compose URL from `API_URL` + path
* attach auth headers
* set `Accept: application/json`
* handle non-2xx responses (map to a typed error)
* support optional `next` caching options (or `cache: 'no-store'` for now)

### 4) Types

Define TypeScript types for entities with what we are about to work with. Put them in 'src/entities'.

Examples (adapt to swagger):

* `CommunityActivityItem`
* `TopMember`
* `RecentVisitor`

Also define typed API responses:

* `CommunityActivityResponse`
* `TopMembersResponse`
* `RecentVisitorsResponse`

### 5) Dashboard page UI

Route:

* `src/app/dashboard/page.tsx`

UI blocks:

* **Start matching button**

  * navigates to the matching flow route (use the existing route; if not present, use placeholder `/matching`)
* **Community Activity**

  * show list with basic fields (avatar, name, action, time)
  * handle empty state
* **Top Members**

  * two sections or tabs: Men / Women
  * fetch both (parallel) or fetch by tab selection
* **Recent Visitors**

  * show list of profiles with time of visit

Data fetching approach:

* Prefer server components + `fetch` from route handlers OR client component + `fetch('/api/...')`.
* Pick one approach and keep it consistent.

### 6) Loading & error states

* Each widget should have:

  * skeleton/loading state
  * empty state
  * error state (non-blocking; page still renders other widgets)

### 7) Security

* Do **not** leak `API_KEY` to the client.
* Ensure `/api/dashboard/*` does not allow arbitrary upstream URL injection.
* Only proxy the required endpoints.
