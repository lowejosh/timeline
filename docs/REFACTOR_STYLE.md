# Style & Structure Refactor Plan

> **Goal**: Consolidate scattered styles into a single theme, eliminate ad-hoc CSS files, and move every component into its own named folder. Visual output must be pixel-identical after the refactor.

---

## 1. Current State Audit

### 1.1 CSS Files (7 files · ~2,020 lines)

| File | Lines | Problem |
|---|---|---|
| `src/App.css` | 955 | Dumps styles for 6+ unrelated components: shell, sidebar toggle, sidebar inner, canvas shell, tooltip, view transitions |
| `src/components/availableSets/AvailableSetsPage.css` | 512 | Co-located but lowercase folder name, no index barrel |
| `src/components/TimelineDisclaimer.css` | 169 | Flat in `/components/`, not in its own folder |
| `src/components/TimelineSettings.css` | 172 | Same problem as above |
| `src/components/overview/TimelineOverviewRulerStack.css` | 91 | Nested in `overview/`, not its own folder |
| `src/components/overview/TimelineOverviewRuler.css` | 68 | Same |
| `src/index.css` | 53 | Global tokens + resets — **intentionally global, keep** |

### 1.2 Raw Colors — No Single Source of Truth

The same raw RGBA values appear 30+ times across all CSS files with no named token:

| Raw value | Role | Appears in |
|---|---|---|
| `rgba(77, 61, 47, X)` | Brown ink (borders, muted text) | App.css ×21, Disclaimer.css, Settings.css, AvailableSets.css |
| `rgba(44, 31, 20, X)` | Shadow base | App.css ×12, Disclaimer.css, Settings.css, AvailableSets.css |
| `rgba(251, 247, 239, X)` | Paper glass surface | App.css ×5, Disclaimer.css, Settings.css, AvailableSets.css |
| `rgba(255, 251, 244, X)` | Paper glass hover | App.css ×4, Disclaimer.css, Settings.css |
| `rgba(124, 92, 59, X)` | Accent / focus | index.css, Settings.css, AvailableSets.css |
| `rgba(32, 25, 19, X)` | Ink text body | App.css, AvailableSets.css |

A canvas-specific `TimelineCanvasTheme` already exists in `src/lib/rendering/canvas/theme.ts` and reads from CSS custom properties. The browser-side tokens in `index.css` (`--paper`, `--ink`, `--timeline-surface`, etc.) are partial — the raw RGBA overrides bypass them.

### 1.3 Component Folder Structure

```
src/components/
  TimelineDisclaimer.css   ← flat, no folder, no index
  TimelineDisclaimer.tsx   ← flat, no folder
  TimelineSettings.css     ← flat, no folder, no index
  TimelineSettings.tsx     ← flat, no folder
  availableSets/           ← lowercase, no index barrel
    AvailableSetsPage.css
    AvailableSetsPage.hooks.ts
    AvailableSetsPage.tsx
    AvailableSetsPage.types.ts
    AvailableSetsPage.utils.ts
  canvas/                  ← generic folder, not component-named
    OverlayGroupIconSvg.tsx
    TimelineCanvas.tsx
  overview/                ← generic folder, not component-named
    TimelineOverviewRuler.css
    TimelineOverviewRuler.tsx
    TimelineOverviewRulerStack.css
    TimelineOverviewRulerStack.tsx
  sidebar/                 ← generic folder, not component-named
    TimelineSidebar.tsx
```

---

## 2. Styling Approach Recommendation

### Option Comparison

| Approach | Eliminates CSS files | Theme support | Migration effort | Animation/transition risk |
|---|---|---|---|---|
| **Tailwind v4** | ✅ Yes (mostly) | ✅ Via `@theme` in CSS | High | Medium — arbitrary values for complex cubics |
| **CSS Modules** | ❌ No (still `.module.css`) | ⚠️ Via CSS vars only | Low | None |
| **CSS Modules + TS theme** | ❌ No | ✅ Dual: CSS vars + TS const | Medium | None |

