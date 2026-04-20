import type { EraDefinition } from "../timelineTypes";
import { afterBigBang, yearsAgo } from "../timelineDateBuilders";
import { createExactElapsedTimestamp } from "../../time/exactTimestamp";

export const EARLY_UNIVERSE_ID = "early-universe";
export const EARLY_UNIVERSE_START_YEAR = afterBigBang(0);
const RECOMBINATION_END = afterBigBang(380_000);
export const EARLY_UNIVERSE_END_YEAR = RECOMBINATION_END;
export const DARK_AGES_END_YEAR = afterBigBang(200_000_000);
export const REIONIZATION_END_YEAR = afterBigBang(1_000_000_000);
export const DARK_ENERGY_ACCELERATION_START_YEAR = afterBigBang(10_000_000_000);
export const EARLY_UNIVERSE_CHILD_ERA_ORDER = [
  "planck-epoch",
  "grand-unification-epoch",
  "inflationary-epoch",
  "electroweak-epoch",
  "quark-epoch",
  "hadron-epoch",
  "lepton-epoch",
  "big-bang-nucleosynthesis",
  "photon-epoch",
  "recombination",
] as const;

// Sub-year epoch boundary computation.
// At ~13.8 billion years, float64 can only distinguish offsets > ~3.8e-6 years (~2 minutes).
// Earlier boundaries collapse to EARLY_UNIVERSE_START_YEAR, but the data is recorded
// with timeLabel strings carrying the true scientific-notation timescales.
const SECONDS_PER_YEAR = 365.25 * 24 * 3600;
const secondsAfterBB = (s: number) =>
  EARLY_UNIVERSE_START_YEAR + s / SECONDS_PER_YEAR;
const minutesAfterBB = (m: number) =>
  EARLY_UNIVERSE_START_YEAR + (m * 60) / SECONDS_PER_YEAR;

const BB = EARLY_UNIVERSE_START_YEAR;
const PLANCK_END = secondsAfterBB(1e-43);
const GUT_END = secondsAfterBB(1e-36);
const INFLATION_END = secondsAfterBB(1e-32);
const ELECTROWEAK_END = secondsAfterBB(1e-12);
const QUARK_END = secondsAfterBB(1e-6);
const HADRON_END = secondsAfterBB(1);
const LEPTON_END = minutesAfterBB(3);
const BBN_END = minutesAfterBB(20);
const PHOTON_END = afterBigBang(240_000);

const bigBangTimelineSource = {
  sourceId: "physicsOfUniverseBigBangTimeline" as const,
};

const afterBigBangExact = (
  timestamp: Omit<
    Parameters<typeof createExactElapsedTimestamp>[0],
    "kind" | "reference"
  >,
) =>
  createExactElapsedTimestamp({
    reference: "after-big-bang",
    ...timestamp,
  });

