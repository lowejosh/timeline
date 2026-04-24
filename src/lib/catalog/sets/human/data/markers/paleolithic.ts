import type { TimelineMarker } from "@/lib/core/timelineTypes";
import { yearsAgo } from "@/lib/core/timelineDateBuilders";

export const PALEOLITHIC_MARKERS: TimelineMarker[] = [
  {
    id: "homo-sapiens-evolves-in-africa",
    label: "Homo sapiens evolves in Africa",
    shortLabel: "Homo sapiens",
    year: yearsAgo(300_000),
    regionalScopeLabel: "Africa",
    approximate: true,
    minZoom: 17,
    priority: 83,
    sourceIds: ["smithsonianHomoSapiens"],
  },
  {
    id: "ground-ocher-markings-appear-in-africa",
    label: "Ground ocher markings appear in African rock art",
    shortLabel: "Ocher Markings",
    year: yearsAgo(100_000),
    regionalScopeLabel: "Africa",
    approximate: true,
    minZoom: 17,
    priority: 75,
    sourceIds: ["metPrehistoricArt"],
  },
  {
    id: "chauvet-cave-figurative-art",
    label: "Chauvet Cave figurative art",
    shortLabel: "Chauvet Cave",
    year: yearsAgo(30_000),
    regionalScopeLabel: "Southern France",
    approximate: true,
    minZoom: 18,
    priority: 77,
    sourceIds: ["unescoChauvet", "metChauvet"],
  },
  {
    id: "venus-of-dolni-vestonice",
    label: "Venus of Dolní Věstonice",
    shortLabel: "Dolní Věstonice",
    year: yearsAgo(27_000),
    regionalScopeLabel: "Central Europe",
    approximate: true,
    minZoom: 18,
    priority: 74,
    sourceIds: ["khanPaleolithicCulture"],
  },
];