### Recommendation: Tailwind v4 + TS `THEME` constant

**Rationale:**
- Tailwind v4 is Vite-native via `@tailwindcss/vite` — zero webpack config
- The new `@theme` block in `index.css` integrates directly with existing CSS custom property tokens
- Utility classes inline in TSX eliminate all component-level `.css` files for layout/spacing/color
- The only CSS that cannot be cleanly expressed in Tailwind utilities is complex multi-property `transition` choreography with custom cubic-beziers and `@keyframes`. These stay in `index.css` as named keyframe rules and targeted `@layer components` blocks
- A TypeScript `THEME` constant mirrors the Tailwind `@theme` values, giving full type-safe access for canvas drawing and any `style={{}}` inline values (computed positions, dynamic widths, etc.)

### What stays in `index.css`

```css
/* 1. Tailwind base layers */
@import "tailwindcss";

/* 2. @theme block (replaces raw CSS custom properties) */
@theme {
  --color-paper: #f4ecdd;
  --color-ink: #201913;
  --color-surface: #f7f0e2;
  --color-surface-deep: #efe5d1;
  --color-brown: 77 61 47;      /* used as rgb() channel base */
  --color-shadow: 44 31 20;
  --color-focus: rgba(124, 92, 59, 0.45);
  --color-accent: rgba(110, 82, 54, 0.68);
  --font-sans: Inter, ui-sans-serif, system-ui, ...;
  --font-display: 'Iowan Old Style', Palatino, Georgia, serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', ui-monospace, ...;
}

/* 3. Global resets */
*, html, body, #root { ... }

/* 4. @keyframes only — no component rules */
@keyframes timeline-sidebar-pop { ... }
@keyframes timeline-overview-ruler-tier-in { ... }
@keyframes sidebar-warn-tooltip-in { ... }
```

**Nothing else belongs in `index.css`.** Every component-level rule moves into Tailwind classes inside the TSX file.

### When `.styles.css` files are still allowed

For CSS rules that genuinely cannot be expressed as a Tailwind utility class:
- Multi-property `transition` with mixed durations (e.g. `opacity 180ms ease, transform 280ms cubic-bezier(0.22, 1, 0.36, 1)`)
- `::before` / `::after` pseudo-elements with dynamic `content`
- Complex `:has()` / `:is()` / sibling selector patterns
- `scrollbar-width: thin` with `scrollbar-color`

These files **must** be named `ComponentName.styles.css` (no module, just isolated scope) and imported only by that component's TSX file.

---

## 3. Theme Object

Create `src/lib/ui/theme.ts`. This is the **single source of truth** for all colors and tokens referenced in TypeScript (canvas drawing, inline `style={{}}`, Tailwind config).

