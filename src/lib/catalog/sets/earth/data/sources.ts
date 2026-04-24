import type { EraSource } from "@/lib/core/timelineTypes";

export const EARTH_SOURCES = {
  amnhPaleoceneEoceneThermalMaximum: {
    shortTitle: "AMNH: PETM",
    title: "PETM: Unearthing Ancient Climate Change",
    organization: "American Museum of Natural History",
    citation:
      'American Museum of Natural History, "PETM: Unearthing Ancient Climate Change."',
    url: "https://www.amnh.org/explore/videos/earth-and-climate/paleocene-eocene-thermal-maximum",
  },
  amnhSixExtinctions: {
    shortTitle: "AMNH: Six extinctions",
    title: "Six Extinctions",
    organization: "American Museum of Natural History",
    citation: 'American Museum of Natural History, "Six Extinctions."',
    url: "https://www.amnh.org/explore/videos/shelf-life/six-extinctions",
  },
  amnhZirconsEarlyEarth: {
    shortTitle: "AMNH: Early Earth zircons",
    title: "Zircons: Time Capsules from the Early Earth",
    organization: "American Museum of Natural History",
    citation:
      'American Museum of Natural History, "Zircons: Time Capsules from the Early Earth."',
    url: "https://www.amnh.org/explore/videos/earth-and-climate/zircons",
  },
  asmGreatOxidationEvent: {
    shortTitle: "ASM: Great Oxidation Event",
    title: "The Great Oxidation Event: How Cyanobacteria Changed Life",
    organization: "American Society for Microbiology",
    citation:
      'American Society for Microbiology, "The Great Oxidation Event: How Cyanobacteria Changed Life."',
    url: "https://asm.org/articles/2022/february/the-great-oxidation-event-how-cyanobacteria-change",
  },
  australianMuseumCretaceous: {
    shortTitle: "Australian Museum: Cretaceous",
    title: "The Cretaceous Period (146-65 million years ago)",
    organization: "Australian Museum",
    citation:
      'Australian Museum, "The Cretaceous Period (146-65 million years ago)."',
    url: "https://australian.museum/learn/australia-over-time/evolving-landscape/the-cretaceous-period/",
  },
  berkeleyBirdOrigin: {
    shortTitle: "Berkeley: origin of birds",
    title: "The origin of birds",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "The origin of birds." University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/what-are-evograms/the-origin-of-birds/",
  },
  berkeleyCambrianExplosion: {
    shortTitle: "Berkeley: Cambrian explosion",
    title: "The Cambrian explosion",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "The Cambrian explosion." University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/what-are-evograms/the-cambrian-explosion/",
  },
  berkeleyOriginOfLife: {
    shortTitle: "Berkeley: origin of life",
    title: "When did life originate?",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "When did life originate?" University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/from-soup-to-cells-the-origin-of-life/when-did-life-originate/",
  },
  berkeleyTetrapodOrigin: {
    shortTitle: "Berkeley: tetrapods",
    title: "The origin of tetrapods",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "The origin of tetrapods." University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/what-are-evograms/the-origin-of-tetrapods/",
  },
  birminghamCarboniferousCurios: {
    shortTitle: "Birmingham: Alveley footprints",
    title: "Carboniferous Curios: the Alveley Footprints",
    organization: "University of Birmingham",
    citation:
      'University of Birmingham, "Carboniferous Curios: the Alveley Footprints."',
    url: "https://www.birmingham.ac.uk/news/2024/carboniferous-curios-the-alveley-footprints",
  },
  britannicaCarboniferousPeriod: {
    shortTitle: "Britannica: Carboniferous",
    title: "Carboniferous Period",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Carboniferous Period."',
    url: "https://www.britannica.com/science/Carboniferous-Period",
  },
  frontiersTriassicRevolution: {
    shortTitle: "Frontiers: Triassic Revolution",
    title: "Triassic Revolution",
    organization: "Frontiers in Earth Science",
    citation:
      'Benton, M. J., and Wu, F. (2022), "Triassic Revolution." Frontiers in Earth Science 10:899541. doi:10.3389/feart.2022.899541.',
    url: "https://www.frontiersin.org/journals/earth-science/articles/10.3389/feart.2022.899541/full",
  },
  geoscienceworldLateOrdovicianExtinction: {
    shortTitle: "GSW: Late Ordovician extinction",
    title:
      "Late Ordovician mass extinction caused by volcanism, warming, and anoxia, not cooling and glaciation",
    organization: "GeoScienceWorld",
    citation:
      'GeoScienceWorld, "Late Ordovician mass extinction caused by volcanism, warming, and anoxia, not cooling and glaciation."',
  },
  gsaCambrianSubstrateRevolution: {
    shortTitle: "GSA: Cambrian substrate revolution",
    title: "The Cambrian Substrate Revolution",
    organization: "Geological Society of America",
    citation:
      'Bottjer, D. J., Hagadorn, J. W., and Dornbos, S. Q. (2000), "The Cambrian Substrate Revolution." GSA Today.',
    url: "https://rock.geosociety.org/gsatoday/archive/10/9/article/i1052-5173-10-9-1.htm",
  },
  gsaOrdovicianBiodiversificationEvent: {
    shortTitle: "GSA: GOBE",
    title:
      "Understanding the Great Ordovician Biodiversification Event (GOBE): Influences of paleogeography, paleoclimate, or paleoecology?",
    organization: "Geological Society of America",
    citation:
      'Servais, T., Harper, D. A. T., Munnecke, A., Owen, A. W., and Sheehan, P. M. (2009), "Understanding the Great Ordovician Biodiversification Event (GOBE): Influences of paleogeography, paleoclimate, or paleoecology?" GSA Today.',
    url: "https://rock.geosociety.org/net/gsatoday/archive/19/4/abstract/i1052-5173-19-4-4.htm",
  },
  gutenbergHistoricalGeologyMiller1922: {
    shortTitle: "Miller: Historical Geology",
    title: "An Introduction to Historical Geology",
    organization: "Project Gutenberg",
    citation:
      "Miller, W. J. (1922), An Introduction to Historical Geology. Project Gutenberg eBook #41660.",
    url: "https://www.gutenberg.org/files/41660/41660-h/41660-h.htm",
  },
  icsChart2024: {
    shortTitle: "ICS Chart v2024/12",
    title: "International Chronostratigraphic Chart v2024/12",
    organization: "International Commission on Stratigraphy",
    citation:
      'Cohen, K. M., Finney, S. C., Gibbard, P. L., Fan, J.-X. (2025). "The ICS international chronostratigraphic chart this decade." Episodes. DOI: 10.18814/epiiugs/2025/025001.',
    url: "https://stratigraphy.org/chart",
  },
  museumsVictoria600MillionYears: {
    shortTitle: "Museums Victoria: 600 Million Years",
    title: "600 Million Years: Victoria Evolves",
    organization: "Museums Victoria",
    citation: 'Museums Victoria, "600 Million Years: Victoria Evolves."',
    url: "https://museumsvictoria.com.au/melbournemuseum/resources/600-million-years/",
  },
  museumsVictoriaPalaeobotany: {
    shortTitle: "Museums Victoria: Palaeobotany",
    title: "Palaeobotany",
    organization: "Museums Victoria",
    citation:
      'Rich, T., Pickering, D. and Pawley, K. (2012), "Palaeobotany." Museums Victoria Collections.',
    url: "https://collections.museumsvictoria.com.au/collections/14168",
  },
  nasaGreatDying: {
    shortTitle: "NASA: Great Dying",
    title: "The Great Dying",
    organization: "NASA",
    citation: 'NASA, "The Great Dying."',
    url: "https://science.nasa.gov/science-research/earth-science/the-great-dying/",
  },
  nasaMoonFormation: {
    shortTitle: "NASA: Moon Formation",
    title: "Moon Formation",
    organization: "NASA",
    citation: 'NASA, "Moon Formation," Science Mission Directorate.',
    url: "https://science.nasa.gov/moon/formation/",
  },
  nationalMuseumEarliestVascularPlants: {
    shortTitle: "National Museum: earliest vascular plants",
    title:
      "The earliest vascular terrestrial plants and polymorphs of the Silurian and Lower Devonian periods in Barrandien, Czech Republic",
    organization: "National Museum, Prague",
    citation:
      'National Museum, Prague, "The earliest vascular terrestrial plants and polymorphs of the Silurian and Lower Devonian periods in Barrandien, Czech Republic."',
    url: "https://www.nm.cz/en/about-us/science-and-research/the-earliest-vascular-terrestrial-plants-and-polymorphs-of-the-silurian-and-lower-devonian-periods-in-barrandien-czech-republic",
  },
  nhmCarboniferousRainforestCollapse: {
    shortTitle: "NHM: Carboniferous collapse",
    title:
      "New species of “living fossil” had jaws unlike anything seen before",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "New species of “living fossil” had jaws unlike anything seen before."',
    url: "https://www.nhm.ac.uk/discover/news/2026/march/new-species-living-fossil-had-jaws-unlike-anything-seen-before.html",
  },
  nhmEarliestFossilisedForest: {
    shortTitle: "NHM: earliest fossil forest",
    title: "Earliest fossilised forest discovered in Somerset",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "Earliest fossilised forest discovered in Somerset."',
    url: "https://www.nhm.ac.uk/discover/news/2024/march/earliest-fossilised-forest-discovered-in-somerset.html",
  },
  nhmFirstLandPlants: {
    shortTitle: "NHM: first land plants",
    title: "New group of plants was one of the first to colonise the land",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "New group of plants was one of the first to colonise the land."',
    url: "https://www.nhm.ac.uk/discover/news/2022/february/new-group-plants-was-one-first-colonise-land.html",
  },
  nhmLateEdiacaranTracks: {
    shortTitle: "NHM: Ediacaran tracks",
    title:
      "Complex animals living millions of years before the Cambrian Explosion revealed by seabed tracks",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "Complex animals living millions of years before the Cambrian Explosion revealed by seabed tracks."',
    url: "https://www.nhm.ac.uk/discover/news/2025/july/complex-animals-living-before-cambrian-explosion.html",
  },
  nhmPaleoceneEoceneThermalMaximum: {
    shortTitle: "NHM: PETM",
    title: "Paleocene-Eocene Thermal Maximum (PETM)",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "Paleocene-Eocene Thermal Maximum (PETM)."',
    url: "https://www.nhm.ac.uk/our-science/research/projects/paleocene-eocene-thermal-maximum.html",
  },
  nsfLateDevonianExtinction: {
    shortTitle: "NSF: Late Devonian extinction",
    title:
      "Climate change factors in the fossil record that accelerate mass extinction",
    organization: "U.S. National Science Foundation",
    citation:
      'U.S. National Science Foundation, "Climate change factors in the fossil record that accelerate mass extinction."',
    url: "https://www.nsf.gov/news/climate-change-factors-fossil-record-accelerate",
  },
  nysmOldestTrees: {
    shortTitle: "NYSM: oldest trees",
    title: "Re-Examining the Earth's Oldest Trees",
    organization: "New York State Museum",
    citation:
      'New York State Museum, "Re-Examining the Earth\'s Oldest Trees."',
    url: "https://nysm.nysed.gov/paleontology/paleobotany/news/re-examining-earths-oldest-trees",
  },
  royalSocietyPalaeozoicWaterColumn: {
    shortTitle: "Royal Society: water-column colonization",
    title:
      "The Palaeozoic colonization of the water column and the rise of global nekton",
    organization: "The Royal Society",
    citation:
      'Whalen, C. D., and Briggs, D. E. G. (2018), "The Palaeozoic colonization of the water column and the rise of global nekton." Proceedings of the Royal Society B 285:20180883. doi:10.1098/rspb.2018.0883.',
    url: "https://royalsocietypublishing.org/rspb/article/285/1883/20180883/84706/The-Palaeozoic-colonization-of-the-water-column",
  },
  samNobleOrdovicianCommunities: {
    shortTitle: "Sam Noble: Ordovician communities",
    title: "Ordovician communities",
    organization: "Sam Noble Museum",
    citation: 'Sam Noble Museum, "Ordovician communities."',
    url: "https://samnoblemuseum.ou.edu/common-fossils-of-oklahoma/paleocommunities/marine-communities/ordovician-communities/",
  },
  smithsonianExtinctionOverTime: {
    shortTitle: "Smithsonian: Extinction Over Time",
    title: "Extinction Over Time",
    organization: "Smithsonian National Museum of Natural History",
    citation:
      'Smithsonian National Museum of Natural History, "Extinction Over Time."',
    url: "https://naturalhistory.si.edu/education/teaching-resources/paleontology/extinction-over-time",
  },
  smithsonianTriassicLife: {
    shortTitle: "Smithsonian: Triassic Life",
    title: "Triassic Life, Extinction, and Recovery",
    organization: "Smithsonian National Museum of Natural History",
    citation:
      'Smithsonian National Museum of Natural History, "Triassic Life, Extinction, and Recovery."',
    url: "https://naturalhistory.si.edu/education/teaching-resources/paleontology/triassic-life-extinction-and-recovery",
  },
  ucmpArchosauriaFossilRecord: {
    shortTitle: "UCMP: Archosaur fossil record",
    title: "Archosauria: Fossil Record",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Archosauria: Fossil Record."',
    url: "https://ucmp.berkeley.edu/diapsids/archofr.html",
  },
  ucmpCyanobacteria: {
    shortTitle: "UCMP: Cyanobacteria",
    title: "Introduction to the Cyanobacteria",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Introduction to the Cyanobacteria."',
    url: "https://ucmp.berkeley.edu/bacteria/cyanointro.html",
  },
  ucmpEukaryota: {
    shortTitle: "UCMP: Eukaryota",
    title: "Introduction to the Eukaryota",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Introduction to the Eukaryota."',
    url: "https://ucmp.berkeley.edu/alllife/eukaryota.html",
  },
  ucmpGeologicTimeScaleGuide: {
    shortTitle: "UCMP: geologic time scale",
    title: "The Geologic Time Scale",
    organization: "University of California Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "The Geologic Time Scale."',
    url: "https://ucmp.berkeley.edu/help/timeform.php",
  },
  ucmpMesozoicLife: {
    shortTitle: "UCMP: Mesozoic life",
    title: "Mesozoic Era: Life",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Mesozoic Era: Life."',
    url: "https://ucmp.berkeley.edu/mesozoic/mesozoiclife.html",
  },
  umdMacroecologyNektonRevolution: {
    shortTitle: "UMD: Devonian Nekton Revolution",
    title: "GEOL 331/BSCI 333 Principles of Paleontology: Macroecology",
    organization: "University of Maryland",
    citation:
      'Holtz, T. R. Jr., "GEOL 331/BSCI 333 Principles of Paleontology: Macroecology." University of Maryland, last modified December 7, 2020.',
    url: "https://www.geol.umd.edu/~tholtz/G331/lectures/331macroecol.html",
  },
  universityMelbourneFlowersReachedAustralia: {
    shortTitle: "Unimelb: flowers reached Australia",
    title: "When flowers reached Australia",
    organization: "The University of Melbourne",
    citation: 'The University of Melbourne, "When flowers reached Australia."',
    url: "https://www.unimelb.edu.au/newsroom/news/2019/december/when-flowers-reached-australia",
  },
  usgsAgeOfEarth: {
    shortTitle: "USGS: Age of Earth",
    title: "How old is Earth?",
    organization: "U.S. Geological Survey",
    citation: 'U.S. Geological Survey, "How old is Earth?" FAQ.',
    url: "https://www.usgs.gov/faqs/how-old-earth",
  },
  uwMadisonCoolEarlyEarth: {
    shortTitle: "UW–Madison: cool early Earth",
    title: "Oldest bit of crust firms up idea of a cool early Earth",
    organization: "University of Wisconsin–Madison",
    citation:
      'University of Wisconsin–Madison, "Oldest bit of crust firms up idea of a cool early Earth."',
    url: "https://news.wisc.edu/oldest-bit-of-crust-firms-up-idea-of-a-cool-early-earth/",
  },
} as const satisfies Record<string, EraSource>;
