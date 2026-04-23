import type { EraDefinition } from "../../core/timelineTypes";
import { bce, ce } from "../timelineDateBuilders";
import { TIMELINE_MAX_YEAR } from "../../core/timelineYears";

const ANCIENT_WORLD_CHILDREN: EraDefinition[] = [
  {
    id: "physics-early-astronomical-traditions",
    name: "Early Astronomical Traditions",
    startYear: bce(2_000),
    endYear: bce(600),
    approximateStart: true,
    approximateEnd: true,
    description:
      "Babylonian records, Egyptian surveying, and early calendar astronomy turn repeated sky watching into usable knowledge.",
    scheme: "history-of-science",
    sourceIds: ["physicsOfUniverseDates"],
  },
  {
    id: "physics-greek-natural-philosophy",
    name: "Greek Natural Philosophy",
    startYear: bce(600),
    endYear: bce(300),
    approximateStart: true,
    approximateEnd: true,
    description:
      "Greek thinkers frame matter, motion, causation, and geometry as problems that can be argued in general principles.",
    scheme: "history-of-science",
    sourceIds: ["physicsOfUniverseDates"],
  },
  {
    id: "physics-hellenistic-and-roman-science",
    name: "Hellenistic and Roman Science",
    startYear: bce(300),
    endYear: ce(500),
    approximateStart: true,
    approximateEnd: true,
    description:
      "Archimedes, Ptolemy, and later commentators push mathematical astronomy, mechanics, and measurement further.",
    scheme: "history-of-science",
    sourceIds: ["physicsOfUniverseDates"],
  },
];

const MEDIEVAL_WORLD_CHILDREN: EraDefinition[] = [
  {
    id: "physics-late-antique-and-early-medieval-inheritance",
    name: "Late Antique and Early Medieval Inheritance",
    startYear: ce(500),
    endYear: ce(750),
    approximateStart: true,
    approximateEnd: true,
    description:
      "Scholars preserve and transmit mathematical astronomy and natural philosophy across Greek, Persian, Indian, and Syriac traditions.",
    scheme: "history-of-science",
    sourceIds: ["physicsOfUniverseDates"],
  },
  {
    id: "physics-islamic-golden-age",
    name: "Islamic Golden Age",
    startYear: ce(750),
    endYear: ce(1258),
    approximateStart: true,
    approximateEnd: true,
    description:
      "Arabic-language scholarship in optics, astronomy, and mechanics sharpens observation, calculation, and critique.",
    scheme: "history-of-science",
    sourceIds: ["khanGoldenAgeOfIslam"],
  },
  {
    id: "physics-late-medieval-and-renaissance-transition",
    name: "Late Medieval and Renaissance Transition",
    startYear: ce(1258),
    endYear: ce(1600),
    approximateStart: true,
    approximateEnd: true,
    description:
      "University natural philosophy, improved instruments, and new astronomy set up the break from inherited cosmology.",
    scheme: "history-of-science",
    sourceIds: ["physicsOfUniverseDates"],
  },
];

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
    children: ANCIENT_WORLD_CHILDREN,
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
    children: MEDIEVAL_WORLD_CHILDREN,
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
