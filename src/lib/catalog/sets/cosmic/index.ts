import {
  normalizeTimelineSetDocument,
  type TimelineRawSetDocument,
} from "@/lib/catalog/setSchema";

const COSMIC_SET_DOCUMENT = {
  version: 1,
  metadata: {
    id: "cosmic",
    label: "Cosmic",
    description:
      "Universe-scale history from the Big Bang through the formation of the Solar System.",
    tags: ["universe", "physics"],
    order: 2,
    defaultEnabled: true,
  },
  sources: {
    nasaUniverseOverview: {
      shortTitle: "NASA: Cosmic History",
      title: "Universe: Cosmic History",
      organization: "NASA",
      citation:
        'NASA, "Universe: Cosmic History," Science Mission Directorate.',
      url: "https://science.nasa.gov/universe/overview/",
    },
    nasaLambdaCosmology: {
      shortTitle: "NASA LAMBDA: Cosmology timeline",
      title: "ΛCDM Model of Cosmology",
      organization: "NASA Goddard Space Flight Center",
      citation:
        'NASA LAMBDA Archive / WMAP Science Team, "ΛCDM Model of Cosmology."',
      url: "https://lambda.gsfc.nasa.gov/education/graphic_history/univ_evol.html",
    },
    nasaGalaxyBasics: {
      shortTitle: "NASA: Galaxy Basics",
      title: "Galaxy Basics",
      organization: "NASA",
      citation: 'NASA, "Galaxy Basics," Science Mission Directorate.',
      url: "https://science.nasa.gov/universe/galaxies/",
    },
    nasaMilkyWayGrowth: {
      shortTitle: "NASA: Milky Way-like growth",
      title: "The Growth of Milky Way-Like Galaxies Over Time",
      organization: "NASA / Hubble",
      citation:
        'NASA, ESA, C. Papovich et al., "The Growth of Milky Way-Like Galaxies Over Time."',
      url: "https://science.nasa.gov/asset/hubble/the-growth-of-milky-way-like-galaxies-over-time/",
    },
    nasaSunLateToMilkyWayParty: {
      shortTitle: "NASA: Sun came late",
      title: "Our Sun Came Late to the Milky Way's Star-Birth Party",
      organization: "NASA / Hubble",
      citation:
        'NASA, "Our Sun Came Late to the Milky Way’s Star-Birth Party."',
      url: "https://science.nasa.gov/missions/hubble/our-sun-came-late-to-the-milky-ways-star-birth-party/",
    },
    nasaSolarSystemFacts: {
      shortTitle: "NASA: Solar System Facts",
      title: "Solar System Facts",
      organization: "NASA",
      citation: 'NASA, "Solar System Facts," Science Mission Directorate.',
      url: "https://science.nasa.gov/solar-system/solar-system-facts/",
    },
    physicsOfUniverseBigBangTimeline: {
      shortTitle: "Physics of the Universe: Big Bang Timeline",
      title: "Timeline of the Big Bang",
      organization: "The Physics of the Universe",
      citation: '"Timeline of the Big Bang," The Physics of the Universe.',
      url: "https://www.physicsoftheuniverse.com/topics_bigbang_timeline.html",
    },
  },
  categories: [
    {
      id: "cosmic-milestones",
      label: "Cosmic Milestones",
      description: "Foundational universe-scale milestone markers.",
      order: 0,
      groups: [
        {
          id: "cosmic-milestones",
          label: "Cosmic Milestones",
          description:
            "Core universe-scale milestone markers from recombination through solar-system formation.",
          contentType: "markers",
          order: 0,
        },
      ],
    },
  ],
  families: [
    {
      id: "cosmic",
      label: "Cosmic History",
      description: "Universe-scale eras before Earth forms.",
      order: 0,
      priority: 100,
      defaultEnabled: true,
      root: {
        id: "cosmic-history",
        name: "Cosmic History",
        startYear: {
          kind: "relative",
          reference: "after-big-bang",
          unit: "years",
          value: 0,
        },
        endYear: {
          kind: "relative",
          reference: "ago",
          unit: "years",
          value: 0,
        },
        color: "rgba(0, 0, 0, 0)",
        scheme: "cosmic",
        children: [
          {
            id: "planck-epoch",
            name: "Planck Epoch",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "years",
              value: 0,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "seconds",
              value: 1e-43,
            },
            approximateStart: true,
            approximateEnd: true,
            color: "rgb(74, 46, 132)",
            timeLabel: "0 to 10⁻⁴³ s after the Big Bang",
            description:
              "All four fundamental forces are unified. The observable universe spans one Planck length at over 10³² °C, the hottest moment in existence.",
            scheme: "cosmic",
            sourceIds: ["physicsOfUniverseBigBangTimeline"],
          },
          {
            id: "grand-unification-epoch",
            name: "Grand Unification Epoch",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "seconds",
              value: 1e-43,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "seconds",
              value: 1e-36,
            },
            approximateStart: true,
            approximateEnd: true,
            color: "rgb(56, 92, 196)",
            timeLabel: "10⁻⁴³ to 10⁻³⁶ s after the Big Bang",
            description:
              "Gravity separates first. The earliest elementary particles and antiparticles begin to appear.",
            scheme: "cosmic",
            sourceIds: ["physicsOfUniverseBigBangTimeline"],
          },
          {
            id: "inflationary-epoch",
            name: "Inflationary Epoch",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "seconds",
              value: 1e-36,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "seconds",
              value: 1e-32,
            },
            approximateStart: true,
            approximateEnd: true,
            color: "rgb(58, 150, 228)",
            timeLabel: "10⁻³⁶ to 10⁻³² s after the Big Bang",
            description:
              "Space itself expands by at least a factor of 10²⁶ in a fraction of a second, stretching the universe from subatomic to roughly grapefruit-sized.",
            scheme: "cosmic",
            sourceIds: ["physicsOfUniverseBigBangTimeline"],
          },
          {
            id: "electroweak-epoch",
            name: "Electroweak Epoch",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "seconds",
              value: 1e-32,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "seconds",
              value: 1e-12,
            },
            approximateStart: true,
            approximateEnd: true,
            color: "rgb(70, 182, 136)",
            timeLabel: "10⁻³² to 10⁻¹² s after the Big Bang",
            description:
              "With the strong force now separate, particle interactions create W and Z bosons and the Higgs boson, slowing particles down and giving them mass.",
            scheme: "cosmic",
            sourceIds: ["physicsOfUniverseBigBangTimeline"],
          },
          {
            id: "quark-epoch",
            name: "Quark Epoch",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "seconds",
              value: 1e-12,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "microseconds",
              value: 1,
            },
            approximateStart: true,
            approximateEnd: true,
            exactEndTime: {
              kind: "elapsed",
              reference: "after-big-bang",
              precision: "microsecond",
              microseconds: "1",
            },
            color: "rgb(182, 82, 208)",
            timeLabel: "10⁻¹² to 10⁻⁶ s after the Big Bang",
            description:
              "Quarks, electrons, and neutrinos fill the cooling universe below 10 quadrillion degrees. A tiny surplus of quarks over antiquarks survives, becoming the seed of all future matter.",
            scheme: "cosmic",
            sourceIds: ["physicsOfUniverseBigBangTimeline"],
          },
          {
            id: "hadron-epoch",
            name: "Hadron Epoch",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "microseconds",
              value: 1,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "seconds",
              value: 1,
            },
            approximateStart: true,
            approximateEnd: true,
            exactStartTime: {
              kind: "elapsed",
              reference: "after-big-bang",
              precision: "microsecond",
              microseconds: "1",
            },
            exactEndTime: {
              kind: "elapsed",
              reference: "after-big-bang",
              precision: "second",
              seconds: "1",
            },
            color: "rgb(230, 122, 72)",
            timeLabel: "10⁻⁶ s to 1 s after the Big Bang",
            description:
              "Quarks bind into protons and neutrons at roughly a trillion degrees. Neutrinos decouple and begin streaming freely through space.",
            scheme: "cosmic",
            sourceIds: ["physicsOfUniverseBigBangTimeline"],
          },
          {
            id: "lepton-epoch",
            name: "Lepton Epoch",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "seconds",
              value: 1,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "minutes",
              value: 3,
            },
            approximateStart: true,
            approximateEnd: true,
            exactStartTime: {
              kind: "elapsed",
              reference: "after-big-bang",
              precision: "second",
              seconds: "1",
            },
            exactEndTime: {
              kind: "elapsed",
              reference: "after-big-bang",
              precision: "minute",
              minutes: "3",
            },
            color: "rgb(220, 92, 138)",
            timeLabel: "1 s to 3 min after the Big Bang",
            description:
              "Electrons and positrons dominate, annihilating in pairs and releasing bursts of photons. A small excess of electrons survives.",
            scheme: "cosmic",
            sourceIds: ["physicsOfUniverseBigBangTimeline"],
          },
          {
            id: "big-bang-nucleosynthesis",
            name: "Big Bang Nucleosynthesis",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "minutes",
              value: 3,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "minutes",
              value: 20,
            },
            approximateStart: true,
            approximateEnd: true,
            exactStartTime: {
              kind: "elapsed",
              reference: "after-big-bang",
              precision: "minute",
              minutes: "3",
            },
            exactEndTime: {
              kind: "elapsed",
              reference: "after-big-bang",
              precision: "minute",
              minutes: "20",
            },
            color: "rgb(240, 176, 64)",
            timeLabel: "3 to 20 min after the Big Bang",
            description:
              "Protons and neutrons fuse into hydrogen, helium, and traces of lithium in the first bout of nuclear fusion, before the universe cools too far for it to continue.",
            scheme: "cosmic",
            sourceIds: ["physicsOfUniverseBigBangTimeline"],
          },
          {
            id: "photon-epoch",
            name: "Photon Epoch",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "minutes",
              value: 20,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "years",
              value: 240000,
            },
            approximateStart: true,
            approximateEnd: true,
            exactStartTime: {
              kind: "elapsed",
              reference: "after-big-bang",
              precision: "minute",
              minutes: "20",
            },
            exactEndTime: {
              kind: "elapsed",
              reference: "after-big-bang",
              precision: "year",
              years: "240000",
            },
            color: "rgb(192, 198, 74)",
            timeLabel: "20 min to 240,000 yr after the Big Bang",
            description:
              "A hot, opaque plasma of atomic nuclei and electrons fills the expanding universe, with photons scattering endlessly off charged particles.",
            scheme: "cosmic",
            sourceIds: ["physicsOfUniverseBigBangTimeline"],
          },
          {
            id: "recombination",
            name: "Recombination",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "years",
              value: 240000,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "years",
              value: 380000,
            },
            approximateStart: true,
            approximateEnd: true,
            exactStartTime: {
              kind: "elapsed",
              reference: "after-big-bang",
              precision: "year",
              years: "240000",
            },
            exactEndTime: {
              kind: "elapsed",
              reference: "after-big-bang",
              precision: "year",
              years: "380000",
            },
            color: "rgb(88, 194, 228)",
            timeLabel: "240,000 to 380,000 yr after the Big Bang",
            description:
              "As electrons settle into the first neutral atoms, the cosmic fog clears. By around 380,000 years after the Big Bang, the universe becomes transparent and the oldest light we observe today as the cosmic microwave background can travel freely.",
            scheme: "cosmic",
            sourceIds: ["nasaUniverseOverview", "nasaLambdaCosmology"],
          },
          {
            id: "dark-ages",
            name: "Dark Ages",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "years",
              value: 380000,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "years",
              value: 200000000,
            },
            approximateStart: true,
            approximateEnd: true,
            description:
              "Neutral hydrogen fills a starless universe after recombination, before the first stars light up space.",
            scheme: "cosmic",
            sourceIds: ["nasaLambdaCosmology", "nasaUniverseOverview"],
          },
          {
            id: "first-stars-and-reionization",
            name: "First Stars and Reionization",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "years",
              value: 200000000,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "years",
              value: 1000000000,
            },
            approximateStart: true,
            approximateEnd: true,
            description:
              "The first stars and young galaxies ignite, flooding space with ultraviolet light that reionizes cosmic gas.",
            scheme: "cosmic",
            sourceIds: ["nasaUniverseOverview", "nasaLambdaCosmology"],
          },
          {
            id: "galaxy-assembly",
            name: "Galaxy Assembly",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "years",
              value: 1000000000,
            },
            endYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "years",
              value: 10000000000,
            },
            approximateStart: true,
            approximateEnd: true,
            description:
              "Galaxies keep growing into groups, clusters, and the large-scale cosmic web.",
            scheme: "cosmic",
            sourceIds: ["nasaUniverseOverview"],
          },
          {
            id: "dark-energy-acceleration",
            name: "Dark Energy Acceleration",
            startYear: {
              kind: "relative",
              reference: "after-big-bang",
              unit: "years",
              value: 10000000000,
            },
            endYear: {
              kind: "relative",
              reference: "ago",
              unit: "years",
              value: 0,
            },
            approximateStart: true,
            timeLabel: "10 billion years after the Big Bang to Present",
            description:
              "Cosmic expansion speeds up as dark energy stretches space ever faster while galaxies continue drifting apart.",
            scheme: "cosmic",
            sourceIds: ["nasaUniverseOverview"],
          },
        ],
      },
    },
  ],
  markers: [
    {
      id: "cosmic-microwave-background-released",
      label: "Cosmic microwave background released",
      shortLabel: "CMB Released",
      groupId: "cosmic-milestones",
      year: {
        kind: "relative",
        reference: "after-big-bang",
        unit: "years",
        value: 380000,
      },
      approximate: true,
      description:
        "About 380,000 years after the Big Bang, the first atoms formed and the cosmic fog cleared, releasing the oldest light we can still observe today.",
      minZoom: 0,
      priority: 92,
      sourceIds: ["nasaUniverseOverview", "nasaLambdaCosmology"],
    },
    {
      id: "first-stars-ignite",
      label: "First stars ignite",
      shortLabel: "First Stars",
      groupId: "cosmic-milestones",
      year: {
        kind: "relative",
        reference: "after-big-bang",
        unit: "years",
        value: 200000000,
      },
      approximate: true,
      description:
        "The first stars ended the fully dark universe, flooding space with new light and helping seed the earliest galaxies.",
      minZoom: 0,
      priority: 91,
      sourceIds: ["nasaUniverseOverview", "nasaLambdaCosmology"],
    },
    {
      id: "reionization-largely-complete",
      label: "Reionization largely complete",
      shortLabel: "Reionization",
      groupId: "cosmic-milestones",
      year: {
        kind: "relative",
        reference: "after-big-bang",
        unit: "years",
        value: 1000000000,
      },
      approximate: true,
      description:
        "By roughly 1 billion years after the Big Bang, starlight and young galaxies had reionized nearly all intergalactic gas, leaving the universe broadly transparent to light again.",
      minZoom: 0,
      priority: 90,
      sourceIds: ["nasaUniverseOverview", "nasaLambdaCosmology"],
    },
    {
      id: "milky-way-like-star-birth-peaks",
      label: "Milky Way-like star birth peaks",
      shortLabel: "Star-Birth Peak",
      groupId: "cosmic-milestones",
      year: {
        kind: "relative",
        reference: "ago",
        unit: "years",
        value: 10300000000,
      },
      approximate: true,
      description:
        "Milky Way-like galaxies hit a stellar baby boom, forming stars far faster than our galaxy does today.",
      minZoom: 0,
      priority: 89,
      sourceIds: ["nasaMilkyWayGrowth", "nasaSunLateToMilkyWayParty"],
    },
    {
      id: "milky-way-like-spiral-shape-emerges",
      label: "Milky Way-like spiral shape emerges",
      shortLabel: "Spiral Shape",
      groupId: "cosmic-milestones",
      year: {
        kind: "relative",
        reference: "ago",
        unit: "years",
        value: 8900000000,
      },
      approximate: true,
      description:
        "By this stage, Milky Way-like galaxies have grown larger and show a clear spiral form with older stars concentrated toward the center.",
      minZoom: 0,
      priority: 88,
      sourceIds: ["nasaMilkyWayGrowth", "nasaGalaxyBasics"],
    },
    {
      id: "solar-system-formation",
      label: "Solar System forms",
      shortLabel: "Solar System",
      groupId: "cosmic-milestones",
      year: {
        kind: "relative",
        reference: "ago",
        unit: "years",
        value: 4567000000,
      },
      approximate: true,
      description:
        "A collapsing cloud of gas and dust forms the Sun, a spinning solar nebula, and the raw material of the planets.",
      minZoom: 0,
      priority: 90,
      sourceIds: ["nasaSolarSystemFacts"],
    },
  ],
  overlays: [],
} satisfies TimelineRawSetDocument;

