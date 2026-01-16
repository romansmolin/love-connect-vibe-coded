# AGENTS.md — Frontend Architecture

## Stack & Principles

- **FSD (Feature‑Sliced Design)** + **SOLID** + **Clean Architecture**
- Prefer **KISS/DRY**, reusable building blocks, and clear boundaries
- Dependency direction: **shared → entities → features → widgets → views → app**

---

## Project Structure

```txt
src/
├── app/        # routing, layouts, global providers, store
├── views/      # pages (composition, minimal logic)
├── widgets/    # complex blocks combining features/entities
├── features/   # business actions/flows (self-contained)
├── entities/   # domain models, API clients, entity UI
└── shared/     # reusable UI, hooks, lib, types, base API
```

---

## Layer Rules

### app/

- Next.js routing (App Router), layouts, global providers, store configuration
- **No business logic**

### views/

- Page composition only
- Uses widgets/features; minimal page-level state

### widgets/

- UI blocks that combine **multiple** features/entities
- Self-contained; export via `index.ts`

### features/

- User/business actions (e.g., start quiz, answer question, submit)
- Keep UI presentational; move logic into hooks
- Can import from **entities** and **shared**

### entities/

- Domain building blocks:

    - `model/` — types, domain helpers
    - `ui/` — reusable entity UI
    - `api/` — **API layer for Next.js Route Handlers** + client access

#### entities/\*/api conventions (Next.js)

- Keep **server API** for the entity inside the entity:

    - `api/server/` — controllers, services, repositories
    - `api/routes/` — Next.js route handlers that call controllers
    - `api/client/` — client-side API (RTK Query / fetch wrappers)

Example:

```txt
entities/quiz/
  api/
    client/
      quiz.api.ts           # RTK Query hooks / client fetch
    server/
      controllers/
        quiz.controller.ts  # request orchestration, input validation
      services/
        quiz.service.ts     # business rules for server actions
      repositories/
        quiz.repo.ts        # data access (DB/external)
      dto/
        quiz.dto.ts         # zod schemas / DTO types
    routes/
      route.ts              # re-exported handler used by app/api/.../route.ts
```

#### Next.js API Routes (App Router)

- Route files in `app/api/**/route.ts` should be **thin adapters**:

    - call `entities/*/api/routes/*` (or directly controllers)
    - no domain logic in `app/api`

### shared/

- Reusable UI, hooks, utilities, base API, common types
- Framework-agnostic when possible
- **No business logic**

---

## Naming Conventions

- Folders: **kebab-case**
- Components: **PascalCase** files (e.g., `QuizCard.tsx`)
- Hooks: **use-\*** (e.g., `use-quiz-timer.ts`)
- Types: `*.types.ts`, `*.interface.ts`
- API: `*.api.ts`

---

## Public API Exports

- Each slice exports via **`index.ts` only**
- Import using aliases (e.g., `@/entities/quiz`), not deep paths

---

## Import Order

1. External libraries
2. Shared
3. Entities
4. Features
5. Widgets
6. Views/App (rare)

---

## State & Data

- **RTK Query** for server state (API slices live under `entities/*/api`)
- Local UI state stays close to usage
- Complex logic → custom hooks (usually in features)

---

## Errors & Validation

- API layer defines consistent error types
- Use error boundaries where appropriate
- **Zod** for form validation with clear user messages

---

## Performance

- Code-split by **routes/features**
- Memoize only when needed (`memo`, `useMemo`, `useCallback`)
- Keep imports tree-shakeable

---

## Accessibility

- Semantic HTML first
- Keyboard navigation + focus management for modals/forms
- ARIA only when necessary

---

## Development Flow

1. Create/extend an **entity** (types/api/ui) if needed
2. Implement the **feature** (ui + hooks)
3. Compose into a **widget** if it combines multiple pieces
4. Wire into a **view**
5. Add tests + update exports/docs

---

## Review Checklist

- [ ] Correct layer placement + boundaries
- [ ] Naming + `index.ts` exports
- [ ] Error handling + validation
- [ ] Accessibility basics covered
- [ ] No unnecessary re-renders / heavy components
- [ ] Tests added/updated where meaningful

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
Use 'bd' for task tracking
