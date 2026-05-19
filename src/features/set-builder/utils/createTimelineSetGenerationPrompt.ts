import type { TimelineRawSetDocument } from "@/lib/catalog/setSchema";

function formatTemplate(document: TimelineRawSetDocument) {
  return JSON.stringify(
    {
      version: document.version,
      metadata: document.metadata,
      sources: document.sources,
      categories: document.categories,
      families: document.families,
      markers: document.markers,
      overlays: document.overlays,
      overlayLaneBias: document.overlayLaneBias ?? {},
    },
    null,
    2,
  );
}

export function createTimelineSetGenerationPrompt(
  document: TimelineRawSetDocument,
) {
  return `You are helping generate a portable timeline set document for a timeline application.

Task:
Research and produce a complete, valid TimelineRawSetDocument JSON object that can be pasted into the app's Raw editor.

Current draft/template:
${formatTemplate(document)}

Output requirements:
- Return ONLY one valid JSON object. No markdown fences, no commentary, no trailing commas.
- Keep "version": 1.
- Keep ids stable, lowercase, URL-safe, and unique across the document.
- Use concise but meaningful ids, e.g. "rome-republic-founded", "industrial-revolution-eras".
- Metadata should include id, label, description, tags, order, and defaultEnabled.
- Keep metadata.tags to at most 4 tags — pick the most useful ones only.
- Keep metadata.description to 1 short sentence.
- Preserve the same top-level shape: metadata, sources, categories, families, markers, overlays, overlayLaneBias.

How the app displays this data:
- Eras render as nested horizontal span blocks in the main timeline. Children appear as the viewer zooms in.
- Markers render as compact point events on the axis/timeline. Dense marker data can overlap, so only the most important points should have high priority.
- Overlays/context bands render as translucent horizontal bands behind or around the timeline context.
- Sources, descriptions, images, and labels appear in tooltips/details, so keep labels short and descriptions useful.
- The app already has a strong default marker color. Do not set marker.color unless there is a specific semantic reason.
- Era default colors are usually acceptable. Only override era colors when it improves visual grouping.
- Overlay/band colors matter more because bands are large visible spans; keep them readable and restrained.

Time point rules:
- For ordinary years, use numbers where BCE is negative and CE is positive. Example: 476 CE = 476, 44 BCE = -44.
- For very ancient dates, use a relative point when clearer:
  { "kind": "relative", "reference": "ago", "unit": "years", "value": "120000" }
  or
  { "kind": "relative", "reference": "after-big-bang", "unit": "years", "value": "380000" }
- Use exact timestamps only when precision matters:
  { "kind": "calendar", "era": "ce", "year": 1969, "precision": "minute", "month": 7, "day": 20, "hour": 20, "minute": 17 }
- Calendar era should be lowercase "ce" or "bce".
- Mark approximate starts/ends with approximateStart / approximateEnd, or approximate for markers.

Sources:
- Build a sources object keyed by source id.
- Prefer reputable primary or high-quality secondary sources: academic publishers, museum/university pages, official archives, encyclopedias with editorial standards.
- Every substantial era, marker, and overlay should include sourceIds.
- Source objects should include shortTitle, title, organization, citation, and url when available.
- Do not fabricate URLs. If unsure, omit the url but keep a useful citation.

Categories and groups:
- Define at least one category with groups.
- Markers and overlays should use groupId values that exist in categories[].groups.
- Use contentType values like "mixed", "milestone", "event", "period", or the closest existing content type implied by the topic.
- Set defaultEnabled thoughtfully.

Era families:
- families is an array.
- Each family has id, label, description, order, priority, defaultEnabled, and root.
- root should span the whole set and contain nested children.
- Era nodes use: id, name, alternateName, startYear, endYear, color, description, sourceIds, image, approximateStart, approximateEnd, regionalScopeLabel, priority, children.
- Use nesting to show structure, but avoid excessive depth.
- Era colors MUST be bright, saturated, and visually distinct. Every top-level era and major group should have an explicit color. Good era color examples: "rgb(64, 167, 226)", "rgb(232, 134, 69)", "rgb(88, 217, 69)", "rgb(191, 82, 224)", "rgb(229, 208, 67)", "rgb(63, 213, 188)", "rgb(227, 84, 93)", "rgb(81, 114, 225)". Child eras can inherit or use softer variants of their parent's color.
- Do NOT use dark, muddy, near-black, or washed-out era colors. The timeline renders eras with opacity and dark colors look heavy and unreadable.
- Do not create overlapping sibling eras. If two things overlap in time, either nest them under a broader parent when one contains the other, split the era sequence into non-overlapping intervals, or model overlapping context as overlays/bands instead of eras.
- Use priority when dense era spans compete visually; higher priority should mean more important or more specific.

Markers:
- markers is an array of important points.
- Each marker should include id, label, year, groupId, description, sourceIds, and optional image/dateLabel/timeLabel/priority.
- Usually omit color for markers so the app uses its default marker color. Only set color if the color carries real semantic meaning.
- Use markers for specific events, publications, discoveries, births/deaths, battles, releases, treaties, launches, etc.
- Use priority for dense timelines. Higher priority should mean more important to show when space is constrained.

Overlays / context bands:
- overlays is an array of contextual spans.
- Each overlay should include id, label, startYear, endYear, color, groupId, description, sourceIds, and optional priority/children.
- Use bands for broader context like movements, dynasties, wars, reigns, technological phases, cultural periods, or environmental conditions.
- Nested overlays are allowed and should use children.
- Use priority and overlayLaneBias when data is dense or when certain bands should appear more prominently/stably.
- Overlay colors are more flexible than era colors. Muted, translucent, or thematic colors are fine as long as the bands are readable against the parchment background.

Images:
- Images are URL links only.
- Prefer stable Wikimedia Commons image URLs when suitable. Other stable museum, archive, library, university, or official image URLs are fine.
- Use image objects only when you have a stable, relevant URL and a useful alt label.
- Do not hotlink random unreliable images.

Quality bar:
- Prioritize accuracy over volume.
- Include enough eras, markers, and bands to make the set useful without making it noisy.
- Make labels short enough for a timeline UI.
- Descriptions should be clear, source-backed, and short — 1 to 2 sentences maximum.
- Prefer fewer, better markers over dozens of low-value points.
- Avoid decorative color noise. Use visual overrides only when they clarify meaning.
- Check for duplicate ids, missing group references, and unknown sourceIds before returning.
- The final answer must be directly pasteable into the Raw editor.
`;
}
