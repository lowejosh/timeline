import type { TimelineMarker } from "../timelineTypes";
import { yearsAgo } from "../timelineDateBuilders";

export const DEEP_TIME_LIFE_MARKERS: TimelineMarker[] = [
  {
    id: "earliest-evidence-of-life",
    label: "Earliest evidence of life on Earth",
    shortLabel: "Earliest Life",
    year: yearsAgo(3_500_000_000),
    approximate: true,
    minZoom: 0,
    priority: 95,
    sourceRefs: [
      {
        sourceId: "berkeleyOriginOfLife",
        note: "Understanding Evolution says evidence suggests life first evolved around 3.5 billion years ago; the app phrases this conservatively as the earliest evidence of life rather than an exact moment life began.",
      },
    ],
  },
  {
    id: "great-oxidation-event",
    label: "Great Oxidation Event",
    shortLabel: "Oxygen Crisis",
    approximate: true,
    year: yearsAgo(2_400_000_000),
    description:
      "As cyanobacteria oxygenated sea and sky, oxygen likely poisoned much of Earth's anaerobic life. The precise size of that die-off remains hard to pin down from the fossil record.",
    minZoom: 0,
    priority: 96,
    sourceRefs: [
      {
        sourceId: "ucmpCyanobacteria",
        note: "UCMP explains that cyanobacteria generated the oxygen atmosphere during the Archean and Proterozoic; the app uses c. 2.4 billion years ago as the conventional Great Oxidation Event anchor for that planetary shift.",
      },
      {
        sourceId: "asmGreatOxidationEvent",
        note: "ASM says oxygen likely acted as a poison and wiped out much of anaerobic life during the Great Oxidation Event, but also notes that precise lineage and species losses are difficult to estimate.",
      },
    ],
  },
  {
    id: "first-eukaryotic-cells",
    label: "First eukaryotic cells",
    shortLabel: "First Eukaryotes",
    approximate: true,
    year: yearsAgo(1_800_000_000),
    minZoom: 0,
    priority: 94,
    sourceRefs: [
      {
        sourceId: "ucmpEukaryota",
        note: "UCMP summarizes eukaryotes as a fundamentally different, more complex cell type; the app uses c. 1.8 billion years ago as a conventional public-facing anchor for the earliest known eukaryotic cells.",
      },
    ],
  },
  {
    id: "first-large-multicellular-life",
    label: "First large multicellular life",
    shortLabel: "Large Multicellular Life",
    approximate: true,
    year: yearsAgo(575_000_000),
    minZoom: 0,
    priority: 93,
    sourceRefs: [
      {
        sourceId: "museumsVictoria600MillionYears",
        note: "Museums Victoria says the earliest fossils of these multicelled animals are preserved in rocks that are about 575 million years old.",
      },
    ],
  },
  {
    id: "first-land-plants",
    label: "First land plants",
    approximate: true,
    shortLabel: "Land Plants",
    year: yearsAgo(470_000_000),
    description:
      "Tiny early plants were among the first to colonise land, beginning the long transformation of bare continents into living landscapes.",
    minZoom: 0,
    priority: 92,
    sourceRefs: [
      {
        sourceId: "nhmFirstLandPlants",
        note: "The Natural History Museum says the ancestors of modern flora first moved onto land at some point between 450 and 500 million years ago, and that cryptospores date back to around 470 million years ago.",
      },
    ],
  },
  {
    id: "late-ordovician-mass-extinction",
    label: "Late Ordovician mass extinction",
    shortLabel: "Ordovician Extinction",
    year: yearsAgo(447_000_000),
    approximate: true,
    description:
      "A two-pulse marine crisis driven by climate upheaval that wiped out about 85% of species, shattering reefs and open-ocean ecosystems alike.",
    minZoom: 0,
    priority: 94,
    sourceRefs: [
      {
        sourceId: "smithsonianExtinctionOverTime",
        note: "Smithsonian dates the Late Ordovician mass extinction to 447 million years ago and summarizes it as a global cooling, glaciation, and sea-level crisis affecting marine life.",
      },
      {
        sourceId: "geoscienceworldLateOrdovicianExtinction",
        note: "GeoScienceWorld summarizes the event as a two-pulse crisis in which around 85% of species were eliminated.",
      },
    ],
  },
  {
    id: "earliest-vascular-plants-appear",
    label: "Cooksonia, oldest known vascular plant",
    shortLabel: "Cooksonia",
    approximate: true,
    year: yearsAgo(426_000_000),
    description:
      "Cooksonia appears among the oldest known vascular plants, marking an early step toward taller and more complex land floras.",
    minZoom: 0,
    priority: 89,
    sourceRefs: [
      {
        sourceId: "nationalMuseumEarliestVascularPlants",
        note: "The National Museum in Prague says Cooksonia from the Motol Formation is considered the oldest vascular plant in the world and dates it to about 425 to 427 million years ago.",
      },
      {
        sourceId: "museumsVictoriaPalaeobotany",
        note: "Museums Victoria notes that its Baragwanathia and related Silurian and Lower Devonian flora are among the world's oldest known vascular land plants, reinforcing this early vascular-plant interval.",
      },
    ],
  },
  {
    id: "first-forests-appear",
    label: "Earliest known fossil forest",
    shortLabel: "Oldest Forest",
    approximate: true,
    year: yearsAgo(390_000_000),
    description:
      "Calamophyton trees formed the world's oldest known fossil forest, an early Devonian woodland already reshaping soils, rivers, and life on land.",
    minZoom: 0,
    priority: 92,
    sourceRefs: [
      {
        sourceId: "nhmEarliestFossilisedForest",
        note: "The Natural History Museum says 390-million-year-old fossils from southwest England are the world's oldest known fossilised forest.",
      },
      {
        sourceId: "nysmOldestTrees",
        note: "The New York State Museum says Gilboa's Eospermatopteris trees date to roughly 380 to 385 million years ago and were among the first plants on Earth to have a tree-like form.",
      },
    ],
  },
  {
    id: "late-devonian-mass-extinction",
    label: "Late Devonian mass extinction",
    shortLabel: "Devonian Extinction",
    year: yearsAgo(378_000_000),
    approximate: true,
    description:
      "A drawn-out reef crisis that unfolded in pulses and eliminated roughly 75% of species, hitting corals, brachiopods, and other marine life especially hard.",
    minZoom: 0,
    priority: 93,
    sourceRefs: [
      {
        sourceId: "smithsonianExtinctionOverTime",
        note: "Smithsonian dates the Late Devonian mass extinction to 378 million years ago and notes that many marine groups, including corals and brachiopods, were heavily affected.",
      },
      {
        sourceId: "nsfLateDevonianExtinction",
        note: "NSF describes the Late Devonian event as one of the Big Five and says roughly 75% of all species disappeared over two pulses.",
      },
    ],
  },
  {
    id: "first-tetrapods-step-onto-land",
    label: "Early tetrapods move onto land",
    approximate: true,
    shortLabel: "Tetrapods on Land",
    year: yearsAgo(370_000_000),
    minZoom: 0,
    priority: 92,
    sourceRefs: [
      {
        sourceId: "berkeleyTetrapodOrigin",
        note: "Understanding Evolution describes the tetrapod transition as unfolding between about 390 and 360 million years ago during the Devonian; the app uses c. 370 Ma as a midpoint anchor for the move onto land.",
      },
    ],
  },
  {
    id: "first-reptiles-appear",
    label: "First reptiles appear",
    approximate: true,
    shortLabel: "First Reptiles",
    year: yearsAgo(320_000_000),
    minZoom: 0,
    priority: 91,
    sourceRefs: [
      {
        sourceId: "britannicaCarboniferousPeriod",
        note: "Britannica describes Hylonomus from the Lower Pennsylvanian as the earliest reptile in the fossil record; the app uses c. 320 Ma as a concise anchor within that interval.",
      },
    ],
  },
  {
    id: "giant-insects-fill-carboniferous-skies",
    label: "Giant insects fill Carboniferous skies",
    shortLabel: "Giant Insects",
    approximate: true,
    year: yearsAgo(315_000_000),
    minZoom: 0,
    priority: 88,
    sourceRefs: [
      {
        sourceId: "britannicaCarboniferousPeriod",
        note: "Britannica says that by the Pennsylvanian dragonflies and mayflies were abundant and some ancestors of modern dragonflies had wingspans of about 70 cm; the app uses c. 315 Ma as a mid-Pennsylvanian marker.",
      },
    ],
  },
  {
    id: "end-permian-mass-extinction",
    label: "End-Permian mass extinction",
    shortLabel: "Permian Extinction",
    approximate: true,
    year: yearsAgo(252_000_000),
    description:
      "Earth's worst known extinction: roughly 9 in 10 marine species and 7 in 10 land species vanished as massive volcanism drove runaway warming and ecosystem collapse.",
    minZoom: 0,
    priority: 97,
    sourceRefs: [
      {
        sourceId: "smithsonianExtinctionOverTime",
        note: "Smithsonian dates Earth's largest mass extinction to 252 million years ago and notes that it devastated marine species and many terrestrial groups.",
      },
      {
        sourceId: "nasaGreatDying",
        note: "NASA describes the end-Permian crisis as the Great Dying and says roughly 9 in 10 marine species and 7 in 10 land species vanished.",
      },
      {
        sourceId: "amnhSixExtinctions",
        note: "AMNH likewise frames the end-Permian event as the most severe extinction, with more than 95% of marine species and upward of 70% of land vertebrates lost in some estimates.",
      },
    ],
  },
  {
    id: "first-mammals-appear",
    label: "First mammals appear",
    shortLabel: "First Mammals",
    approximate: true,
    year: yearsAgo(225_000_000),
    minZoom: 0,
    priority: 90,
    sourceRefs: [
      {
        sourceId: "ucmpMesozoicLife",
        note: "UCMP says the first mammals arrived on the scene in the Mesozoic and highlights Triassic relatives in this early phase; the app uses c. 225 million years ago as a concise Late Triassic anchor for their appearance.",
      },
    ],
  },
  {
    id: "end-triassic-mass-extinction",
    label: "End-Triassic mass extinction",
    shortLabel: "Triassic Extinction",
    approximate: true,
    year: yearsAgo(199_000_000),
    description:
      "A volcanic crisis as the Atlantic began opening that wiped out more than a third of marine species and many large land reptiles, clearing space for dinosaur dominance.",
    minZoom: 0,
    priority: 95,
    sourceRefs: [
      {
        sourceId: "smithsonianExtinctionOverTime",
        note: "Smithsonian dates the Late Triassic mass extinction to 199 million years ago and links it to widespread losses among marine and terrestrial groups.",
      },
      {
        sourceId: "smithsonianTriassicLife",
        note: "Smithsonian's Triassic teaching guide frames this crisis as a major extinction-and-recovery interval closely tied to the rise of dinosaurs.",
      },
      {
        sourceId: "amnhSixExtinctions",
        note: "AMNH says more than a third of marine species vanished in the end-Triassic crisis, alongside many large amphibians and crocodile-line reptiles.",
      },
    ],
  },
  {
    id: "archaeopteryx-first-known-bird",
    label: "Archaeopteryx, first known bird",
    shortLabel: "Archaeopteryx",
    year: yearsAgo(150_000_000),
    approximate: true,
    minZoom: 0,
    priority: 89,
    sourceRefs: [
      {
        sourceId: "berkeleyBirdOrigin",
        note: "Understanding Evolution identifies Archaeopteryx as the first known bird and places the dinosaur-to-bird transition in the Late Jurassic; the app uses c. 150 Ma as a familiar Late Jurassic anchor.",
      },
    ],
  },
  {
    id: "first-flowering-plants-appear",
    label: "Earliest known flowering plant fossils",
    shortLabel: "Earliest Flowers",
    approximate: true,
    year: yearsAgo(125_000_000),
    description:
      "Fossils such as Archaefructus show flowering plants were already present by about 125 million years ago, with southern Australian flower-bearing forests appearing soon after.",
    minZoom: 0,
    priority: 90,
    sourceRefs: [
      {
        sourceId: "australianMuseumCretaceous",
        note: "The Australian Museum says Archaefructus liaoningensis is the earliest known flowering plant and that its fossils are about 125 million years old.",
      },
      {
        sourceId: "universityMelbourneFlowersReachedAustralia",
        note: "The University of Melbourne says Australia's oldest flowering plants are 126 million years old and reconstructs flower-bearing forests in southern Australia from 126 to 100 million years ago.",
      },
    ],
  },
  {
    id: "k-pg-asteroid-impact",
    label: "K–Pg asteroid impact",
    shortLabel: "Dinosaur Asteroid",
    year: yearsAgo(66_000_000),
    approximate: true,
    description:
      "The Chicxulub impact triggered abrupt global collapse that wiped out about 75% of species, including all non-avian dinosaurs, while birds and mammals pulled through.",
    minZoom: 0,
    priority: 99,
    sourceRefs: [
      {
        sourceId: "smithsonianExtinctionOverTime",
        note: "Smithsonian dates the end-Cretaceous mass extinction to 66 million years ago and says the scientific consensus links it to the environmental consequences of a large asteroid impact near what is now Mexico.",
      },
      {
        sourceId: "icsChart2024",
        note: "The marker aligns to the formal 66.0 Ma Cretaceous-Paleogene boundary on the ICS chart.",
      },
      {
        sourceId: "amnhSixExtinctions",
        note: "AMNH estimates that about 75% of species living at the time were wiped out in the end-Cretaceous extinction.",
      },
    ],
  },
];
