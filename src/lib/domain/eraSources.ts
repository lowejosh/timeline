export type EraSource = {
  shortTitle: string;
  title: string;
  organization: string;
  citation: string;
  url?: string;
};

export const ERA_SOURCES = {
  nasaUniverseOverview: {
    shortTitle: "NASA: Cosmic History",
    title: "Universe: Cosmic History",
    organization: "NASA",
    citation: 'NASA, "Universe: Cosmic History," Science Mission Directorate.',
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
  nasaStarBasics: {
    shortTitle: "NASA: Star Basics",
    title: "Star Basics",
    organization: "NASA",
    citation: 'NASA, "Star Basics," Science Mission Directorate.',
    url: "https://science.nasa.gov/universe/stars/",
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
  usgsAgeOfEarth: {
    shortTitle: "USGS: Age of Earth",
    title: "How old is Earth?",
    organization: "U.S. Geological Survey",
    citation: 'U.S. Geological Survey, "How old is Earth?" FAQ.',
    url: "https://www.usgs.gov/faqs/how-old-earth",
  },
  nasaMoonFormation: {
    shortTitle: "NASA: Moon Formation",
    title: "Moon Formation",
    organization: "NASA",
    citation: 'NASA, "Moon Formation," Science Mission Directorate.',
    url: "https://science.nasa.gov/moon/formation/",
  },
  amnhZirconsEarlyEarth: {
    shortTitle: "AMNH: Early Earth zircons",
    title: "Zircons: Time Capsules from the Early Earth",
    organization: "American Museum of Natural History",
    citation:
      'American Museum of Natural History, "Zircons: Time Capsules from the Early Earth."',
    url: "https://www.amnh.org/explore/videos/earth-and-climate/zircons",
  },
  uwMadisonCoolEarlyEarth: {
    shortTitle: "UW–Madison: cool early Earth",
    title: "Oldest bit of crust firms up idea of a cool early Earth",
    organization: "University of Wisconsin–Madison",
    citation:
      'University of Wisconsin–Madison, "Oldest bit of crust firms up idea of a cool early Earth."',
    url: "https://news.wisc.edu/oldest-bit-of-crust-firms-up-idea-of-a-cool-early-earth/",
  },
  icsChart2024: {
    shortTitle: "ICS Chart v2024/12",
    title: "International Chronostratigraphic Chart v2024/12",
    organization: "International Commission on Stratigraphy",
    citation:
      'Cohen, K. M., Finney, S. C., Gibbard, P. L., Fan, J.-X. (2025). "The ICS international chronostratigraphic chart this decade." Episodes. DOI: 10.18814/epiiugs/2025/025001.',
    url: "https://stratigraphy.org/chart",
  },
  ucmpGeologicTimeScaleGuide: {
    shortTitle: "UCMP: geologic time scale",
    title: "The Geologic Time Scale",
    organization: "University of California Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "The Geologic Time Scale."',
    url: "https://ucmp.berkeley.edu/help/timeform.php",
  },
  gutenbergHistoricalGeologyMiller1922: {
    shortTitle: "Miller: Historical Geology",
    title: "An Introduction to Historical Geology",
    organization: "Project Gutenberg",
    citation:
      'Miller, W. J. (1922), An Introduction to Historical Geology. Project Gutenberg eBook #41660.',
    url: "https://www.gutenberg.org/files/41660/41660-h/41660-h.htm",
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
  asmGreatOxidationEvent: {
    shortTitle: "ASM: Great Oxidation Event",
    title: "The Great Oxidation Event: How Cyanobacteria Changed Life",
    organization: "American Society for Microbiology",
    citation:
      'American Society for Microbiology, "The Great Oxidation Event: How Cyanobacteria Changed Life."',
    url: "https://asm.org/articles/2022/february/the-great-oxidation-event-how-cyanobacteria-change",
  },
  geoscienceworldLateOrdovicianExtinction: {
    shortTitle: "GSW: Late Ordovician extinction",
    title:
      "Late Ordovician mass extinction caused by volcanism, warming, and anoxia, not cooling and glaciation",
    organization: "GeoScienceWorld",
    citation:
      'GeoScienceWorld, "Late Ordovician mass extinction caused by volcanism, warming, and anoxia, not cooling and glaciation."',
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
  nasaGreatDying: {
    shortTitle: "NASA: Great Dying",
    title: "The Great Dying",
    organization: "NASA",
    citation: 'NASA, "The Great Dying."',
    url: "https://science.nasa.gov/science-research/earth-science/the-great-dying/",
  },
  amnhSixExtinctions: {
    shortTitle: "AMNH: Six extinctions",
    title: "Six Extinctions",
    organization: "American Museum of Natural History",
    citation: 'American Museum of Natural History, "Six Extinctions."',
    url: "https://www.amnh.org/explore/videos/shelf-life/six-extinctions",
  },
  berkeleyCambrianExplosion: {
    shortTitle: "Berkeley: Cambrian explosion",
    title: "The Cambrian explosion",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "The Cambrian explosion." University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/what-are-evograms/the-cambrian-explosion/",
  },
  gsaCambrianSubstrateRevolution: {
    shortTitle: "GSA: Cambrian substrate revolution",
    title: "The Cambrian Substrate Revolution",
    organization: "Geological Society of America",
    citation:
      'Bottjer, D. J., Hagadorn, J. W., and Dornbos, S. Q. (2000), "The Cambrian Substrate Revolution." GSA Today.',
    url: "https://rock.geosociety.org/gsatoday/archive/10/9/article/i1052-5173-10-9-1.htm",
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
  gsaOrdovicianBiodiversificationEvent: {
    shortTitle: "GSA: GOBE",
    title:
      "Understanding the Great Ordovician Biodiversification Event (GOBE): Influences of paleogeography, paleoclimate, or paleoecology?",
    organization: "Geological Society of America",
    citation:
      'Servais, T., Harper, D. A. T., Munnecke, A., Owen, A. W., and Sheehan, P. M. (2009), "Understanding the Great Ordovician Biodiversification Event (GOBE): Influences of paleogeography, paleoclimate, or paleoecology?" GSA Today.',
    url: "https://rock.geosociety.org/net/gsatoday/archive/19/4/abstract/i1052-5173-19-4-4.htm",
  },
  samNobleOrdovicianCommunities: {
    shortTitle: "Sam Noble: Ordovician communities",
    title: "Ordovician communities",
    organization: "Sam Noble Museum",
    citation: 'Sam Noble Museum, "Ordovician communities."',
    url: "https://samnoblemuseum.ou.edu/common-fossils-of-oklahoma/paleocommunities/marine-communities/ordovician-communities/",
  },
  umdMacroecologyNektonRevolution: {
    shortTitle: "UMD: Devonian Nekton Revolution",
    title: "GEOL 331/BSCI 333 Principles of Paleontology: Macroecology",
    organization: "University of Maryland",
    citation:
      'Holtz, T. R. Jr., "GEOL 331/BSCI 333 Principles of Paleontology: Macroecology." University of Maryland, last modified December 7, 2020.',
    url: "https://www.geol.umd.edu/~tholtz/G331/lectures/331macroecol.html",
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
  berkeleyTetrapodOrigin: {
    shortTitle: "Berkeley: tetrapods",
    title: "The origin of tetrapods",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "The origin of tetrapods." University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/what-are-evograms/the-origin-of-tetrapods/",
  },
  berkeleyBirdOrigin: {
    shortTitle: "Berkeley: origin of birds",
    title: "The origin of birds",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "The origin of birds." University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/what-are-evograms/the-origin-of-birds/",
  },
  berkeleyMammalAncestors: {
    shortTitle: "Berkeley: mammal ancestors",
    title: "Jaws to ears in the ancestors of mammals",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "Jaws to ears in the ancestors of mammals." University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/what-are-evograms/jaws-to-ears-in-the-ancestors-of-mammals/",
  },
  ucmpArchaean: {
    shortTitle: "UCMP: Archaean",
    title: "Introduction to the Archaean",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Introduction to the Archaean."',
    url: "https://ucmp.berkeley.edu/precambrian/archaean.html",
  },
  ucmpVendian: {
    shortTitle: "UCMP: Vendian",
    title: "Introduction to the Vendian Period",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Introduction to the Vendian Period."',
    url: "https://ucmp.berkeley.edu/vendian/vendian.html",
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
  ucmpPlantae: {
    shortTitle: "UCMP: Plantae",
    title: "Introduction to the Plantae",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Introduction to the Plantae."',
    url: "https://ucmp.berkeley.edu/plants/plantae.html",
  },
  ucmpSilurian: {
    shortTitle: "UCMP: Silurian",
    title: "The Silurian",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "The Silurian."',
    url: "https://ucmp.berkeley.edu/silurian/silurian.html",
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
  hkuSilurianCoralReefs: {
    shortTitle: "HKU: Silurian reefs",
    title: "Silurian Coral Reefs",
    organization: "Stephen Hui Geological Museum, The University of Hong Kong",
    citation:
      'Stephen Hui Geological Museum, The University of Hong Kong, "Silurian Coral Reefs."',
    url: "https://shmuseum.hku.hk/education/earth-evolution/early-paleozoic/early-paleozoic-biosphere/silurian-coral-reefs",
  },
  fieldMuseumSilurian: {
    shortTitle: "Field Museum: Silurian",
    title: "Silurian",
    organization: "Field Museum / Milwaukee Public Museum",
    citation:
      'Field Museum and Milwaukee Public Museum, "Silurian" (Virtual Silurian Reef project).',
    url: "https://silurian-reef.fieldmuseum.org/narrative/439",
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
  nhmEarliestFossilisedForest: {
    shortTitle: "NHM: earliest fossil forest",
    title: "Earliest fossilised forest discovered in Somerset",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "Earliest fossilised forest discovered in Somerset."',
    url: "https://www.nhm.ac.uk/discover/news/2024/march/earliest-fossilised-forest-discovered-in-somerset.html",
  },
  nysmOldestTrees: {
    shortTitle: "NYSM: oldest trees",
    title: "Re-Examining the Earth's Oldest Trees",
    organization: "New York State Museum",
    citation:
      'New York State Museum, "Re-Examining the Earth\'s Oldest Trees."',
    url: "https://nysm.nysed.gov/paleontology/paleobotany/news/re-examining-earths-oldest-trees",
  },
  australianMuseumCretaceous: {
    shortTitle: "Australian Museum: Cretaceous",
    title: "The Cretaceous Period (146-65 million years ago)",
    organization: "Australian Museum",
    citation:
      'Australian Museum, "The Cretaceous Period (146-65 million years ago)."',
    url: "https://australian.museum/learn/australia-over-time/evolving-landscape/the-cretaceous-period/",
  },
  universityMelbourneFlowersReachedAustralia: {
    shortTitle: "Unimelb: flowers reached Australia",
    title: "When flowers reached Australia",
    organization: "The University of Melbourne",
    citation: 'The University of Melbourne, "When flowers reached Australia."',
    url: "https://www.unimelb.edu.au/newsroom/news/2019/december/when-flowers-reached-australia",
  },
  britannicaDevonianPeriod: {
    shortTitle: "Britannica: Devonian",
    title: "Devonian Period",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Devonian Period."',
    url: "https://www.britannica.com/science/Devonian-Period",
  },
  ucmpDevonian: {
    shortTitle: "UCMP: Devonian",
    title: "The Devonian",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "The Devonian."',
    url: "https://ucmp.berkeley.edu/devonian/devonian.html",
  },
  ucmpCarboniferous: {
    shortTitle: "UCMP: Carboniferous",
    title: "The Carboniferous",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "The Carboniferous."',
    url: "https://ucmp.berkeley.edu/carboniferous/carboniferous.html",
  },
  ucmpMesozoicLife: {
    shortTitle: "UCMP: Mesozoic life",
    title: "Mesozoic Era: Life",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Mesozoic Era: Life."',
    url: "https://ucmp.berkeley.edu/mesozoic/mesozoiclife.html",
  },
  ucmpArchosauriaFossilRecord: {
    shortTitle: "UCMP: Archosaur fossil record",
    title: "Archosauria: Fossil Record",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Archosauria: Fossil Record."',
    url: "https://ucmp.berkeley.edu/diapsids/archofr.html",
  },
  ucmpJurassicLife: {
    shortTitle: "UCMP: Jurassic life",
    title: "Jurassic Period: Life",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Jurassic Period: Life."',
    url: "https://ucmp.berkeley.edu/mesozoic/jurassic/jurassiclife.html",
  },
  ucmpCretaceousPeriod: {
    shortTitle: "UCMP: Cretaceous",
    title: "The Cretaceous Period",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "The Cretaceous Period."',
    url: "https://ucmp.berkeley.edu/mesozoic/cretaceous/cretaceous.html",
  },
  britannicaCarboniferousPeriod: {
    shortTitle: "Britannica: Carboniferous",
    title: "Carboniferous Period",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Carboniferous Period."',
    url: "https://www.britannica.com/science/Carboniferous-Period",
  },
  ucmpPermian: {
    shortTitle: "UCMP: Permian",
    title: "The Permian",
    organization: "UC Museum of Paleontology",
    citation: 'University of California Museum of Paleontology, "The Permian."',
    url: "https://ucmp.berkeley.edu/permian/permian.html",
  },
  britannicaPermianPeriod: {
    shortTitle: "Britannica: Permian",
    title: "Permian Period",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Permian Period."',
    url: "https://www.britannica.com/science/Permian-Period",
  },
  smithsonianHumanOrigins: {
    shortTitle: "Smithsonian Human Origins",
    title: "Interactive Human Origins Timeline",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Interactive Human Origins Timeline."',
    url: "https://humanorigins.si.edu/evidence/human-evolution-interactive-timeline",
  },
  smithsonianHomoSapiens: {
    shortTitle: "Smithsonian: Homo sapiens",
    title: "Homo sapiens",
    organization: "Smithsonian Institution Human Origins Program",
    citation: 'Smithsonian Institution, Human Origins Program, "Homo sapiens."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
  },
  smithsonianHumanEvolutionIntro: {
    shortTitle: "Smithsonian: Human evolution intro",
    title: "Introduction to Human Evolution",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Introduction to Human Evolution."',
    url: "https://humanorigins.si.edu/education/introduction-human-evolution",
  },
  smithsonianHumanFamilyTree: {
    shortTitle: "Smithsonian: Family tree",
    title: "Human Family Tree",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Human Family Tree."',
    url: "https://humanorigins.si.edu/evidence/human-family-tree",
  },
  smithsonianSahelanthropus: {
    shortTitle: "Smithsonian: Sahelanthropus",
    title: "Sahelanthropus tchadensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Sahelanthropus tchadensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/sahelanthropus-tchadensis",
  },
  smithsonianOrrorin: {
    shortTitle: "Smithsonian: Orrorin",
    title: "Orrorin tugenensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Orrorin tugenensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/orrorin-tugenensis",
  },
  smithsonianArdipithecusRamidus: {
    shortTitle: "Smithsonian: Ardipithecus ramidus",
    title: "Ardipithecus ramidus",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Ardipithecus ramidus."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/ardipithecus-ramidus",
  },
  smithsonianAustralopithecusAnamensis: {
    shortTitle: "Smithsonian: Au. anamensis",
    title: "Australopithecus anamensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Australopithecus anamensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/australopithecus-anamensis",
  },
  smithsonianAustralopithecusAfarensis: {
    shortTitle: "Smithsonian: Au. afarensis",
    title: "Australopithecus afarensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Australopithecus afarensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/australopithecus-afarensis",
  },
  smithsonianHomoHabilis: {
    shortTitle: "Smithsonian: Homo habilis",
    title: "Homo habilis",
    organization: "Smithsonian Institution Human Origins Program",
    citation: 'Smithsonian Institution, Human Origins Program, "Homo habilis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-habilis",
  },
  smithsonianHomoErectus: {
    shortTitle: "Smithsonian: Homo erectus",
    title: "Homo erectus",
    organization: "Smithsonian Institution Human Origins Program",
    citation: 'Smithsonian Institution, Human Origins Program, "Homo erectus."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-erectus",
  },
  smithsonianHomoHeidelbergensis: {
    shortTitle: "Smithsonian: Homo heidelbergensis",
    title: "Homo heidelbergensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Homo heidelbergensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-heidelbergensis",
  },
  smithsonianHomoNeanderthalensis: {
    shortTitle: "Smithsonian: Neanderthals",
    title: "Homo neanderthalensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Homo neanderthalensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-neanderthalensis",
  },
  smithsonianHomoFloresiensis: {
    shortTitle: "Smithsonian: Homo floresiensis",
    title: "Homo floresiensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Homo floresiensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-floresiensis",
  },
  smithsonianHomoNaledi: {
    shortTitle: "Smithsonian: Homo naledi",
    title: "Homo naledi",
    organization: "Smithsonian Institution Human Origins Program",
    citation: 'Smithsonian Institution, Human Origins Program, "Homo naledi."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-naledi",
  },
  smithsonianParanthropusBoisei: {
    shortTitle: "Smithsonian: P. boisei",
    title: "Paranthropus boisei",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Paranthropus boisei."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/paranthropus-boisei",
  },
  smithsonianArdipithecusKadabba: {
    shortTitle: "Smithsonian: Ardipithecus kadabba",
    title: "Ardipithecus kadabba",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Ardipithecus kadabba."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/ardipithecus-kadabba",
  },
  smithsonianAustralopithecusAfricanus: {
    shortTitle: "Smithsonian: Au. africanus",
    title: "Australopithecus africanus",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Australopithecus africanus."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/australopithecus-africanus",
  },
  smithsonianAustralopithecusGarhi: {
    shortTitle: "Smithsonian: Au. garhi",
    title: "Australopithecus garhi",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Australopithecus garhi."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/australopithecus-garhi",
  },
  smithsonianAustralopithecusSediba: {
    shortTitle: "Smithsonian: Au. sediba",
    title: "Australopithecus sediba",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Australopithecus sediba."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/australopithecus-sediba",
  },
  smithsonianKenyanthropusPlatyops: {
    shortTitle: "Smithsonian: Kenyanthropus",
    title: "Kenyanthropus platyops",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Kenyanthropus platyops."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/kenyanthropus-platyops",
  },
  smithsonianHomoRudolfensis: {
    shortTitle: "Smithsonian: H. rudolfensis",
    title: "Homo rudolfensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Homo rudolfensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-rudolfensis",
  },
  smithsonianParanthropusAethiopicus: {
    shortTitle: "Smithsonian: P. aethiopicus",
    title: "Paranthropus aethiopicus",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Paranthropus aethiopicus."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/paranthropus-aethiopicus",
  },
  smithsonianParanthropusRobustus: {
    shortTitle: "Smithsonian: P. robustus",
    title: "Paranthropus robustus",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Paranthropus robustus."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/paranthropus-robustus",
  },
  khanPaleolithicCulture: {
    shortTitle: "Khan: Paleolithic culture",
    title: "Paleolithic technology, culture, and art",
    organization: "Khan Academy",
    citation: 'Khan Academy, "Paleolithic technology, culture, and art."',
    url: "https://www.khanacademy.org/humanities/world-history/world-history-beginnings/origin-humans-early-societies/a/paleolithic-culture-and-technology",
  },
  kakaduUbirr: {
    shortTitle: "Kakadu: Ubirr",
    title: "Ubirr",
    organization: "Kakadu National Park / Parks Australia",
    citation: 'Parks Australia, "Ubirr," Kakadu National Park.',
    url: "https://kakadu.gov.au/things-do/activities/rock-art/ubirr/",
  },
  khanNeolithicRevolution: {
    shortTitle: "Khan: Neolithic Revolution",
    title: "The Neolithic Revolution",
    organization: "Khan Academy / Smarthistory",
    citation: 'Khan Academy, "The Neolithic Revolution."',
    url: "https://www.khanacademy.org/humanities/world-history/world-history-beginnings/origin-humans-early-societies/a/the-neolithic-revolution",
  },
  metPrehistoricArt: {
    shortTitle: "Met: Prehistoric Art",
    title: "Introduction to Prehistoric Art, 20,000–8000 B.C.",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Tedesco, Laura Anne. "Introduction to Prehistoric Art, 20,000–8000 B.C." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/preh/hd_preh.htm",
  },
  natufianCultureWikipedia: {
    shortTitle: "Wikipedia: Natufian culture",
    title: "Natufian culture",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Natufian culture." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Natufian_culture",
  },
  khiamianCultureWikipedia: {
    shortTitle: "Wikipedia: Khiamian culture",
    title: "Khiamian culture",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Khiamian culture." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Khiamian_culture",
  },
  mureybetWikipedia: {
    shortTitle: "Wikipedia: Mureybet",
    title: "Mureybet",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Mureybet." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Mureybet",
  },
  cayonuWikipedia: {
    shortTitle: "Wikipedia: Çayönü",
    title: "Çayönü",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Çayönü." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/%C3%87ay%C3%B6n%C3%BC",
  },
  nevaliCoriWikipedia: {
    shortTitle: "Wikipedia: Nevalı Çori",
    title: "Nevalı Çori",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Nevalı Çori." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Neval%C4%B1_%C3%87ori",
  },
  prePotteryNeolithicAWikipedia: {
    shortTitle: "Wikipedia: Pre-Pottery Neolithic A",
    title: "Pre-Pottery Neolithic A",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Pre-Pottery Neolithic A." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Pre-Pottery_Neolithic_A",
  },
  originsOfAgricultureInWestAsiaWikipedia: {
    shortTitle: "Wikipedia: West Asian agriculture origins",
    title: "Origins of agriculture in West Asia",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Origins of agriculture in West Asia." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Origins_of_agriculture_in_West_Asia",
  },
  prePotteryNeolithicBWikipedia: {
    shortTitle: "Wikipedia: Pre-Pottery Neolithic B",
    title: "Pre-Pottery Neolithic B",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Pre-Pottery Neolithic B." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Pre-Pottery_Neolithic_B",
  },
  halafCultureWikipedia: {
    shortTitle: "Wikipedia: Halaf culture",
    title: "Halaf culture",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Halaf culture." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Halaf_culture",
  },
  samarraCultureWikipedia: {
    shortTitle: "Wikipedia: Samarra culture",
    title: "Samarra culture",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Samarra culture." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Samarra_culture",
  },
  ubaidPeriodWikipedia: {
    shortTitle: "Wikipedia: Ubaid period",
    title: "Ubaid period",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Ubaid period." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Ubaid_period",
  },
  chogaMamiWikipedia: {
    shortTitle: "Wikipedia: Choga Mami",
    title: "Choga Mami",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Choga Mami." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Choga_Mami",
  },
  metChauvet: {
    shortTitle: "Met: Chauvet Cave",
    title: "Chauvet Cave (ca. 30,000 B.C.)",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Clottes, Jean. "Chauvet Cave (ca. 30,000 B.C.)." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/chav/hd_chav.htm",
  },
  berkeleyOriginOfLife: {
    shortTitle: "Berkeley: origin of life",
    title: "When did life originate?",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "When did life originate?" University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/from-soup-to-cells-the-origin-of-life/when-did-life-originate/",
  },
  nhmFirstLandPlants: {
    shortTitle: "NHM: first land plants",
    title: "New group of plants was one of the first to colonise the land",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "New group of plants was one of the first to colonise the land."',
    url: "https://www.nhm.ac.uk/discover/news/2022/february/new-group-plants-was-one-first-colonise-land.html",
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
  frontiersTriassicRevolution: {
    shortTitle: "Frontiers: Triassic Revolution",
    title: "Triassic Revolution",
    organization: "Frontiers in Earth Science",
    citation:
      'Benton, M. J., and Wu, F. (2022), "Triassic Revolution." Frontiers in Earth Science 10:899541. doi:10.3389/feart.2022.899541.',
    url: "https://www.frontiersin.org/journals/earth-science/articles/10.3389/feart.2022.899541/full",
  },
  amnhPaleoceneEoceneThermalMaximum: {
    shortTitle: "AMNH: PETM",
    title: "PETM: Unearthing Ancient Climate Change",
    organization: "American Museum of Natural History",
    citation:
      'American Museum of Natural History, "PETM: Unearthing Ancient Climate Change."',
    url: "https://www.amnh.org/explore/videos/earth-and-climate/paleocene-eocene-thermal-maximum",
  },
  nhmPaleoceneEoceneThermalMaximum: {
    shortTitle: "NHM: PETM",
    title: "Paleocene-Eocene Thermal Maximum (PETM)",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "Paleocene-Eocene Thermal Maximum (PETM)."',
    url: "https://www.nhm.ac.uk/our-science/research/projects/paleocene-eocene-thermal-maximum.html",
  },
  birminghamCarboniferousCurios: {
    shortTitle: "Birmingham: Alveley footprints",
    title: "Carboniferous Curios: the Alveley Footprints",
    organization: "University of Birmingham",
    citation:
      'University of Birmingham, "Carboniferous Curios: the Alveley Footprints."',
    url: "https://www.birmingham.ac.uk/news/2024/carboniferous-curios-the-alveley-footprints",
  },
  britannicaOriginAgriculture: {
    shortTitle: "Britannica: origins of agriculture",
    title: "origins of agriculture",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "origins of agriculture."',
    url: "https://www.britannica.com/topic/agriculture/The-origin-of-agriculture",
  },
  britannicaMehrgarh: {
    shortTitle: "Britannica: Mehrgarh",
    title: "Mehrgarh",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Mehrgarh."',
    url: "https://www.britannica.com/place/Mehrgarh",
  },
  unescoGobekliTepe: {
    shortTitle: "UNESCO: Göbekli Tepe",
    title: "Göbekli Tepe",
    organization: "UNESCO World Heritage Centre",
    citation: 'UNESCO World Heritage Centre, "Göbekli Tepe."',
    url: "https://whc.unesco.org/en/list/1572/",
  },
  unescoCatalhoyuk: {
    shortTitle: "UNESCO: Çatalhöyük",
    title: "Neolithic Site of Çatalhöyük",
    organization: "UNESCO World Heritage Centre",
    citation: 'UNESCO World Heritage Centre, "Neolithic Site of Çatalhöyük."',
    url: "https://whc.unesco.org/en/list/1405/",
  },
  unescoStonehenge: {
    shortTitle: "UNESCO: Stonehenge",
    title: "Stonehenge, Avebury and Associated Sites",
    organization: "UNESCO World Heritage Centre",
    citation:
      'UNESCO World Heritage Centre, "Stonehenge, Avebury and Associated Sites."',
    url: "https://whc.unesco.org/en/list/373/",
  },
  unescoSwabianJura: {
    shortTitle: "UNESCO: Swabian Jura",
    title: "Caves and Ice Age Art in the Swabian Jura",
    organization: "UNESCO World Heritage Centre",
    citation:
      'UNESCO World Heritage Centre, "Caves and Ice Age Art in the Swabian Jura."',
    url: "https://whc.unesco.org/en/list/1527/",
  },
  unescoChauvet: {
    shortTitle: "UNESCO: Chauvet",
    title:
      "Decorated Cave of Pont d’Arc, known as Grotte Chauvet-Pont d’Arc, Ardèche",
    organization: "UNESCO World Heritage Centre",
    citation:
      'UNESCO World Heritage Centre, "Decorated Cave of Pont d’Arc, known as Grotte Chauvet-Pont d’Arc, Ardèche."',
    url: "https://whc.unesco.org/en/list/1426/",
  },
  metJiahu: {
    shortTitle: "Met: Jiahu",
    title: "Jiahu (ca. 7000–5700 B.C.)",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Tedesco, Laura Anne. "Jiahu (ca. 7000–5700 B.C.)." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/jiah/hd_jiah.htm",
  },
  britannicaBronzeAge: {
    shortTitle: "Britannica: Bronze Age",
    title: "Bronze Age",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Bronze Age."',
    url: "https://www.britannica.com/topic/Bronze-Age",
  },
  britannicaIronAge: {
    shortTitle: "Britannica: Iron Age",
    title: "Iron Age",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Iron Age."',
    url: "https://www.britannica.com/topic/Iron-Age",
  },
  britannicaClassicalAntiquity: {
    shortTitle: "Britannica: Classical antiquity",
    title: "Classical antiquity",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Classical antiquity."',
    url: "https://www.britannica.com/event/classical-antiquity",
  },
  britannicaMetallurgy: {
    shortTitle: "Britannica: Metallurgy",
    title: "metallurgy",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "metallurgy."',
    url: "https://www.britannica.com/science/metallurgy",
  },
  britannicaMiddleEast: {
    shortTitle: "Britannica: Middle East",
    title: "Middle East",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Middle East."',
    url: "https://www.britannica.com/place/Middle-East",
  },
  britannicaMesopotamia: {
    shortTitle: "Britannica: Mesopotamia",
    title: "history of Mesopotamia",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "history of Mesopotamia."',
    url: "https://www.britannica.com/place/Mesopotamia-historical-region-Asia",
  },
  britannicaErech: {
    shortTitle: "Britannica: Erech",
    title: "Erech",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Erech."',
    url: "https://www.britannica.com/place/Erech",
  },
  britannicaSumer: {
    shortTitle: "Britannica: Sumer",
    title: "Sumer",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Sumer."',
    url: "https://www.britannica.com/place/Sumer",
  },
  urukPeriodWikipedia: {
    shortTitle: "Wikipedia: Uruk period",
    title: "Uruk period",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Uruk period." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Uruk_period",
  },
  jemdetNasrPeriodWikipedia: {
    shortTitle: "Wikipedia: Jemdet Nasr period",
    title: "Jemdet Nasr period",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Jemdet Nasr period." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Jemdet_Nasr_period",
  },
  metUrukFirstCity: {
    shortTitle: "Met: Uruk",
    title: "Uruk: The First City",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Department of Ancient Near Eastern Art. "Uruk: The First City." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/uruk/hd_uruk.htm",
  },
  metEarlyDynasticSculpture: {
    shortTitle: "Met: Early Dynastic",
    title: "Early Dynastic Sculpture, 2900–2350 B.C.",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Department of Ancient Near Eastern Art. "Early Dynastic Sculpture, 2900–2350 B.C." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/edys/hd_edys.htm",
  },
  metAkkadianPeriod: {
    shortTitle: "Met: Akkadian period",
    title: "The Akkadian Period (ca. 2350–2150 B.C.)",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Department of Ancient Near Eastern Art. "The Akkadian Period (ca. 2350–2150 B.C.)." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/essays/the-akkadian-period-ca-2350-2150-b-c",
  },
  metUrZiggurat: {
    shortTitle: "Met: Ur ziggurat",
    title: "Ur: The Ziggurat",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Department of Ancient Near Eastern Art. "Ur: The Ziggurat." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/essays/ur-the-ziggurat",
  },
  britannicaWheel: {
    shortTitle: "Britannica: wheel",
    title: "wheel",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "wheel."',
    url: "https://www.britannica.com/technology/wheel",
  },
  britannicaAkkad: {
    shortTitle: "Britannica: Akkad",
    title: "Akkad",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Akkad."',
    url: "https://www.britannica.com/place/Akkad",
  },
  metIsinLarsaOldBabylonian: {
    shortTitle: "Met: Isin-Larsa and Old Babylonian",
    title: "The Isin-Larsa and Old Babylonian Periods (2004–1595 B.C.)",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Knott, Elizabeth. "The Isin-Larsa and Old Babylonian Periods (2004–1595 B.C.)." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/essays/the-isin-larsa-and-old-babylonian-periods-2004-1595-b-c",
  },
  britannicaBabylonia: {
    shortTitle: "Britannica: Babylonia",
    title: "Babylonia",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Babylonia."',
    url: "https://www.britannica.com/place/Babylonia",
  },
  metBabylon: {
    shortTitle: "Met: Babylon",
    title: "Babylon",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Seymour, Michael. "Babylon." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/babl/hd_babl.htm",
  },
  metMiddleBabylonianKassite: {
    shortTitle: "Met: Kassite period",
    title: "The Middle Babylonian / Kassite Period (ca. 1595–1155 B.C.) in Mesopotamia",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Knott, Elizabeth. "The Middle Babylonian / Kassite Period (ca. 1595–1155 B.C.) in Mesopotamia." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/essays/the-middle-babylonian-kassite-period-ca-1595-1155-b-c-in-mesopotamia",
  },
  britannicaHammurabi: {
    shortTitle: "Britannica: Hammurabi",
    title: "Hammurabi",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Hammurabi."',
    url: "https://www.britannica.com/biography/Hammurabi",
  },
  britannicaAncientEgypt: {
    shortTitle: "Britannica: Ancient Egypt",
    title: "ancient Egypt",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "ancient Egypt."',
    url: "https://www.britannica.com/place/ancient-Egypt",
  },
  britannicaHittiteEmpire: {
    shortTitle: "Britannica: Hittites",
    title: "The Hittite empire, c. 1650–1180 BCE",
    organization: "Encyclopaedia Britannica",
    citation:
      'Encyclopaedia Britannica, "Anatolia: The Hittite empire, c. 1650–1180 BCE."',
    url: "https://www.britannica.com/place/Anatolia/The-Hittite-empire-c-1650-1180-bce",
  },
  britannicaIndusCivilization: {
    shortTitle: "Britannica: Indus civilization",
    title: "Indus civilization",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Indus civilization."',
    url: "https://www.britannica.com/topic/Indus-civilization",
  },
  historyPersianEmpire: {
    shortTitle: "History: Persian Empire",
    title: "Persian Empire",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Persian Empire."',
    url: "https://www.history.com/topics/ancient-middle-east/persian-empire",
  },
  worldHistoryGreatPyramidGiza: {
    shortTitle: "WHE: Great Pyramid",
    title: "Great Pyramid of Giza",
    organization: "World History Encyclopedia",
    citation:
      'Mark, Joshua J., "Great Pyramid of Giza." World History Encyclopedia.',
    url: "https://www.worldhistory.org/Great_Pyramid_of_Giza/",
  },
  worldHistoryAssyria: {
    shortTitle: "WHE: Assyria",
    title: "Assyria",
    organization: "World History Encyclopedia",
    citation: 'Mark, Joshua J., "Assyria." World History Encyclopedia.',
    url: "https://www.worldhistory.org/assyria/",
  },
  worldHistoryNeoAssyrianEmpire: {
    shortTitle: "WHE: Neo-Assyrian Empire",
    title: "Neo-Assyrian Empire",
    organization: "World History Encyclopedia",
    citation:
      'Mark, Joshua J. "Neo-Assyrian Empire." World History Encyclopedia.',
    url: "https://www.worldhistory.org/Neo-Assyrian_Empire/",
  },
  metAssyria: {
    shortTitle: "Met: Assyria",
    title: "Assyria, 1365–609 B.C.",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Department of Ancient Near Eastern Art. "Assyria, 1365–609 B.C." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/assy/hd_assy.htm",
  },
  unescoMycenaeTiryns: {
    shortTitle: "UNESCO: Mycenae",
    title: "Archaeological Sites of Mycenae and Tiryns",
    organization: "UNESCO World Heritage Centre",
    citation:
      'UNESCO World Heritage Centre, "Archaeological Sites of Mycenae and Tiryns."',
    url: "https://whc.unesco.org/en/list/941/",
  },
  unescoYinXu: {
    shortTitle: "UNESCO: Yin Xu",
    title: "Yin Xu",
    organization: "UNESCO World Heritage Centre",
    citation: 'UNESCO World Heritage Centre, "Yin Xu."',
    url: "https://whc.unesco.org/en/list/1114/",
  },
  historyOfChinaWikipedia: {
    shortTitle: "Wikipedia: History of China",
    title: "History of China",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "History of China." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/History_of_China",
  },
  shangDynastyWikipedia: {
    shortTitle: "Wikipedia: Shang dynasty",
    title: "Shang dynasty",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Shang dynasty." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Shang_dynasty",
  },
  zhouDynastyWikipedia: {
    shortTitle: "Wikipedia: Zhou dynasty",
    title: "Zhou dynasty",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Zhou dynasty." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Zhou_dynasty",
  },
  qinDynastyWikipedia: {
    shortTitle: "Wikipedia: Qin dynasty",
    title: "Qin dynasty",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Qin dynasty." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Qin_dynasty",
  },
  britannicaAncientGreece: {
    shortTitle: "Britannica: ancient Greece",
    title: "ancient Greek civilization",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "ancient Greek civilization."',
    url: "https://www.britannica.com/place/ancient-Greece",
  },
  britannicaCarthage: {
    shortTitle: "Britannica: Carthage",
    title: "Carthage",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Carthage."',
    url: "https://www.britannica.com/place/Carthage-ancient-city-Tunisia",
  },
  britannicaHellenisticAge: {
    shortTitle: "Britannica: Hellenistic age",
    title: "Hellenistic age",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Hellenistic age."',
    url: "https://www.britannica.com/event/Hellenistic-Age",
  },
  historyAncientRome: {
    shortTitle: "History: Ancient Rome",
    title: "Ancient Rome",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Ancient Rome."',
    url: "https://www.history.com/articles/ancient-rome",
  },
  khanRomanRepublic: {
    shortTitle: "Khan: Roman Republic",
    title: "The Roman Republic",
    organization: "Khan Academy",
    citation: 'Khan Academy, "The Roman Republic."',
    url: "https://www.khanacademy.org/humanities/world-history/ancient-medieval/roman/a/roman-republic",
  },
  khanRomanEmpire: {
    shortTitle: "Khan: Roman Empire",
    title: "The Roman Empire",
    organization: "Khan Academy",
    citation: 'Khan Academy, "The Roman Empire."',
    url: "https://www.khanacademy.org/humanities/world-history/ancient-medieval/roman/a/roman-empire",
  },
  britannicaHanDynasty: {
    shortTitle: "Britannica: Han dynasty",
    title: "Han dynasty",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Han dynasty."',
    url: "https://www.britannica.com/topic/Han-dynasty",
  },
  tangDynastyWikipedia: {
    shortTitle: "Wikipedia: Tang dynasty",
    title: "Tang dynasty",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Tang dynasty." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Tang_dynasty",
  },
  britannicaMongolEmpire: {
    shortTitle: "Britannica: Mongol empire",
    title: "Mongol empire",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Mongol empire."',
    url: "https://www.britannica.com/topic/Mongol-empire",
  },
  historyBlackDeath: {
    shortTitle: "History: Black Death",
    title: "Black Death",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Black Death."',
    url: "https://www.history.com/articles/black-death",
  },
  historyAlexanderGreat: {
    shortTitle: "History: Alexander the Great",
    title: "Alexander the Great",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Alexander the Great."',
    url: "https://www.history.com/articles/alexander-the-great",
  },
  historyByzantineEmpire: {
    shortTitle: "History: Byzantine Empire",
    title: "Byzantine Empire",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Byzantine Empire."',
    url: "https://www.history.com/articles/byzantine-empire",
  },
  historyIslam: {
    shortTitle: "History: Islam",
    title: "Islam",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Islam."',
    url: "https://www.history.com/articles/islam",
  },
  historyCharlemagne: {
    shortTitle: "History: Charlemagne",
    title: "Charlemagne",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Charlemagne."',
    url: "https://www.history.com/articles/charlemagne",
  },
  holyRomanEmpireWikipedia: {
    shortTitle: "Wikipedia: Holy Roman Empire",
    title: "Holy Roman Empire",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Holy Roman Empire." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Holy_Roman_Empire",
  },
  historyCrusades: {
    shortTitle: "History: Crusades",
    title: "Crusades",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Crusades."',
    url: "https://www.history.com/articles/crusades",
  },
  historyGenghisKhan: {
    shortTitle: "History: Genghis Khan",
    title: "Genghis Khan",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Genghis Khan."',
    url: "https://www.history.com/articles/genghis-khan",
  },
  metByzantium: {
    shortTitle: "Met: Byzantium",
    title: "Byzantium (ca. 330–1453)",
    organization: "The Metropolitan Museum of Art",
    citation: 'The Metropolitan Museum of Art, "Byzantium (ca. 330–1453)."',
    url: "https://www.metmuseum.org/toah/hd/byza/hd_byza.htm",
  },
  khanGoldenAgeOfIslam: {
    shortTitle: "Khan: Golden age of Islam",
    title: "The golden age of Islam",
    organization: "Khan Academy",
    citation: 'Khan Academy, "The golden age of Islam."',
    url: "https://www.khanacademy.org/humanities/world-history/medieval-times/islam-medieval/a/the-golden-age-of-islam",
  },
  khanSongChina: {
    shortTitle: "Khan: Song China",
    title: "Prosperity in Song China (960-1279)",
    organization: "Khan Academy",
    citation: 'Khan Academy, "Prosperity in Song China (960-1279)."',
    url: "https://www.khanacademy.org/humanities/world-history/medieval-times/song-china/v/prosperity-in-song-china-960-1279",
  },
  yuanDynastyWikipedia: {
    shortTitle: "Wikipedia: Yuan dynasty",
    title: "Yuan dynasty",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Yuan dynasty." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Yuan_dynasty",
  },
  historyOttomanEmpire: {
    shortTitle: "History: Ottoman Empire",
    title: "Ottoman Empire",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Ottoman Empire."',
    url: "https://www.history.com/topics/middle-east/ottoman-empire",
  },
  historyMingDynasty: {
    shortTitle: "History: Ming Dynasty",
    title: "Ming Dynasty",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Ming Dynasty."',
    url: "https://www.history.com/topics/china/ming-dynasty",
  },
  qingDynastyWikipedia: {
    shortTitle: "Wikipedia: Qing dynasty",
    title: "Qing dynasty",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Qing dynasty." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Qing_dynasty",
  },
  historyOfMayaCivilizationWikipedia: {
    shortTitle: "Wikipedia: History of the Maya civilization",
    title: "History of the Maya civilization",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "History of the Maya civilization." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/History_of_the_Maya_civilization",
  },
  mayaCivilizationWikipedia: {
    shortTitle: "Wikipedia: Maya civilization",
    title: "Maya civilization",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Maya civilization." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Maya_civilization",
  },
  preclassicMayaWikipedia: {
    shortTitle: "Wikipedia: Preclassic Maya",
    title: "Preclassic Maya",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Preclassic Maya." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Preclassic_Maya",
  },
  maliEmpireWikipedia: {
    shortTitle: "Wikipedia: Mali Empire",
    title: "Mali Empire",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Mali Empire." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Mali_Empire",
  },
  sasanianEmpireWikipedia: {
    shortTitle: "Wikipedia: Sasanian Empire",
    title: "Sasanian Empire",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Sasanian Empire." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Sasanian_Empire",
  },
  historyAztecs: {
    shortTitle: "History: Aztecs",
    title: "Aztecs",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Aztecs."',
    url: "https://www.history.com/topics/ancient-americas/aztecs",
  },
  historyInca: {
    shortTitle: "History: Inca",
    title: "Inca",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Inca."',
    url: "https://www.history.com/topics/south-america/inca",
  },
  historyChristopherColumbus: {
    shortTitle: "History: Christopher Columbus",
    title: "Christopher Columbus",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Christopher Columbus."',
    url: "https://www.history.com/articles/christopher-columbus",
  },
  historyReformation: {
    shortTitle: "History: Reformation",
    title: "The Reformation",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "The Reformation."',
    url: "https://www.history.com/articles/reformation",
  },
  historyFerdinandMagellan: {
    shortTitle: "History: Ferdinand Magellan",
    title: "Ferdinand Magellan",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Ferdinand Magellan."',
    url: "https://www.history.com/articles/ferdinand-magellan",
  },
  historyJamestown: {
    shortTitle: "History: Jamestown Colony",
    title: "Jamestown Colony",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Jamestown Colony."',
    url: "https://www.history.com/articles/jamestown",
  },
  historyThirtyYearsWar: {
    shortTitle: "History: Thirty Years' War",
    title: "Thirty Years' War",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Thirty Years’ War."',
    url: "https://www.history.com/articles/thirty-years-war",
  },
  historyEnglishCivilWars: {
    shortTitle: "History: English Civil Wars",
    title: "English Civil Wars",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "English Civil Wars."',
    url: "https://www.history.com/articles/english-civil-wars",
  },
  historyEnlightenment: {
    shortTitle: "History: Enlightenment",
    title: "Enlightenment",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Enlightenment."',
    url: "https://www.history.com/articles/enlightenment",
  },
  britannicaSiegeOfVienna: {
    shortTitle: "Britannica: Siege of Vienna",
    title: "Siege of Vienna",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Siege of Vienna."',
    url: "https://www.britannica.com/event/Siege-of-Vienna-1683",
  },
  britannicaEncyclopedie: {
    shortTitle: "Britannica: Encyclopédie",
    title: "Encyclopédie",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Encyclopédie."',
    url: "https://www.britannica.com/topic/Encyclopedie",
  },
  historyFrenchRevolution: {
    shortTitle: "History: French Revolution",
    title: "French Revolution",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "French Revolution."',
    url: "https://www.history.com/articles/french-revolution",
  },
  britannicaRevolutionsOf1848: {
    shortTitle: "Britannica: Revolutions of 1848",
    title: "Revolutions of 1848",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Revolutions of 1848."',
    url: "https://www.britannica.com/event/Revolutions-of-1848",
  },
  britannicaRisorgimento: {
    shortTitle: "Britannica: Risorgimento",
    title: "Risorgimento",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Risorgimento."',
    url: "https://www.britannica.com/event/Risorgimento",
  },
  britannicaGermanEmpire: {
    shortTitle: "Britannica: German Empire",
    title: "German Empire",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "German Empire."',
    url: "https://www.britannica.com/place/German-Empire",
  },
  britannicaScrambleForAfrica: {
    shortTitle: "Britannica: Scramble for Africa",
    title: "Scramble for Africa",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Scramble for Africa."',
    url: "https://www.britannica.com/event/Scramble-for-Africa",
  },
  historyWorldWarOne: {
    shortTitle: "History: World War I",
    title: "World War I",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "World War I."',
    url: "https://www.history.com/articles/world-war-i-history",
  },
  britannicaTitanic: {
    shortTitle: "Britannica: Titanic",
    title: "Titanic",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Titanic."',
    url: "https://www.britannica.com/topic/Titanic",
  },
  historyRussianRevolution: {
    shortTitle: "History: Russian Revolution",
    title: "Russian Revolution",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Russian Revolution."',
    url: "https://www.history.com/articles/russian-revolution",
  },
  historyWorldWarTwo: {
    shortTitle: "History: World War II",
    title: "World War II",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "World War II."',
    url: "https://www.history.com/articles/world-war-ii-history",
  },
  historyGreatDepression: {
    shortTitle: "History: Great Depression",
    title: "Great Depression History",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Great Depression History."',
    url: "https://www.history.com/articles/great-depression-history",
  },
  historyIndustrialRevolution: {
    shortTitle: "History: Industrial Revolution",
    title: "Industrial Revolution",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Industrial Revolution."',
    url: "https://www.history.com/articles/industrial-revolution",
  },
  historyTelegraph: {
    shortTitle: "History: Telegraph",
    title: "Morse Code & the Telegraph",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Morse Code & the Telegraph."',
    url: "https://www.history.com/articles/telegraph",
  },
  britannicaTelephone: {
    shortTitle: "Britannica: telephone",
    title: "telephone",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "telephone."',
    url: "https://www.britannica.com/technology/telephone",
  },
  energyHistoryLightBulb: {
    shortTitle: "DOE: history of the light bulb",
    title: "The History of the Light Bulb",
    organization: "U.S. Department of Energy",
    citation: 'U.S. Department of Energy, "The History of the Light Bulb."',
    url: "https://www.energy.gov/articles/history-light-bulb",
  },
  mercedesFirstAutomobile: {
    shortTitle: "Mercedes-Benz: first automobile",
    title: "1885–1886, The first automobile",
    organization: "Mercedes-Benz Group",
    citation: 'Mercedes-Benz Group, "1885–1886, The first automobile."',
    url: "https://group.mercedes-benz.com/company/tradition/company-history/1885-1886.html",
  },
  nobelMarconiBiographical: {
    shortTitle: "Nobel: Guglielmo Marconi",
    title: "Guglielmo Marconi, Biographical",
    organization: "Nobel Prize Outreach",
    citation: 'Nobel Prize Outreach, "Guglielmo Marconi – Biographical."',
    url: "https://www.nobelprize.org/prizes/physics/1909/marconi/biographical/",
  },
  historyWrightBrothers: {
    shortTitle: "History: Wright Brothers",
    title: "Wright Brothers",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Wright Brothers."',
    url: "https://www.history.com/articles/wright-brothers",
  },
  historyColdWar: {
    shortTitle: "History: Cold War",
    title: "Cold War History",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Cold War History."',
    url: "https://www.history.com/articles/cold-war-history",
  },
  britannicaColdWar: {
    shortTitle: "Britannica: Cold War",
    title: "Cold War",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Cold War."',
    url: "https://www.britannica.com/event/Cold-War",
  },
  unHistoryUnitedNations: {
    shortTitle: "UN: History of the UN",
    title: "History of the United Nations",
    organization: "United Nations",
    citation: 'United Nations, "History of the United Nations."',
    url: "https://www.un.org/en/about-us/history-of-the-un",
  },
  unUniversalDeclarationHumanRights: {
    shortTitle: "UN: UDHR",
    title: "Universal Declaration of Human Rights",
    organization: "United Nations",
    citation: 'United Nations, "Universal Declaration of Human Rights."',
    url: "https://www.un.org/en/about-us/universal-declaration-of-human-rights",
  },
  natoFoundingTreaty: {
    shortTitle: "NATO: Founding treaty",
    title: "Founding treaty",
    organization: "North Atlantic Treaty Organization",
    citation: 'North Atlantic Treaty Organization, "Founding treaty."',
    url: "https://www.nato.int/cps/en/natohq/topics_67656.htm",
  },
  historyMarshallPlan: {
    shortTitle: "History: Marshall Plan",
    title: "Marshall Plan",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Marshall Plan."',
    url: "https://www.history.com/articles/marshall-plan",
  },
  historyPrintingPress: {
    shortTitle: "History: Printing Press",
    title: "Printing Press",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Printing Press."',
    url: "https://www.history.com/articles/printing-press",
  },
  historyAmericanRevolution: {
    shortTitle: "History: Revolutionary War",
    title: "Revolutionary War",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Revolutionary War."',
    url: "https://www.history.com/articles/american-revolution-history",
  },
  natGeoGlobalization: {
    shortTitle: "NatGeo: Globalization",
    title: "Globalization",
    organization: "National Geographic Society",
    citation: 'National Geographic Society, "Globalization."',
    url: "https://education.nationalgeographic.org/resource/globalization/",
  },
  unDecolonization: {
    shortTitle: "UN: Decolonization",
    title: "Decolonization",
    organization: "United Nations",
    citation: 'United Nations, "Decolonization."',
    url: "https://www.un.org/en/global-issues/decolonization",
  },
  unAntiColonialismDay: {
    shortTitle: "UN: Anti-Colonialism Day",
    title: "International Day Against Colonialism in All Its Forms and Manifestations",
    organization: "United Nations",
    citation:
      'United Nations, "International Day Against Colonialism in All Its Forms and Manifestations."',
    url: "https://www.un.org/en/observances/anti-colonialism-day",
  },
  historyStateFallCommunism: {
    shortTitle: "State Dept: fall of communism",
    title: "Fall of Communism in Eastern Europe, 1989",
    organization: "U.S. Department of State, Office of the Historian",
    citation:
      'U.S. Department of State, Office of the Historian, "Fall of Communism in Eastern Europe, 1989."',
    url: "https://history.state.gov/milestones/1989-1992/fall-of-communism",
  },
  britannicaSovietCollapse: {
    shortTitle: "Britannica: Soviet collapse",
    title: "collapse of the Soviet Union",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "collapse of the Soviet Union."',
    url: "https://www.britannica.com/event/the-collapse-of-the-Soviet-Union",
  },
  cernBirthWeb: {
    shortTitle: "CERN: birth of the Web",
    title: "The birth of the Web",
    organization: "CERN",
    citation: 'CERN, "The birth of the Web."',
    url: "https://home.cern/science/computing/birth-web",
  },
  cernShortHistoryWeb: {
    shortTitle: "CERN: short history of the Web",
    title: "A short history of the Web",
    organization: "CERN",
    citation: 'CERN, "A short history of the Web."',
    url: "https://home.cern/science/computing/birth-web/short-history-web",
  },
  cernHiggsBoson2012: {
    shortTitle: "CERN: Higgs boson announcement",
    title: "CERN experiments observe particle consistent with long-sought Higgs boson",
    organization: "CERN",
    citation:
      'CERN, "CERN experiments observe particle consistent with long-sought Higgs boson."',
    url: "https://home.cern/news/press-release/cern/cern-experiments-observe-particle-consistent-long-sought-higgs-boson",
  },
  trustMeBro: {
    shortTitle: "Trust me bro",
    title: "Trust me bro",
    organization: "Personal bias",
    citation: '"Trust me bro."',
  },
  appleIPhoneIntroduction: {
    shortTitle: "Apple: iPhone introduced",
    title: "Apple Reinvents the Phone with iPhone",
    organization: "Apple",
    citation: 'Apple, "Apple Reinvents the Phone with iPhone."',
    url: "https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/",
  },
  oecdAiWipsProgram: {
    shortTitle: "OECD: AI-WIPS",
    title: "AI in Work, Innovation, Productivity and Skills (AI-WIPS)",
    organization: "Organisation for Economic Co-operation and Development",
    citation:
      'OECD, "AI in Work, Innovation, Productivity and Skills (AI-WIPS)."',
    url: "https://www.oecd.org/en/about/programmes/ai-in-work-innovation-productivity-and-skills.html",
  },
  oecdAlgorithmicManagement: {
    shortTitle: "OECD: algorithmic management",
    title: "Algorithmic management in the workplace",
    organization: "Organisation for Economic Co-operation and Development",
    citation: 'OECD, "Algorithmic management in the workplace."',
    url: "https://www.oecd.org/en/publications/algorithmic-management-in-the-workplace_287c13c4-en.html",
  },
  openAiIntroducingChatGpt: {
    shortTitle: "OpenAI: Introducing ChatGPT",
    title: "Introducing ChatGPT",
    organization: "OpenAI",
    citation: 'OpenAI, "Introducing ChatGPT."',
    url: "https://openai.com/index/chatgpt/",
  },
  britannicaYuriGagarin: {
    shortTitle: "Britannica: Yuri Gagarin",
    title: "Yuri Gagarin",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Yuri Gagarin."',
    url: "https://www.britannica.com/biography/Yuri-Gagarin",
  },
  historyStateCubanMissileCrisis: {
    shortTitle: "State Dept: Cuban Missile Crisis",
    title: "The Cuban Missile Crisis, October 1962",
    organization: "U.S. Department of State, Office of the Historian",
    citation:
      'U.S. Department of State, Office of the Historian, "The Cuban Missile Crisis, October 1962."',
    url: "https://history.state.gov/milestones/1961-1968/cuban-missile-crisis",
  },
  britannicaVietnamWar: {
    shortTitle: "Britannica: Vietnam War",
    title: "Vietnam War",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Vietnam War."',
    url: "https://www.britannica.com/event/Vietnam-War",
  },
  britannicaIranianRevolution: {
    shortTitle: "Britannica: Iranian Revolution",
    title: "Iranian Revolution",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Iranian Revolution."',
    url: "https://www.britannica.com/event/Iranian-Revolution",
  },
  whoSmallpoxEradication: {
    shortTitle: "WHO: smallpox eradication",
    title: "WHO commemorates the 40th anniversary of smallpox eradication",
    organization: "World Health Organization",
    citation:
      'World Health Organization, "WHO commemorates the 40th anniversary of smallpox eradication."',
    url: "https://www.who.int/news/item/13-12-2019-who-commemorates-the-40th-anniversary-of-smallpox-eradication",
  },
  iaeaChernobylFaq: {
    shortTitle: "IAEA: Chernobyl FAQs",
    title: "Frequently Asked Chernobyl Questions",
    organization: "International Atomic Energy Agency",
    citation: 'International Atomic Energy Agency, "Frequently Asked Chernobyl Questions."',
    url: "https://www.iaea.org/topics/chornobyl/faqs",
  },
  historySeptember11Attacks: {
    shortTitle: "History: September 11 Attacks",
    title: "September 11 Attacks",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "September 11 Attacks."',
    url: "https://www.history.com/articles/9-11-attacks",
  },
  investopediaLehmanCollapse: {
    shortTitle: "Investopedia: Lehman collapse",
    title: "Lehman Brothers Collapse Explained: Causes and Legacy",
    organization: "Investopedia",
    citation: 'Liodis, Nick, "Lehman Brothers Collapse Explained: Causes and Legacy." Investopedia.',
    url: "https://www.investopedia.com/articles/economics/09/lehman-brothers-collapse.asp",
  },
  unParisAgreement: {
    shortTitle: "UN: Paris Agreement",
    title: "The Paris Agreement",
    organization: "United Nations",
    citation: 'United Nations, "The Paris Agreement."',
    url: "https://www.un.org/en/climatechange/paris-agreement",
  },
  whoCovid19Pandemic: {
    shortTitle: "WHO: COVID-19 pandemic",
    title: "Coronavirus disease (COVID-19) pandemic",
    organization: "World Health Organization",
    citation:
      'World Health Organization, "Coronavirus disease (COVID-19) pandemic."',
    url: "https://www.who.int/europe/emergencies/situations/covid-19",
  },
  britannicaHaitianRevolution: {
    shortTitle: "Britannica: Haitian Revolution",
    title: "Haitian Revolution",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Haitian Revolution."',
    url: "https://www.britannica.com/event/Haitian-Revolution",
  },
  historyMeijiRestoration: {
    shortTitle: "History: Meiji Restoration",
    title: "Meiji Restoration",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Meiji Restoration."',
    url: "https://www.history.com/articles/meiji-restoration",
  },
  historyMoonLanding: {
    shortTitle: "History: 1969 Moon Landing",
    title: "1969 Moon Landing",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "1969 Moon Landing."',
    url: "https://www.history.com/articles/moon-landing-1969",
  },
  periodo: {
    shortTitle: "PeriodO",
    title: "PeriodO: A Gazetteer of Period Definitions",
    organization: "PeriodO",
    citation:
      "Rabinowitz, A. et al., PeriodO: a public-domain gazetteer of scholarly period definitions.",
    url: "https://perio.do/en/",
  },
  stearnsPeriodization: {
    shortTitle: "Stearns on periodization",
    title: "Periodization in World History: Challenges and Opportunities",
    organization: "Palgrave / world-history scholarship",
    citation:
      'Stearns, Peter N. (2017). "Periodization in World History: Challenges and Opportunities." In 21st-Century Narratives of World History: Global and Multidisciplinary Perspectives. Palgrave Macmillan.',
  },
  bentleyEarlyModern: {
    shortTitle: "Bentley on early modern",
    title: "Early Modern Europe and the Early Modern World",
    organization: "Rowman & Littlefield / world-history scholarship",
    citation:
      'Bentley, Jerry H. (2007). "Early Modern Europe and the Early Modern World." In Between the Middle Ages and Modernity: Individual and Community in the Early Modern World. Rowman & Littlefield.',
  },
  brivatiContemporary: {
    shortTitle: "Brivati on contemporary history",
    title: "The Contemporary History Handbook",
    organization: "Manchester University Press",
    citation:
      'Brivati, Brian (1996). "Introduction." In The Contemporary History Handbook. Manchester University Press.',
  },
  physicsOfUniverseDates: {
    shortTitle: "Physics of the Universe: Dates",
    title: "Important Dates and Discoveries",
    organization: "The Physics of the Universe",
    citation:
      '"Important Dates and Discoveries," The Physics of the Universe.',
    url: "https://www.physicsoftheuniverse.com/dates.html",
  },
  timelineOfFundamentalPhysicsDiscoveriesWikipedia: {
    shortTitle: "Wikipedia: physics discoveries timeline",
    title: "Timeline of fundamental physics discoveries",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Timeline of fundamental physics discoveries." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Timeline_of_fundamental_physics_discoveries",
  },
  physicsOfUniverseBigBangTimeline: {
    shortTitle: "Physics of the Universe: Big Bang Timeline",
    title: "Timeline of the Big Bang",
    organization: "The Physics of the Universe",
    citation:
      '"Timeline of the Big Bang," The Physics of the Universe.',
    url: "https://www.physicsoftheuniverse.com/topics_bigbang_timeline.html",
  },
} as const satisfies Record<string, EraSource>;

export type EraSourceId = keyof typeof ERA_SOURCES;