const EARLY_UNIVERSE_CHILDREN: EraDefinition[] = [
  {
    id: "planck-epoch",
    name: "Planck Epoch",
    startYear: BB,
    endYear: PLANCK_END,
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(74, 46, 132)",
    timeLabel: "0 to 10⁻⁴³ s after the Big Bang",
    description:
      "All four fundamental forces are unified. The observable universe spans one Planck length at over 10³² °C, the hottest moment in existence.",
    scheme: "cosmic",
    sourceRefs: [
      {
        ...bigBangTimelineSource,
        note: "Planck Epoch from zero to approximately 10⁻⁴³ seconds; four forces unified, universe spans 10⁻³⁵ meters at Planck Temperature.",
      },
    ],
  },
  {
    id: "grand-unification-epoch",
    name: "Grand Unification Epoch",
    startYear: PLANCK_END,
    endYear: GUT_END,
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(56, 92, 196)",
    timeLabel: "10⁻⁴³ to 10⁻³⁶ s after the Big Bang",
    description:
      "Gravity separates first. The earliest elementary particles and antiparticles begin to appear.",
    scheme: "cosmic",
    sourceRefs: [
      {
        ...bigBangTimelineSource,
        note: "Grand Unification Epoch from 10⁻⁴³ to 10⁻³⁶ seconds; gravity separates, elementary particles created.",
      },
    ],
  },
  {
    id: "inflationary-epoch",
    name: "Inflationary Epoch",
    startYear: GUT_END,
    endYear: INFLATION_END,
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(58, 150, 228)",
    timeLabel: "10⁻³⁶ to 10⁻³² s after the Big Bang",
    description:
      "Space itself expands by at least a factor of 10²⁶ in a fraction of a second, stretching the universe from subatomic to roughly grapefruit-sized.",
    scheme: "cosmic",
    sourceRefs: [
      {
        ...bigBangTimelineSource,
        note: "Inflationary Epoch from 10⁻³⁶ to 10⁻³² seconds; triggered by separation of strong nuclear force, universe expands by factor of 10²⁶.",
      },
    ],
  },
  {
    id: "electroweak-epoch",
    name: "Electroweak Epoch",
    startYear: INFLATION_END,
    endYear: ELECTROWEAK_END,
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(70, 182, 136)",
    timeLabel: "10⁻³² to 10⁻¹² s after the Big Bang",
    description:
      "With the strong force now separate, particle interactions create W and Z bosons and the Higgs boson, slowing particles down and giving them mass.",
    scheme: "cosmic",
    sourceRefs: [
      {
        ...bigBangTimelineSource,
        note: "Electroweak Epoch from 10⁻³⁶ to 10⁻¹² seconds; strong nuclear force separates, Higgs field gives particles mass. Sequenced here after inflation for non-overlapping display.",
      },
    ],
  },
  {
    id: "quark-epoch",
    name: "Quark Epoch",
    startYear: ELECTROWEAK_END,
    endYear: QUARK_END,
    approximateStart: true,
    approximateEnd: true,
    exactEndTime: afterBigBangExact({
      microseconds: 1n,
      precision: "microsecond",
    }),
    color: "rgb(182, 82, 208)",
    timeLabel: "10⁻¹² to 10⁻⁶ s after the Big Bang",
    description:
      "Quarks, electrons, and neutrinos fill the cooling universe below 10 quadrillion degrees. A tiny surplus of quarks over antiquarks survives, becoming the seed of all future matter.",
    scheme: "cosmic",
    sourceRefs: [
      {
        ...bigBangTimelineSource,
        note: "Quark Epoch from 10⁻¹² to 10⁻⁶ seconds; quarks and antiquarks annihilate, a surplus of about one quark per billion pairs persists (baryogenesis).",
      },
    ],
  },
  {
    id: "hadron-epoch",
    name: "Hadron Epoch",
    startYear: QUARK_END,
    endYear: HADRON_END,
    approximateStart: true,
    approximateEnd: true,
    exactStartTime: afterBigBangExact({
      microseconds: 1n,
      precision: "microsecond",
    }),
    exactEndTime: afterBigBangExact({
      seconds: 1n,
      precision: "second",
    }),
    color: "rgb(230, 122, 72)",
    timeLabel: "10⁻⁶ s to 1 s after the Big Bang",
    description:
      "Quarks bind into protons and neutrons at roughly a trillion degrees. Neutrinos decouple and begin streaming freely through space.",
    scheme: "cosmic",
    sourceRefs: [
      {
        ...bigBangTimelineSource,
        note: "Hadron Epoch from 10⁻⁶ to 1 second; quarks combine into hadrons (protons and neutrons), neutrinos decouple.",
      },
    ],
  },
  {
    id: "lepton-epoch",
    name: "Lepton Epoch",
    startYear: HADRON_END,
    endYear: LEPTON_END,
    approximateStart: true,
    approximateEnd: true,
    exactStartTime: afterBigBangExact({
      seconds: 1n,
      precision: "second",
    }),
    exactEndTime: afterBigBangExact({
      minutes: 3n,
      precision: "minute",
    }),
    color: "rgb(220, 92, 138)",
    timeLabel: "1 s to 3 min after the Big Bang",
    description:
      "Electrons and positrons dominate, annihilating in pairs and releasing bursts of photons. A small excess of electrons survives.",
    scheme: "cosmic",
    sourceRefs: [
      {
        ...bigBangTimelineSource,
        note: "Lepton Epoch from 1 second to 3 minutes; leptons and antileptons dominate, most annihilate into photons.",
      },
    ],
  },
  {
    id: "big-bang-nucleosynthesis",
    name: "Big Bang Nucleosynthesis",
    startYear: LEPTON_END,
    endYear: BBN_END,
    approximateStart: true,
    approximateEnd: true,
    exactStartTime: afterBigBangExact({
      minutes: 3n,
      precision: "minute",
    }),
    exactEndTime: afterBigBangExact({
      minutes: 20n,
      precision: "minute",
    }),
    color: "rgb(240, 176, 64)",
    timeLabel: "3 to 20 min after the Big Bang",
    description:
      "Protons and neutrons fuse into hydrogen, helium, and traces of lithium in the first bout of nuclear fusion, before the universe cools too far for it to continue.",
    scheme: "cosmic",
    sourceRefs: [
      {
        ...bigBangTimelineSource,
        note: "Nucleosynthesis from 3 to 20 minutes; protons and neutrons fuse into hydrogen, helium, and lithium nuclei.",
      },
    ],
  },
  {
    id: "photon-epoch",
    name: "Photon Epoch",
    startYear: BBN_END,
    endYear: PHOTON_END,
    approximateStart: true,
    approximateEnd: true,
    exactStartTime: afterBigBangExact({
      minutes: 20n,
      precision: "minute",
    }),
    exactEndTime: afterBigBangExact({
      years: 240_000n,
      precision: "year",
    }),
    color: "rgb(192, 198, 74)",
    timeLabel: "20 min to 240,000 yr after the Big Bang",
    description:
      "A hot, opaque plasma of atomic nuclei and electrons fills the expanding universe, with photons scattering endlessly off charged particles.",
    scheme: "cosmic",
    sourceRefs: [
      {
        ...bigBangTimelineSource,
        note: "Photon Epoch (Radiation Domination) from 3 minutes to 240,000 years; universe filled with hot opaque plasma, photon energy dominates. Displayed here from 20 minutes onward (after nucleosynthesis) for non-overlapping layout.",
      },
    ],
  },
  {
    id: "recombination",
    name: "Recombination",
    startYear: PHOTON_END,
    endYear: RECOMBINATION_END,
    approximateStart: true,
    approximateEnd: true,
    exactStartTime: afterBigBangExact({
      years: 240_000n,
      precision: "year",
    }),
    exactEndTime: afterBigBangExact({
      years: 380_000n,
      precision: "year",
    }),
    color: "rgb(88, 194, 228)",
    timeLabel: "240,000 to 380,000 yr after the Big Bang",
    description:
      "As electrons settle into the first neutral atoms, the cosmic fog clears. By around 380,000 years after the Big Bang, the universe becomes transparent and the oldest light we observe today as the cosmic microwave background can travel freely.",
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaUniverseOverview",
        note: "NASA says recombination occurred around 380,000 years after the Big Bang, when atomic nuclei captured electrons, the cosmic fog cleared, and the glow we still detect as the cosmic microwave background began traveling freely.",
      },
      {
        sourceId: "nasaLambdaCosmology",
        note: "NASA LAMBDA uses recombination as the transition where electrons and baryons form mostly neutral atoms, photons decouple from baryons, and the density pattern preserved in the CMB becomes frozen in.",
      },
    ],
  },
];

