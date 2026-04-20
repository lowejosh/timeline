import type { TimelineMarker } from "../timelineTypes";
import { bce } from "../timelineDateBuilders";

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
    sourceRefs: [
      {
        sourceId: "historyAlexanderGreat",
        note: "HISTORY notes that the period from Alexander's death to 31 BCE came to be known as the Hellenistic period; the app uses Alexander's death in 323 BCE as the clearer event label for that transition.",
      },
      {
        sourceId: "britannicaHellenisticAge",
        note: "Supports 323 BCE as the conventional opening of the Hellenistic age after Alexander's death.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaCarthage",
        note: "Britannica says Carthage finally fell in 146 BCE, when the site was plundered and burned after the Punic Wars; the app uses that year as a clear marker for Rome's final defeat of Carthage.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyAncientRome",
        note: "HISTORY dates Caesar's crossing of the Rubicon to 49 BCE, when his invasion of Italy ignited the civil war that ended the Roman Republic.",
      },
    ],
  },
];
