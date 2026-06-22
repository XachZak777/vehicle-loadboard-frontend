# Codebase Structure Audit — Report Only

## Current State

### 1. Directory tree (2–3 levels)

```
.
├── public/                       Static assets served as-is
├── logos/                        Brand image files (root-level, not under public/ or src/)
├── src/
│   ├── main.tsx                  Entry — mounts <App/> with ErrorBoundary
│   ├── assets/                   (one folder, contents not surveyed)
│   ├── styles/                   GLOBAL CSS (theme tokens, fonts, animations) + a TS file
│   │   ├── index.css, theme.css, animations.css, fonts.css, tailwind.css, map-background.css
│   │   ├── globals.css           empty (0 B)
│   │   └── theme.ts              non-CSS color constants (print/email/chart)
│   └── app/
│       ├── App.tsx, routes.tsx, types.ts
│       ├── components/           UI + feature composites; mixed conventions (see §2)
│       │   ├── ui/               51 files — shadcn/Radix primitives, kebab-case
│       │   ├── admin/, broker/, carrier/, signup/, load-form/, figma/
│       │   └── 15 PascalCase .tsx files at root (Navbar, Footer, ErrorBoundary, DispatchSheet, RateModal, AIAssistant, etc.)
│       ├── pages/                49 flat PascalCase.tsx route entries — no subfolders
│       ├── store/                Redux Toolkit
│       │   ├── index.ts, hooks.ts
│       │   ├── slices/           authSlice.ts, themeSlice.ts
│       │   └── services/         RTK Query
│       │       ├── hauliusApi.ts (barrel after recent split)
│       │       └── api/          baseApi.ts, types.ts, {auth,loads,bids,admin,profile,documents,ratings,ai,notifications}.api.ts
│       ├── services/             3 files (apiClient.ts, emailService.ts, fmcsaService.ts) — see §7
│       ├── styles/               TS-only "styles": colors.ts (Tailwind class tokens), signup.styles.tsx
│       ├── constants/            index.ts (US_STATES, VEHICLE_TYPES, ...), routes.ts (ROUTES — see §7)
│       ├── hooks/                useInactivityLogout.ts, useLogout.ts
│       ├── utils/                authStorage.ts, phone.ts, themeClasses.ts, validation.ts
│       └── types/                user.ts (UserRole, UserProfile, LoadStatus)
└── .claude/, Dockerfile, vite.config.ts, nginx.conf, etc.
```

### 2. How code is grouped

**Mixed — primarily by type, with shallow feature subfolders inside `components/`.**

- Top level under `src/app/` is by **type**: `components/`, `pages/`, `hooks/`, `utils/`, `types/`, `constants/`, `styles/`, `services/`, `store/`.
- Inside `components/` there's a **half-finished feature grouping**: `admin/`, `broker/`, `carrier/`, `signup/`, `load-form/` exist alongside 15 root-level shared/feature-mixed files. Pages have no equivalent grouping (49 files, all flat).

### 3. Where each concern lives — confirmed

| Concern        | Location                                                                                  |
|----------------|-------------------------------------------------------------------------------------------|
| Routing        | `src/app/routes.tsx` (single `createBrowserRouter`, lazy imports, hardcoded path strings) |
| State (server) | `src/app/store/services/api/*.api.ts` (RTK Query, one `hauliusApi` instance, 88 endpoints) |
| State (client) | `src/app/store/slices/{auth,theme}Slice.ts`                                               |
| API DTOs       | `src/app/store/services/api/types.ts` (after recent split)                                |
| Global CSS     | `src/styles/*.css` — entry is `src/styles/index.css`, imported from `src/main.tsx`        |
| Theme tokens   | CSS vars in `src/styles/theme.css`; JS-only colors for non-DOM contexts in `src/styles/theme.ts` |
| Tailwind colors| `src/app/styles/colors.ts` (centralized class strings — see §7 for compliance)            |
| Styled blocks  | `src/app/styles/signup.styles.tsx` (function components: `PageWrapper`, `ContentWrapper`, `DropZone`, ...) |
| Shared UI      | `src/app/components/ui/` (shadcn primitives)                                              |
| Feature UI     | `src/app/components/{broker,admin,signup,load-form,carrier}/` + some at `components/` root |
| Cross-app types| `src/app/types/user.ts` (only one file)                                                   |
| Constants      | `src/app/constants/index.ts`                                                              |
| Hooks          | `src/app/hooks/` (2 files) + `src/app/components/ui/use-mobile.ts` (shadcn)               |

