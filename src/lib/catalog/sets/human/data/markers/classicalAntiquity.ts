import type { TimelineMarker } from "@/lib/core/timelineTypes";
import { bce, ce } from "@/lib/core/timelineDateBuilders";

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
    sourceIds: ["edictOfMilanWikipedia"],
  },
];
