import type { TimelineMarker } from "../../core/timelineTypes";
import { yearsAgo } from "../timelineDateBuilders";

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
    sourceRefs: [
      {
        sourceId: "smithsonianHomoSapiens",
        note: "The Smithsonian's Homo sapiens overview says our species evolved in Africa around 300,000 years ago; the app uses c. 300,000 BCE as the species-level anchor for the emergence of modern humans.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "metPrehistoricArt",
        note: "The Met's prehistoric-art introduction says the first human artistic representations, markings with ground red ocher, seem to have occurred about 100,000 B.C. in African rock art; the app uses that date as a cautious early-symbolic-expression anchor.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "unescoChauvet",
        note: "UNESCO dates Chauvet Cave's earliest-known figurative drawings to roughly 30,000–32,000 BP; the app uses c. 30,000 BCE as a clean public-facing anchor for this exceptionally early cave art.",
      },
      {
        sourceId: "metChauvet",
        note: "The Met's Chauvet essay says most of the cave's images belong to a first phase between 30,000 and 32,000 BP, reinforcing the app's c. 30,000 BCE anchor.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "khanPaleolithicCulture",
        note: "Khan Academy directly identifies the Venus of Dolní Věstonice as a Paleolithic figurine dated to 29,000–25,000 BCE; the app uses c. 27,000 BCE as a midpoint anchor for this iconic portable sculpture.",
      },
    ],
  },
];