### 4. Naming conventions in use — and violations

| Kind | Convention | Violations |
|------|-----------|------------|
| Pages | `PascalCase.tsx`, named export matches filename | consistent across all 49 |
| Feature components | `PascalCase.tsx`, named export | consistent |
| shadcn UI primitives | `kebab-case.tsx` (`alert-dialog.tsx`, `date-picker.tsx`, `dropdown-menu.tsx`) | `CityAutocomplete.tsx`, `PhoneInput.tsx` (PascalCase) inside same folder |
| Hooks | `useXxx.ts` (camelCase) | `src/app/components/ui/use-mobile.ts` is kebab-case (carried over from shadcn) |
| Slices | `xxxSlice.ts` (camelCase) | consistent (2 files) |
| API modules | `xxx.api.ts` (after split) | consistent inside `api/` |
| Style files | mixed: `.css` global files, `.ts` for class-token modules, `.tsx` for `signup.styles.tsx` | the `.tsx` "styles" file is the only one of its kind |
| Constants | `SCREAMING_SNAKE_CASE` values, `camelCase` filenames | consistent |

### 5. Two real feature layouts

**Broker dashboard** (`src/app/pages/BrokerDashboard.tsx:1-25`):
```
pages/BrokerDashboard.tsx                  ← route entry
  imports:
    store/hooks                            (useAppSelector)
    store/services/hauliusApi              (4 hooks + 2 DTO types)
    components/Navbar                      (root)
    components/MapBackground               (root)
    components/ui/{button,badge,tabs}      (primitives)
    components/broker/DashboardStats       (feature folder)
    components/broker/PendingBidsTab
    components/broker/AssignedLoadsTab
    components/broker/AllLoadsTab
```
Pattern: page composes from a feature subfolder + shared root components + ui primitives + store hooks.

**Post-load flow** (`src/app/pages/PostLoad.tsx:1-22`):
```
pages/PostLoad.tsx                         ← route entry
  imports:
    store/services/hauliusApi              (mutation + lazy query + types)
    components/Navbar, MapBackground       (root)
    components/ui/{button,label,select,card,checkbox}
    utils/validation                       (form helpers)
    components/load-form/VehicleInfoSection
    components/load-form/LocationSection
    components/load-form/PricingNotesSection
    components/load-form/ContactInfoSection
```
Same pattern. `load-form/` is a **flow-scoped** folder (not role-scoped), reused by both `PostLoad` and `EditLoad`.

### 6. Import patterns

- **All relative**, no `@/` alias use anywhere (`grep "from '@/" → 0 matches`), despite the alias being configured in `vite.config.ts`.
- **No public barrels** — only `src/app/constants/index.ts` and `src/app/store/index.ts` exist. Features in `components/<role>/` are imported file-by-file (`from '../components/broker/PendingBidsTab'`).
- **No cross-feature reaching** observed: pages pull from role folders; role folders pull from `ui/` and `utils/`; no `components/broker/*` imports `components/carrier/*` or vice versa.
- **Pages → store, store → slices**: one-directional, no cycles spotted in this audit.

### 7. Inconsistencies and duplication — confirmed

**a. Two parallel "services" folders, one entirely dead**
- `src/app/services/{apiClient.ts, emailService.ts, fmcsaService.ts}` — `grep -rn "apiClient\|emailService\|fmcsaService"` returns **0 hits** in `src/`. Hand-rolled fetch client, predates RTK Query.
- `src/app/store/services/` — the live RTK Query API.

