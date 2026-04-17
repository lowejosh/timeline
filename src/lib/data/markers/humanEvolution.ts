import type { TimelineMarker } from "../timelineTypes";
import { yearsAgo } from "../timelineDateBuilders";

export const HUMAN_EVOLUTION_MARKERS: TimelineMarker[] = [
  {
    id: "earliest-likely-bipedal-hominins-appear",
    label: "Earliest likely bipedal hominins appear",
    shortLabel: "Early Bipeds",
    year: yearsAgo(7_000_000),
    regionalScopeLabel: "Africa",
    approximate: true,
    minZoom: 10,
    priority: 92,
    description:
      "Some of the oldest candidate hominins already show anatomy linked to upright posture.",
    sourceRefs: [
      {
        sourceId: "smithsonianSahelanthropus",
        note: "The Smithsonian dates Sahelanthropus tchadensis to about 7 to 6 million years ago and treats it as one of the oldest known hominins with evidence linked to upright posture.",
      },
      {
        sourceId: "smithsonianHumanEvolutionIntro",
        note: "The Smithsonian introduction says one of the earliest defining human traits, bipedalism, evolved over 4 million years ago; this earlier marker keeps the oldest candidate hominins visible without flattening the debates into a single answer.",
      },
    ],
  },
  {
    id: "early-bipedal-femur-evidence-in-kenya",
    label: "Early bipedal femur evidence appears in Kenya",
    shortLabel: "Orrorin Femur",
    year: yearsAgo(6_000_000),
    regionalScopeLabel: "Eastern Africa",
    approximate: true,
    minZoom: 10,
    priority: 91,
    description:
      "Orrorin femora preserve one of the clearest early skeletal signals of upright walking.",
    sourceRefs: [
      {
        sourceId: "smithsonianOrrorin",
        note: "The Smithsonian dates Orrorin tugenensis to about 6.2 to 5.8 million years ago and highlights femora showing evidence typical of a biped.",
      },
    ],
  },
  {
    id: "earliest-stone-tools-associated-with-early-homo",
    label: "Earliest stone tools are associated with early Homo",
    shortLabel: "Earliest Stone Tools",
    year: yearsAgo(2_600_000),
    regionalScopeLabel: "Eastern Africa",
    approximate: true,
    minZoom: 11,
    priority: 89,
    description:
      "Cut-marked bones and the oldest stone tools cluster around the rise of early Homo.",
    sourceRefs: [
      {
        sourceId: "smithsonianHomoHabilis",
        note: "The Smithsonian's Homo habilis page says some of the earliest cut- and percussion-marked bones and the first stone tools date back to about 2.6 million years ago.",
      },
    ],
  },
  {
    id: "genus-homo-emerges",
    label: "Genus Homo emerges",
    shortLabel: "Genus Homo",
    year: yearsAgo(2_400_000),
    regionalScopeLabel: "Eastern and Southern Africa",
    approximate: true,
    minZoom: 11,
    priority: 88,
    description:
      "Early Homo enters the record with larger brains, altered faces, and a more flexible ecological niche.",
    sourceRefs: [
      {
        sourceId: "smithsonianHomoHabilis",
        note: "The Smithsonian dates Homo habilis to 2.4 million to 1.4 million years ago and describes it as one of the earliest members of the genus Homo.",
      },
    ],
  },
  {
    id: "early-humans-expand-beyond-africa",
    label: "Early humans expand beyond Africa",
    shortLabel: "Out of Africa",
    year: yearsAgo(1_900_000),
    regionalScopeLabel: "Africa into Asia",
    approximate: true,
    minZoom: 12,
    priority: 87,
    description:
      "The first major dispersal carries early humans out of Africa and into Asia.",
    sourceRefs: [
      {
        sourceId: "smithsonianHumanEvolutionIntro",
        note: "The Smithsonian introduction says early humans first migrated out of Africa into Asia probably between 2 million and 1.8 million years ago.",
      },
      {
        sourceId: "smithsonianHomoErectus",
        note: "The Smithsonian's Homo erectus page treats this species as the first to expand beyond Africa.",
      },
    ],
  },
  {
    id: "acheulean-handaxes-appear",
    label: "Acheulean handaxes appear",
    shortLabel: "Acheulean Tools",
    year: yearsAgo(1_760_000),
    regionalScopeLabel: "Africa",
    approximate: true,
    minZoom: 12,
    priority: 86,
    description:
      "Large cutting tools mark the first major leap in stone-tool design.",
    sourceRefs: [
      {
        sourceId: "smithsonianHomoErectus",
        note: "The Smithsonian's Homo erectus page says the Acheulean industry appears by about 1.76 million years ago.",
      },
    ],
  },
  {
    id: "hearths-and-fireplaces-appear-in-heidelbergensis-era",
    label: "Hearths and fireplaces appear in the Homo heidelbergensis era",
    shortLabel: "Early Hearths",
    year: yearsAgo(790_000),
    regionalScopeLabel: "Southwest Asia",
    approximate: true,
    minZoom: 13,
    priority: 84,
    description:
      "Fire becomes a more visible part of human shelter, warmth, and social life.",
    sourceRefs: [
      {
        sourceId: "smithsonianHomoHeidelbergensis",
        note: "The Smithsonian says Homo heidelbergensis was capable of controlling fire by 790,000 years ago at Gesher Benot Ya'aqov in Israel.",
      },
    ],
  },
  {
    id: "neanderthal-and-modern-human-lineages-diverge",
    label: "Neanderthal and modern-human lineages diverge",
    shortLabel: "Lineages Diverge",
    year: yearsAgo(400_000),
    regionalScopeLabel: "Africa and Eurasia",
    approximate: true,
    minZoom: 13,
    priority: 83,
    description:
      "The branches leading to Neanderthals and Homo sapiens split apart in the Middle Pleistocene.",
    sourceRefs: [
      {
        sourceId: "smithsonianHomoHeidelbergensis",
        note: "The Smithsonian says Neanderthal and modern-human DNA imply divergence from a common ancestor, most likely Homo heidelbergensis, between 350,000 and 400,000 years ago.",
      },
    ],
  },
  {
    id: "last-known-homo-floresiensis-survives-on-flores",
    label: "Last known Homo floresiensis survives on Flores",
    shortLabel: "Late H. floresiensis",
    year: yearsAgo(50_000),
    regionalScopeLabel: "Flores, Indonesia",
    approximate: true,
    minZoom: 14,
    priority: 82,
    description:
      "A tiny island-dwelling human lineage lingers surprisingly late in Southeast Asia.",
    sourceRefs: [
      {
        sourceId: "smithsonianHomoFloresiensis",
        note: "The Smithsonian summarizes Homo floresiensis as living about 100,000 to 50,000 years ago, making it one of the last surviving cousin species.",
      },
    ],
  },
  {
    id: "last-neanderthals-disappear",
    label: "Last Neanderthals disappear",
    shortLabel: "Last Neanderthals",
    year: yearsAgo(40_000),
    regionalScopeLabel: "Western Europe and Southwest Asia",
    approximate: true,
    minZoom: 14,
    priority: 81,
    description:
      "The last surviving Neanderthal populations vanish, leaving Homo sapiens alone.",
    sourceRefs: [
      {
        sourceId: "smithsonianHomoNeanderthalensis",
        note: "The Smithsonian says all traces of Neanderthals disappear by about 40,000 years ago.",
      },
    ],
  },
];
