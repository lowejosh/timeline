import type { CSSProperties, ReactNode } from "react";

import { THEME } from "@/lib/ui/theme";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <div className="contents" style={themeVariables as CSSProperties}>
      {children}
    </div>
  );
}

const themeVariables: Record<`--${string}`, string> = {
  "--background": THEME.color.paper,
  "--foreground": THEME.color.ink,
  "--card": THEME.color.glass.pageSurface,
  "--card-foreground": THEME.color.ink,
  "--popover": THEME.color.primaryForeground,
  "--popover-foreground": THEME.color.ink,
  "--primary": THEME.color.primary,
  "--primary-foreground": THEME.color.primaryForeground,
  "--secondary": THEME.color.surfaceDeep,
  "--secondary-foreground": THEME.color.ink,
  "--muted": THEME.color.brown[8],
  "--muted-foreground": THEME.color.brown[68],
  "--accent": THEME.color.accentChip,
  "--accent-foreground": THEME.color.ink,
  "--border": THEME.color.brown[14],
  "--input": THEME.color.brown[14],
  "--ring": THEME.color.focus,
  "--focus-ring": THEME.color.focusRing,
  "--focus-ring-soft": THEME.color.focusRingSoft,
  "--surface": THEME.color.paperLight,
  "--surface-deep": THEME.color.surfaceDeep,
  "--glass": THEME.color.glass.base,
  "--glass-hover": THEME.color.glass.hover,
  "--glass-active": THEME.color.glass.active,
  "--glass-selected": THEME.color.glass.selected,
  "--overlay-scrim": THEME.color.overlayScrim,
  "--warning": THEME.color.warn.stroke,
  "--font-sans": THEME.font.sans,
  "--font-display": THEME.font.display,
  "--font-mono": THEME.font.mono,
};
