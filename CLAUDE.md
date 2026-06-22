# CLAUDE.md

Vehicle-transport load board SPA (broker / carrier / dealer / admin roles). Backend is a separate Spring Boot service consumed via RTK Query.

## Stack

| Layer       | Tool                                                      |
|-------------|-----------------------------------------------------------|
| UI          | React 18.3.1, react-router 7.13.0                         |
| Build       | Vite ^6.4.2, `@vitejs/plugin-react` 4.7.0                 |
| Language    | TypeScript via `@types/react` ^19; **no `tsconfig.json`, `typescript` package not installed** — build does not type-check (TODO: confirm intentional) |
| State       | Redux Toolkit ^2.11.2 + RTK Query, react-redux ^9.2.0     |
| Styling     | Tailwind 4.1.12 (`@tailwindcss/vite`)                     |
| Primitives  | Radix UI + shadcn-style wrappers, lucide-react            |

Node 20 (per Dockerfile).

## Commands

| Task       | Command         |
|------------|-----------------|
| Dev server | `npm run dev`   |
| Prod build | `npm run build` (outputs `dist/`) |
| Typecheck  | **none** — see Stack note |
| Lint       | **none** — no ESLint configured |
| Test       | **none** |

Env: copy `.env.example` → `.env`; `VITE_API_BASE_URL` and `VITE_CAPTCHA_WEB_KEY` are read. Both are baked into the bundle at build time.

## Where things live

```
src/
  main.tsx                       entry — mounts <App/> with ErrorBoundary, imports src/styles/index.css
  app/
    App.tsx, routes.tsx          single createBrowserRouter, every page lazy-loaded
    store/
      index.ts, hooks.ts         configureStore + typed useAppSelector / useAppDispatch
      slices/                    authSlice.ts, themeSlice.ts          ← client state
      services/
        hauliusApi.ts            barrel re-export
        api/
          baseApi.ts             createApi with 401 interceptor + tagTypes
          types.ts               all DTO / payload types
          {auth,loads,bids,admin,profile,documents,ratings,ai,notifications}.api.ts
                                 each calls hauliusApi.injectEndpoints — single api instance
    pages/                       49 flat PascalCase route entries
    components/
      ui/                        shadcn / Radix primitives (kebab-case, vendored)
      broker/ admin/ signup/ load-form/   feature- and flow-scoped composites
      figma/                     vendored Figma export (ImageWithFallback)
      <root .tsx files>          shared infra (Navbar, Footer, ErrorBoundary, ProtectedRoute, MapBackground, AIAssistant, RateModal, ...)
    hooks/                       useInactivityLogout, useLogout
    utils/                       authStorage, phone, themeClasses, validation
    constants/  types/  styles/  US_STATES etc; UserProfile/LoadStatus; colors.ts + signup.styles.tsx
src/styles/                      global CSS — entry is index.css; theme.css holds CSS-var tokens; theme.ts has non-CSS color constants for print/email/charts
public/                          static assets
```

## Ignore

`node_modules/`, `dist/`, `.git/`, `logos/`, `public/`, image files (`*.png`, `*.jpeg`), `package-lock.json`. Skim `src/app/components/figma/` only if relevant.

## Conventions (current practice — do not refactor on sight)

- **Pages & feature components**: `PascalCase.tsx` with a named export matching the filename. `routes.tsx` depends on the named export.
- **Hooks**: `useXxx.ts` (camelCase). Exception: `components/ui/use-mobile.ts` (kebab — vendored from shadcn).
- **Slices**: `xxxSlice.ts`.
- **API modules**: `xxx.api.ts` inside `store/services/api/`.
- **`components/ui/`**: vendored shadcn primitives, kebab-case. **Treat as regenerable — don't hand-edit unless necessary**, and prefer wrappers in feature folders.
- **Custom primitives in `ui/`**: `CityAutocomplete.tsx`, `PhoneInput.tsx`, `date-picker.tsx` exist alongside shadcn files.
- **Colors**: use Tailwind semantic classes freely (`text-amber-500`, `bg-destructive`, etc.). `src/app/styles/colors.ts` holds the brand-accent tokens only. The old "no raw color classes anywhere" header in that file is dropped — ignore it.
- **Theme tokens**: prefer CSS-var tokens from `src/styles/theme.css` (`bg-input-background`, `text-muted-foreground`, `border-border`) so dark/light mode works automatically.
- **State**: server state via RTK Query (single `hauliusApi`); UI/auth/theme via slices. No Context for app state. Token lives in-memory in `authSlice` + httpOnly cookie; only non-sensitive profile is persisted to `localStorage` as `currentUser`.
- **API calls in components**: import generated hooks from `'../store/services/hauliusApi'` (the barrel). 401s auto-trigger `sessionExpire` via the base query — don't reimplement.
- **Imports**: existing code is all relative. **For new imports prefer the `@/` alias** (configured in `vite.config.ts` → `src/`) over deep `../../../` paths.

## Gotchas

- **No type-check on build.** Vite uses esbuild; broken types compile silently. IDE warning may be the only signal.
- **`scrollbar-gutter: stable` on `<html>`** (in `src/styles/index.css`) must stay — Radix Select/Dialog scroll-locking otherwise shifts the fixed `Navbar` horizontally on Windows.
- **`hauliusApi.ts` is the single source of backend truth.** Don't create a second `createApi` — duplicate caches and tag namespaces silently desync. Add new endpoints by injecting into the existing instance from one of the `api/*.api.ts` files.
- _add solved-bug notes here as they come up_

## Agent notes (token discipline)

- Trust the map above before grepping. Jump directly to `pages/<Name>.tsx`, `components/<role>/`, or `store/services/api/<domain>.api.ts`.
- For large pages (LoadBoard, CarrierLoadsPage, LoadDetail, CompanyProfile are 20–60 KB) read by **range** (`grep` for the symbol, then `Read` with `offset/limit`). Don't load whole files.
- Reference files by path + line (`src/app/pages/LoadBoard.tsx:1143`) rather than pasting bodies. Prefer `Edit` over `Write`; keep diffs minimal.
- `npm run build` is the only verification command available.
- **Do NOT, without asking first**: reorganize folders, move files between directories, rename files, adopt the (currently unused) `ROUTES` constant in `src/app/constants/routes.ts`, or restructure `components/` root vs. role subfolders. These are deliberately deferred — ask before any structural change. See `STRUCTURE_AUDIT.md` for the open decisions.
