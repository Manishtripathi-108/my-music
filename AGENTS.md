<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Architecture Guide

Next.js App Router · TypeScript · `src/` layout.

This file defines where code lives. Follow it unless the user explicitly asks for something different. If a task does not fit, stop and ask (see [When to ask](#when-to-ask)).

## Core rules

1. **Ownership decides placement.** Ask "who owns this code?" and put it in that layer (see [Where does it go](#where-does-it-go)).
2. **`src/app` is routing and composition only.** No business logic, database calls, validation rules, or large forms in `page.tsx`, `layout.tsx`, `loading.tsx`, or `error.tsx`.
3. **Business code lives in `src/features/<feature>`.** Never in `components/`, `hooks/`, `lib/`, or `types/`.
4. **Shared technical infrastructure lives in `src/server` (server-only) or `src/lib` (isomorphic).** Never inside a feature.
5. **Server Components by default.** Add `"use client"` only for state, effects, browser APIs, or event handlers, and only on the smallest leaf component.
6. **Server-only code never reaches the client bundle.** Every server-only module starts with `import "server-only"`.
7. **The server enforces validation and authorization.** UI checks are presentation only.
8. **Reuse before creating.** Search for an existing module first. No empty folders, no speculative abstractions, no new pattern for a single task.
9. **No unrelated moves or renames** during a feature task.
10. **Verify Next.js APIs against `node_modules/next/dist/docs/`**, not memory (routing files, request APIs, caching, and config may have changed).

## Folder structure

```
project-root/
├── public/                       # static assets only: images/, icons/, fonts/
├── e2e/                          # end-to-end tests for real user flows
├── src/
│   ├── app/                      # ROUTING + COMPOSITION
│   │   ├── (marketing)/          # route groups: only when they own a layout or section
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/                  # thin route handlers
│   │   ├── layout.tsx
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── not-found.tsx
│   │   ├── globals.css
│   │   └── favicon.ico
│   │
│   ├── features/                 # BUSINESS DOMAINS: one folder per domain
│   │   └── <feature>/
│   │       ├── components/       # UI owned by this feature
│   │       ├── actions/          # "use server" entry points (writes)
│   │       ├── queries/          # server-only reads
│   │       ├── services/         # server-only business operations
│   │       ├── repositories/     # server-only DB access for this feature's data
│   │       ├── schemas/          # validation schemas (isomorphic)
│   │       ├── hooks/            # client hooks used only by this feature
│   │       ├── types.ts
│   │       ├── constants.ts
│   │       ├── index.ts          # client-safe public API
│   │       └── server.ts         # server-only public API
│   │
│   ├── components/               # SHARED UI with no business knowledge
│   │   ├── ui/                   # primitives: button, input, dialog, table
│   │   ├── common/               # app-wide compounds: page-header, empty-state, confirm-dialog
│   │   ├── layout/               # header, footer, sidebar, mobile-nav
│   │   └── providers/            # generic providers: theme, query
│   │
│   ├── hooks/                    # shared client hooks: use-debounce, use-media-query
│   ├── lib/                      # generic isomorphic utilities: cn, format-date, logger
│   │
│   ├── server/                   # SHARED SERVER INFRASTRUCTURE (server-only)
│   │   ├── db/                   # client, schema
│   │   ├── auth/                 # auth library setup, session helpers
│   │   └── services/             # email, storage, queue: used by 2+ features
│   │
│   ├── config/                   # env.server.ts, env.client.ts, site.ts, routes.ts
│   └── types/                    # cross-cutting, domain-independent types
│
└── ...                           # package.json, tsconfig.json, next.config.ts, .env.local, etc.
```

- Every folder is optional. Create a folder only when it will hold files.
- Tool-mandated folders (`prisma/`, `drizzle/`, `.github/`, `scripts/`) are fine at the root. Any other new top-level folder needs user approval.
- `src/app/page.tsx` and `src/app/(group)/page.tsx` both resolve to `/` and collide. Keep only one.

## Where does it go

| Code | Location |
| --- | --- |
| Route, layout, loading, error, metadata | `src/app/...` |
| Route handler | `src/app/api/.../route.ts` |
| UI used by one route only | `src/app/<route>/_components/` |
| UI, logic, queries, schemas of one business domain | `src/features/<feature>/` |
| Generic primitive (Button, Table) | `src/components/ui` |
| App-wide component with no domain (PageHeader) | `src/components/common` |
| Header, footer, sidebar | `src/components/layout` |
| Generic provider (theme, query) | `src/components/providers` |
| Provider that depends on a feature (session) | that feature's `components/` |
| Client hook shared across features | `src/hooks` |
| Client hook used by one feature | `src/features/<feature>/hooks` |
| Generic utility (cn, formatDate, logger) | `src/lib` |
| DB client, email, storage, queue, auth setup | `src/server` |
| Typed env, site config, route constants | `src/config` |
| Cross-cutting type (Pagination) | `src/types` |
| Type for one domain | `src/features/<feature>/types.ts` |
| Static file | `public/` |

## Layer contracts

- **`app`**: Routes, groups, layouts, loading/error/not-found UI, route handlers, metadata. A page fetches via feature queries, selects feature components, and composes them.
- **`features`**: Everything that exists because a business domain exists. Add only the subfolders the feature needs. A small feature may be just `components/`, `schemas/`, `types.ts`.
- **`components/ui`**: Primitives. Must not know any business domain (`Table` yes, `UserTable` no).
- **`components/common`, `layout`, `providers`**: App-wide only. If only one feature uses it, it belongs in that feature.
- **`hooks`**: Reusable React hooks not owned by a feature.
- **`lib`**: Small, boring, generic utilities. If a utility knows about orders, users, or billing, it belongs in that feature.
- **`server`**: Technical infrastructure used by multiple features. It never contains feature business rules and is never imported by Client Components.
- **`config`**: Typed, validated environment access and app constants. Read `process.env` only here.
- **`types`**: Only types that genuinely span multiple modules. Do not use it to avoid deciding which feature owns a type.

## Dependency rules

| Layer | May import | Must not import |
| --- | --- | --- |
| `app` | features (public API), components, hooks, lib, server, config, types | none of the layers below import it |
| `features` | own internals; other features via public API only; components, hooks, lib, server, config, types | `app` |
| `components` | hooks, lib, config (client-safe), types | `app`, `features`, `server` |
| `hooks` | lib, config (client-safe), types | `app`, `features`, `components`, `server` |
| `server` | lib, config, types | `app`, `features`, `components`, `hooks` |
| `lib` | config (client-safe), types | everything else |
| `config` | types | everything else |
| `types` | nothing | all application layers |

Additional rules:

- Feature-to-feature imports go through the other feature's `index.ts` (client-safe) or `server.ts` (server-only). No deep imports into its internals.
- No circular dependencies. When two features need the same capability, extract a proper shared module.
- Use the `@/` path alias. No long relative paths like `../../../`.

## Feature anatomy and data flow

```
Read:   Server Component -> feature queries/ -> repositories/ -> server/db
Write:  Form / Client Component -> actions/ -> services/ -> repositories/ -> server/db
```

| Folder | Responsibility | Rules |
| --- | --- | --- |
| `actions/` | Server Action entry points | Thin: authenticate → validate → authorize → call service → revalidate/redirect → return. Return a typed result for expected failures instead of throwing. |
| `queries/` | Named, reusable reads | Server-only. Never called from Client Components. Filter data by what the caller may see. |
| `services/` | Business operations (`create-order`, `cancel-order`) | Server-only. Business work only, never UI behavior. Add one only when logic spans steps or entities; a simple query may call a repository directly. |
| `repositories/` | The only place in a feature that touches the ORM or SQL | Server-only. No business rules. |
| `schemas/` | Validation, single source of truth | Infer TypeScript types from schemas. Never duplicate rules in components. |
| `components/` | Feature UI | Server Components by default. No data access inside; receive data via props. |

Public API of a feature:

- `index.ts`: client-safe exports only (components, types, schemas, constants).
- `server.ts`: starts with `import "server-only"`; exports queries and services other modules may call.
- `actions/*`: may be imported by Client Components directly.
- Create `index.ts` / `server.ts` when another module first needs the feature. Do not add barrel files anywhere else (`components/ui/index.ts` is the only accepted exception).

## Server / client boundary

- Keep `"use client"` at the leaf. Pass server-rendered content down as `children` or props. Props crossing the boundary must be serializable.
- `import "server-only"` is required in: `src/server/**`, `features/*/{queries,services,repositories}/**`, every `server.ts`, `config/env.server.ts`.
- Environment: `config/env.server.ts` (server-only, validated) and `config/env.client.ts` (`NEXT_PUBLIC_*` only). Never read `process.env` anywhere else.
- Client writes go through Server Actions. Use Route Handlers only when a real HTTP endpoint is needed (webhooks, third-party or mobile clients). Never call your own API routes from server code.
- Prefer server state and URL state (search params). Use client state libraries only for genuinely shared client state. Do not mirror server data into client stores.

## Security and validation

- Validate all untrusted input at the server boundary (actions, route handlers, webhooks) with the owning feature's schema. Client validation is UX only.
- Server Actions and Route Handlers are public endpoints. Each one authenticates and authorizes on its own; never assume the page already did.
- Domain permission rules live in the owning feature, not in buttons or pages.
- Return only the fields the client needs. Never pass secrets, internal IDs, or full DB rows to Client Components.

## Routes and API handlers

- Use route groups when they own a layout or a clear section, not to make the tree look tidy.
- Route-specific UI goes in a private `_components/` folder beside the route. If a second route needs it, move it to the owning feature. `_components` is not a second global component system.
- Route Handlers do HTTP only: method handling, parse input, authenticate/authorize, call feature logic, return response.
- Errors: `error.tsx` per segment, `global-error.tsx` for the root fallback, `not-found.tsx` for missing content. Use `try/catch` only to add context, recover, convert an error, or return a safe result.

## Naming

- Folders and files: `kebab-case` (`user-card.tsx`, `create-order.ts`, `use-theme.ts`).
- Components and types: `PascalCase`. Functions and variables: `camelCase`. True constants: `UPPER_SNAKE_CASE` when it matches existing style.
- Actions and queries: verb-noun (`create-order.ts`, `list-orders.ts`).
- Next.js special files keep their required names (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`).
- Unit and component tests sit beside the source (`order-service.test.ts`). Full flows go in `e2e/*.spec.ts`.

## Scaling triggers

Promote code on the second real use, not in anticipation.

| Signal | Action |
| --- | --- |
| Another module needs a feature's code | Expose it through `index.ts` / `server.ts`. Do not deep import. |
| Two features need the same business capability | Extract a new feature (domain logic) or `server/services` (infrastructure). Never cross-import internals. |
| UI used by 2+ features with no domain knowledge | Move to `components/common` or `components/ui`. |
| A feature has independent sub-domains (billing → invoices, subscriptions) | Split into sibling features. Do not nest features. |
| A folder is hard to scan (roughly 15+ files) | Group into subfolders by sub-area. |
| A flow spans several features | Compose it in the route (`app/`) or create a dedicated feature. |
| A second deployable app or shared code with another app appears | Move to a monorepo (`apps/`, `packages/`) at that point, not before. |

## Anti-patterns

- Folders named `utils/`, `helpers/`, `common/`, `shared/`, or a root-level `services/`.
- `components/<domain>/` (for example `components/orders/`). Use `features/` instead.
- One giant `types/index.ts` or one giant services file.
- Database calls in components, hooks, `page.tsx`, or `layout.tsx`.
- Business rules hidden in `lib/`.
- `components/ui` importing from a feature, or any layer importing from `app/`.
- Client Components importing from `src/server` or from `queries/`, `services/`, `repositories/`.
- `"use client"` on a page or layout to make an error go away.
- Barrel files in every folder.
- Duplicating validation or authorization rules across components.

## Refactoring

- Preserve the existing architecture. Move code only when its current placement is clearly wrong.
- Update imports and tests when moving files, check all consumers of changed public paths, and delete dead files after the move.
- If existing project conventions conflict with this file, ask before choosing.

## When to ask

Ask the user before proceeding when:

- Two layers could reasonably own the code.
- A new top-level folder or a new shared abstraction affecting several features seems necessary.
- The request conflicts with this file or with existing project conventions.
- The task requires choosing between two materially different patterns.

Do not ask about placements this file already answers.

## Definition of done

- [ ] Route files only route and compose.
- [ ] Code sits in the layer that owns it; shared code is truly shared.
- [ ] Server-only code is guarded with `server-only` and isolated from Client Components.
- [ ] DB access stays in repositories and `src/server/db`.
- [ ] Input is validated and authorized on the server.
- [ ] Imports follow the dependency table; no cycles or deep cross-feature imports.
- [ ] No unnecessary folders, duplicate utilities, or duplicated logic.
- [ ] Tests added or updated for changed behavior.
- [ ] The project's lint, typecheck, and test scripts (see `package.json`) pass.

If the repo has import-boundary lint rules, treat violations as errors. Proposing to add them (for example `no-restricted-imports` or `eslint-plugin-boundaries`) is welcome, but do not add dependencies without approval.