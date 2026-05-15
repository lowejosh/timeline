import type { TimelineMarker } from "@/lib/core/timelineTypes";
import { bce, ce } from "@/lib/core/timelineDateBuilders";
import { commonsTooltipImage } from "@/lib/catalog/tooltipImages";

export const CLASSICAL_ANTIQUITY_MARKERS: TimelineMarker[] = [
  {
    id: "alexander-dies-hellenistic-age-begins",
    label: "Alexander the Great dies",
    shortLabel: "Alexander Dies",
    description:
      "Alexander's death at Babylon opened the Hellenistic age, when Greek power and culture spread through the lands he had conquered.",
    year: bce(323),
    minZoom: 18,
    priority: 76,
    image: {
      src: commonsTooltipImage("Alexandermosaic.jpg"),
      alt: "Alexander Mosaic showing Alexander in battle against Darius III",
      width: 3440,
      height: 2236,
      credit: "Wikimedia Commons",
    },
    sourceIds: ["historyAlexanderGreat", "britannicaHellenisticAge"],
  },
  {
    id: "rome-destroys-carthage",
    label: "Rome destroys Carthage",
    shortLabel: "Carthage Falls",
    description:
      "Rome destroyed Carthage in 146 BCE, ending the city's long rivalry with Rome as an independent power.",
    year: bce(146),
    regionalScopeLabel: "North Africa",
    minZoom: 18,
    priority: 75,
    image: {
      src: commonsTooltipImage("Punic Ruins, Carthage.jpg"),
      alt: "Punic ruins at Carthage in North Africa",
      width: 1280,
      height: 825,
      credit: "Wikimedia Commons",
    },
    sourceIds: ["britannicaCarthage"],
  },
  {
    id: "caesar-crosses-the-rubicon",
    label: "Caesar crosses the Rubicon",
    shortLabel: "Rubicon",
    description:
      "Caesar led his army across the Rubicon into Italy, triggering the civil war that helped bring down the Roman Republic.",
    year: bce(49),
    minZoom: 19,
    priority: 74,
    image: {
      src: commonsTooltipImage("Julius Caesar.jpg"),
      alt: "Marble bust traditionally identified as Julius Caesar",
      width: 2848,
      height: 4288,
      credit: "Wikimedia Commons",
    },
    sourceIds: ["historyAncientRome"],
  },
  {
    id: "qin-unifies-china",
    label: "Qin unifies China",
    shortLabel: "Qin Unifies China",
    description:
      "Qin completed the conquest of the rival states in 221 BCE, unifying China under Qin Shi Huang and ending the Warring States period.",
    year: bce(221),
    regionalScopeLabel: "China",
    minZoom: 18,
    priority: 80,
    image: {
      src: commonsTooltipImage("Terracotta Army Pit 1 - 11.jpg"),
      alt: "Terracotta warriors from the mausoleum of Qin Shi Huang",
      width: 3504,
      height: 2336,
      credit: "Wikimedia Commons",
    },
    sourceIds: ["qinDynastyWikipedia"],
  },
  {
    id: "kalinga-war",
    label: "Kalinga War",
    shortLabel: "Kalinga War",
    description:
      "Ashoka's Mauryan Empire fought Kalinga in one of ancient India's largest and deadliest wars.",
    year: bce(261),
    regionalScopeLabel: "Indian subcontinent",
    approximate: true,
    minZoom: 18,
    priority: 77,
    image: {
      src: commonsTooltipImage("Rock edicts of Ashoka at Dhauli.jpg"),
      alt: "Ashoka's rock edicts at Dhauli in Odisha",
      width: 6016,
      height: 4000,
      credit: "Wikimedia Commons",
    },
    sourceIds: ["kalingaWarWikipedia"],
  },
  {
    id: "edict-of-milan",
    label: "Edict of Milan",
    shortLabel: "Edict of Milan",
    description:
      "Constantine I and Licinius agreed at Milan to treat Christians benevolently, giving Christianity legal status in the Roman Empire.",
    year: ce(313),
    regionalScopeLabel: "Roman Empire",
    minZoom: 18,
    priority: 76,
    image: {
      src: commonsTooltipImage(
        "Colossal head of Constantine (M.C. inv. 1072), August 24, 2021.jpg",
      ),
      alt: "Colossal bronze head of Constantine",
      width: 5449,
      height: 8173,
      credit: "Wikimedia Commons",
    },
    sourceIds: ["edictOfMilanWikipedia"],
  },
];
