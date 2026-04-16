import type { EraDefinition } from "../timelineTypes";

function chartRef(note?: string): EraDefinition["sourceRefs"] {
  return note
    ? [{ sourceId: "icsChart2024", note }]
    : [{ sourceId: "icsChart2024" }];
}

function icsColor(red: number, green: number, blue: number): string {
  return `rgb(${red}, ${green}, ${blue})`;
}

const QUATERNARY_TRUNCATION_NOTE =
  "The formal Quaternary continues to the present; the rendered band is clipped where the app hands off to the visible human-history eras.";

const PROTEROZOIC_SUBDIVISIONS: EraDefinition[] = [
  {
    id: "siderian",
    name: "Siderian",
    startYear: -2_500_000_000,
    endYear: -2_300_000_000,
    color: icsColor(247, 79, 124),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "rhyacian",
    name: "Rhyacian",
    startYear: -2_300_000_000,
    endYear: -2_050_000_000,
    color: icsColor(247, 91, 137),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "orosirian",
    name: "Orosirian",
    startYear: -2_050_000_000,
    endYear: -1_800_000_000,
    color: icsColor(247, 104, 152),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "statherian",
    name: "Statherian",
    startYear: -1_800_000_000,
    endYear: -1_600_000_000,
    color: icsColor(248, 117, 167),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "calymmian",
    name: "Calymmian",
    startYear: -1_600_000_000,
    endYear: -1_400_000_000,
    color: icsColor(253, 192, 122),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "ectasian",
    name: "Ectasian",
    startYear: -1_400_000_000,
    endYear: -1_200_000_000,
    color: icsColor(253, 204, 138),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "stenian",
    name: "Stenian",
    startYear: -1_200_000_000,
    endYear: -1_000_000_000,
    color: icsColor(254, 217, 154),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "tonian",
    name: "Tonian",
    startYear: -1_000_000_000,
    endYear: -720_000_000,
    color: icsColor(254, 191, 78),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "cryogenian",
    name: "Cryogenian",
    startYear: -720_000_000,
    endYear: -635_000_000,
    color: icsColor(254, 204, 92),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "ediacaran",
    name: "Ediacaran",
    startYear: -635_000_000,
    endYear: -538_800_000,
    color: icsColor(254, 217, 106),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const PALEOZOIC_SYSTEMS: EraDefinition[] = [
  {
    id: "cambrian",
    name: "Cambrian",
    startYear: -538_800_000,
    endYear: -485_400_000,
    color: icsColor(127, 160, 86),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "ordovician",
    name: "Ordovician",
    startYear: -485_400_000,
    endYear: -443_100_000,
    color: icsColor(0, 146, 112),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "silurian",
    name: "Silurian",
    startYear: -443_100_000,
    endYear: -419_620_000,
    color: icsColor(179, 225, 182),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "devonian",
    name: "Devonian",
    startYear: -419_620_000,
    endYear: -358_860_000,
    color: icsColor(203, 140, 55),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "carboniferous",
    name: "Carboniferous",
    startYear: -358_860_000,
    endYear: -298_900_000,
    color: icsColor(103, 165, 153),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "permian",
    name: "Permian",
    startYear: -298_900_000,
    endYear: -251_902_000,
    color: icsColor(240, 64, 40),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const MESOZOIC_SYSTEMS: EraDefinition[] = [
  {
    id: "triassic",
    name: "Triassic",
    startYear: -251_902_000,
    endYear: -201_400_000,
    color: icsColor(129, 43, 146),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "jurassic",
    name: "Jurassic",
    startYear: -201_400_000,
    endYear: -143_100_000,
    color: icsColor(52, 178, 201),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "cretaceous",
    name: "Cretaceous",
    startYear: -143_100_000,
    endYear: -66_000_000,
    color: icsColor(127, 198, 78),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const CENOZOIC_PERIODS: EraDefinition[] = [
  {
    id: "paleogene",
    name: "Paleogene",
    startYear: -66_000_000,
    endYear: -23_040_000,
    color: icsColor(253, 154, 82),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "neogene",
    name: "Neogene",
    startYear: -23_040_000,
    endYear: -2_580_000,
    color: icsColor(255, 230, 25),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "quaternary",
    name: "Quaternary",
    startYear: -2_580_000,
    endYear: -300_000,
    timeLabel: "2.58M years ago — present",
    color: icsColor(249, 249, 127),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(QUATERNARY_TRUNCATION_NOTE),
  },
];

export const GEOLOGICAL_ERA_DEFINITIONS: EraDefinition[] = [
  {
    id: "hadean",
    name: "Hadean",
    startYear: -4_567_000_000,
    endYear: -4_000_000_000,
    color: icsColor(174, 2, 126),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "archean",
    name: "Archean",
    startYear: -4_000_000_000,
    endYear: -2_500_000_000,
    color: icsColor(240, 4, 127),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  ...PROTEROZOIC_SUBDIVISIONS,
  ...PALEOZOIC_SYSTEMS,
  ...MESOZOIC_SYSTEMS,
  ...CENOZOIC_PERIODS,
];