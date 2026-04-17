import type { EraDefinition } from "../timelineTypes";

function chartRef(note?: string): EraDefinition["sourceRefs"] {
  return note
    ? [{ sourceId: "icsChart2024", note }]
    : [{ sourceId: "icsChart2024" }];
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

const QUATERNARY_TRUNCATION_NOTE =
  "The formal Quaternary continues to the present; the rendered band is clipped where the app hands off to the visible human-history eras.";

const PLEISTOCENE_TRUNCATION_NOTE =
  "The formal Pleistocene continues to 11.7 ka; the rendered child is clipped where the app hands off to the visible human-history eras.";

const CAMBRIAN_SERIES: EraDefinition[] = [
  {
    id: "terreneuvian",
    name: "Terreneuvian",
    startYear: -538_800_000,
    endYear: -521_000_000,
    color: icsHex("#8CB06C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "cambrian-series-2",
    name: "Cambrian Series 2",
    startYear: -521_000_000,
    endYear: -506_500_000,
    color: icsHex("#99C078"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "miaolingian",
    name: "Miaolingian",
    startYear: -506_500_000,
    endYear: -497_000_000,
    color: icsHex("#A6CF86"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "furongian",
    name: "Furongian",
    startYear: -497_000_000,
    endYear: -486_850_000,
    color: icsHex("#B3E095"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const ORDOVICIAN_SERIES: EraDefinition[] = [
  {
    id: "lower-ordovician",
    name: "Lower Ordovician",
    startYear: -486_850_000,
    endYear: -471_300_000,
    color: icsHex("#1A9D6F"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-ordovician",
    name: "Middle Ordovician",
    startYear: -471_300_000,
    endYear: -458_200_000,
    color: icsHex("#4DB47E"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-ordovician",
    name: "Upper Ordovician",
    startYear: -458_200_000,
    endYear: -443_100_000,
    color: icsHex("#7FCA93"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const SILURIAN_SERIES: EraDefinition[] = [
  {
    id: "llandovery",
    name: "Llandovery",
    startYear: -443_100_000,
    endYear: -432_900_000,
    color: icsHex("#99D7B3"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "wenlock",
    name: "Wenlock",
    startYear: -432_900_000,
    endYear: -426_700_000,
    color: icsHex("#B3E1C2"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "ludlow",
    name: "Ludlow",
    startYear: -426_700_000,
    endYear: -422_700_000,
    color: icsHex("#BFE6CF"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "pridoli",
    name: "Pridoli",
    startYear: -422_700_000,
    endYear: -419_620_000,
    color: icsHex("#E6F5E1"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const DEVONIAN_SERIES: EraDefinition[] = [
  {
    id: "lower-devonian",
    name: "Lower Devonian",
    startYear: -419_620_000,
    endYear: -393_470_000,
    color: icsHex("#E5AC4D"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-devonian",
    name: "Middle Devonian",
    startYear: -393_470_000,
    endYear: -382_310_000,
    color: icsHex("#F1C868"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-devonian",
    name: "Upper Devonian",
    startYear: -382_310_000,
    endYear: -358_860_000,
    color: icsHex("#F1E19D"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const CARBONIFEROUS_SERIES: EraDefinition[] = [
  {
    id: "lower-mississippian",
    name: "Lower Mississippian",
    startYear: -358_860_000,
    endYear: -346_700_000,
    color: icsHex("#80AB6C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-mississippian",
    name: "Middle Mississippian",
    startYear: -346_700_000,
    endYear: -330_300_000,
    color: icsHex("#99B46C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-mississippian",
    name: "Upper Mississippian",
    startYear: -330_300_000,
    endYear: -323_400_000,
    color: icsHex("#B3BE6C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "lower-pennsylvanian",
    name: "Lower Pennsylvanian",
    startYear: -323_400_000,
    endYear: -315_200_000,
    color: icsHex("#8CBEB4"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-pennsylvanian",
    name: "Middle Pennsylvanian",
    startYear: -315_200_000,
    endYear: -307_000_000,
    color: icsHex("#A6C7B7"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-pennsylvanian",
    name: "Upper Pennsylvanian",
    startYear: -307_000_000,
    endYear: -298_900_000,
    color: icsHex("#BFD0BA"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const PERMIAN_SERIES: EraDefinition[] = [
  {
    id: "cisuralian",
    name: "Cisuralian",
    startYear: -298_900_000,
    endYear: -274_400_000,
    color: icsHex("#EF5845"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "guadalupian",
    name: "Guadalupian",
    startYear: -274_400_000,
    endYear: -259_510_000,
    color: icsHex("#FB745C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "lopingian",
    name: "Lopingian",
    startYear: -259_510_000,
    endYear: -251_902_000,
    color: icsHex("#FBA794"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const TRIASSIC_SERIES: EraDefinition[] = [
  {
    id: "lower-triassic",
    name: "Lower Triassic",
    startYear: -251_902_000,
    endYear: -246_700_000,
    color: icsHex("#983999"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-triassic",
    name: "Middle Triassic",
    startYear: -246_700_000,
    endYear: -237_000_000,
    color: icsHex("#B168B1"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-triassic",
    name: "Upper Triassic",
    startYear: -237_000_000,
    endYear: -201_400_000,
    color: icsHex("#BD8CC3"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const JURASSIC_SERIES: EraDefinition[] = [
  {
    id: "lower-jurassic",
    name: "Lower Jurassic",
    startYear: -201_400_000,
    endYear: -174_700_000,
    color: icsHex("#42AED0"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "middle-jurassic",
    name: "Middle Jurassic",
    startYear: -174_700_000,
    endYear: -161_500_000,
    color: icsHex("#80CFD8"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-jurassic",
    name: "Upper Jurassic",
    startYear: -161_500_000,
    endYear: -143_100_000,
    color: icsHex("#B3E3EE"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const CRETACEOUS_SERIES: EraDefinition[] = [
  {
    id: "lower-cretaceous",
    name: "Lower Cretaceous",
    startYear: -143_100_000,
    endYear: -100_500_000,
    color: icsHex("#8CCD57"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "upper-cretaceous",
    name: "Upper Cretaceous",
    startYear: -100_500_000,
    endYear: -66_000_000,
    color: icsHex("#A6D84A"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const PALEOGENE_SERIES: EraDefinition[] = [
  {
    id: "paleocene",
    name: "Paleocene",
    startYear: -66_000_000,
    endYear: -56_000_000,
    color: icsHex("#FDA75F"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "eocene",
    name: "Eocene",
    startYear: -56_000_000,
    endYear: -33_900_000,
    color: icsHex("#FDB46C"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "oligocene",
    name: "Oligocene",
    startYear: -33_900_000,
    endYear: -23_040_000,
    color: icsHex("#FEC07A"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const NEOGENE_SERIES: EraDefinition[] = [
  {
    id: "miocene",
    name: "Miocene",
    startYear: -23_040_000,
    endYear: -5_333_000,
    color: icsHex("#FFFF00"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
  {
    id: "pliocene",
    name: "Pliocene",
    startYear: -5_333_000,
    endYear: -2_580_000,
    color: icsHex("#FFFF99"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
  },
];

const QUATERNARY_SERIES: EraDefinition[] = [
  {
    id: "pleistocene",
    name: "Pleistocene",
    startYear: -2_580_000,
    endYear: -300_000,
    color: icsHex("#FFEFAF"),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(PLEISTOCENE_TRUNCATION_NOTE),
  },
];

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
    endYear: -486_850_000,
    color: icsColor(127, 160, 86),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
    children: CAMBRIAN_SERIES,
  },
  {
    id: "ordovician",
    name: "Ordovician",
    startYear: -486_850_000,
    endYear: -443_100_000,
    color: icsColor(0, 146, 112),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
    children: ORDOVICIAN_SERIES,
  },
  {
    id: "silurian",
    name: "Silurian",
    startYear: -443_100_000,
    endYear: -419_620_000,
    color: icsColor(179, 225, 182),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
    children: SILURIAN_SERIES,
  },
  {
    id: "devonian",
    name: "Devonian",
    startYear: -419_620_000,
    endYear: -358_860_000,
    color: icsColor(203, 140, 55),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
    children: DEVONIAN_SERIES,
  },
  {
    id: "carboniferous",
    name: "Carboniferous",
    startYear: -358_860_000,
    endYear: -298_900_000,
    color: icsColor(103, 165, 153),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
    children: CARBONIFEROUS_SERIES,
  },
  {
    id: "permian",
    name: "Permian",
    startYear: -298_900_000,
    endYear: -251_902_000,
    color: icsColor(240, 64, 40),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
    children: PERMIAN_SERIES,
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
    children: TRIASSIC_SERIES,
  },
  {
    id: "jurassic",
    name: "Jurassic",
    startYear: -201_400_000,
    endYear: -143_100_000,
    color: icsColor(52, 178, 201),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
    children: JURASSIC_SERIES,
  },
  {
    id: "cretaceous",
    name: "Cretaceous",
    startYear: -143_100_000,
    endYear: -66_000_000,
    color: icsColor(127, 198, 78),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
    children: CRETACEOUS_SERIES,
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
    children: PALEOGENE_SERIES,
  },
  {
    id: "neogene",
    name: "Neogene",
    startYear: -23_040_000,
    endYear: -2_580_000,
    color: icsColor(255, 230, 25),
    scheme: "chronostratigraphic",
    sourceRefs: chartRef(),
    children: NEOGENE_SERIES,
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
    children: QUATERNARY_SERIES,
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