# Chat Proxy Contract

## 1. Internal BFF routes to proxy

Base URL (internal): `/api`

| Feature | Method | Internal route | Request input | Internal response |
|---|---|---|---|---|
| Contacts list | `GET` | `/chat/contacts` | Cookie: `fotochat_session_id` | `ContactsResponse` |
| Conversation messages | `GET` | `/chat/messages` | Cookie: `fotochat_session_id`, query: `contactId` (required), `contact` (optional) | `MessagesResponse` |
| Send message | `POST` | `/chat/send` | Cookie: `fotochat_session_id`, JSON body: `SendMessageRequest` | `SendMessageResponse` |

## 2. Upstream routes used by repository

Base URL (upstream): `https://api.fotochat.com`

| Internal route | Upstream method | Upstream endpoint | Upstream params sent by code |
|---|---|---|---|
| `/api/chat/contacts` | `GET` | `/ajax_api/load_contacts` | `session_id`, `filter=1`, `api_key` |
| `/api/chat/messages` | `GET` | `/ajax_api/load_messages` | `api-key`, `session_id`, `contact_id`, `contact` |
| `/api/chat/send` | `GET` | `/ajax_api/send_message` | `api-key`, `session_id`, `contact_id`, `contact`, `msg` |

## 3. Request and response bodies

### 3.1 `GET /api/chat/contacts`

Request:

- No query/body.
- Requires cookie `fotochat_session_id`.

Success response (`200`):

```json
{
  "contacts": [
    {
      "id": 123,
      "username": "Member",
      "avatarUrl": "https://...",
      "unreadCount": 2,
      "onlineStatus": "online",
      "isFriend": true,
      "lastMessagePreview": "Hi"
    }
  ]
}
```

### 3.2 `GET /api/chat/messages`

Query params:

- `contactId: number` (required)
- `contact: string` (optional)

Success response (`200`):

```json
{
  "messages": [
    {
      "id": 987,
      "senderId": 123,
      "text": "Hello",
      "sentAt": "2026-02-10 19:31:00",
      "extra": "https://..."
    }
  ]
}
```

### 3.3 `POST /api/chat/send`

Request body:

```json
{
  "contactId": 123,
  "contact": "nickname",
  "message": "Hello there"
}
```

Success response (`200`) mirrors upstream `ResultSendMessage` shape:

```json
{
  "notification": "",
  "msg": "Hello there",
  "p_extra": "",
  "date": "2026-02-10 19:31:00",
  "id": 456
}
```

## 4. Models

### 4.1 Internal normalized models

Defined in `src/entities/chat/model/types.ts`.

```ts
export interface ContactPreview {
  id: number
  username: string
  avatarUrl?: string
  unreadCount?: number
  onlineStatus?: 'online' | 'recent' | 'offline'
  isFriend?: boolean
  lastMessagePreview?: string
}

export interface ChatMessage {
  id: number | string
  senderId?: number
  text?: string
  sentAt?: string
  extra?: string
}

export interface ContactsResponse {
  contacts: ContactPreview[]
}

export interface MessagesResponse {
  messages: ChatMessage[]
}

export interface SendMessageRequest {
  contactId: number
  contact?: string
  message: string
}

export interface SendMessageResponse {
  message?: string
  date?: string
}
```

### 4.2 Raw upstream models (repository-level)

Defined in `src/entities/chat/api/server/repositories/chat.repo.ts`.

```ts
export type ContactBlock = {
  m_id?: number
  pseudo?: string
  photo?: string
  nb_new?: number
  online?: string
  is_friend?: number
  tab_last_msg?: string | string[] | null
}

export type LoadContactsResponse = {
  contacts?: ContactBlock[]
}

export type EclairBlock = {
  id?: number
  exp?: number
  date?: string
  msg?: string
  p_extra?: string
  album_share?: string
  state?: string
}

export type LoadMessagesResponse = {
  credits_counter?: number
  eclairs?: EclairBlock[]
}

export type SendMessageResponse = {
  notification?: string
  msg?: string
  p_extra?: string
  date?: string
  id?: number
}
```

## 5. Mapping rules

- Contact mapping:
  - `m_id -> id`
  - `pseudo -> username`
  - `photo -> avatarUrl`
  - `nb_new -> unreadCount`
  - `online: green|yellow|other -> onlineStatus: online|recent|offline`
  - `is_friend === 1 -> isFriend`
  - `tab_last_msg[0]` or raw value -> `lastMessagePreview`
- Message mapping:
  - `id -> id` (fallback generated `${exp}-${date}`)
  - `exp -> senderId`
  - `msg -> text`
  - `date -> sentAt`
  - `p_extra ?? album_share -> extra`

## 6. Error contract

Errors returned by route handlers:

- `401` when `fotochat_session_id` cookie is missing:
  - `{ "message": "Unauthorized" }`
- `400` for validation:
  - `{ "message": "contactId is required" }` for missing/invalid query in `/chat/messages`
  - `{ "message": "Invalid payload" }` for missing body or missing `contactId` in `/chat/send`
  - `{ "message": "Message cannot be empty" }` when `message.trim()` is empty
- `405` for unsupported methods:
  - `{ "message": "Method Not Allowed" }`
- `500` unexpected:
  - `{ "message": "Unexpected server error" }`

`HttpError` responses can also include a `data` field:

```json
{
  "message": "Some error",
  "data": {}
}
```

## 7. `api.json` alignment notes

- `api.json` defines:
  - `/ajax_api/load_contacts` with `session_id`, `filter`
  - `/ajax_api/load_messages` with `api-key`, `session_id`, `contact`, `contact_id`
  - `/ajax_api/send_message` with `session_id`, `dest`, `msg`, optional `id_extra`
- Current project proxy sends `contact` + `contact_id` to `/ajax_api/send_message` (and also sends `api-key`), not `dest`.
- If you build an external proxy layer, keep this implementation behavior unless backend compatibility testing confirms strict `dest` is required.

## 8. Source references

- `src/app/api/chat/contacts/route.ts`
- `src/app/api/chat/messages/route.ts`
- `src/app/api/chat/send/route.ts`
- `src/entities/chat/api/routes/index.ts`
- `src/entities/chat/api/server/routes/chat.route.ts`
- `src/entities/chat/api/server/controllers/chat.controller.ts`
- `src/entities/chat/api/server/services/chat.service.ts`
- `src/entities/chat/api/server/repositories/chat.repo.ts`
- `src/entities/chat/model/types.ts`
- `src/shared/api/fotochat.ts`
- `api.json`
