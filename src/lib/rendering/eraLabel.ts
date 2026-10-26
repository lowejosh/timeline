/** Keep labels inside their own column; long names wrap before truncating. */
export function fitEraLabel(text: string, width: number, measure: (text: string) => number): string[] {
  if (width < measure("…")) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  while (words.length) {
    const word = words.shift()!;
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate) <= width) {
      line = candidate;
    } else if (line && lines.length === 0) {
      lines.push(line);
      line = word;
    } else {
      line = [candidate, ...words].join(" ");
      break;
    }
  }
  if (measure(line) > width) {
    while (line && measure(`${line}…`) > width) line = line.slice(0, -1);
    line = `${line.trimEnd()}…`;
  }
  if (line) lines.push(line);
  return lines;
}

/** Fit a complete label block between the bands and the tick marks. */
export function placeEraLabelBlock(
  lines: string[], alternateLines: string[], desiredBaseline: number,
  top: number, bottom: number,
) {
  const lineHeight = 12;
  const maxLines = Math.max(0, Math.floor((bottom - top - 10) / lineHeight) + 1);
  const primary = lines.slice(0, maxLines);
  const secondary = alternateLines.slice(0, Math.max(0, maxLines - primary.length));
  const count = primary.length + secondary.length;
  const baseline = Math.min(bottom, Math.max(desiredBaseline, top + 10 + Math.max(0, count - 1) * lineHeight));
  return { lines: primary, alternateLines: secondary, baseline };
}