export const COSMIC_ERA_DEFINITIONS: EraDefinition[] = [
  ...EARLY_UNIVERSE_CHILDREN,
  {
    id: "dark-ages",
    name: "Dark Ages",
    startYear: RECOMBINATION_END,
    endYear: DARK_AGES_END_YEAR,
    approximateStart: true,
    approximateEnd: true,
    description:
      "Neutral hydrogen fills a starless universe after recombination, before the first stars light up space.",
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaLambdaCosmology",
        note: "NASA LAMBDA describes the post-recombination neutral universe as the Dark Ages, before the first stars switch on and begin reionizing the intergalactic medium.",
      },
      {
        sourceId: "nasaUniverseOverview",
        note: "NASA says the universe remained dark for the next 200 million years after recombination because no stars yet existed to shine.",
      },
    ],
  },
  {
    id: "first-stars-and-reionization",
    name: "First Stars and Reionization",
    startYear: DARK_AGES_END_YEAR,
    endYear: REIONIZATION_END_YEAR,
    approximateStart: true,
    approximateEnd: true,
    description:
      "The first stars and young galaxies ignite, flooding space with ultraviolet light that reionizes cosmic gas.",
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaUniverseOverview",
        note: "NASA says the first stars formed after the dark ages and that by the time the universe was 1 billion years old, stars and galaxies had reionized nearly all the gas.",
      },
      {
        sourceId: "nasaLambdaCosmology",
        note: "NASA LAMBDA ties cosmic dawn to the first radiation sources and describes their light as reionizing the intergalactic medium across this interval.",
      },
    ],
  },
  {
    id: "galaxy-assembly",
    name: "Galaxy Assembly",
    startYear: REIONIZATION_END_YEAR,
    endYear: DARK_ENERGY_ACCELERATION_START_YEAR,
    approximateStart: true,
    approximateEnd: true,
    description:
      "Galaxies keep growing into groups, clusters, and the large-scale cosmic web.",
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaUniverseOverview",
        note: "On NASA's Cosmic History overview, the visible infographic places 'Galaxies & Dark Matter' at about 400 million years and 'Dark Energy' at 10 billion years, framing this interval as the long era of galaxy building before accelerating expansion dominates.",
      },
    ],
  },
  {
    id: "dark-energy-acceleration",
    name: "Dark Energy Acceleration",
    startYear: DARK_ENERGY_ACCELERATION_START_YEAR,
    endYear: yearsAgo(0),
    approximateStart: true,
    timeLabel: "10 billion years after the Big Bang to Present",
    description:
      "Cosmic expansion speeds up as dark energy stretches space ever faster while galaxies continue drifting apart.",
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaUniverseOverview",
        note: "The History of the Universe infographic on NASA's Cosmic History overview places 'Dark Energy' at 10 billion years and describes this stage as the point where expansion accelerates.",
      },
    ],
  },
];
