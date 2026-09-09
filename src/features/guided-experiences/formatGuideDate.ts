import { formatTimelineYear } from "@/lib/rendering/bands";

/** Keep period labels and qualifications, while sharing the axis year format. */
export function formatGuideDate(label: string) {
  return label
    .replace(/^c\.\s*/, "~")
    .replace(/\b(\d[\d,]*)\s+(BCE|BC|CE|AD)\b/g, (_, digits: string, era: string) =>
      formatTimelineYear(Number(digits.replaceAll(",", "")) * (era.startsWith("B") ? -1 : 1)))
    .replace(/\bNinth century/g, "9th century")
    .replace(/\bSixth century/g, "6th century")
    .replace(/\bsixth century/g, "6th century")
    .replace(/(\d+(?:st|nd|rd|th))-(\d+(?:st|nd|rd|th))/g, "$1\u2013$2");
}
