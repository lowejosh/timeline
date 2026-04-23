import { THEME } from "../../ui/theme";

export type TimelineCanvasTheme = {
  paper: string;
  paperDeep: string;
  line: string;
  lineSoft: string;
  labelColor: string;
  fontSans: string;
};

export const DEFAULT_TIMELINE_THEME: TimelineCanvasTheme = {
  paper: THEME.color.surface,
  paperDeep: THEME.color.overviewStrip.to,
  line: THEME.color.line,
  lineSoft: THEME.color.lineSoft,
  labelColor: THEME.color.inkLabel,
  fontSans: THEME.font.sans,
};

export function readTimelineCanvasTheme(): TimelineCanvasTheme {
  if (typeof window === "undefined") {
    return DEFAULT_TIMELINE_THEME;
  }

  const styles = getComputedStyle(document.documentElement);

  return {
    paper:
      styles.getPropertyValue("--timeline-surface").trim() ||
      DEFAULT_TIMELINE_THEME.paper,
    paperDeep:
      styles.getPropertyValue("--timeline-surface-deep").trim() ||
      DEFAULT_TIMELINE_THEME.paperDeep,
    line:
      styles.getPropertyValue("--timeline-line").trim() ||
      DEFAULT_TIMELINE_THEME.line,
    lineSoft:
      styles.getPropertyValue("--timeline-line-soft").trim() ||
      DEFAULT_TIMELINE_THEME.lineSoft,
    labelColor:
      styles.getPropertyValue("--timeline-label").trim() ||
      DEFAULT_TIMELINE_THEME.labelColor,
    fontSans:
      styles.getPropertyValue("--font-sans").trim() ||
      DEFAULT_TIMELINE_THEME.fontSans,
  };
}
