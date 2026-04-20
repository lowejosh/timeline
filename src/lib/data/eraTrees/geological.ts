import type { EraDefinition } from "../timelineTypes";
import { yearsAgo } from "../timelineDateBuilders";

function chartRef(note?: string): EraDefinition["sourceRefs"] {
  return note
    ? [{ sourceId: "icsChart2024", note }]
    : [{ sourceId: "icsChart2024" }];
}

function chartAndGuideRefs(
  guideNote: string,
  chartNote?: string,
): EraDefinition["sourceRefs"] {
  return [
    ...(chartRef(chartNote) ?? []),
    { sourceId: "ucmpGeologicTimeScaleGuide", note: guideNote },
  ];
}

function icsColor(red: number, green: number, blue: number): string {
  return `rgb(${red}, ${green}, ${blue})`;
}

function icsHex(hex: string): string {
  const normalized = hex.replace(/^#/, "");

  if (normalized.length !== 6) {
    throw new Error(`Invalid ICS hex color: ${hex}`);
  }

  return icsColor(
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  );
}

const CAMBRIAN_SERIES: EraDefinition[] = [
  {
    id: "terreneuvian",
    name: "Terreneuvian",
    startYear: yearsAgo(538_800_000),
    endYear: yearsAgo(521_000_000),
    color: icsHex("#8CB06C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "cambrian-series-2",
    name: "Cambrian Series 2",
    startYear: yearsAgo(521_000_000),
    endYear: yearsAgo(506_500_000),
    color: icsHex("#99C078"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "miaolingian",
    name: "Miaolingian",
    startYear: yearsAgo(506_500_000),
    endYear: yearsAgo(497_000_000),
    color: icsHex("#A6CF86"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "furongian",
    name: "Furongian",
    startYear: yearsAgo(497_000_000),
    endYear: yearsAgo(486_850_000),
    color: icsHex("#B3E095"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const ORDOVICIAN_SERIES: EraDefinition[] = [
  {
    id: "lower-ordovician",
    name: "Lower Ordovician",
    startYear: yearsAgo(486_850_000),
    endYear: yearsAgo(471_300_000),
    color: icsHex("#1A9D6F"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-ordovician",
    name: "Middle Ordovician",
    startYear: yearsAgo(471_300_000),
    endYear: yearsAgo(458_200_000),
    color: icsHex("#4DB47E"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-ordovician",
    name: "Upper Ordovician",
    startYear: yearsAgo(458_200_000),
    endYear: yearsAgo(443_100_000),
    color: icsHex("#7FCA93"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const SILURIAN_SERIES: EraDefinition[] = [
  {
    id: "llandovery",
    name: "Llandovery",
    startYear: yearsAgo(443_100_000),
    endYear: yearsAgo(432_900_000),
    color: icsHex("#99D7B3"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "wenlock",
    name: "Wenlock",
    startYear: yearsAgo(432_900_000),
    endYear: yearsAgo(426_700_000),
    color: icsHex("#B3E1C2"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "ludlow",
    name: "Ludlow",
    startYear: yearsAgo(426_700_000),
    endYear: yearsAgo(422_700_000),
    color: icsHex("#BFE6CF"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "pridoli",
    name: "Pridoli",
    startYear: yearsAgo(422_700_000),
    endYear: yearsAgo(419_620_000),
    color: icsHex("#E6F5E1"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const DEVONIAN_SERIES: EraDefinition[] = [
  {
    id: "lower-devonian",
    name: "Lower Devonian",
    startYear: yearsAgo(419_620_000),
    endYear: yearsAgo(393_470_000),
    color: icsHex("#E5AC4D"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-devonian",
    name: "Middle Devonian",
    startYear: yearsAgo(393_470_000),
    endYear: yearsAgo(382_310_000),
    color: icsHex("#F1C868"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-devonian",
    name: "Upper Devonian",
    startYear: yearsAgo(382_310_000),
    endYear: yearsAgo(358_860_000),
    color: icsHex("#F1E19D"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const CARBONIFEROUS_SERIES: EraDefinition[] = [
  {
    id: "lower-mississippian",
    name: "Lower Mississippian",
    startYear: yearsAgo(358_860_000),
    endYear: yearsAgo(346_700_000),
    color: icsHex("#80AB6C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-mississippian",
    name: "Middle Mississippian",
    startYear: yearsAgo(346_700_000),
    endYear: yearsAgo(330_300_000),
    color: icsHex("#99B46C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-mississippian",
    name: "Upper Mississippian",
    startYear: yearsAgo(330_300_000),
    endYear: yearsAgo(323_400_000),
    color: icsHex("#B3BE6C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "lower-pennsylvanian",
    name: "Lower Pennsylvanian",
    startYear: yearsAgo(323_400_000),
    endYear: yearsAgo(315_200_000),
    color: icsHex("#8CBEB4"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-pennsylvanian",
    name: "Middle Pennsylvanian",
    startYear: yearsAgo(315_200_000),
    endYear: yearsAgo(307_000_000),
    color: icsHex("#A6C7B7"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-pennsylvanian",
    name: "Upper Pennsylvanian",
    startYear: yearsAgo(307_000_000),
    endYear: yearsAgo(298_900_000),
    color: icsHex("#BFD0BA"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const PERMIAN_SERIES: EraDefinition[] = [
  {
    id: "cisuralian",
    name: "Cisuralian",
    startYear: yearsAgo(298_900_000),
    endYear: yearsAgo(274_400_000),
    color: icsHex("#EF5845"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "guadalupian",
    name: "Guadalupian",
    startYear: yearsAgo(274_400_000),
    endYear: yearsAgo(259_510_000),
    color: icsHex("#FB745C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "lopingian",
    name: "Lopingian",
    startYear: yearsAgo(259_510_000),
    endYear: yearsAgo(251_902_000),
    color: icsHex("#FBA794"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const TRIASSIC_SERIES: EraDefinition[] = [
  {
    id: "lower-triassic",
    name: "Lower Triassic",
    startYear: yearsAgo(251_902_000),
    endYear: yearsAgo(246_700_000),
    color: icsHex("#983999"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-triassic",
    name: "Middle Triassic",
    startYear: yearsAgo(246_700_000),
    endYear: yearsAgo(237_000_000),
    color: icsHex("#B168B1"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-triassic",
    name: "Upper Triassic",
    startYear: yearsAgo(237_000_000),
    endYear: yearsAgo(201_400_000),
    color: icsHex("#BD8CC3"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const JURASSIC_SERIES: EraDefinition[] = [
  {
    id: "lower-jurassic",
    name: "Lower Jurassic",
    startYear: yearsAgo(201_400_000),
    endYear: yearsAgo(174_700_000),
    color: icsHex("#42AED0"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-jurassic",
    name: "Middle Jurassic",
    startYear: yearsAgo(174_700_000),
    endYear: yearsAgo(161_500_000),
    color: icsHex("#80CFD8"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-jurassic",
    name: "Upper Jurassic",
    startYear: yearsAgo(161_500_000),
    endYear: yearsAgo(143_100_000),
    color: icsHex("#B3E3EE"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const CRETACEOUS_SERIES: EraDefinition[] = [
  {
    id: "lower-cretaceous",
    name: "Lower Cretaceous",
    startYear: yearsAgo(143_100_000),
    endYear: yearsAgo(100_500_000),
    color: icsHex("#8CCD57"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-cretaceous",
    name: "Upper Cretaceous",
    startYear: yearsAgo(100_500_000),
    endYear: yearsAgo(66_000_000),
    color: icsHex("#A6D84A"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const PALEOGENE_SERIES: EraDefinition[] = [
  {
    id: "paleocene",
    name: "Paleocene",
    startYear: yearsAgo(66_000_000),
    endYear: yearsAgo(56_000_000),
    color: icsHex("#FDA75F"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "eocene",
    name: "Eocene",
    startYear: yearsAgo(56_000_000),
    endYear: yearsAgo(33_900_000),
    color: icsHex("#FDB46C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "oligocene",
    name: "Oligocene",
    startYear: yearsAgo(33_900_000),
    endYear: yearsAgo(23_040_000),
    color: icsHex("#FEC07A"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const NEOGENE_SERIES: EraDefinition[] = [
  {
    id: "miocene",
    name: "Miocene",
    startYear: yearsAgo(23_040_000),
    endYear: yearsAgo(5_333_000),
    color: icsHex("#FFFF00"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "pliocene",
    name: "Pliocene",
    startYear: yearsAgo(5_333_000),
    endYear: yearsAgo(2_580_000),
    color: icsHex("#FFFF99"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const QUATERNARY_SERIES: EraDefinition[] = [
  {
    id: "pleistocene",
    name: "Pleistocene",
    startYear: yearsAgo(2_580_000),
    endYear: yearsAgo(11_700),
    color: icsHex("#FFEFAF"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "holocene",
    name: "Holocene",
    startYear: yearsAgo(11_700),
    endYear: yearsAgo(0),
    color: icsHex("#FEEBD2"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const PROTEROZOIC_SUBDIVISIONS: EraDefinition[] = [
  {
    id: "siderian",
    name: "Siderian",
    startYear: yearsAgo(2_500_000_000),
    endYear: yearsAgo(2_300_000_000),
    color: icsColor(247, 79, 124),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "rhyacian",
    name: "Rhyacian",
    startYear: yearsAgo(2_300_000_000),
    endYear: yearsAgo(2_050_000_000),
    color: icsColor(247, 91, 137),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "orosirian",
    name: "Orosirian",
    startYear: yearsAgo(2_050_000_000),
    endYear: yearsAgo(1_800_000_000),
    color: icsColor(247, 104, 152),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "statherian",
    name: "Statherian",
    startYear: yearsAgo(1_800_000_000),
    endYear: yearsAgo(1_600_000_000),
    color: icsColor(248, 117, 167),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "calymmian",
    name: "Calymmian",
    startYear: yearsAgo(1_600_000_000),
    endYear: yearsAgo(1_400_000_000),
    color: icsColor(253, 192, 122),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "ectasian",
    name: "Ectasian",
    startYear: yearsAgo(1_400_000_000),
    endYear: yearsAgo(1_200_000_000),
    color: icsColor(253, 204, 138),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "stenian",
    name: "Stenian",
    startYear: yearsAgo(1_200_000_000),
    endYear: yearsAgo(1_000_000_000),
    color: icsColor(254, 217, 154),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "tonian",
    name: "Tonian",
    startYear: yearsAgo(1_000_000_000),
    endYear: yearsAgo(720_000_000),
    color: icsColor(254, 191, 78),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "cryogenian",
    name: "Cryogenian",
    startYear: yearsAgo(720_000_000),
    endYear: yearsAgo(635_000_000),
    color: icsColor(254, 204, 92),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "ediacaran",
    name: "Ediacaran",
    startYear: yearsAgo(635_000_000),
    endYear: yearsAgo(538_800_000),
    color: icsColor(254, 217, 106),
    description:
      "Soft-bodied animals, colonial algae, and early sponges become conspicuous as multicellular life expands.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP's geologic time-scale guide describes the late Proterozoic as the interval when multicelled organisms, colonial algae, sponges, and soft-bodied invertebrates appear.",
    ),
  },
];

const PALEOZOIC_SYSTEMS: EraDefinition[] = [
  {
    id: "cambrian",
    name: "Cambrian",
    startYear: yearsAgo(538_800_000),
    endYear: yearsAgo(486_850_000),
    color: icsColor(127, 160, 86),
    description:
      "Major animal groups rise in the seas, with trilobites abundant and no terrestrial life yet known.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP summarizes the Cambrian as the rise of all major animal groups, abundant metazoan life in the seas, trilobite dominance, and no known terrestrial life.",
    ),
    children: CAMBRIAN_SERIES,
  },
  {
    id: "ordovician",
    name: "Ordovician",
    startYear: yearsAgo(486_850_000),
    endYear: yearsAgo(443_100_000),
    color: icsColor(0, 146, 112),
    description:
      "Marine life diversifies strongly while the first land plants, primitive fungi, and seaweeds appear.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP's guide characterizes the Ordovician by extensive marine diversification together with the first land plants, primitive fungi, and seaweeds.",
    ),
    children: ORDOVICIAN_SERIES,
  },
  {
    id: "silurian",
    name: "Silurian",
    startYear: yearsAgo(443_100_000),
    endYear: yearsAgo(419_620_000),
    color: icsColor(179, 225, 182),
    description:
      "Large reefs, jawed fish, vascular plants, and some of the first land arthropods appear.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP highlights the Silurian for large reef development, jawed fish, vascular plants, and some of the earliest evidence of spiders, scorpions, centipedes, and related arthropods on land.",
    ),
    children: SILURIAN_SERIES,
  },
  {
    id: "devonian",
    name: "Devonian",
    startYear: yearsAgo(419_620_000),
    endYear: yearsAgo(358_860_000),
    color: icsColor(203, 140, 55),
    description:
      "Fishes radiate dramatically as the first amphibians, forests, and many land plants spread.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP summarizes the Devonian as the interval when fish radiate strongly and the first amphibians, horsetails, ferns, and forests appear.",
    ),
    children: DEVONIAN_SERIES,
  },
  {
    id: "carboniferous",
    name: "Carboniferous",
    startYear: yearsAgo(358_860_000),
    endYear: yearsAgo(298_900_000),
    color: icsColor(103, 165, 153),
    description:
      "Coal-swamp forests spread while many seas teem with crinoids and bryozoans and the first reptiles appear.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP's guide describes the Carboniferous as a coal-swamp world with crinoids and bryozoans common in the seas, abundant winged insects, and the first reptiles appearing.",
    ),
    children: CARBONIFEROUS_SERIES,
  },
  {
    id: "permian",
    name: "Permian",
    startYear: yearsAgo(298_900_000),
    endYear: yearsAgo(251_902_000),
    color: icsColor(240, 64, 40),
    description:
      "Gymnosperms and amphibians dominate many landscapes before the period ends in catastrophic extinction.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP characterizes the Permian by gymnosperms, amphibians, and expanding insect groups, ending with the largest extinction of the Phanerozoic.",
    ),
    children: PERMIAN_SERIES,
  },
];

const MESOZOIC_SYSTEMS: EraDefinition[] = [
  {
    id: "triassic",
    name: "Triassic",
    startYear: yearsAgo(251_902_000),
    endYear: yearsAgo(201_400_000),
    color: icsColor(129, 43, 146),
    description:
      "Reptiles diversify after the great dying, with the first mammals, dinosaurs, and true flies appearing.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP's guide describes the Triassic as the interval of the first mammals, dinosaurs, and true flies after end-Permian recovery.",
    ),
    children: TRIASSIC_SERIES,
  },
  {
    id: "jurassic",
    name: "Jurassic",
    startYear: yearsAgo(201_400_000),
    endYear: yearsAgo(143_100_000),
    color: icsColor(52, 178, 201),
    description:
      "Dinosaurs and gymnosperms dominate while birds and many marine reptiles appear.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP summarizes the Jurassic as a dinosaur- and gymnosperm-dominated world in which birds, marine reptiles, ammonites, and belemnites are prominent.",
    ),
    children: JURASSIC_SERIES,
  },
  {
    id: "cretaceous",
    name: "Cretaceous",
    startYear: yearsAgo(143_100_000),
    endYear: yearsAgo(66_000_000),
    color: icsColor(127, 198, 78),
    description:
      "Flowering plants spread widely while dinosaurs remain dominant until the end-Cretaceous extinction.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP's guide characterizes the Cretaceous by dinosaurs, marine reptiles, ammonites, and the rise of flowering plants before the period's terminal extinction.",
    ),
    children: CRETACEOUS_SERIES,
  },
];

const CENOZOIC_PERIODS: EraDefinition[] = [
  {
    id: "paleogene",
    name: "Paleogene",
    startYear: yearsAgo(66_000_000),
    endYear: yearsAgo(23_040_000),
    color: icsColor(253, 154, 82),
    description:
      "Early placental mammals diversify rapidly as primates, modern birds, whales, and grasses appear.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP's Paleocene, Eocene, and Oligocene summaries together describe the Paleogene as a time of early placental-mammal diversification, first primates and modern birds, primitive whales, grasses, and increasingly modern mammal faunas.",
    ),
    children: PALEOGENE_SERIES,
  },
  {
    id: "neogene",
    name: "Neogene",
    startYear: yearsAgo(23_040_000),
    endYear: yearsAgo(2_580_000),
    color: icsColor(255, 230, 25),
    description:
      "Grasslands spread, many modern mammal groups flourish, and the first hominids appear.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP's Miocene and Pliocene summaries describe the Neogene as an interval of expanding grasslands, diverse modern mammals, and the first hominids.",
    ),
    children: NEOGENE_SERIES,
  },
  {
    id: "quaternary",
    name: "Quaternary",
    startYear: yearsAgo(2_580_000),
    endYear: yearsAgo(0),
    color: icsColor(249, 249, 127),
    description:
      "Modern humans appear, repeated glaciations reshape ecosystems, and agriculture and civilization rise late in the period.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP's Pleistocene and Holocene summaries describe the Quaternary as the age of modern humans, major glaciations, and eventually agriculture and civilization.",
    ),
    children: QUATERNARY_SERIES,
  },
];

export const GEOLOGICAL_ERA_DEFINITIONS: EraDefinition[] = [
  {
    id: "hadean",
    name: "Hadean",
    startYear: yearsAgo(4_567_000_000),
    endYear: yearsAgo(4_000_000_000),
    color: icsColor(174, 2, 126),
    description:
      "Earth's crust cools and solidifies, but no life is yet known from this interval.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP's guide describes the Hadean as the interval when Earth's crust cooled and solidified and no life is known.",
    ),
  },
  {
    id: "archean",
    name: "Archean",
    startYear: yearsAgo(4_000_000_000),
    endYear: yearsAgo(2_500_000_000),
    color: icsColor(240, 4, 127),
    description:
      "Earth's earliest known life appears, largely microbial, while photosynthesis begins the long oxygenation of the atmosphere.",
    scheme: "chronostratigraphic",
    sourceRefs: chartAndGuideRefs(
      "UCMP's guide characterizes the Archean as the time of earliest anaerobic prokaryotic life and the beginning of oxygen rise through photosynthetic organisms.",
    ),
  },
  ...PROTEROZOIC_SUBDIVISIONS,
  ...PALEOZOIC_SYSTEMS,
  ...MESOZOIC_SYSTEMS,
  ...CENOZOIC_PERIODS,
];
