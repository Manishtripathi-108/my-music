<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` - verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

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
6. **The server enforces validation and authorization.** UI checks are presentation only.
7. **Reuse before creating.** Search for an existing module first. No empty folders, no speculative abstractions, no new pattern for a single task.
8. **Verify, don't assume.** Check Next.js APIs against `node_modules/next/dist/docs/`, and check the DBMS, ORM, and library versions against the project's `package.json`, lockfile, and existing code before relying on them.
9. **API and Bruno synchronization.** Whenever you change, add, or remove route files (`src/app/api/...`), always update the corresponding Bruno request files in `bruno/` to match the exact HTTP methods, URLs, request schemas, response structures, and assertions.

## Scope and boundaries

- **Stay inside this project.** Do not read, modify, create, delete, or rename files outside the project root (other repos, home directory, system configuration, unrelated projects) without asking first. Exception: read-only lookup of installed dependency docs (e.g. `node_modules/next/dist/docs/`), even when hoisted above the app directory.
- **Keep changes local.** No unrelated refactors, moves, renames, or reformatting during a task. No new dependencies, integrations, or top-level folders without approval.
- **Never test against real user data.** Do not run scans, tag writes, conversions, or migrations against the user's real media library or any database other than the project's dev/test database. Use copies or fixtures inside the project unless the user explicitly authorizes otherwise.

## Folder structure

```
project-root/
├── public/                       # static assets only
├── e2e/                          # end-to-end tests for real user flows
├── cache/                        # runtime caches (e.g. cache/art/); gitignored
├── src/
│   ├── app/                      # ROUTING + COMPOSITION
│   │   ├── (group)/              # route groups: only when they own a layout or section
│   │   ├── api/                  # thin route handlers
│   │   ├── layout.tsx, error.tsx, global-error.tsx, not-found.tsx
│   │   └── globals.css
│   │
│   ├── features/<feature>/       # BUSINESS DOMAINS: one folder per domain
│   │   ├── components/           # UI owned by this feature
│   │   ├── actions/              # "use server" entry points (writes)
│   │   ├── queries/              # server-only reads
│   │   ├── services/             # server-only business operations
│   │   ├── repositories/         # server-only DB access for this feature's data
│   │   ├── schemas/              # validation schemas (isomorphic)
│   │   ├── hooks/                # client hooks used only by this feature
│   │   ├── types.ts, constants.ts
│   │   ├── index.ts              # client-safe public API
│   │   └── server.ts             # server-only public API
│   │
│   ├── components/               # SHARED UI with no business knowledge
│   │   ├── ui/                   # primitives
│   │   ├── common/               # app-wide compounds (page header, empty state, confirm dialog)
│   │   ├── layout/               # header, footer, sidebar, mobile nav
│   │   └── providers/            # generic providers (theme, query)
│   │
│   ├── hooks/                    # shared client hooks
│   ├── lib/                      # generic isomorphic utilities
│   ├── server/                   # SHARED SERVER INFRASTRUCTURE (server-only)
│   │   ├── api/                  # response helpers, handleRouteError
│   │   ├── db/                   # client, schema
│   │   ├── auth/                 # auth setup, session helpers
│   │   └── services/             # email, storage, queue: used by 2+ features
│   │
│   ├── config/                   # env.server.ts, env.client.ts, site.ts, routes.ts
│   └── types/                    # cross-cutting, domain-independent types (incl. api.ts)
│
└── ...                           # package.json, tsconfig.json, next.config.ts, .env.local, etc.
```

- Every folder is optional. Create a folder only when it will hold files.
- Allowed at the root without approval: tool-mandated folders (`prisma/`, `drizzle/`, `.github/`, `scripts/`) and `cache/`. Any other new top-level folder needs approval.
- `src/app/page.tsx` and `src/app/(group)/page.tsx` both resolve to `/` and collide. Keep only one.

## Where does it go

| Code | Location |
| --- | --- |
| Route, layout, loading, error, metadata | `src/app/...` |
| Route handler | `src/app/api/.../route.ts` |
| UI used by one route only | `src/app/<route>/_components/` (move to the owning feature when a second route needs it) |
| UI, logic, queries, schemas, types of one business domain | `src/features/<feature>/` |
| Generic primitive (Button, Table) | `src/components/ui` |
| App-wide component with no domain (PageHeader) | `src/components/common` |
| Header, footer, sidebar | `src/components/layout` |
| Generic provider (theme, query) | `src/components/providers` |
| Provider that depends on a feature (session) | that feature's `components/` |
| Client hook shared across features / used by one feature | `src/hooks` / `src/features/<feature>/hooks` |
| Generic utility (cn, formatDate, logger) | `src/lib` |
| DB client and schema, email, storage, queue, auth setup | `src/server` |
| Typed env, site config, route constants | `src/config` |
| Cross-cutting type (Pagination, ApiResponse) | `src/types` |
| Static file | `public/` |

Layer boundaries:

- **`components/ui`** knows no business domain (`Table` yes, `UserTable` no). **`common`, `layout`, `providers`** are app-wide only; if one feature uses it, it belongs in that feature.
- **`lib`** is small and generic. If a utility knows about orders, users, or billing, it belongs in that feature.
- **`server`** holds infrastructure shared by 2+ features. No feature business rules; never imported by Client Components.
- **`types`** holds only genuinely cross-cutting types. Do not use it to avoid deciding which feature owns a type.

## Dependency rules

| Layer | May import | Must not import |
| --- | --- | --- |
| `app` | features (public API), components, hooks, lib, server, config, types | - |
| `features` | own internals; other features via public API only; components, hooks, lib, server, config, types | `app` |
| `components` | hooks, lib, config (client-safe), types | `app`, `features`, `server` |
| `hooks` | lib, config (client-safe), types | `app`, `features`, `components`, `server` |
| `server` | lib, config, types | `app`, `features`, `components`, `hooks` |
| `lib` | config (client-safe), types | everything else |
| `config` | types | everything else |
| `types` | nothing | all application layers |

- Feature-to-feature imports go through the other feature's `index.ts` (client-safe) or `server.ts` (server-only). No deep imports into its internals.
- No circular dependencies. When two features need the same capability, extract a proper shared module.
- Use the `@/` path alias. No long relative paths like `../../../`.
- If the repo has import-boundary lint rules, treat violations as errors.

## Feature anatomy and data flow

```
Read:   Server Component -> feature queries/ -> repositories/ -> server/db
Write:  Form / Client Component -> actions/ -> services/ -> repositories/ -> server/db
```

| Folder | Responsibility | Rules |
| --- | --- | --- |
| `actions/` | Server Action entry points | Thin: authenticate → validate → authorize → call service → revalidate/redirect → return. Expected failures return a typed result (see [Error handling](#error-handling)). |
| `queries/` | Named, reusable reads | Server-only. Never called from Client Components. Filter data by what the caller may see. |
| `services/` | Business operations | Server-only. Business work only, never UI behavior. Own transaction boundaries. Add one only when logic spans steps or entities; a simple query may call a repository directly. |
| `repositories/` | The only place in a feature that touches the ORM or SQL | Server-only. No business rules. Accept an optional transaction handle. |
| `schemas/` | Validation, single source of truth | Infer TypeScript types from schemas. Never duplicate rules in components. |
| `components/` | Feature UI | Server Components by default. No data access inside; receive data via props. |

Public API of a feature:

- `index.ts`: client-safe exports only (components, types, schemas, constants).
- `server.ts`: starts with `import "server-only"`; exports queries and services other modules may call.
- `actions/*`: may be imported by Client Components directly.
- Create `index.ts` / `server.ts` when another module first needs the feature. No other barrel files (`components/ui/index.ts` is the only exception).

## Server / client boundary

- Keep `"use client"` at the leaf. Pass server-rendered content down as `children` or props. Props crossing the boundary must be serializable.
- `import "server-only"` is required in `src/server/**`, `features/*/{queries,services,repositories}/**`, every `server.ts`, and `config/env.server.ts`. Pure type-only files are exempt (types emit no runtime code).
- Environment: `config/env.server.ts` (server-only, validated) and `config/env.client.ts` (`NEXT_PUBLIC_*` only). Read `process.env` only in `src/config`, including `NODE_ENV` and the engine switches; expose typed values (e.g. `isProduction`) from there.
- Client writes go through Server Actions. Use Route Handlers only when a real HTTP endpoint is needed: streaming or binary delivery, long-running jobs the client polls, webhooks, external clients, or an existing REST endpoint. Never call your own API routes from server code.
- Prefer server state and URL state (search params). Use client state libraries only for genuinely shared client state. Do not mirror server data into client stores.

## Security and validation

- Validate all untrusted input at the server boundary (actions, route handlers, webhooks) with the owning feature's schema. Client validation is UX only.
- Server Actions and Route Handlers are public endpoints. Each authenticates and authorizes on its own; never assume the page already did.
- Domain permission rules live in the owning feature, not in buttons or pages.
- Return only the fields the client needs. Never pass secrets, internal IDs, or full DB rows to Client Components.
- **Client-supplied file paths:** resolve to an absolute path, canonicalize (`realpath`), and verify it sits inside an allowed root defined in `src/config` before any filesystem or subprocess use. If no allowed-root policy exists, ask before adding a path-accepting endpoint.
- **Subprocesses:** use `spawn`/`execFile` with an argument array, never a shell string, and pass only validated absolute paths.

## Error handling

- **Throw, don't return, inside server code.** Services, repositories, engine clients (`TagLibClient`, `AudioProber`, `MediaInfoClient`, `MediaConverter`, `MetaReader`), and utilities signal failure by throwing `Error` instances: typed domain errors such as `NotFoundError`, `BadRequestError`, `ConflictError`. Never propagate failures as strings or `{ success: false, error: "message" }` between layers.
- **Route Handlers:** one `try/catch` whose `catch` only calls `handleRouteError(error, fallbackMessage)`. Never branch on `result.success`. The central handler maps domain errors, Zod errors, syntax errors, and unknown errors to an `ApiResponse<T>` with the right status. Map by error class or code, never by message text.
- **Server Actions** are the UI boundary: catch expected domain errors and return a typed result whose failure branch carries a stable error code and field errors, not a message string. Let unexpected errors propagate to `error.tsx`.
- Use `try/catch` elsewhere only to add context, recover, convert an error, or return a safe result.
- Errors in the UI: `error.tsx` per segment, `global-error.tsx` for the root fallback, `not-found.tsx` for missing content.

## Routes and API handlers

- Route groups only when they own a layout or a clear section, not to tidy the tree.
- Route Handlers do HTTP only: method handling, parse input, authenticate/authorize, call feature logic, return response.
- **Bruno Collection Sync (MANDATORY)**: Whenever route files are created, modified, or deleted (`src/app/api/...`), you MUST immediately update, add, or delete the corresponding Bruno request files in `bruno/` to keep the API collection in exact parity with schemas, HTTP methods, route URLs, request payloads, response structures, and status assertions.

### Response envelope

Every Route Handler returns a typed `ApiResponse<T>` built with the helpers in `@/server/api`. Never return ad-hoc JSON, or HTTP 200 for a failed operation. The source of truth is `src/types/api.ts`: success is `{ success: true, data, message?, meta? }`, failure is `{ success: false, error: { code, message, details? } }`. Frontend logic inspects `error.code`, never the message.

| Status | Scenario | Helper |
| --- | --- | --- |
| 200 | Successful read, update, or action | `apiSuccess` |
| 201 | Resource created | `apiCreated` |
| 202 | Async job queued | `apiAccepted` |
| 204 | Successful deletion or empty action | `apiNoContent` |
| 400 | Malformed JSON or invalid syntax | `apiBadRequest` |
| 401 | Missing or invalid authentication | `apiUnauthorized` |
| 403 | Authenticated but not permitted | `apiForbidden` |
| 404 | Resource does not exist | `apiNotFound` |
| 409 | State conflict or duplicate | `apiConflict` |
| 422 | Input validation failure (Zod) | `apiValidationError` (via `handleRouteError`), `details: ApiFieldError[]` |
| 429 | Rate limit exceeded | `apiRateLimited` |
| 500 | Unhandled exception | `apiInternalError` (via `handleRouteError`) |

In production, `apiInternalError` logs the full error server-side and returns only a generic message. Stack traces, file paths, queries, and environment details never reach a response body.

### Methods and URLs

- Choose the method by the operation: `GET` read (safe, idempotent, cacheable); `POST` create, non-CRUD actions, or large batch payloads; `PUT` full replacement; `PATCH` partial update; `DELETE` removal. Never use `GET` or `POST` to delete.
- Prefer resource URLs (`PATCH /api/media/tags`) over action URLs (`/api/media/tags/update`). Use action URLs only for genuine actions (`POST /api/scan`).
- Use only the canonical method per operation. No delegating alias handlers (e.g. a `POST` fallback for a `PATCH`).

### Binary and streaming delivery

- Stream via a web `ReadableStream` (`Readable.toWeb(nodeStream)`) with `Content-Type` and `Content-Length`. Never buffer whole files in memory.
- Use `Cache-Control: public, max-age=31536000, immutable` only when the URL contains the content or cache key, so a changed file gets a new URL. Otherwise use `ETag` and revalidation.

### Handler template

```ts
import type { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';
import { apiAccepted, handleRouteError } from '@/server/api';
import { myRequestSchema, type MyResult } from '@/features/my-feature';
import { startMyTask } from '@/features/my-feature/server';

/**
 * POST /api/my-task
 * Body: MyRequest. Queues a task for asynchronous processing (202).
 */