```typescript
// src/lib/ui/theme.ts

/** All raw design tokens. Mirror of the Tailwind @theme block in index.css. */
export const THEME = {
  color: {
    /** Base parchment background */
    paper: '#f4ecdd',
    /** Lightest glass surface — used in frosted UI panels */
    paperLight: '#fbf7ef',
    /** Timeline canvas surface */
    surface: '#f7f0e2',
    /** Timeline canvas surface — deeper variant */
    surfaceDeep: '#efe5d1',

    /** Primary text / icon color */
    ink: '#201913',
    /** Label color for timeline axis text */
    inkLabel: '#4d3d2f',

    /** Timeline axis rule line */
    line: 'rgba(71, 55, 39, 0.7)',
    /** Timeline axis rule line — subtle */
    lineSoft: 'rgba(71, 55, 39, 0.18)',

    /** Focus ring */
    focus: 'rgba(124, 92, 59, 0.45)',
    /** Toggle active / accent */
    accent: 'rgba(110, 82, 54, 0.68)',

    /**
     * Brown ink base: rgba(77, 61, 47, α).
     * Use these for borders, dividers, and muted text.
     * The key is the opacity multiplied by 100.
     */
    brown: {
      6:  'rgba(77, 61, 47, 0.06)',
      8:  'rgba(77, 61, 47, 0.08)',
      9:  'rgba(77, 61, 47, 0.09)',
      10: 'rgba(77, 61, 47, 0.10)',
      12: 'rgba(77, 61, 47, 0.12)',
      14: 'rgba(77, 61, 47, 0.14)',
      18: 'rgba(77, 61, 47, 0.18)',
      20: 'rgba(77, 61, 47, 0.20)',
      36: 'rgba(77, 61, 47, 0.36)',
      52: 'rgba(77, 61, 47, 0.52)',
      66: 'rgba(77, 61, 47, 0.66)',
      68: 'rgba(77, 61, 47, 0.68)',
      70: 'rgba(77, 61, 47, 0.70)',
      72: 'rgba(77, 61, 47, 0.72)',
      74: 'rgba(77, 61, 47, 0.74)',
      82: 'rgba(77, 61, 47, 0.82)',
    },

    /**
     * Shadow base: rgba(44, 31, 20, α).
     * Use these for box-shadows only.
     * The key is the opacity multiplied by 100.
     */
    shadow: {
      4:  'rgba(44, 31, 20, 0.04)',
      5:  'rgba(44, 31, 20, 0.05)',
      8:  'rgba(44, 31, 20, 0.08)',
      10: 'rgba(44, 31, 20, 0.10)',
      12: 'rgba(44, 31, 20, 0.12)',
    },

    /**
     * Glass surface variants (paper + alpha).
     * Use for frosted/backdrop-blur panels.
     */
    glass: {
      /** Default resting state */
      base:   'rgba(251, 247, 239, 0.5)',
      /** Hover state */
      hover:  'rgba(255, 251, 244, 0.62)',
      /** Active / open state */
      active: 'rgba(255, 251, 244, 0.58)',
      /** Elevated panel (sidebar, settings) */
      panel:  'rgba(251, 247, 239, 0.56)',
    },
  },

  font: {
    sans:    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
    mono:    "'SF Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Consolas, monospace",
  },

  /** Common easing curves — use in inline transition strings or .styles.css */
  easing: {
    spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
    bounce: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    ease:   'ease',
  },
} as const;

export type Theme = typeof THEME;
```

> **Rule**: Any raw `rgba(...)` or hex literal in a `.tsx` or `.styles.css` file that isn't from a dynamic data color (era/overlay hue) must reference `THEME.color.*`.

The existing `src/lib/rendering/canvas/theme.ts` (`TimelineCanvasTheme`) reads from CSS custom properties at runtime — it does **not** need to be replaced, but its `DEFAULT_TIMELINE_THEME` fallback constants should be switched to reference `THEME.color.*`.

---

## 4. Component Folder Structure

### Rules

1. **Every component lives in its own folder** named exactly after the component (PascalCase).
2. The folder contains all files that belong exclusively to that component:
   - `ComponentName.tsx` — the component
   - `ComponentName.styles.css` — only if CSS is genuinely needed (see §2)
   - `ComponentName.hooks.ts`, `ComponentName.types.ts`, `ComponentName.utils.ts` — if extracted
   - `index.ts` — re-exports the public surface (`export { ComponentName } from './ComponentName'`)
3. **Child components** that only exist for a parent live inside the parent's folder, not as top-level peers.
4. **Nested sub-components** (e.g. `TimelineOverviewRulerStack` inside `TimelineOverviewRuler`) get their own subfolder inside the parent folder.

### Target Structure

