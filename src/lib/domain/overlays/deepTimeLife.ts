import type { TimelineOverlayBand } from "../../core/timelineTypes";
import { yearsAgo } from "../timelineDateBuilders";

export const DEEP_TIME_LIFE_OVERLAYS: TimelineOverlayBand[] = [
  {
    id: "cambrian-explosion",
    label: "Cambrian explosion",
    shortLabel: "Cambrian Explosion",
    description:
      "A rapid burst of marine evolution in which most major animal lineages first appear in the fossil record, many with striking new body plans.",
    startYear: yearsAgo(570_000_000),
    endYear: yearsAgo(530_000_000),
    color: "rgb(82, 136, 138)",
    minZoom: 0,
    priority: 86,
    sourceIds: ["berkeleyCambrianExplosion"],
  },
  {
    id: "cambrian-substrate-revolution",
    label: "Cambrian Substrate Revolution",
    shortLabel: "Substrate Revolution",
    description:
      "Shallow seafloors shifted from firm microbial-mat surfaces toward increasingly burrowed, mixed sediments, transforming how benthic animals moved, fed, and survived.",
    startYear: yearsAgo(600_000_000),
    endYear: yearsAgo(500_000_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(98, 138, 126)",
    minZoom: 0,
    priority: 87,
    sourceIds: [
      "gsaCambrianSubstrateRevolution",
      "nhmLateEdiacaranTracks"
    ],
  },
  {
    id: "great-ordovician-biodiversification-event",
    label: "Great Ordovician Biodiversification Event",
    shortLabel: "GOBE",
    description:
      "During the second half of the Ordovician, marine communities diversified dramatically as brachiopods, crinoids, graptolites, and other groups reshaped ocean ecosystems that would persist through the Paleozoic.",
    startYear: yearsAgo(470_000_000),
    endYear: yearsAgo(445_000_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(92, 129, 104)",
    minZoom: 0,
    priority: 87,
    sourceIds: [
      "gsaOrdovicianBiodiversificationEvent",
      "samNobleOrdovicianCommunities"
    ],
  },
  {
    id: "age-of-invertebrates",
    label: "Age of Invertebrates",
    shortLabel: "Invertebrates",
    description:
      "Shell-forming sea animals, crinoids, and giant sea scorpions flourished as reefs and fishes expanded.",
    startYear: yearsAgo(443_100_000),
    endYear: yearsAgo(419_620_000),
    color: "rgb(76, 138, 132)",
    minZoom: 0,
    priority: 86,
    sourceIds: ["gutenbergHistoricalGeologyMiller1922"],
  },
  {
    id: "age-of-fishes",
    label: "Age of Fishes",
    shortLabel: "Fishes",
    description:
      "Fishes spread through the seas while early amphibians and land plants gained ground.",
    startYear: yearsAgo(419_620_000),
    endYear: yearsAgo(358_860_000),
    color: "rgb(79, 124, 156)",
    minZoom: 0,
    priority: 87,
    sourceIds: ["gutenbergHistoricalGeologyMiller1922"],
  },
  {
    id: "devonian-nekton-revolution",
    label: "Devonian Nekton Revolution",
    shortLabel: "Nekton Revolution",
    description:
      "Marine animals increasingly occupied the open water column as fish, ammonoids, and other fully swimming forms became a larger part of ocean ecosystems.",
    startYear: yearsAgo(419_000_000),
    endYear: yearsAgo(359_000_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(86, 126, 148)",
    minZoom: 0,
    priority: 87,
    sourceIds: [
      "umdMacroecologyNektonRevolution",
      "royalSocietyPalaeozoicWaterColumn"
    ],
  },
  {
    id: "age-of-amphibians",
    label: "Age of Amphibians",
    shortLabel: "Amphibians",
    description:
      "Coal-swamp forests thrived and amphibians dominated many wet lowlands as early reptiles appeared.",
    startYear: yearsAgo(358_860_000),
    endYear: yearsAgo(251_902_000),
    color: "rgb(108, 132, 88)",
    minZoom: 0,
    priority: 87,
    sourceIds: ["gutenbergHistoricalGeologyMiller1922"],
  },
  {
    id: "carboniferous-rainforest-collapse",
    label: "Carboniferous Rainforest Collapse",
    shortLabel: "Rainforest Collapse",
    description:
      "A late-Carboniferous environmental shift fragmented humid coal-forest habitats, drove plant losses, and reduced many amphibian-rich tetrapod communities as drier ecosystems spread.",
    startYear: yearsAgo(307_000_000),
    endYear: yearsAgo(299_000_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(108, 120, 78)",
    minZoom: 0,
    priority: 87,
    sourceIds: [
      "birminghamCarboniferousCurios",
      "nhmCarboniferousRainforestCollapse",
      "icsChart2024"
    ],
  },
  {
    id: "mesozoic-marine-revolution",
    label: "Mesozoic Marine Revolution",
    shortLabel: "Marine Revolution",
    description:
      "A gradual predator-prey arms race reshaped marine ecosystems as shell-crushing and drilling predators spread, pushing prey toward thicker armor, burrowing, and greater mobility.",
    startYear: yearsAgo(252_000_000),
    endYear: yearsAgo(66_000_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(88, 118, 144)",
    minZoom: 0,
    priority: 87,
    sourceIds: ["frontiersTriassicRevolution"],
  },
  {
    id: "age-of-reptiles",
    label: "Age of Reptiles",
    shortLabel: "Reptiles",
    description:
      "Dinosaurs and other reptiles dominated land, sea, and air while the first birds and mammals appeared.",
    startYear: yearsAgo(251_902_000),
    endYear: yearsAgo(66_000_000),
    color: "rgb(146, 104, 74)",
    minZoom: 0,
    priority: 88,
    sourceIds: ["gutenbergHistoricalGeologyMiller1922"],
    children: [
      {
        id: "age-of-archosaurs",
        label: "Age of Archosaurs",
        shortLabel: "Archosaurs",
        description:
          "Archosaurs diversify after the end-Permian crisis and go on to dominate terrestrial vertebrate life through most of the Mesozoic.",
        startYear: yearsAgo(245_000_000),
        endYear: yearsAgo(66_000_000),
        approximateStart: true,
        color: "rgb(184, 132, 67)",
        minZoom: 0,
        priority: 89,
        sourceIds: ["ucmpArchosauriaFossilRecord"],
      },
      {
        id: "age-of-dinosaurs",
        label: "Age of Dinosaurs",
        shortLabel: "Dinosaurs",
        description:
          "Dinosaurs and other archosaurs dominated life on land through most of the Mesozoic, while early birds and mammals emerged in their shadow.",
        startYear: yearsAgo(201_400_000),
        endYear: yearsAgo(66_000_000),
        color: "rgb(105, 136, 86)",
        minZoom: 0,
        priority: 90,
        sourceIds: [
          "ucmpMesozoicLife",
          "smithsonianExtinctionOverTime",
          "icsChart2024"
        ],
      },
    ],
  },
  {
    id: "age-of-mammals",
    label: "Age of Mammals",
    shortLabel: "Mammals",
    description:
      "Mammals rose to prominence as flowering plants and increasingly modern ecosystems spread.",
    startYear: yearsAgo(66_000_000),
    endYear: yearsAgo(0),
    color: "rgb(169, 122, 92)",
    minZoom: 0,
    priority: 88,
    autoToggleRule: {
      kind: "max-visible-span",
      hideAtOrBelowYears: 10_500_000,
      onlyWhenAnyGroupVisible: ["human-evolution"],
    },
    sourceIds: ["gutenbergHistoricalGeologyMiller1922"],
  },
  {
    id: "paleocene-eocene-thermal-maximum",
    label: "Paleocene-Eocene Thermal Maximum",
    shortLabel: "PETM",
    description:
      "A rapid global warming pulse near the Paleocene-Eocene boundary raised temperatures by about 5 to 9°C and dramatically affected life on land and in the oceans.",
    startYear: yearsAgo(56_000_000),
    endYear: yearsAgo(55_800_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(164, 118, 88)",
    minZoom: 0,
    priority: 88,
    sourceIds: [
      "amnhPaleoceneEoceneThermalMaximum",
      "nhmPaleoceneEoceneThermalMaximum"
    ],
  },
];