export async function POST(request: Request): Promise<NextResponse<ApiResponse<MyResult>>> {
  try {
    // Authenticate and authorize here, before touching the payload.
    const payload = myRequestSchema.parse(await request.json());
    const result = await startMyTask(payload);
    return apiAccepted(result, { message: 'Task queued successfully' });
  } catch (error) {
    return handleRouteError(error, 'Failed to process task');
  }
}
```

Every handler has a JSDoc comment above each exported method (route, method, params, behavior), parses input with `schema.parse(...)`, and delegates all error formatting to `handleRouteError`.

## Database and data architecture

Before creating or changing a schema, inspect the project's actual DBMS, ORM, migration tool, and existing schema, and design for that stack. Do not assume one, and do not replace an existing design when a targeted change is enough.

- **Where and how:** schema lives in `src/server/db`, feature data access in `repositories/`. Schema changes go through the project's migration tool. Migrations are reviewed and never edited after being applied. Destructive changes (drop, rename, narrowing a type) need approval.
- **Keys:** every entity gets a stable surrogate primary key from the DBMS's native identity mechanism (PostgreSQL `GENERATED ... AS IDENTITY`, MySQL `AUTO_INCREMENT`, SQL Server `IDENTITY`, SQLite `INTEGER PRIMARY KEY`). Mutable business fields (file path, title, email) get a `UNIQUE` constraint, not the primary key.
- **Integrity:** declare foreign keys explicitly with a deliberate `ON DELETE` behavior. Enforce invariants in the database (`NOT NULL`, `UNIQUE`, `CHECK`), not only in application code.
- **Normalization:** normalize by default. Denormalize only for a measured read-path need, and say why in the change.
- **Types:** use the smallest precise type; exact types for money (decimal or integer minor units); timezone-aware timestamps where the DBMS supports them.
- **Indexes:** add one only for a real access pattern (join/filter columns, frequent `WHERE`/`ORDER BY`, unique lookups) with column order matching the query. Check whether the DBMS auto-indexes foreign keys (PostgreSQL does not). Confirm with the query plan (`EXPLAIN`) on realistic data volume. No speculative indexes; each one adds write cost.
- **Transactions:** services own them. Multi-statement writes that must succeed together run in one transaction. Keep network calls, subprocesses, and file I/O out of open transactions.
- **Queries:** no N+1 patterns, select only needed columns, paginate unbounded lists.
- **Compatibility:** confirm any DBMS-specific feature is supported by the project's ORM and migration tool before using it.

## Media processing

The media subsystem is three decoupled engines. Native binaries are the default; WebAssembly (WASM) is a fallback or a user-selected option.

| Role | Default (native) | Fallback (WASM) | Selector |
| --- | --- | --- | --- |
| Metadata | TagLib 2.x native sidecar | `taglib-wasm` | `METADATA_ENGINE=native\|wasm` |
| Probing | `ffprobe` (primary) + MediaInfo (QC supplement) | `mediainfo.js` | `PROBING_ENGINE=native\|wasm` |
| Conversion and DSP | FFmpeg 9.0.x or 8.1.x, LGPL build | `@ffmpeg/ffmpeg` | `CONVERSION_ENGINE=native\|wasm` |

- Each engine sits behind one interface. Features depend on the interface, never on a specific engine. Selectors are validated in `config/env.server.ts` and default to `native`.
- Native tools run as isolated subprocesses with bounded concurrency.
- Never use FFmpeg for metadata-only edits; tag operations always go through the Metadata Engine.

### Metadata (TagLib 2.x)

- **Native (default):** wrap TagLib's C API (`tag_c.h`) or C++17 API in a self-contained sidecar (Node-API / `node-addon-api` or a dedicated worker).
- **`taglib-wasm`:** check its Node.js version requirement against the project's Node version, since it has changed between releases. Before using it in production, run a bake-off against the project's audio corpus covering: seek-based I/O throughput and memory, tag preservation across ID3v2.3, ID3v2.4, Vorbis Comments, MP4 atoms, RIFF INFO and APEv2, and multi-artwork handling (`APIC`, `METADATA_BLOCK_PICTURE`, `covr`).
- **Never re-encode audio.** Tag writes preserve audio data bit-for-bit.
- **Crash-safe writes:** when an update fits existing padding, write in place. Otherwise write to a temporary sibling file in the same directory (`.<name>.tmp_<uuid>`), restore `atime`/`mtime` with `fs.promises.utimes()`, `fsync`, then atomically rename it over the target. With `preserveOriginal: true`, first hard-link (or copy, if linking is unsupported) the original to `<name>.<ext>_original`, so the target path never goes missing.

### Probing (ffprobe + MediaInfo)

- `ffprobe` is the primary prober: codec, container, duration, bitrate, sample rate, channels, channel layout, attached-picture dispositions. Concurrency is bounded (default `MAX_CONCURRENCY = 8`).
- MediaInfo supplements it where `ffprobe` is weak: bitrate mode (CBR/VBR), bit depth, and encoder library/settings and gapless-related header details. Confirm field names against real MediaInfo output on corpus files.
- `mediainfo.js` (WASM) replaces native probing when binaries cannot run (restricted sandbox) or the user selects it.
- Loudness (EBU R128 / ITU-R BS.1770) is not a probing field: measure it on demand with FFmpeg's `ebur128` filter, never during bulk scans.

### Conversion (FFmpeg, LGPL)

- Verify the native binary is an LGPL build: the `configuration:` line of `ffmpeg -version` must contain neither `--enable-gpl` nor `--enable-nonfree`.
- Encoders: AAC via native `aac` (or `aac_mf` on Windows; never `libfdk_aac` unless the user configures an in-house, non-redistributed binary); Opus via `libopus`; MP3 via `libmp3lame`; FLAC and ALAC via native encoders; PCM via `pcm_s16le`, `pcm_s24le`, `pcm_s32le`, `pcm_f32le`.
- Resample with SoX: `-af "aresample=resampler=soxr:precision=28:cutoff=0.99"`.
- When reducing bit depth, dither: `-af "aresample=dither_method=triangular"` (or `lipshitz`).
- Downmix multichannel to stereo with standard ITU-R BS.775 coefficients.
- Report progress by parsing `-progress pipe:1`. Cancel gracefully: write `q` to `stdin`, then `SIGTERM`, then `SIGKILL` after 2 seconds.
- Transcode to a temporary sibling file in the destination directory, then rename on success.
- `@ffmpeg/ffmpeg` (WASM) runs in memory (MEMFS). Use it for small files (under about 200 MB) or where spawning subprocesses is restricted; prefer native for large files and batches.

### Artwork

- Extraction and embedding go through the Metadata Engine (TagLib 2.x, ID3v2 `APIC` types `$03` front and `$04` back, FLAC `METADATA_BLOCK_PICTURE`, MP4 `covr`), with zero container remuxing.
- Validate buffers by magic bytes. Dimensions and MIME types are parsed via zero-dependency pure buffer inspection (JPEG SOF0/SOF2 and PNG IHDR headers). Do not introduce Sharp or external image processing libraries.
- Cache at `cache/art/<key>.<ext>` with `key = sha256(filePath + ":" + size + ":" + mtimeMs).slice(0, 24)`.
- **Invalidate a file's cache entry on every tag write.** Padded in-place writes keep `size`, and restored timestamps keep `mtime`, so the key alone will not change.

## Naming and code clarity

### Files

- **Components:** a single-file component is `PascalCase.tsx` (`Button.tsx`, `ScanModal.tsx`). A multi-file component is a kebab-case folder with kebab-case parts (`checkbox/checkbox-root.tsx`). A component uses one style, never both.
- **Hooks:** `camelCase` with a `use` prefix (`useTheme.ts`).
- **Extensions:** `.tsx` only when the file contains JSX; otherwise `.ts`.
- **Other modules:** `kebab-case`. Services, schemas, and repositories carry a role suffix (`media.service.ts`, `scan-request.schema.ts`). Actions and queries are verb-noun without a suffix (`create-order.ts`, `list-orders.ts`). Utilities and clients are plain kebab-case (`format.ts`, `taglib-client.ts`).
- **Next.js special files** keep their mandated lowercase names (`page.tsx`, `layout.tsx`, `route.ts`, ...).
- **Tests:** beside the source, named after it (`media.service.test.ts`). Full flows go in `e2e/*.spec.ts`.
- **Code:** types `PascalCase`; functions and variables `camelCase`; true constants `UPPER_SNAKE_CASE`.

### Identifiers

- Use the shortest name that makes the role clear. Describe what something is or does, not how it is implemented.
- Prefer specific names (`requestId`, `toolProcess`, `outputBuffer`, `filePath`, `tagMap`) over vague ones (`tmp`, `val`, `obj`, `ctx`, `info`). Names fixed by a contract, such as `data` in `ApiResponse`, are exempt.
- Nouns for values and state; verbs for functions (`runNext`, `parseOutput`). Booleans read as conditions (`isClosing`, `hasError`, `shouldRetry`).
- Abbreviate only universal terms (`URL`, `API`, `ID`, `HTTP`, `JSON`, `UTF8`). Use one vocabulary for each concept across the project.
- Rename vague identifiers only in code you are already changing.

### Comments and section dividers

- **JSDoc** (`/** ... */`) goes on exported functions, classes, types, and route handlers. It documents the contract: params, behavior, errors. Do not restate the signature. Internal helpers get one only when non-obvious.
- **Other comments** explain non-obvious intent, constraints, or protocol behavior. Do not comment obvious code, compensate for poor naming with comments, or annotate line by line.
- **Section dividers** separate major sections of a long file. They are single-line, at column 0, and exactly 80 characters, with the title centered between dashes (an odd remainder puts the extra dash on the right):

  ```ts
  /* --------------------------------- Types ---------------------------------- */
  ```

  Never use multi-line banners or boxes. Generate and check dividers with these commands instead of counting characters:

  ```sh
  node -e 'const t=process.argv[1],d=72-t.length,l=d>>1;console.log(`/* ${"-".repeat(l)} ${t} ${"-".repeat(d-l)} */`)' "Title"
  grep -rhE '^/\* -{2,} .+ -{2,} \*/$' src | awk 'length != 80'
  ```

  The second command prints any divider that is not 80 characters.
- When the user sets or changes a naming, formatting, or comment convention, record it in this file in the same change. Keep one source of truth.

## Scaling triggers

Promote code on the second real use, not in anticipation.

| Signal | Action |
| --- | --- |
| Another module needs a feature's code | Expose it through `index.ts` / `server.ts`. No deep imports. |
| Two features need the same business capability | Extract a new feature (domain logic) or `server/services` (infrastructure). Never cross-import internals. |
| UI used by 2+ features with no domain knowledge | Move to `components/common` or `components/ui`. |
| A feature has independent sub-domains | Split into sibling features. Do not nest features. |
| A folder is hard to scan (roughly 15+ files) | Group into subfolders by sub-area. |
| A flow spans several features | Compose it in the route (`app/`) or create a dedicated feature. |
| A second deployable app or code shared with another app appears | Move to a monorepo (`apps/`, `packages/`) at that point, not before. |

## Anti-patterns

- Catch-all folders: `utils/`, `helpers/`, `shared/`, `misc/`, or a root-level `src/services/`.
- `components/<domain>/` (e.g. `components/orders/`). Use `features/` instead.
- One giant `types/index.ts` or one giant services file.
- Database calls in components, hooks, `page.tsx`, or `layout.tsx`.
- Business rules hidden in `lib/`.
- `components/ui` importing from a feature, or any layer importing from `app/`.
- Client Components importing from `src/server` or from `queries/`, `services/`, `repositories/`.
- `"use client"` on a page or layout to make an error go away.
- Barrel files outside the sanctioned ones.
- Duplicating validation or authorization rules across components.

## Refactoring

- Preserve the existing architecture. Move code only when its current placement is clearly wrong.
- When moving files, update imports and tests, check all consumers of changed public paths, and delete dead files.
- If existing project conventions conflict with this file, ask before choosing.

## When to ask

Ask the user before proceeding when:

- Two layers could reasonably own the code.
- A new top-level folder or a new shared abstraction affecting several features seems necessary.
- The request conflicts with this file or with existing project conventions.
- The task requires choosing between two materially different patterns.
- A change would touch files outside the project, or run against real user data or a non-dev database.

Do not ask about placements this file already answers.

## Definition of done

- [ ] Route files only route and compose.
- [ ] Code sits in the layer that owns it; shared code is truly shared.
- [ ] Server-only code is guarded with `server-only` and isolated from Client Components.
- [ ] DB access stays in repositories and `src/server/db`; schema changes go through migrations.
- [ ] Input is validated and authorized on the server; errors are thrown and translated per [Error handling](#error-handling).
- [ ] Imports follow the dependency table; no cycles or deep cross-feature imports.
- [ ] The diff contains no unrelated changes, new dependencies, or duplicated logic.
- [ ] Tests are added or updated for changed behavior.
- [ ] Bruno API collection files (`bruno/`) are updated to match any modified or added route handlers.
- [ ] The project's lint, typecheck, and test scripts (see `package.json`) pass.