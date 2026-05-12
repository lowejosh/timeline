/**
 * Single source of truth for all design tokens.
 *
 * Rules:
 * - Raw rgba/hex literals in .tsx should reference THEME.color.*
 *   (exception: dynamic era/overlay hues generated at runtime)
 * - This object mirrors the @theme block in index.css — keep them in sync
 * - Canvas drawing uses src/lib/rendering/canvas/theme.ts which reads CSS
 *   custom properties at runtime; its DEFAULT_TIMELINE_THEME fallbacks
 *   reference THEME.color.*
 */
export const THEME = {
  color: {
    /** Base parchment background */
    paper: "#f4ecdd",
    /** Lightest glass surface — frosted UI panels at rest */
    paperLight: "#fbf7ef",
    /** Timeline canvas surface */
    surface: "#f7f0e2",
    /** Timeline canvas surface — deeper variant */
    surfaceDeep: "#efe5d1",

    /** Primary text / icon color */
    ink: "#201913",
    /** Label color for timeline axis text */
    inkLabel: "#4d3d2f",
    /** Body text (slightly warmer than pure ink) */
    inkBody: "rgba(32, 25, 19, 0.82)",

    /** Timeline axis rule line */
    line: "rgba(71, 55, 39, 0.7)",
    /** Timeline axis rule line — subtle variant */
    lineSoft: "rgba(71, 55, 39, 0.18)",

    /** Keyboard focus ring */
    focus: "rgba(124, 92, 59, 0.45)",
    /** Toggle-active / accent fill */
    accent: "rgba(110, 82, 54, 0.68)",
    /** Accent background chip */
    accentChip: "rgba(124, 92, 59, 0.12)",

    /**
     * Brown ink base: rgba(77, 61, 47, α).
     * Used for borders, dividers, and muted text.
     * Key = opacity × 100 (rounded).
     */
    brown: {
      6: "rgba(77, 61, 47, 0.06)",
      8: "rgba(77, 61, 47, 0.08)",
      9: "rgba(77, 61, 47, 0.09)",
      10: "rgba(77, 61, 47, 0.10)",
      12: "rgba(77, 61, 47, 0.12)",
      14: "rgba(77, 61, 47, 0.14)",
      18: "rgba(77, 61, 47, 0.18)",
      20: "rgba(77, 61, 47, 0.20)",
      36: "rgba(77, 61, 47, 0.36)",
      42: "rgba(77, 61, 47, 0.42)",
      46: "rgba(77, 61, 47, 0.46)",
      50: "rgba(77, 61, 47, 0.50)",
      52: "rgba(77, 61, 47, 0.52)",
      62: "rgba(77, 61, 47, 0.62)",
      66: "rgba(77, 61, 47, 0.66)",
      68: "rgba(77, 61, 47, 0.68)",
      70: "rgba(77, 61, 47, 0.70)",
      72: "rgba(77, 61, 47, 0.72)",
      74: "rgba(77, 61, 47, 0.74)",
      78: "rgba(77, 61, 47, 0.78)",
      80: "rgba(77, 61, 47, 0.80)",
      82: "rgba(77, 61, 47, 0.82)",
    },

    /**
     * Shadow base: rgba(44, 31, 20, α).
     * For box-shadows only.
     * Key = opacity × 100 (rounded).
     */
    shadow: {
      3: "rgba(44, 31, 20, 0.03)",
      4: "rgba(44, 31, 20, 0.04)",
      5: "rgba(44, 31, 20, 0.05)",
      8: "rgba(44, 31, 20, 0.08)",
      10: "rgba(44, 31, 20, 0.10)",
      12: "rgba(44, 31, 20, 0.12)",
    },

    /**
     * Deep shadow base: rgba(28, 20, 14, α).
     * Used for the overview ruler shade overlay.
     */
    deepShadow: {
      42: "rgba(28, 20, 14, 0.42)",
    },

    /**
     * Glass surface variants — frosted/backdrop-blur panels.
     */
    glass: {
      /** Resting state (toggle buttons, sidebar shell) */
      base: "rgba(251, 247, 239, 0.5)",
      /** Hover state */
      hover: "rgba(255, 251, 244, 0.62)",
      /** Active / open state */
      active: "rgba(255, 251, 244, 0.58)",
      /** Elevated panel gradient start (sidebar, settings panel) */
      panelFrom: "rgba(251, 247, 239, 0.56)",
      /** Elevated panel gradient end */
      panelTo: "rgba(245, 237, 223, 0.44)",
      /** Settings panel gradient start */
      panelHeavyFrom: "rgba(251, 247, 239, 0.7)",
      /** Settings panel gradient end */
      panelHeavyTo: "rgba(245, 237, 223, 0.56)",
      /** AvailableSets page surface */
      pageSurface: "rgba(250, 246, 238, 0.78)",
      /** Sets-view background gradient */
      setsFrom: "rgba(252, 248, 240, 0.97)",
      /** Sets-view background gradient end */
      setsTo: "rgba(246, 239, 226, 0.97)",
    },

    /** Deep-time muted palette used in overview ruler overview strip */
    overviewStrip: {
      from: "#f7f0e2",
      to: "#efe5d4",
    },

    /** Warning/caution tones (sidebar set-warn badge) */
    warn: {
      fill: "rgba(155, 90, 10, 0.22)",
      stroke: "rgba(155, 90, 10, 0.82)",
    },
  },

  font: {
    sans: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display:
      "'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
    mono: "'SF Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Consolas, monospace",
  },

  /**
   * Named easing curves.
   * Use in inline transition strings.
   */
  easing: {
    /** Natural spring settle — most UI transitions */
    spring: "cubic-bezier(0.22, 1, 0.36, 1)",
    /** Soft bounce — sidebar item pop */
    bounce: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    /** Smooth settle — overview ruler */
    settle: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    ease: "ease",
  },
} as const;

export type Theme = typeof THEME;
