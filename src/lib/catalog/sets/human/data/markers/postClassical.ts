import type { TimelineMarker } from "@/lib/core/timelineTypes";
import { ce } from "@/lib/core/timelineDateBuilders";

export const POST_CLASSICAL_MARKERS: TimelineMarker[] = [
  {
    id: "first-crusade-called",
    label: "First Crusade called",
    shortLabel: "First Crusade",
    description:
      "At Clermont in 1095, Pope Urban II called on western Christians to aid Byzantium and launch the First Crusade.",
    year: ce(1095),
    minZoom: 18,
    priority: 74,
    sourceIds: ["historyCrusades"],
  },
  {
    id: "battle-of-talas",
    label: "Battle of Talas",
    shortLabel: "Battle of Talas",
    description:
      "Abbasid and Tang forces clashed at Talas in 751, ending Tang influence in Transoxiana and halting Tang westward expansion.",
    year: ce(751),
    regionalScopeLabel: "Central Asia",
    minZoom: 18,
    priority: 77,
    sourceIds: ["battleOfTalasWikipedia"],
  },
  {
    id: "an-lushan-rebellion-begins",
    label: "An Lushan rebellion begins",
    shortLabel: "An Lushan Rebellion",
    description:
      "An Lushan's rebellion broke out against the Tang in 755, beginning a civil war that shook China for years.",
    year: ce(755),
    regionalScopeLabel: "China",
    minZoom: 18,
    priority: 78,
    sourceIds: ["anLushanRebellionWikipedia"],
  },
];