```
src/components/
│
├── TimelineDisclaimer/
│   ├── TimelineDisclaimer.tsx
│   ├── TimelineDisclaimer.styles.css   ← only if needed for ::before/after or complex transitions
│   └── index.ts
│
├── TimelineSettings/
│   ├── TimelineSettings.tsx
│   ├── TimelineSettings.styles.css     ← icon spin transition lives here
│   └── index.ts
│
├── TimelineCanvas/                      ← was canvas/
│   ├── TimelineCanvas.tsx
│   ├── OverlayGroupIconSvg.tsx          ← private to TimelineCanvas, stays here
│   └── index.ts
│
├── AvailableSets/                       ← was availableSets/ (lowercase)
│   ├── AvailableSetsPage.tsx
│   ├── AvailableSetsPage.styles.css     ← only if needed
│   ├── AvailableSetsPage.hooks.ts
│   ├── AvailableSetsPage.types.ts
│   ├── AvailableSetsPage.utils.ts
│   └── index.ts
│
├── TimelineOverviewRuler/               ← was overview/
│   ├── TimelineOverviewRuler.tsx
│   ├── TimelineOverviewRuler.styles.css ← only if needed
│   ├── index.ts
│   │
│   └── TimelineOverviewRulerStack/      ← nested: child of TimelineOverviewRuler
│       ├── TimelineOverviewRulerStack.tsx
│       ├── TimelineOverviewRulerStack.styles.css  ← only if needed
│       └── index.ts
│
└── TimelineSidebar/                     ← was sidebar/
    ├── TimelineSidebar.tsx
    └── index.ts
```

### What happens to `App.css`

`App.css` is decomposed entirely. Each block of rules moves to its logical owner:

| Current rule block in `App.css` | Moves to |
|---|---|
| `.app-shell`, `.app-stage`, `.app-stage__*` | Tailwind classes in `App.tsx` |
| `.app-view-stack`, `.app-view`, `.app-view--*` | Tailwind + `App.styles.css` (view slide transitions) |
| `.timeline-sidebar-shell` | Tailwind classes in `App.tsx` |
| `.timeline-sidebar-toggle`, `.timeline-sidebar-toggle__*` | `TimelineSidebar/TimelineSidebar.styles.css` or Tailwind |
| `.timeline-sidebar`, `.timeline-sidebar__*` | `TimelineSidebar/TimelineSidebar.styles.css` or Tailwind |
| `.timeline-canvas`, `.timeline-canvas-shell` | `TimelineCanvas/TimelineCanvas.styles.css` or Tailwind |
| `.timeline-tooltip`, `.timeline-tooltip__*` | `TimelineCanvas/TimelineCanvas.styles.css` or Tailwind |
| `@keyframes timeline-sidebar-pop` | `index.css` |
| `@keyframes sidebar-warn-tooltip-in` | `index.css` |
| Media queries | Distributed to Tailwind responsive variants where possible |

After decomposition, `App.css` is **deleted**. `App.tsx` imports nothing except `index.css` (via `main.tsx`).

---

## 5. File Naming Conventions

| What | Convention | Example |
|---|---|---|
| Component file | `PascalCase.tsx` | `TimelineSidebar.tsx` |
| Component folder | `PascalCase/` | `TimelineSidebar/` |
| Barrel export | `index.ts` | re-exports component |
| Styles file (CSS-only, if needed) | `PascalCase.styles.css` | `TimelineSettings.styles.css` |
| Hooks extracted from component | `PascalCase.hooks.ts` | `AvailableSetsPage.hooks.ts` |
| Types extracted from component | `PascalCase.types.ts` | `AvailableSetsPage.types.ts` |
| Utilities extracted from component | `PascalCase.utils.ts` | `AvailableSetsPage.utils.ts` |
| Theme constants | `theme.ts` in `src/lib/ui/` | `src/lib/ui/theme.ts` |
| Canvas-specific theme | `theme.ts` in `src/lib/rendering/canvas/` | unchanged |

---

## 6. Implementation Phases

### Phase 1 — Theme Object (no visual change, no file moves)
1. Create `src/lib/ui/theme.ts` with the `THEME` constant
2. Update `DEFAULT_TIMELINE_THEME` in `src/lib/rendering/canvas/theme.ts` to reference `THEME.color.*`
3. No CSS changes yet — just a new TypeScript file

**Risk**: None. Purely additive.

---

### Phase 2 — Install Tailwind v4
1. `npm install tailwindcss @tailwindcss/vite`
2. Add `@tailwindcss/vite` to `vite.config.ts`
3. Replace top of `index.css` with `@import "tailwindcss"` + `@theme { ... }` block
4. Verify dev server renders identically

