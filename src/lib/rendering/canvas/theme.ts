export type TimelineCanvasTheme = {
  paper: string;
  paperDeep: string;
  line: string;
  lineSoft: string;
  labelColor: string;
  fontSans: string;
};

export const DEFAULT_TIMELINE_THEME: TimelineCanvasTheme = {
  paper: "#f7f0e2",
  paperDeep: "#efe5d4",
  line: "rgba(74, 57, 43, 0.9)",
  lineSoft: "rgba(74, 57, 43, 0.24)",
  labelColor: "rgba(53, 39, 29, 0.92)",
  fontSans: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
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