export const COSMIC_SET = normalizeTimelineSetDocument(COSMIC_SET_DOCUMENT);

const COSMIC_FAMILY = COSMIC_SET.families.find(
  (family) => family.id === "cosmic",
);

if (!COSMIC_FAMILY) {
  throw new Error("Cosmic set must define the cosmic era family.");
}

const CANONICAL_COSMIC_ERA_DEFINITIONS = COSMIC_FAMILY.root.children ?? [];

function getRequiredEra(eraId: string) {
  const era = CANONICAL_COSMIC_ERA_DEFINITIONS.find(
    (candidate) => candidate.id === eraId,
  );

  if (!era) {
    throw new Error(`Missing canonical cosmic era: ${eraId}`);
  }

  return era;
}

export const EARLY_UNIVERSE_ID = "early-universe";
export const EARLY_UNIVERSE_START_YEAR = COSMIC_FAMILY.root.startYear;
export const EARLY_UNIVERSE_END_YEAR = getRequiredEra("recombination").endYear;
export const DARK_AGES_END_YEAR = getRequiredEra("dark-ages").endYear;
export const REIONIZATION_END_YEAR = getRequiredEra(
  "first-stars-and-reionization",
).endYear;
export const DARK_ENERGY_ACCELERATION_START_YEAR = getRequiredEra(
  "dark-energy-acceleration",
).startYear;
export const EARLY_UNIVERSE_CHILD_ERA_ORDER =
  CANONICAL_COSMIC_ERA_DEFINITIONS.slice(0, 10).map((era) => era.id);

export const COSMIC_ERA_DEFINITIONS = CANONICAL_COSMIC_ERA_DEFINITIONS;