**Risk**: Low. Tailwind adds no classes unless you use them.

---

### Phase 3 — Component Folder Structure (no style changes)
Move files one component at a time. Update all imports. Run `npm run build` between each move to catch broken imports.

Order (safest first — fewest dependants):
1. `TimelineDisclaimer` → `components/TimelineDisclaimer/`
2. `TimelineSettings` → `components/TimelineSettings/`
3. `canvas/` → `components/TimelineCanvas/` (rename folder, add `index.ts`)
4. `sidebar/` → `components/TimelineSidebar/` (rename folder, add `index.ts`)
5. `overview/TimelineOverviewRuler.*` → `components/TimelineOverviewRuler/`
6. `overview/TimelineOverviewRulerStack.*` → `components/TimelineOverviewRuler/TimelineOverviewRulerStack/`
7. `availableSets/` → `components/AvailableSets/` (rename, add `index.ts`)

Add an `index.ts` barrel to each folder that re-exports the public component.

**Risk**: Low if done one at a time with build checks. Purely mechanical.

---

### Phase 4 — Style Migration (component by component)

Migrate one component's styles at a time. Convert CSS classes to Tailwind utilities in JSX. For each component:
1. Open the `.css` file and the `.tsx` file side by side
2. For each CSS class: convert layout/color/spacing rules to Tailwind classes on the element
3. For genuinely unmappable rules (complex `transition`, `::before`/`::after`): keep them in a `ComponentName.styles.css` file
4. Delete the old `.css` file when all rules are accounted for
5. Build and visually verify

Suggested order (smallest/simplest first):
1. `TimelineOverviewRuler` (68 lines CSS)
2. `TimelineOverviewRulerStack` (91 lines CSS)
3. `TimelineDisclaimer` (169 lines CSS — has `::before`/`::after` icon animation)
4. `TimelineSettings` (172 lines CSS — has icon rotation transition)
5. App shell styles from `App.css` (shell, stage, view transitions)
6. Sidebar from `App.css` (largest block — ~400 lines)
7. Canvas shell + tooltip from `App.css`
8. `AvailableSetsPage` (512 lines CSS — largest single file)

After all components are migrated, delete `App.css`.

**Risk**: Medium. Each component needs visual verification. Keep a screenshot of the current UI before starting.

---

### Phase 5 — Global Keyframes Consolidation
Move all `@keyframes` from component `.styles.css` files into `index.css`. No functional change — just ensures animations are globally reachable without import order coupling.

---

## 7. What Does NOT Change

- `src/index.css` continues to be the global entry — it just becomes a `@theme` + resets + `@keyframes` file
- `src/lib/rendering/canvas/theme.ts` stays as-is (`readTimelineCanvasTheme()` still reads CSS properties at runtime)
- All TypeScript logic files under `src/lib/` are untouched
- Era/overlay/marker data files are untouched
- All animation timing values are preserved exactly (no visual regressions)

---

## 8. Open Questions

1. **`OverlayGroupIconSvg.tsx`** — used by both `TimelineCanvas` and `TimelineSidebar`. Should it live in `TimelineCanvas/` (current location) or be promoted to a shared `components/shared/` or `components/icons/` folder?
   - Recommendation: move to `components/icons/OverlayGroupIconSvg/` once a second consumer exists; for now keep in `TimelineCanvas/` since sidebar imports it from there.

2. **`App.tsx` sidebar toggle** — the Layers toggle button is rendered in `App.tsx` but its styles belong logically to the sidebar. After migration, the toggle's Tailwind classes live in `App.tsx` directly (since the element is there), but any `.styles.css` rules for it go in `TimelineSidebar/TimelineSidebar.styles.css`.

3. **Tailwind arbitrary value verbosity** — if multi-property transitions in JSX become too noisy (e.g. `className="[transition:opacity_180ms_ease,transform_280ms_cubic-bezier(0.22,1,0.36,1)]"`), extract them to a named class in a tiny `App.styles.css` or component `.styles.css` at the `@layer components` level. This is preferable to silently breaking animation fidelity.