**b. Two parallel "styles" folders with different roles**
- `src/styles/` (root): global CSS + `theme.ts` (JS color constants).
- `src/app/styles/`: `colors.ts` (Tailwind class tokens), `signup.styles.tsx` (function components that wrap children in styled divs).
- `src/styles/globals.css` is 0 bytes — empty placeholder.

**c. `colors.ts` policy not enforced**
- `src/app/styles/colors.ts:1-3` declares: "Do NOT write raw color classes (e.g. text-amber-500) anywhere outside this file."
- `grep "text-amber-|text-red-|text-blue-|text-green-"` outside that file: **416 matches**, including inside `src/app/styles/signup.styles.tsx` itself.

**d. `ROUTES` constant is dead**
- `src/app/constants/routes.ts` exports `ROUTES` map. Zero importers. All 38 `path:` strings in `src/app/routes.tsx` are hardcoded.

**e. Duplicate `DispatchSheet` name with one orphan**
- `src/app/components/DispatchSheet.tsx` (18.5 K, broker-side, used by `pages/LoadDetail.tsx:25`).
- `src/app/components/carrier/DispatchSheet.tsx` (15.8 K, carrier-side, **0 importers**). `components/carrier/` contains nothing else.

**f. Orphan page `LoadDetails.tsx` (plural)**
- `src/app/pages/LoadDetails.tsx` exists (23 K) and exports `LoadDetails`. `routes.tsx` only references `LoadDetail` (singular). No importer of `LoadDetails`.

**g. Mixed file casing in `components/ui/`**
- 49 kebab-case shadcn files, 2 PascalCase custom files (`CityAutocomplete.tsx`, `PhoneInput.tsx`), 1 kebab-case hook (`use-mobile.ts`).

**h. `components/` root mixes shared infra with feature-specific files**
- Shared: `Navbar`, `Footer`, `ErrorBoundary`, `ProtectedRoute`, `MapBackground`, `ThemeToggle`, `BrandLogo`, `AnimatedButton`, `AnimatedCard`.
- Feature-specific: `DispatchSheet` (broker), `RateModal`, `AIAssistant`, `CityMapModal`, `AuthNavbar`, `PublicNavbar`.
- No rule visible for what justifies root vs. role-subfolder placement.

**i. Pages folder is flat despite role-scoped UI subfolders**
- `components/broker/`, `components/admin/` exist, but there's no `pages/broker/` or `pages/admin/`. 49 pages live side-by-side, including 9 `AI*.tsx` files that could plausibly be grouped.

**j. `@/` alias configured but unused** (`vite.config.ts:14-17` vs. 0 use sites).

---

## Inconsistencies & Decisions Needed

For each: not picking — listing options with tradeoffs.

### D1. Dead `src/app/services/` folder
- **A. Delete it.** Simplest; zero call sites. Risk: none confirmed.
- **B. Leave it.** No-op; bundle isn't affected (tree-shaken). Costs only mental overhead when grepping.
- **C. Repurpose** as the home for non-RTK side-effects (analytics, FMCSA enrichment) and revive `fmcsaService.ts`. Tradeoff: only worth it if you actually need a second API path.

### D2. Two `styles/` folders
- **A. Merge under `src/styles/`.** Move `colors.ts` + `signup.styles.tsx` there. Tradeoff: TS modules live next to CSS; mild category-mismatch but one canonical location.
- **B. Merge under `src/app/styles/`.** Move the CSS files in. Tradeoff: requires updating `main.tsx` `./styles/index.css` import; CSS leaves the conventional `src/styles/` spot.
- **C. Keep both but document the split.** `src/styles/` = browser-loaded CSS, `src/app/styles/` = TS-imported style modules. Tradeoff: no churn, but contributors still ask "which one?"

### D3. `colors.ts` policy vs. 416 raw-class hits
- **A. Drop the rule** from the file header. Tradeoff: honest about current practice; loses the central-tokens benefit.
- **B. Enforce it** — codemod existing files to use `colors.*`, add a lint rule (would require introducing ESLint, currently none configured). Tradeoff: large mechanical change + ongoing lint maintenance.
- **C. Narrow the rule** to "brand accent colors only" (the amber family) — `colors.ts` is mostly amber tokens anyway, and most "violations" are semantic colors (red for errors, etc.). Tradeoff: needs the file edited and `colors.ts` trimmed to brand-only.

