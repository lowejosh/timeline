import type { TimelineOverlayBand } from "../timelineTypes";
import { yearsAgo } from "../timelineDateBuilders";

export const DEEP_TIME_LIFE_OVERLAYS: TimelineOverlayBand[] = [
  {
    id: "cambrian-explosion",
    label: "Cambrian explosion",
    shortLabel: "Cambrian Explosion",
    description:
      "A rapid burst of marine evolution in which most major animal lineages first appear in the fossil record, many with striking new body plans.",
    startYear: yearsAgo(570_000_000),
    endYear: yearsAgo(530_000_000),
    color: "rgb(82, 136, 138)",
    minZoom: 0,
    priority: 86,
    sourceRefs: [
      {
        sourceId: "berkeleyCambrianExplosion",
        note: "Understanding Evolution describes the Cambrian explosion as an evolutionary burst from about 570 to 530 million years ago in which many major animal lineages got their starts.",
      },
    ],
  },
  {
    id: "cambrian-substrate-revolution",
    label: "Cambrian Substrate Revolution",
    shortLabel: "Substrate Revolution",
    description:
      "Shallow seafloors shifted from firm microbial-mat surfaces toward increasingly burrowed, mixed sediments, transforming how benthic animals moved, fed, and survived.",
    startYear: yearsAgo(600_000_000),
    endYear: yearsAgo(500_000_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(98, 138, 126)",
    minZoom: 0,
    priority: 87,
    sourceRefs: [
      {
        sourceId: "gsaCambrianSubstrateRevolution",
        note: "GSA frames the Cambrian Substrate Revolution as a major ecological transition across the late Neoproterozoic to Cambrian interval, around 600 to 500 million years ago.",
      },
      {
        sourceId: "nhmLateEdiacaranTracks",
        note: "NHM describes late Ediacaran changes in locomotion and sensing as setting the stage for the Cambrian Substrate Revolution.",
      },
    ],
  },
  {
    id: "great-ordovician-biodiversification-event",
    label: "Great Ordovician Biodiversification Event",
    shortLabel: "GOBE",
    description:
      "During the second half of the Ordovician, marine communities diversified dramatically as brachiopods, crinoids, graptolites, and other groups reshaped ocean ecosystems that would persist through the Paleozoic.",
    startYear: yearsAgo(470_000_000),
    endYear: yearsAgo(445_000_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(92, 129, 104)",
    minZoom: 0,
    priority: 87,
    sourceRefs: [
      {
        sourceId: "gsaOrdovicianBiodiversificationEvent",
        note: "GSA describes the GOBE as a sustained 25-million-year increase in marine biodiversity.",
      },
      {
        sourceId: "samNobleOrdovicianCommunities",
        note: "Sam Noble Museum places the Ordovician Radiation in the second half of the Ordovician and emphasizes its long-lived reshaping of Paleozoic marine communities.",
      },
    ],
  },
  {
    id: "devonian-nekton-revolution",
    label: "Devonian Nekton Revolution",
    shortLabel: "Nekton Revolution",
    description:
      "Marine animals increasingly occupied the open water column as fish, ammonoids, and other fully swimming forms became a larger part of ocean ecosystems.",
    startYear: yearsAgo(419_000_000),
    endYear: yearsAgo(359_000_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(86, 126, 148)",
    minZoom: 0,
    priority: 87,
    sourceRefs: [
      {
        sourceId: "umdMacroecologyNektonRevolution",
        note: "University of Maryland summarizes the Devonian Nekton Revolution as occurring throughout the Devonian, with a great increase in fully nektonic forms such as fish and ammonoids and occupation of more of the water column.",
      },
      {
        sourceId: "royalSocietyPalaeozoicWaterColumn",
        note: "The Royal Society review argues that water-column colonization was more gradual and cannot be pinned to a single narrow interval, which supports keeping this band broad and approximate rather than forcing a 410–400 Ma pulse.",
      },
    ],
  },
  {
    id: "carboniferous-rainforest-collapse",
    label: "Carboniferous Rainforest Collapse",
    shortLabel: "Rainforest Collapse",
    description:
      "A late-Carboniferous environmental shift fragmented humid coal-forest habitats, drove plant losses, and reduced many amphibian-rich tetrapod communities as drier ecosystems spread.",
    startYear: yearsAgo(307_000_000),
    endYear: yearsAgo(299_000_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(108, 120, 78)",
    minZoom: 0,
    priority: 87,
    sourceRefs: [
      {
        sourceId: "birminghamCarboniferousCurios",
        note: "The University of Birmingham dates the major environmental change termed the Carboniferous Rainforest Collapse to around 307 million years ago.",
      },
      {
        sourceId: "nhmCarboniferousRainforestCollapse",
        note: "NHM describes the collapse as a widespread extinction tied to moist habitats giving way to drier ones.",
      },
      {
        sourceId: "icsChart2024",
        note: "The app clips this transition band to the Carboniferous-Permian boundary for a clean, bounded late-Carboniferous interval.",
      },
    ],
  },
  {
    id: "mesozoic-marine-revolution",
    label: "Mesozoic Marine Revolution",
    shortLabel: "Marine Revolution",
    description:
      "A gradual predator-prey arms race reshaped marine ecosystems as shell-crushing and drilling predators spread, pushing prey toward thicker armor, burrowing, and greater mobility.",
    startYear: yearsAgo(252_000_000),
    endYear: yearsAgo(66_000_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(88, 118, 144)",
    minZoom: 0,
    priority: 87,
    sourceRefs: [
      {
        sourceId: "frontiersTriassicRevolution",
        note: "Frontiers reviews the Mesozoic Marine Revolution as beginning from the Early Triassic onward, with predator-prey escalation already underway by the Middle and Late Triassic and additional bursts later in the Mesozoic.",
      },
    ],
  },
  {
    id: "age-of-dinosaurs",
    label: "Age of Dinosaurs",
    shortLabel: "Dinosaurs",
    description:
      "Dinosaurs and other archosaurs dominated life on land through most of the Mesozoic, while early birds and mammals emerged in their shadow.",
    startYear: yearsAgo(201_400_000),
    endYear: yearsAgo(66_000_000),
    color: "rgb(136, 104, 76)",
    minZoom: 0,
    priority: 88,
    sourceRefs: [
      {
        sourceId: "ucmpMesozoicLife",
        note: "UCMP summarizes Mesozoic terrestrial life by noting that dinosaurs and other archosaurs dominated the land biota; the app uses a broad post-end-Triassic to end-Cretaceous band for that familiar public-facing phase.",
      },
      {
        sourceId: "smithsonianExtinctionOverTime",
        note: "The band ends at the 66 million-year-old end-Cretaceous mass extinction, when all non-avian dinosaurs disappeared.",
      },
      {
        sourceId: "icsChart2024",
        note: "Band start is aligned to the app's Jurassic threshold for a clean system-level transition after the end-Triassic extinction interval.",
      },
    ],
  },
  {
    id: "paleocene-eocene-thermal-maximum",
    label: "Paleocene-Eocene Thermal Maximum",
    shortLabel: "PETM",
    description:
      "A rapid global warming pulse near the Paleocene-Eocene boundary raised temperatures by about 5 to 9°C and dramatically affected life on land and in the oceans.",
    startYear: yearsAgo(56_000_000),
    endYear: yearsAgo(55_800_000),
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(164, 118, 88)",
    minZoom: 0,
    priority: 88,
    sourceRefs: [
      {
        sourceId: "amnhPaleoceneEoceneThermalMaximum",
        note: "AMNH describes the PETM as a warming event about 55 million years ago in which global surface temperature rose 5 to 9°C, lasting upwards of 170,000 years and dramatically affecting life on land and in the oceans.",
      },
      {
        sourceId: "nhmPaleoceneEoceneThermalMaximum",
        note: "NHM dates the PETM to around 55.8 million years ago and describes it as the most rapid and significant climatic warming pulse of the past 65 million years, with extinctions among some deep-sea organisms, plankton, and terrestrial mammals.",
      },
    ],
  },
];
