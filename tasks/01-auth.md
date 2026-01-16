# LoveConnect Auth (Prisma + PostgreSQL) — Codex Task

## Goal
Implement **Sign Up** and **Sign In** authentication using **Prisma ORM** connected to **PostgreSQL** via environment variables:

- `DATABASE_URL`
- `POSTGRES_URL`
- `PRISMA_DATABASE_URL`

Create API routes:
- `POST /auth/sign-up`
- `POST /auth/sign-in`

After a successful login, the client should navigate the user to **`/dashboard`**.

---

## Tech Expectations
- Node.js + TypeScript (preferred)
- Prisma ORM + PostgreSQL
- Secure password handling (hash + verify)
- Input validation and clear error responses
- Session strategy: **JWT** (recommended) or **server session + cookie**
- `rememberMe` controls token/cookie expiration


---

## Data Requirements

### Sign Up Body (`POST /auth/sign-up`)
Required fields:
- `name` (string)
- `email` (string, valid email)
- `password` (string, minimum length e.g. 8)
- `username` (string, unique)
- `gender` (enum or string; define allowed values)
- `lookingFor` (enum: `women` | `man` | `couple`)
- `dateOfBirth` (date string, ISO `YYYY-MM-DD`)
- `city` (string)

### Sign In Body (`POST /auth/sign-in`)
- `username` (string)
- `password` (string)
- `rememberMe` (boolean)

---

## Prisma Schema Tasks

### 1) Create/Update `User` model
Add a `User` model (or update existing) to support authentication fields.

**Minimum suggested fields**
- `id` (UUID / CUID)
- `name`
- `email` (unique)
- `username` (unique)
- `passwordHash`
- `gender`
- `lookingFor` (enum)
- `dateOfBirth`
- `city`
- `createdAt`, `updatedAt`

**Enum**
- `LookingFor`: `women`, `man`, `couple`

> If you already have a user model, adapt it rather than duplicating.

### 2) Run Migration
- `prisma migrate dev` (or equivalent)
- Ensure schema is in sync with DB.

---

## API Route Tasks

### Route: `POST /auth/sign-up`
**Responsibilities**
1. Validate body:
   - Ensure all required fields exist.
   - Validate email format.
   - Enforce password policy (min length; optionally complexity).
   - Validate `lookingFor` is one of: `women`, `man`, `couple`.
   - Validate `dateOfBirth` is a valid date and user is at least 18 (if required by product).
2. Normalize:
   - Lowercase email
   - Trim username
3. Check uniqueness:
   - Reject if `email` or `username` already exists.
4. Hash password:
   - Use `bcrypt` or `argon2`
   - Store as `passwordHash` only (never store raw password).
5. Create user in DB via Prisma.
6. (Optional but recommended) Auto-login:
   - Issue session token / JWT and set cookie.
7. Return response:
   - `201 Created` on success

**Success Response Example**
```json
{
  "ok": true,
  "user": {
    "id": "…",
    "name": "…",
    "username": "…",
    "email": "…"
  }
}