### D4. `ROUTES` constant dead vs. inlined paths in `routes.tsx`
- **A. Delete `routes.ts`.** Simplest. Tradeoff: future link refactors stay grep-based.
- **B. Adopt it** — replace all string literals in `routes.tsx` and consumer pages (`navigate('/loads')` etc.) with `ROUTES.LOADS`. Tradeoff: meaningful refactor (38+ call sites), but enables typed link rewrites.
- **C. Replace with a typed wrapper** like `react-router`'s typed paths or a small `route('/load/:id', { id })` helper. Tradeoff: more upfront design, better DX afterwards.

### D5. Orphan `LoadDetails.tsx` and `components/carrier/DispatchSheet.tsx`
- **A. Delete both.** Confirmed zero importers. Tradeoff: if they're WIP someone forgot, the work is in `git log`.
- **B. Wire them up.** Implies a missing route / missing carrier flow — intent unknown.
- **C. Move under `__archive__/`** or similar. Tradeoff: rare convention here; clutter persists.

### D6. `components/` root mixed with feature components
- **A. Move feature-specific files into role folders** (`DispatchSheet` → `components/broker/`, `RateModal` → `components/broker/` or new `components/ratings/`, `AIAssistant` → `components/ai/` or pages-adjacent). Tradeoff: large rename PR; import paths churn.
- **B. Codify the current split** in CLAUDE.md as "root = shared across roles; subfolder = role-specific." Some current root files would still be miscategorized (`DispatchSheet`, `RateModal`). Tradeoff: cheap; mostly documentation.
- **C. Flatten** — remove role subfolders, put everything at `components/` root. Tradeoff: undoes the partial grouping; 49+ files in one dir.

### D7. Pages folder flat vs. role-scoped
- **A. Mirror components** — `pages/broker/`, `pages/carrier/`, `pages/admin/`, `pages/ai/`, `pages/public/`. Tradeoff: 49 file moves; `routes.tsx` lazy paths all change.
- **B. Keep flat**, rely on prefix in filename (already mostly the case: `Broker*`, `Carrier*`, `AI*`). Tradeoff: scales worse past ~60 pages but works today.
- **C. Group only the largest cluster** (the 9 `AI*` pages) into `pages/ai/` and leave the rest flat. Tradeoff: small win, asymmetric structure.

### D8. shadcn kebab-case vs. PascalCase in `components/ui/`
- **A. Rename custom files** (`CityAutocomplete` → `city-autocomplete.tsx`, `PhoneInput` → `phone-input.tsx`) to match shadcn convention. Tradeoff: import-path churn at every call site.
- **B. Accept the split** as "shadcn primitives are kebab, custom primitives are Pascal." Tradeoff: documentable; matches what's already happening.
- **C. Move custom primitives out of `ui/`** into a sibling `components/inputs/` (PascalCase). Tradeoff: separates "vendored" from "ours" — cleaner mental model, more import churn.

### D9. `@/` alias configured but unused
- **A. Delete the alias** from `vite.config.ts`. Tradeoff: simplification.
- **B. Adopt it** going forward — write new imports as `@/app/...`, optionally codemod existing ones. Tradeoff: deep-relative paths (`../../../`) disappear; one-time refactor cost.
- **C. Leave it dormant.** Tradeoff: zero cost, mild "Chesterton's fence" for future contributors.

### D10. `globals.css` is empty
- Delete it, or move something into it (currently `index.css` is the entry). Pure cleanup, no tradeoff.

---

Inferences vs. confirmed:
- **Confirmed by grep/file reads**: every "orphan", "0 importers", file size, path, and quoted line.
- **Inferred** (flagged): intent behind the half-built role grouping in `components/`; intent behind the `ROUTES` constant (looks aspirational, but not asked); whether `LoadDetails.tsx` is dead or in-progress.
