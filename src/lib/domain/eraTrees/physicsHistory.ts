import type { EraDefinition } from "../../core/timelineTypes";
import { bce, ce } from "../timelineDateBuilders";
import { TIMELINE_MAX_YEAR } from "../../core/timelineYears";

export const PHYSICS_HISTORY_ERA_DEFINITIONS: EraDefinition[] = [
  {
    id: "physics-ancient-world",
    name: "Ancient World Physics",
    startYear: bce(2_000),
    endYear: ce(500),
    approximateStart: true,
    approximateEnd: true,
    description:
      "Babylonian sky records, Greek natural philosophy, atomism, and the first measured models of Earth and the heavens.",
    scheme: "history-of-science",
    sourceIds: ["physicsOfUniverseDates"],
  },
  {
    id: "physics-medieval-and-renaissance-world",
    name: "Medieval and Renaissance Physics",
    startYear: ce(500),
    endYear: ce(1600),
    approximateStart: true,
    approximateEnd: true,
    description:
      "Indian, Islamic, and later European scholars refine motion, optics, and astronomy before heliocentrism breaks old cosmology.",
    scheme: "history-of-science",
    sourceIds: ["physicsOfUniverseDates"],
  },
  {
    id: "physics-early-modern-world",
    name: "Early Modern Physics",
    startYear: ce(1600),
    endYear: ce(1900),
    approximateStart: true,
    approximateEnd: true,
    description:
      "Telescope astronomy, mechanics, gravitation, electricity, thermodynamics, and electromagnetism turn physics into mathematical science.",
    scheme: "history-of-science",
    sourceIds: ["physicsOfUniverseDates"],
  },
  {
    id: "physics-modern-world",
    name: "Modern Physics",
    startYear: ce(1900),
    endYear: ce(2000),
    approximateStart: true,
    approximateEnd: true,
    description:
      "Quanta, relativity, nuclear structure, quantum mechanics, and cosmology reorder the field from first principles outward.",
    scheme: "history-of-science",
    sourceIds: ["physicsOfUniverseDates"],
  },
  {
    id: "physics-contemporary-world",
    name: "Contemporary Physics",
    startYear: ce(2000),
    endYear: TIMELINE_MAX_YEAR,
    description:
      "Particle physics, quantum information, condensed matter, precision cosmology, and gravitational-wave astronomy extend physics into the twenty-first century.",
    scheme: "history-of-science",
    sourceIds: ["timelineOfFundamentalPhysicsDiscoveriesWikipedia"],
  },
];
