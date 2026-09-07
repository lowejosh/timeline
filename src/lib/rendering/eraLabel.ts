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
