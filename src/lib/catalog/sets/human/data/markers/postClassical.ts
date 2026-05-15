import type { TimelineMarker } from "@/lib/core/timelineTypes";
import { ce } from "@/lib/core/timelineDateBuilders";
import { commonsTooltipImage } from "@/lib/catalog/tooltipImages";

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
    image: {
      src: commonsTooltipImage(
        "Paus Urbanus II te Clermont-Ferrand, 1095 Paus Urbanus te Clermont (titel op object), RP-P-2017-7201.jpg",
      ),
      alt: "Print of Pope Urban II preaching at Clermont in 1095",
      width: 2172,
      height: 3384,
      credit: "Wikimedia Commons",
    },
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
    image: {
      src: commonsTooltipImage("Battle of Talas.png"),
      alt: "Map diagram of the Battle of Talas between Abbasid and Tang forces",
      width: 1081,
      height: 738,
      credit: "Wikimedia Commons",
    },
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
