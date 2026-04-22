export const CIVILIZATION_LANE_GROUPS = {
  nearEast: "near-east",
  mediterranean: "mediterranean",
  iranianWorld: "iranian-world",
  southAsia: "south-asia",
  eastAsia: "east-asia",
  northeastAfrica: "northeast-africa",
  westAfrica: "west-africa",
  southeastAsia: "southeast-asia",
  mesoamerica: "mesoamerica",
  andes: "andes",
  centralEurope: "central-europe",
  steppe: "steppe",
} as const;

export type CivilizationLaneGroupId =
  (typeof CIVILIZATION_LANE_GROUPS)[keyof typeof CIVILIZATION_LANE_GROUPS];

export const CIVILIZATION_LANE_AFFINITIES = {
  greek: "greek-continuity",
  roman: "roman-continuity",
  iranianImperial: "iranian-imperial-continuity",
  chineseImperial: "chinese-imperial-continuity",
  northIndianImperial: "north-indian-imperial-continuity",
} as const;

export type CivilizationLaneAffinityId =
  (typeof CIVILIZATION_LANE_AFFINITIES)[keyof typeof CIVILIZATION_LANE_AFFINITIES];
