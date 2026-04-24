import type { TimelineOverlayBand } from "@/lib/core/timelineTypes";
import { bce, ce } from "@/lib/core/timelineDateBuilders";
import { TIMELINE_MAX_YEAR } from "@/lib/core/timelineYears";

export const PHYSICS_CONTEXT_OVERLAYS: TimelineOverlayBand[] = [
  {
    id: "physics-context-greek-physics",
    label: "Greek Physics",
    shortLabel: "Greek Physics",
    description:
      "Greek philosophers explained nature through observable processes rather than myth, and Archimedes applied mathematics to statics and hydrostatics.",
    startYear: bce(600),
    endYear: bce(200),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(170, 128, 76)",
    sourceIds: ["britannicaPhysicalScience"],
  },
  {
    id: "physics-context-islamic-golden-age",
    label: "Islamic Golden Age",
    shortLabel: "Islamic Golden Age",
    description:
      "Baghdad became a center of learning where scholars translated Greek texts, pursued astronomy and medicine, and developed new work such as algebra and Ibn al-Haytham's optics.",
    startYear: ce(600),
    endYear: ce(1300),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(192, 148, 78)",
    sourceIds: ["khanGoldenAgeOfIslam"],
  },
  {
    id: "physics-context-scientific-revolution",
    label: "Scientific Revolution",
    shortLabel: "Scientific Revolution",
    description:
      "A new view of nature displaced the long-dominant Greek inheritance as astronomy, experiment, and mathematical law remade natural philosophy.",
    startYear: ce(1400),
    endYear: ce(1690),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(68, 148, 144)",
    sourceIds: ["britannicaScientificRevolution"],
  },
  {
    id: "physics-context-newtonian-synthesis",
    label: "Newtonian Physics",
    shortLabel: "Newtonian Physics",
    description:
      "Newton's Principia unified the laws of motion and gravity, establishing a framework that explained both celestial and terrestrial phenomena. For over two centuries, Newtonian mechanics shaped scientific understanding and became the foundation for physics until the early 20th century revolutions in relativity and quantum theory.",
    startYear: ce(1687),
    endYear: ce(1905),
    color: "rgb(66, 110, 172)",
    sourceIds: ["sepNewtonPrincipia"],
  },
  {
    id: "physics-context-electromagnetic-revolution",
    label: "Electromagnetic Unification",
    shortLabel: "Electromagnetic Era",
    description:
      "Maxwell unified electricity, magnetism, and light, first developing the field equations in the early 1860s and then arguing in 1865 that light is an electromagnetic disturbance.",
    startYear: ce(1861),
    endYear: ce(1865),
    color: "rgb(130, 82, 170)",
    sourceIds: ["jamesClerkMaxwellWikipedia"],
  },
  {
    id: "physics-context-classical-crisis",
    label: "Crisis of Classical Physics",
    shortLabel: "Classical Crisis",
    description:
      "Hydrogen spectra, blackbody radiation, and the photoelectric effect kept refusing classical explanations, and each deeper investigation pushed physicists farther from Newtonian assumptions.",
    startYear: ce(1885),
    endYear: ce(1905),
    color: "rgb(192, 78, 72)",
    sourceIds: ["libreTextsFailuresOfClassicalPhysics"],
  },
  {
    id: "physics-context-quantum-revolution",
    label: "Quantum Revolution",
    shortLabel: "Quantum Revolution",
    description:
      "From Planck's quanta and Einstein's photoelectric paper through de Broglie, Bohr, Heisenberg, Schrödinger, and Dirac, quantum theory became the new framework for atomic-scale physics.",
    startYear: ce(1900),
    endYear: ce(1930),
    color: "rgb(118, 84, 182)",
    sourceIds: ["libreTextsFailuresOfClassicalPhysics"],
  },
  {
    id: "physics-context-relativity-revolution",
    label: "Relativity Revolution",
    shortLabel: "Relativity",
    description:
      "Einstein's special relativity in 1905 and general relativity in 1915 redefined space, time, matter, energy, and gravity.",
    startYear: ce(1905),
    endYear: ce(1915),
    color: "rgb(94, 72, 188)",
    sourceIds: ["britannicaRelativity"],
  },
  {
    id: "physics-context-nuclear-physics-age",
    label: "Golden Age of Nuclear Physics",
    shortLabel: "Nuclear Golden Age",
    description:
      "The golden age of nuclear physics, when neutron discovery, nucleus splitting, artificial fusion, fission, and new nuclear theory arrived in quick succession.",
    startYear: ce(1920),
    endYear: ce(1940),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(96, 138, 74)",
    sourceIds: ["iopNuclearPhysics"],
  },
  {
    id: "physics-context-precision-era",
    label: "Precision Era",
    shortLabel: "Precision Era",
    description:
      "As the LHC failed to reveal obvious new particles, its programme shifted from spectacular discovery claims toward increasingly precise Standard Model measurements and rare-process tests.",
    startYear: ce(2010),
    endYear: TIMELINE_MAX_YEAR,
    color: "rgb(84, 120, 156)",
    sourceIds: ["cernPrecisionEra"],
  },
];
