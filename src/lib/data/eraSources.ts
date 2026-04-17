export type EraSource = {
  shortTitle: string;
  title: string;
  organization: string;
  citation: string;
  url?: string;
  notes?: string;
};

export const ERA_SOURCES = {
  nasaUniverseOverview: {
    shortTitle: "NASA: Cosmic History",
    title: "Universe: Cosmic History",
    organization: "NASA",
    citation: 'NASA, "Universe: Cosmic History," Science Mission Directorate.',
    url: "https://science.nasa.gov/universe/overview/",
    notes:
      "Used for the age of the universe and the app's broad cosmic-history framing.",
  },
  nasaStarBasics: {
    shortTitle: "NASA: Star Basics",
    title: "Star Basics",
    organization: "NASA",
    citation: 'NASA, "Star Basics," Science Mission Directorate.',
    url: "https://science.nasa.gov/universe/stars/",
    notes:
      "Used for broad context on how stars form from dense clouds of gas and dust.",
  },
  nasaGalaxyBasics: {
    shortTitle: "NASA: Galaxy Basics",
    title: "Galaxy Basics",
    organization: "NASA",
    citation: 'NASA, "Galaxy Basics," Science Mission Directorate.',
    url: "https://science.nasa.gov/universe/galaxies/",
    notes:
      "Used for broad context on galaxy evolution and the Milky Way's place in cosmic history.",
  },
  nasaSolarSystemFacts: {
    shortTitle: "NASA: Solar System Facts",
    title: "Solar System Facts",
    organization: "NASA",
    citation: 'NASA, "Solar System Facts," Science Mission Directorate.',
    url: "https://science.nasa.gov/solar-system/solar-system-facts/",
    notes: "Used for the solar system's formation about 4.6 billion years ago.",
  },
  usgsAgeOfEarth: {
    shortTitle: "USGS: Age of Earth",
    title: "How old is Earth?",
    organization: "U.S. Geological Survey",
    citation: 'U.S. Geological Survey, "How old is Earth?" FAQ.',
    url: "https://www.usgs.gov/faqs/how-old-earth",
    notes: "Used for the Earth's formation at about 4.54 billion years ago.",
  },
  icsChart2024: {
    shortTitle: "ICS Chart v2024/12",
    title: "International Chronostratigraphic Chart v2024/12",
    organization: "International Commission on Stratigraphy",
    citation:
      'Cohen, K. M., Finney, S. C., Gibbard, P. L., Fan, J.-X. (2025). "The ICS international chronostratigraphic chart this decade." Episodes. DOI: 10.18814/epiiugs/2025/025001.',
    url: "https://stratigraphy.org/chart",
    notes:
      "Used for formal deep-time boundaries. Some app bands are intentionally truncated where the timeline hands off to human-history periods.",
  },
  smithsonianExtinctionOverTime: {
    shortTitle: "Smithsonian: Extinction Over Time",
    title: "Extinction Over Time",
    organization: "Smithsonian National Museum of Natural History",
    citation:
      'Smithsonian National Museum of Natural History, "Extinction Over Time."',
    url: "https://naturalhistory.si.edu/education/teaching-resources/paleontology/extinction-over-time",
    notes:
      "Used for public-facing dates and context for the five major mass extinctions, including the end-Cretaceous asteroid impact and the end-Permian extinction.",
  },
  smithsonianTriassicLife: {
    shortTitle: "Smithsonian: Triassic Life",
    title: "Triassic Life, Extinction, and Recovery",
    organization: "Smithsonian National Museum of Natural History",
    citation:
      'Smithsonian National Museum of Natural History, "Triassic Life, Extinction, and Recovery."',
    url: "https://naturalhistory.si.edu/education/teaching-resources/paleontology/triassic-life-extinction-and-recovery",
    notes:
      "Used for a concise, museum-grade framing of the Late Triassic extinction, ecological recovery, and the rise of the dinosaurs.",
  },
  asmGreatOxidationEvent: {
    shortTitle: "ASM: Great Oxidation Event",
    title: "The Great Oxidation Event: How Cyanobacteria Changed Life",
    organization: "American Society for Microbiology",
    citation:
      'American Society for Microbiology, "The Great Oxidation Event: How Cyanobacteria Changed Life."',
    url: "https://asm.org/articles/2022/february/the-great-oxidation-event-how-cyanobacteria-change",
    notes:
      "Used for the public-facing explanation that oxygen likely poisoned much of Earth's anaerobic life during the Great Oxidation Event, while precise losses remain difficult to estimate from the fossil record.",
  },
  geoscienceworldLateOrdovicianExtinction: {
    shortTitle: "GSW: Late Ordovician extinction",
    title:
      "Late Ordovician mass extinction caused by volcanism, warming, and anoxia, not cooling and glaciation",
    organization: "GeoScienceWorld",
    citation:
      'GeoScienceWorld, "Late Ordovician mass extinction caused by volcanism, warming, and anoxia, not cooling and glaciation."',
    notes:
      "Used for the public-facing estimate that around 85% of species were eliminated in the Late Ordovician extinction's two main pulses.",
  },
  nsfLateDevonianExtinction: {
    shortTitle: "NSF: Late Devonian extinction",
    title:
      "Climate change factors in the fossil record that accelerate mass extinction",
    organization: "U.S. National Science Foundation",
    citation:
      'U.S. National Science Foundation, "Climate change factors in the fossil record that accelerate mass extinction."',
    url: "https://www.nsf.gov/news/climate-change-factors-fossil-record-accelerate",
    notes:
      "Used for the public-facing estimate that the Late Devonian extinction eliminated roughly 75% of all species across two pulses.",
  },
  nasaGreatDying: {
    shortTitle: "NASA: Great Dying",
    title: "The Great Dying",
    organization: "NASA",
    citation: 'NASA, "The Great Dying."',
    url: "https://science.nasa.gov/science-research/earth-science/the-great-dying/",
    notes:
      "Used for the broad public-facing estimate that roughly 9 in 10 marine species and 7 in 10 land species vanished in the end-Permian extinction.",
  },
  amnhSixExtinctions: {
    shortTitle: "AMNH: Six extinctions",
    title: "Six Extinctions",
    organization: "American Museum of Natural History",
    citation: 'American Museum of Natural History, "Six Extinctions."',
    url: "https://www.amnh.org/explore/videos/shelf-life/six-extinctions",
    notes:
      "Used for concise, public-facing percentage estimates and consequences for the end-Permian, end-Triassic, and end-Cretaceous extinction crises.",
  },
  berkeleyCambrianExplosion: {
    shortTitle: "Berkeley: Cambrian explosion",
    title: "The Cambrian explosion",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "The Cambrian explosion." University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/what-are-evograms/the-cambrian-explosion/",
    notes:
      "Used for the broad 570–530 million-year framing of the Cambrian explosion and its significance as an early burst of animal diversification.",
  },
  gsaCambrianSubstrateRevolution: {
    shortTitle: "GSA: Cambrian substrate revolution",
    title: "The Cambrian Substrate Revolution",
    organization: "Geological Society of America",
    citation:
      'Bottjer, D. J., Hagadorn, J. W., and Dornbos, S. Q. (2000), "The Cambrian Substrate Revolution." GSA Today.',
    url: "https://rock.geosociety.org/gsatoday/archive/10/9/article/i1052-5173-10-9-1.htm",
    notes:
      "Used for the transition from microbial-mat seafloors to increasingly bioturbated, mixed shallow-marine substrates across roughly the 600–500 Ma interval.",
  },
  nhmLateEdiacaranTracks: {
    shortTitle: "NHM: Ediacaran tracks",
    title:
      "Complex animals living millions of years before the Cambrian Explosion revealed by seabed tracks",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "Complex animals living millions of years before the Cambrian Explosion revealed by seabed tracks."',
    url: "https://www.nhm.ac.uk/discover/news/2025/july/complex-animals-living-before-cambrian-explosion.html",
    notes:
      "Used for the public-facing statement that late Ediacaran changes in movement and sensing set the stage for the Cambrian Substrate Revolution and the Cambrian Explosion.",
  },
  gsaOrdovicianBiodiversificationEvent: {
    shortTitle: "GSA: GOBE",
    title:
      "Understanding the Great Ordovician Biodiversification Event (GOBE): Influences of paleogeography, paleoclimate, or paleoecology?",
    organization: "Geological Society of America",
    citation:
      'Servais, T., Harper, D. A. T., Munnecke, A., Owen, A. W., and Sheehan, P. M. (2009), "Understanding the Great Ordovician Biodiversification Event (GOBE): Influences of paleogeography, paleoclimate, or paleoecology?" GSA Today.',
    url: "https://rock.geosociety.org/net/gsatoday/archive/19/4/abstract/i1052-5173-19-4-4.htm",
    notes:
      "Used for the Great Ordovician Biodiversification Event as a sustained 25-million-year increase in marine biodiversity that reworked Paleozoic marine ecosystems.",
  },
  samNobleOrdovicianCommunities: {
    shortTitle: "Sam Noble: Ordovician communities",
    title: "Ordovician communities",
    organization: "Sam Noble Museum",
    citation: 'Sam Noble Museum, "Ordovician communities."',
    url: "https://samnoblemuseum.ou.edu/common-fossils-of-oklahoma/paleocommunities/marine-communities/ordovician-communities/",
    notes:
      "Used for the public-facing museum framing that the Ordovician Radiation occurred during the second half of the Ordovician and established marine community types that lasted through the rest of the Paleozoic.",
  },
  umdMacroecologyNektonRevolution: {
    shortTitle: "UMD: Devonian Nekton Revolution",
    title: "GEOL 331/BSCI 333 Principles of Paleontology: Macroecology",
    organization: "University of Maryland",
    citation:
      'Holtz, T. R. Jr., "GEOL 331/BSCI 333 Principles of Paleontology: Macroecology." University of Maryland, last modified December 7, 2020.',
    url: "https://www.geol.umd.edu/~tholtz/G331/lectures/331macroecol.html",
    notes:
      "Used for a timing-specific public summary stating that the Devonian Nekton Revolution occurred throughout the Devonian, with a great increase in fully nektonic forms such as fish and ammonoids.",
  },
  royalSocietyPalaeozoicWaterColumn: {
    shortTitle: "Royal Society: water-column colonization",
    title:
      "The Palaeozoic colonization of the water column and the rise of global nekton",
    organization: "The Royal Society",
    citation:
      'Whalen, C. D., and Briggs, D. E. G. (2018), "The Palaeozoic colonization of the water column and the rise of global nekton." Proceedings of the Royal Society B 285:20180883. doi:10.1098/rspb.2018.0883.',
    url: "https://royalsocietypublishing.org/rspb/article/285/1883/20180883/84706/The-Palaeozoic-colonization-of-the-water-column",
    notes:
      "Used for the explicit review-level caution that the rise of global nekton was more complex and gradual than a single narrow interval, and cannot be attributed to one Palaeozoic slice alone.",
  },
  berkeleyTetrapodOrigin: {
    shortTitle: "Berkeley: tetrapods",
    title: "The origin of tetrapods",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "The origin of tetrapods." University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/what-are-evograms/the-origin-of-tetrapods/",
    notes:
      "Used for the Devonian 390–360 million-year transition in which the tetrapod lineage moved from water onto land.",
  },
  berkeleyBirdOrigin: {
    shortTitle: "Berkeley: origin of birds",
    title: "The origin of birds",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "The origin of birds." University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/what-are-evograms/the-origin-of-birds/",
    notes:
      "Used for the Late Jurassic dinosaur-to-bird transition and Archaeopteryx as the first known bird in this public-facing timeline.",
  },
  berkeleyMammalAncestors: {
    shortTitle: "Berkeley: mammal ancestors",
    title: "Jaws to ears in the ancestors of mammals",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "Jaws to ears in the ancestors of mammals." University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/what-are-evograms/jaws-to-ears-in-the-ancestors-of-mammals/",
    notes:
      "Used for synapsids as the lineage that gave rise to mammals and for the broader mammal-line transition through deep time.",
  },
  ucmpArchaean: {
    shortTitle: "UCMP: Archaean",
    title: "Introduction to the Archaean",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Introduction to the Archaean."',
    url: "https://ucmp.berkeley.edu/precambrian/archaean.html",
    notes:
      "Used for the Archean as a bacterial world with roughly 3.5-billion-year-old fossils and abundant stromatolites built by microbial communities.",
  },
  ucmpVendian: {
    shortTitle: "UCMP: Vendian",
    title: "Introduction to the Vendian Period",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Introduction to the Vendian Period."',
    url: "https://ucmp.berkeley.edu/vendian/vendian.html",
    notes:
      "Used for latest-Proterozoic macroscopic soft-bodied fossils in the Vendian/Ediacaran and for a concise public-facing framing of life immediately before the Cambrian explosion.",
  },
  ucmpCyanobacteria: {
    shortTitle: "UCMP: Cyanobacteria",
    title: "Introduction to the Cyanobacteria",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Introduction to the Cyanobacteria."',
    url: "https://ucmp.berkeley.edu/bacteria/cyanointro.html",
    notes:
      "Used for cyanobacteria as very ancient life and for their role in generating Earth's oxygen-rich atmosphere during the Archean and Proterozoic.",
  },
  ucmpEukaryota: {
    shortTitle: "UCMP: Eukaryota",
    title: "Introduction to the Eukaryota",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Introduction to the Eukaryota."',
    url: "https://ucmp.berkeley.edu/alllife/eukaryota.html",
    notes:
      "Used for broad public-facing context on what eukaryotic cells are and why they represent a major increase in cellular complexity.",
  },
  ucmpPlantae: {
    shortTitle: "UCMP: Plantae",
    title: "Introduction to the Plantae",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Introduction to the Plantae."',
    url: "https://ucmp.berkeley.edu/plants/plantae.html",
    notes:
      "Used for the public-facing timeline framing that plants first appeared in the Ordovician and diversified into recognizably modern-looking forms by the Late Silurian and Devonian.",
  },
  ucmpSilurian: {
    shortTitle: "UCMP: Silurian",
    title: "The Silurian",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "The Silurian."',
    url: "https://ucmp.berkeley.edu/silurian/silurian.html",
    notes:
      "Used for the Silurian as the interval of the first coral reefs, first known freshwater fish, first fish with jaws, first good evidence of life on land, and earliest vascular plants.",
  },
  museumsVictoria600MillionYears: {
    shortTitle: "Museums Victoria: 600 Million Years",
    title: "600 Million Years: Victoria Evolves",
    organization: "Museums Victoria",
    citation: 'Museums Victoria, "600 Million Years: Victoria Evolves."',
    url: "https://museumsvictoria.com.au/melbournemuseum/resources/600-million-years/",
    notes:
      "Used for museum-grade Silurian, Devonian, Triassic, Jurassic, and Cretaceous summaries, including expansive Silurian reefs, the first jawed fish, early vascular plants, slow Triassic recovery, and flowering-plant spread in the Cretaceous.",
  },
  museumsVictoriaPalaeobotany: {
    shortTitle: "Museums Victoria: Palaeobotany",
    title: "Palaeobotany",
    organization: "Museums Victoria",
    citation:
      'Rich, T., Pickering, D. and Pawley, K. (2012), "Palaeobotany." Museums Victoria Collections.',
    url: "https://collections.museumsvictoria.com.au/collections/14168",
    notes:
      "Used for the statement that Baragwanathia and related Silurian and Lower Devonian flora are among the world's oldest known vascular land plants.",
  },
  hkuSilurianCoralReefs: {
    shortTitle: "HKU: Silurian reefs",
    title: "Silurian Coral Reefs",
    organization: "Stephen Hui Geological Museum, The University of Hong Kong",
    citation:
      'Stephen Hui Geological Museum, The University of Hong Kong, "Silurian Coral Reefs."',
    url: "https://shmuseum.hku.hk/education/earth-evolution/early-paleozoic/early-paleozoic-biosphere/silurian-coral-reefs",
    notes:
      "Used for the Silurian as a time of extensive reef development in shallow tropical seas and for tabulate corals, rugose corals, and stromatoporoids as major reef builders.",
  },
  fieldMuseumSilurian: {
    shortTitle: "Field Museum: Silurian",
    title: "Silurian",
    organization: "Field Museum / Milwaukee Public Museum",
    citation:
      'Field Museum and Milwaukee Public Museum, "Silurian" (Virtual Silurian Reef project).',
    url: "https://silurian-reef.fieldmuseum.org/narrative/439",
    notes:
      "Used for a public-facing 443 to 417 million-year Silurian reef-sea framing and for large stromatoporoid reefs in Wisconsin and Illinois.",
  },
  nationalMuseumEarliestVascularPlants: {
    shortTitle: "National Museum: earliest vascular plants",
    title:
      "The earliest vascular terrestrial plants and polymorphs of the Silurian and Lower Devonian periods in Barrandien, Czech Republic",
    organization: "National Museum, Prague",
    citation:
      'National Museum, Prague, "The earliest vascular terrestrial plants and polymorphs of the Silurian and Lower Devonian periods in Barrandien, Czech Republic."',
    url: "https://www.nm.cz/en/about-us/science-and-research/the-earliest-vascular-terrestrial-plants-and-polymorphs-of-the-silurian-and-lower-devonian-periods-in-barrandien-czech-republic",
    notes:
      "Used for Cooksonia as the oldest vascular plant in the world, dated on the page to about 425 to 427 million years ago.",
  },
  nhmEarliestFossilisedForest: {
    shortTitle: "NHM: earliest fossil forest",
    title: "Earliest fossilised forest discovered in Somerset",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "Earliest fossilised forest discovered in Somerset."',
    url: "https://www.nhm.ac.uk/discover/news/2024/march/earliest-fossilised-forest-discovered-in-somerset.html",
    notes:
      "Used for the statement that 390-million-year-old fossils from southwest England are the world's oldest known fossilised forest.",
  },
  nysmOldestTrees: {
    shortTitle: "NYSM: oldest trees",
    title: "Re-Examining the Earth's Oldest Trees",
    organization: "New York State Museum",
    citation:
      'New York State Museum, "Re-Examining the Earth\'s Oldest Trees."',
    url: "https://nysm.nysed.gov/paleontology/paleobotany/news/re-examining-earths-oldest-trees",
    notes:
      "Used for Gilboa's Eospermatopteris trees, dated on the page to roughly 380 to 385 million years ago and described as among the first tree-like plants on Earth.",
  },
  australianMuseumCretaceous: {
    shortTitle: "Australian Museum: Cretaceous",
    title: "The Cretaceous Period (146-65 million years ago)",
    organization: "Australian Museum",
    citation:
      'Australian Museum, "The Cretaceous Period (146-65 million years ago)."',
    url: "https://australian.museum/learn/australia-over-time/evolving-landscape/the-cretaceous-period/",
    notes:
      "Used for Archaefructus as the earliest known flowering plant at about 125 million years old and for flowering plants spreading through the Cretaceous world.",
  },
  universityMelbourneFlowersReachedAustralia: {
    shortTitle: "Unimelb: flowers reached Australia",
    title: "When flowers reached Australia",
    organization: "The University of Melbourne",
    citation: 'The University of Melbourne, "When flowers reached Australia."',
    url: "https://www.unimelb.edu.au/newsroom/news/2019/december/when-flowers-reached-australia",
    notes:
      "Used for Australia's oldest flowering plants at 126 million years old and for earliest southern Australian flower-bearing forests between 126 and 100 million years ago.",
  },
  britannicaDevonianPeriod: {
    shortTitle: "Britannica: Devonian",
    title: "Devonian Period",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Devonian Period."',
    url: "https://www.britannica.com/science/Devonian-Period",
    notes:
      "Used for the Devonian as the Age of Fishes and for the first known in-place forests dating from the Middle Devonian.",
  },
  ucmpDevonian: {
    shortTitle: "UCMP: Devonian",
    title: "The Devonian",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "The Devonian."',
    url: "https://ucmp.berkeley.edu/devonian/devonian.html",
    notes:
      "Used for the Devonian appearance of the first tetrapods, terrestrial arthropods, first trees, and first forests.",
  },
  ucmpCarboniferous: {
    shortTitle: "UCMP: Carboniferous",
    title: "The Carboniferous",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "The Carboniferous."',
    url: "https://ucmp.berkeley.edu/carboniferous/carboniferous.html",
    notes:
      "Used for vast Carboniferous coal swamps and for the amniote egg as a key evolutionary innovation that let vertebrates reproduce farther from water.",
  },
  ucmpMesozoicLife: {
    shortTitle: "UCMP: Mesozoic life",
    title: "Mesozoic Era: Life",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Mesozoic Era: Life."',
    url: "https://ucmp.berkeley.edu/mesozoic/mesozoiclife.html",
    notes:
      "Used for the public-facing framing that dinosaurs and other archosaurs dominated terrestrial life through much of the Mesozoic.",
  },
  ucmpJurassicLife: {
    shortTitle: "UCMP: Jurassic life",
    title: "Jurassic Period: Life",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "Jurassic Period: Life."',
    url: "https://ucmp.berkeley.edu/mesozoic/jurassic/jurassiclife.html",
    notes:
      "Used for Jurassic dinosaur dominance, giant sauropods, first birds including Archaeopteryx, marine reptiles, and gymnosperm-dominated plant life.",
  },
  ucmpCretaceousPeriod: {
    shortTitle: "UCMP: Cretaceous",
    title: "The Cretaceous Period",
    organization: "UC Museum of Paleontology",
    citation:
      'University of California Museum of Paleontology, "The Cretaceous Period."',
    url: "https://ucmp.berkeley.edu/mesozoic/cretaceous/cretaceous.html",
    notes:
      "Used for first flowering plants, first fossils of many insect groups, first modern mammal and bird groups, and the appearance of new dinosaur groups such as ceratopsians and pachycephalosaurs.",
  },
  britannicaCarboniferousPeriod: {
    shortTitle: "Britannica: Carboniferous",
    title: "Carboniferous Period",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Carboniferous Period."',
    url: "https://www.britannica.com/science/Carboniferous-Period",
    notes:
      "Used for Carboniferous coal-swamp environments, giant insects in Pennsylvanian skies, and the earliest reptiles such as Hylonomus.",
  },
  ucmpPermian: {
    shortTitle: "UCMP: Permian",
    title: "The Permian",
    organization: "UC Museum of Paleontology",
    citation: 'University of California Museum of Paleontology, "The Permian."',
    url: "https://ucmp.berkeley.edu/permian/permian.html",
    notes:
      "Used for the Permian as a turning point after which modern conifers appear in the fossil record and later Mesozoic land faunas take shape.",
  },
  britannicaPermianPeriod: {
    shortTitle: "Britannica: Permian",
    title: "Permian Period",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Permian Period."',
    url: "https://www.britannica.com/science/Permian-Period",
    notes:
      "Used for synapsid diversification from Early Permian pelycosaurs into more advanced therapsids as Pangaea grew drier and climates harsher.",
  },
  smithsonianHumanOrigins: {
    shortTitle: "Smithsonian Human Origins",
    title: "Interactive Human Origins Timeline",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Interactive Human Origins Timeline."',
    url: "https://humanorigins.si.edu/evidence/human-evolution-interactive-timeline",
    notes:
      "Used for the emergence of Homo sapiens and broad human-prehistory context.",
  },
  smithsonianHomoSapiens: {
    shortTitle: "Smithsonian: Homo sapiens",
    title: "Homo sapiens",
    organization: "Smithsonian Institution Human Origins Program",
    citation: 'Smithsonian Institution, Human Origins Program, "Homo sapiens."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
    notes:
      "Used for the direct public-facing Smithsonian statement that Homo sapiens evolved in Africa about 300,000 years ago.",
  },
  smithsonianHumanEvolutionIntro: {
    shortTitle: "Smithsonian: Human evolution intro",
    title: "Introduction to Human Evolution",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Introduction to Human Evolution."',
    url: "https://humanorigins.si.edu/education/introduction-human-evolution",
    notes:
      "Used for broad public-facing timing on early bipedalism, early human dispersal, and the overall six-million-year arc of human evolution.",
  },
  smithsonianHumanFamilyTree: {
    shortTitle: "Smithsonian: Family tree",
    title: "Human Family Tree",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Human Family Tree."',
    url: "https://humanorigins.si.edu/evidence/human-family-tree",
    notes:
      "Used for the broad branching structure of the human family tree and the main public-facing lineup of ancestor and cousin species.",
  },
  smithsonianSahelanthropus: {
    shortTitle: "Smithsonian: Sahelanthropus",
    title: "Sahelanthropus tchadensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Sahelanthropus tchadensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/sahelanthropus-tchadensis",
    notes:
      "Used for Sahelanthropus as one of the oldest known hominins, living between about 7 and 6 million years ago, with early evidence linked to upright posture.",
  },
  smithsonianOrrorin: {
    shortTitle: "Smithsonian: Orrorin",
    title: "Orrorin tugenensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Orrorin tugenensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/orrorin-tugenensis",
    notes:
      "Used for Orrorin's 6.2 to 5.8 million-year range and for femoral evidence tied to early bipedal walking.",
  },
  smithsonianArdipithecusRamidus: {
    shortTitle: "Smithsonian: Ardipithecus ramidus",
    title: "Ardipithecus ramidus",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Ardipithecus ramidus."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/ardipithecus-ramidus",
    notes:
      "Used for Ardipithecus ramidus as a woodland hominin around 4.4 million years ago combining climbing traits with evidence for bipedal movement.",
  },
  smithsonianAustralopithecusAnamensis: {
    shortTitle: "Smithsonian: Au. anamensis",
    title: "Australopithecus anamensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Australopithecus anamensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/australopithecus-anamensis",
    notes:
      "Used for Australopithecus anamensis as an early upright-walking australopith living about 4.2 to 3.8 million years ago.",
  },
  smithsonianAustralopithecusAfarensis: {
    shortTitle: "Smithsonian: Au. afarensis",
    title: "Australopithecus afarensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Australopithecus afarensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/australopithecus-afarensis",
    notes:
      "Used for Lucy's species, its 3.85 to 2.95 million-year span, and its close association with habitual upright walking.",
  },
  smithsonianHomoHabilis: {
    shortTitle: "Smithsonian: Homo habilis",
    title: "Homo habilis",
    organization: "Smithsonian Institution Human Origins Program",
    citation: 'Smithsonian Institution, Human Origins Program, "Homo habilis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-habilis",
    notes:
      "Used for Homo habilis as an early Homo species living 2.4 to 1.4 million years ago and for public-facing statements on early stone tools and butchery.",
  },
  smithsonianHomoErectus: {
    shortTitle: "Smithsonian: Homo erectus",
    title: "Homo erectus",
    organization: "Smithsonian Institution Human Origins Program",
    citation: 'Smithsonian Institution, Human Origins Program, "Homo erectus."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-erectus",
    notes:
      "Used for Homo erectus as the first major human disperser beyond Africa and for the 1.89 million to 110,000 year timeframe in Smithsonian's public chronology.",
  },
  smithsonianHomoHeidelbergensis: {
    shortTitle: "Smithsonian: Homo heidelbergensis",
    title: "Homo heidelbergensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Homo heidelbergensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-heidelbergensis",
    notes:
      "Used for Homo heidelbergensis as a likely common stock behind Neanderthals and Homo sapiens, and for evidence of hearths, spears, and shelters in its timeframe.",
  },
  smithsonianHomoNeanderthalensis: {
    shortTitle: "Smithsonian: Neanderthals",
    title: "Homo neanderthalensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Homo neanderthalensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-neanderthalensis",
    notes:
      "Used for Neanderthals as our closest extinct relatives, their 400,000 to 40,000 year span, and their overlap with Homo sapiens.",
  },
  smithsonianHomoFloresiensis: {
    shortTitle: "Smithsonian: Homo floresiensis",
    title: "Homo floresiensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Homo floresiensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-floresiensis",
    notes:
      "Used for the late-surviving Flores lineage, summarized by Smithsonian as living about 100,000 to 50,000 years ago.",
  },
  smithsonianHomoNaledi: {
    shortTitle: "Smithsonian: Homo naledi",
    title: "Homo naledi",
    organization: "Smithsonian Institution Human Origins Program",
    citation: 'Smithsonian Institution, Human Origins Program, "Homo naledi."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-naledi",
    notes:
      "Used for Homo naledi's 335,000 to 236,000 year range and for Smithsonian's explicit statement that its placement in the Homo tree remains unresolved.",
  },
  smithsonianParanthropusBoisei: {
    shortTitle: "Smithsonian: P. boisei",
    title: "Paranthropus boisei",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Paranthropus boisei."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/paranthropus-boisei",
    notes:
      "Used for Paranthropus boisei as a long-lived side branch that coexisted with early Homo in eastern Africa.",
  },
  smithsonianArdipithecusKadabba: {
    shortTitle: "Smithsonian: Ardipithecus kadabba",
    title: "Ardipithecus kadabba",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Ardipithecus kadabba."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/ardipithecus-kadabba",
    notes:
      "Used for Ardipithecus kadabba as an early bipedal hominin from Ethiopia living between about 5.8 and 5.2 million years ago.",
  },
  smithsonianAustralopithecusAfricanus: {
    shortTitle: "Smithsonian: Au. africanus",
    title: "Australopithecus africanus",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Australopithecus africanus."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/australopithecus-africanus",
    notes:
      "Used for Australopithecus africanus as a southern African biped living about 3.3 to 2.1 million years ago and as a possible candidate for ancestry within the Homo line.",
  },
  smithsonianAustralopithecusGarhi: {
    shortTitle: "Smithsonian: Au. garhi",
    title: "Australopithecus garhi",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Australopithecus garhi."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/australopithecus-garhi",
    notes:
      "Used for Australopithecus garhi as a poorly documented but potentially important 2.5 million-year-old Ethiopian taxon near the transition toward Homo.",
  },
  smithsonianAustralopithecusSediba: {
    shortTitle: "Smithsonian: Au. sediba",
    title: "Australopithecus sediba",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Australopithecus sediba."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/australopithecus-sediba",
    notes:
      "Used for Australopithecus sediba as a very late australopith with a debated relationship to Homo, dated between 1.977 and 1.98 million years ago.",
  },
  smithsonianKenyanthropusPlatyops: {
    shortTitle: "Smithsonian: Kenyanthropus",
    title: "Kenyanthropus platyops",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Kenyanthropus platyops."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/kenyanthropus-platyops",
    notes:
      "Used for Kenyanthropus platyops as a debated flat-faced 3.5 million-year-old East African branch.",
  },
  smithsonianHomoRudolfensis: {
    shortTitle: "Smithsonian: H. rudolfensis",
    title: "Homo rudolfensis",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Homo rudolfensis."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-rudolfensis",
    notes:
      "Used for Homo rudolfensis as a debated early Homo lineage living about 1.9 to 1.8 million years ago in eastern Africa.",
  },
  smithsonianParanthropusAethiopicus: {
    shortTitle: "Smithsonian: P. aethiopicus",
    title: "Paranthropus aethiopicus",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Paranthropus aethiopicus."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/paranthropus-aethiopicus",
    notes:
      "Used for Paranthropus aethiopicus as the earliest widely recognized robust australopith, living about 2.7 to 2.3 million years ago.",
  },
  smithsonianParanthropusRobustus: {
    shortTitle: "Smithsonian: P. robustus",
    title: "Paranthropus robustus",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      'Smithsonian Institution, Human Origins Program, "Paranthropus robustus."',
    url: "https://humanorigins.si.edu/evidence/human-fossils/species/paranthropus-robustus",
    notes:
      "Used for Paranthropus robustus as a southern African robust cousin lineage living about 1.8 to 1.2 million years ago.",
  },
  khanPaleolithicCulture: {
    shortTitle: "Khan: Paleolithic culture",
    title: "Paleolithic technology, culture, and art",
    organization: "Khan Academy",
    citation: 'Khan Academy, "Paleolithic technology, culture, and art."',
    url: "https://www.khanacademy.org/humanities/world-history/world-history-beginnings/origin-humans-early-societies/a/paleolithic-culture-and-technology",
    notes:
      "Used for standard Stone Age terminology and the broad Paleolithic-to-Neolithic sequence.",
  },
  kakaduUbirr: {
    shortTitle: "Kakadu: Ubirr",
    title: "Ubirr",
    organization: "Kakadu National Park / Parks Australia",
    citation: 'Parks Australia, "Ubirr," Kakadu National Park.',
    url: "https://kakadu.gov.au/things-do/activities/rock-art/ubirr/",
    notes:
      "Used for Ubirr as one of Kakadu's outstanding rock art galleries and one of the reasons for Kakadu's dual World Heritage status.",
  },
  khanNeolithicRevolution: {
    shortTitle: "Khan: Neolithic Revolution",
    title: "The Neolithic Revolution",
    organization: "Khan Academy / Smarthistory",
    citation: 'Khan Academy, "The Neolithic Revolution."',
    url: "https://www.khanacademy.org/humanities/world-history/world-history-beginnings/origin-humans-early-societies/a/the-neolithic-revolution",
    notes:
      "Used for Near Eastern Neolithic examples such as Pre-Pottery Neolithic B at Jericho.",
  },
  metPrehistoricArt: {
    shortTitle: "Met: Prehistoric Art",
    title: "Introduction to Prehistoric Art, 20,000–8000 B.C.",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Tedesco, Laura Anne. "Introduction to Prehistoric Art, 20,000–8000 B.C." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/preh/hd_preh.htm",
    notes:
      "Used for direct public-facing statements on early ocher markings in African rock art and on Natufian occupation at Eynan/Ain Mallaha around 10,000–8000 B.C.",
  },
  metChauvet: {
    shortTitle: "Met: Chauvet Cave",
    title: "Chauvet Cave (ca. 30,000 B.C.)",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Clottes, Jean. "Chauvet Cave (ca. 30,000 B.C.)." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/chav/hd_chav.htm",
    notes:
      "Used for Chauvet Cave's first major drawing phase around 30,000–32,000 BP and for concise museum-grade framing of its figurative art.",
  },
  berkeleyOriginOfLife: {
    shortTitle: "Berkeley: origin of life",
    title: "When did life originate?",
    organization: "Understanding Evolution / UC Museum of Paleontology",
    citation:
      'Understanding Evolution, "When did life originate?" University of California Museum of Paleontology.',
    url: "https://evolution.berkeley.edu/from-soup-to-cells-the-origin-of-life/when-did-life-originate/",
    notes:
      "Used for the cautious estimate that evidence suggests life first evolved around 3.5 billion years ago, based on microfossils and stromatolites.",
  },
  nhmFirstLandPlants: {
    shortTitle: "NHM: first land plants",
    title: "New group of plants was one of the first to colonise the land",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "New group of plants was one of the first to colonise the land."',
    url: "https://www.nhm.ac.uk/discover/news/2022/february/new-group-plants-was-one-first-colonise-land.html",
    notes:
      "Used for the public-facing statement that the ancestors of modern flora first moved onto land between 450 and 500 million years ago, with cryptospores dating back to around 470 million years ago.",
  },
  nhmCarboniferousRainforestCollapse: {
    shortTitle: "NHM: Carboniferous collapse",
    title:
      "New species of “living fossil” had jaws unlike anything seen before",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "New species of “living fossil” had jaws unlike anything seen before."',
    url: "https://www.nhm.ac.uk/discover/news/2026/march/new-species-living-fossil-had-jaws-unlike-anything-seen-before.html",
    notes:
      "Used for the public-facing statement that the Carboniferous rainforest collapse drove widespread extinction as moist habitats gave way to drier ones.",
  },
  frontiersTriassicRevolution: {
    shortTitle: "Frontiers: Triassic Revolution",
    title: "Triassic Revolution",
    organization: "Frontiers in Earth Science",
    citation:
      'Benton, M. J., and Wu, F. (2022), "Triassic Revolution." Frontiers in Earth Science 10:899541. doi:10.3389/feart.2022.899541.',
    url: "https://www.frontiersin.org/journals/earth-science/articles/10.3389/feart.2022.899541/full",
    notes:
      "Used for the review-level framing that the Mesozoic Marine Revolution began much earlier than once thought, with initiation from the Early Triassic onward and major escalation later in the Triassic.",
  },
  amnhPaleoceneEoceneThermalMaximum: {
    shortTitle: "AMNH: PETM",
    title: "PETM: Unearthing Ancient Climate Change",
    organization: "American Museum of Natural History",
    citation:
      'American Museum of Natural History, "PETM: Unearthing Ancient Climate Change."',
    url: "https://www.amnh.org/explore/videos/earth-and-climate/paleocene-eocene-thermal-maximum",
    notes:
      "Used for the public-facing statement that the PETM occurred about 55 million years ago, raised global surface temperature by 5 to 9°C, lasted upwards of 170,000 years, and dramatically affected life on land and in the oceans.",
  },
  nhmPaleoceneEoceneThermalMaximum: {
    shortTitle: "NHM: PETM",
    title: "Paleocene-Eocene Thermal Maximum (PETM)",
    organization: "Natural History Museum, London",
    citation:
      'Natural History Museum, London, "Paleocene-Eocene Thermal Maximum (PETM)."',
    url: "https://www.nhm.ac.uk/our-science/research/projects/paleocene-eocene-thermal-maximum.html",
    notes:
      "Used for the public-facing timing that the PETM occurred around 55.8 million years ago and for the framing of the event as the most rapid and significant climatic warming pulse of the past 65 million years, with extinctions among some deep-sea organisms, plankton, and terrestrial mammals.",
  },
  birminghamCarboniferousCurios: {
    shortTitle: "Birmingham: Alveley footprints",
    title: "Carboniferous Curios: the Alveley Footprints",
    organization: "University of Birmingham",
    citation:
      'University of Birmingham, "Carboniferous Curios: the Alveley Footprints."',
    url: "https://www.birmingham.ac.uk/news/2024/carboniferous-curios-the-alveley-footprints",
    notes:
      "Used for the public-facing statement that a major environmental change around 307 million years ago, termed the Carboniferous Rainforest Collapse, marked a transition from humid rainforest habitats toward drier Permian-style ecosystems.",
  },
  britannicaOriginAgriculture: {
    shortTitle: "Britannica: origins of agriculture",
    title: "origins of agriculture",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "origins of agriculture."',
    url: "https://www.britannica.com/topic/agriculture/The-origin-of-agriculture",
    notes:
      "Used for the broad estimate that agriculture emerged independently in multiple regions, with early agriculture beginning roughly 15,000–10,000 years before present.",
  },
  britannicaMehrgarh: {
    shortTitle: "Britannica: Mehrgarh",
    title: "Mehrgarh",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Mehrgarh."',
    url: "https://www.britannica.com/place/Mehrgarh",
    notes:
      "Used for Mehrgarh as an early South Asian Neolithic settlement from roughly 8000–5000 BCE with farming, herding, mud-brick houses, and widening exchange.",
  },
  unescoGobekliTepe: {
    shortTitle: "UNESCO: Göbekli Tepe",
    title: "Göbekli Tepe",
    organization: "UNESCO World Heritage Centre",
    citation: 'UNESCO World Heritage Centre, "Göbekli Tepe."',
    url: "https://whc.unesco.org/en/list/1572/",
    notes:
      "Used for Göbekli Tepe's Pre-Pottery Neolithic monumental structures, dated between 9600 and 8200 BCE.",
  },
  unescoCatalhoyuk: {
    shortTitle: "UNESCO: Çatalhöyük",
    title: "Neolithic Site of Çatalhöyük",
    organization: "UNESCO World Heritage Centre",
    citation: 'UNESCO World Heritage Centre, "Neolithic Site of Çatalhöyük."',
    url: "https://whc.unesco.org/en/list/1405/",
    notes:
      "Used for Çatalhöyük's eastern mound occupation between 7400 and 6200 BCE as evidence of early settled agricultural life.",
  },
  unescoStonehenge: {
    shortTitle: "UNESCO: Stonehenge",
    title: "Stonehenge, Avebury and Associated Sites",
    organization: "UNESCO World Heritage Centre",
    citation:
      'UNESCO World Heritage Centre, "Stonehenge, Avebury and Associated Sites."',
    url: "https://whc.unesco.org/en/list/373/",
    notes:
      "Used for the broader Stonehenge and Avebury ceremonial landscape spanning about 3700 to 1600 BCE, with Stonehenge itself commonly anchored to the late Neolithic around 3000 BCE.",
  },
  unescoSwabianJura: {
    shortTitle: "UNESCO: Swabian Jura",
    title: "Caves and Ice Age Art in the Swabian Jura",
    organization: "UNESCO World Heritage Centre",
    citation:
      'UNESCO World Heritage Centre, "Caves and Ice Age Art in the Swabian Jura."',
    url: "https://whc.unesco.org/en/list/1527/",
    notes:
      "Used for the Swabian Jura caves as a concentration of Aurignacian finds dating from 43,000 to 33,000 years ago, including the oldest musical instruments yet found worldwide.",
  },
  unescoChauvet: {
    shortTitle: "UNESCO: Chauvet",
    title:
      "Decorated Cave of Pont d’Arc, known as Grotte Chauvet-Pont d’Arc, Ardèche",
    organization: "UNESCO World Heritage Centre",
    citation:
      'UNESCO World Heritage Centre, "Decorated Cave of Pont d’Arc, known as Grotte Chauvet-Pont d’Arc, Ardèche."',
    url: "https://whc.unesco.org/en/list/1426/",
    notes:
      "Used for the earliest-known figurative drawings in Chauvet Cave, dated to about 30,000–32,000 BP.",
  },
  metJiahu: {
    shortTitle: "Met: Jiahu",
    title: "Jiahu (ca. 7000–5700 B.C.)",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Tedesco, Laura Anne. "Jiahu (ca. 7000–5700 B.C.)." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/jiah/hd_jiah.htm",
    notes:
      "Used for Jiahu as an early Neolithic village in central China with houses, kilns, pottery, and the earliest known playable bone flutes.",
  },
  britannicaBronzeAge: {
    shortTitle: "Britannica: Bronze Age",
    title: "Bronze Age",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Bronze Age."',
    url: "https://www.britannica.com/topic/Bronze-Age",
    notes:
      "Used for the standard Bronze Age to Iron Age sequence and the regional caveat that dates vary, including across the Middle East.",
  },
  britannicaIronAge: {
    shortTitle: "Britannica: Iron Age",
    title: "Iron Age",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Iron Age."',
    url: "https://www.britannica.com/topic/Iron-Age",
    notes:
      "Used for broad public-facing Iron Age framing: iron tools and weapons becoming widespread after about 1200 BCE, with regional dates varying.",
  },
  britannicaClassicalAntiquity: {
    shortTitle: "Britannica: Classical antiquity",
    title: "Classical antiquity",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Classical antiquity."',
    url: "https://www.britannica.com/event/classical-antiquity",
    notes:
      "Used for the broad Greco-Roman framing of classical antiquity and its influence on Mediterranean law, architecture, philosophy, and urban life.",
  },
  britannicaMetallurgy: {
    shortTitle: "Britannica: Metallurgy",
    title: "metallurgy",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "metallurgy."',
    url: "https://www.britannica.com/science/metallurgy",
    notes:
      "Used for the iron-metallurgy side of the Iron Age: bloom smelting, repeated reheating and hammering into wrought iron, carburization, and the wider spread of ironworking over time.",
  },
  britannicaMiddleEast: {
    shortTitle: "Britannica: Middle East",
    title: "Middle East",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Middle East."',
    url: "https://www.britannica.com/place/Middle-East",
    notes:
      "Used for ancient Middle East framing, including Bronze Age and Iron Age influence in the Levant and Mesopotamia.",
  },
  britannicaMesopotamia: {
    shortTitle: "Britannica: Mesopotamia",
    title: "history of Mesopotamia",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "history of Mesopotamia."',
    url: "https://www.britannica.com/place/Mesopotamia-historical-region-Asia",
    notes:
      "Used for the late 4th-millennium BCE emergence of writing and early urban civilization in Mesopotamia.",
  },
  britannicaErech: {
    shortTitle: "Britannica: Erech",
    title: "Erech",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Erech."',
    url: "https://www.britannica.com/place/Erech",
    notes:
      "Used for Uruk / Erech as the key Mesopotamian city illustrating early urban life in the Erech–Jamdat Nasr period.",
  },
  metUrukFirstCity: {
    shortTitle: "Met: Uruk",
    title: "Uruk: The First City",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Department of Ancient Near Eastern Art. "Uruk: The First City." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/uruk/hd_uruk.htm",
    notes:
      "Used for the direct museum framing of Uruk as the first city and for its threshold around 3200 B.C. as a true city in southern Mesopotamia.",
  },
  britannicaWheel: {
    shortTitle: "Britannica: wheel",
    title: "wheel",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "wheel."',
    url: "https://www.britannica.com/technology/wheel",
    notes:
      "Used for the direct statement that a Sumerian Erech pictograph from about 3500 BC shows wheeled transport and that potter's wheels had developed in Mesopotamia by 3500 BC.",
  },
  britannicaAkkad: {
    shortTitle: "Britannica: Akkad",
    title: "Akkad",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Akkad."',
    url: "https://www.britannica.com/place/Akkad",
    notes:
      "Used for Sargon of Akkad's rise around 2300 BCE and the broad Akkadian imperial phase that followed.",
  },
  britannicaBabylonia: {
    shortTitle: "Britannica: Babylonia",
    title: "Babylonia",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Babylonia."',
    url: "https://www.britannica.com/place/Babylonia",
    notes:
      "Used for the Sumer/Akkad-to-Babylonia transition, Hammurabi's Babylonian rise, and the broad late-Babylonian endpoint in 539 BCE.",
  },
  metBabylon: {
    shortTitle: "Met: Babylon",
    title: "Babylon",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Seymour, Michael. "Babylon." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/babl/hd_babl.htm",
    notes:
      "Used for public-facing Babylonian periodization, including the Old Babylonian end in 1595 BCE, Kassite rule afterward, and the broader Babylonian sequence into the first millennium BCE.",
  },
  britannicaHammurabi: {
    shortTitle: "Britannica: Hammurabi",
    title: "Hammurabi",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Hammurabi."',
    url: "https://www.britannica.com/biography/Hammurabi",
    notes:
      "Used for Hammurabi's reign (c. 1792–1750 BCE) and his enduring association with one of the best-known Mesopotamian law collections.",
  },
  britannicaAncientEgypt: {
    shortTitle: "Britannica: Ancient Egypt",
    title: "ancient Egypt",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "ancient Egypt."',
    url: "https://www.britannica.com/place/ancient-Egypt",
    notes:
      "Used for the broad span of ancient Egyptian civilization from dynastic unification to Roman annexation.",
  },
  britannicaHittiteEmpire: {
    shortTitle: "Britannica: Hittites",
    title: "The Hittite empire, c. 1650–1180 BCE",
    organization: "Encyclopaedia Britannica",
    citation:
      'Encyclopaedia Britannica, "Anatolia: The Hittite empire, c. 1650–1180 BCE."',
    url: "https://www.britannica.com/place/Anatolia/The-Hittite-empire-c-1650-1180-bce",
    notes:
      "Used for the conventional public-facing span of the Hittite Empire in Anatolia and northern Syria.",
  },
  britannicaIndusCivilization: {
    shortTitle: "Britannica: Indus civilization",
    title: "Indus civilization",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Indus civilization."',
    url: "https://www.britannica.com/topic/Indus-civilization",
    notes:
      "Used for the broad Harappan / Indus Valley civilization timeframe in South Asia.",
  },
  historyPersianEmpire: {
    shortTitle: "History: Persian Empire",
    title: "Persian Empire",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Persian Empire."',
    url: "https://www.history.com/topics/ancient-middle-east/persian-empire",
    notes:
      "Used for the broad Achaemenid Persian Empire span from Cyrus the Great's rise in 550 BCE to Alexander's conquest in 330 BCE.",
  },
  worldHistoryGreatPyramidGiza: {
    shortTitle: "WHE: Great Pyramid",
    title: "Great Pyramid of Giza",
    organization: "World History Encyclopedia",
    citation:
      'Mark, Joshua J., "Great Pyramid of Giza." World History Encyclopedia.',
    url: "https://www.worldhistory.org/Great_Pyramid_of_Giza/",
    notes:
      "Used for the familiar c. 2560 BCE completion date of Khufu's pyramid in public-facing ancient-history timelines.",
  },
  worldHistoryAssyria: {
    shortTitle: "WHE: Assyria",
    title: "Assyria",
    organization: "World History Encyclopedia",
    citation: 'Mark, Joshua J., "Assyria." World History Encyclopedia.',
    url: "https://www.worldhistory.org/assyria/",
    notes:
      "Used for the Neo-Assyrian Empire's conventional 912–612 BCE span and public-facing chronology.",
  },
  metAssyria: {
    shortTitle: "Met: Assyria",
    title: "Assyria, 1365–609 B.C.",
    organization: "The Metropolitan Museum of Art",
    citation:
      'Department of Ancient Near Eastern Art. "Assyria, 1365–609 B.C." In Heilbrunn Timeline of Art History. The Metropolitan Museum of Art.',
    url: "https://www.metmuseum.org/toah/hd/assy/hd_assy.htm",
    notes:
      "Used for broad Assyrian periodization from Ashur-uballit I's revival in the 14th century BCE through the Middle Assyrian high point and the Neo-Assyrian collapse in 612 BCE.",
  },
  unescoMycenaeTiryns: {
    shortTitle: "UNESCO: Mycenae",
    title: "Archaeological Sites of Mycenae and Tiryns",
    organization: "UNESCO World Heritage Centre",
    citation:
      'UNESCO World Heritage Centre, "Archaeological Sites of Mycenae and Tiryns."',
    url: "https://whc.unesco.org/en/list/941/",
    notes:
      "Used for Mycenaean civilization's broad 1600–1100 BCE span and for its role in preserving the earliest written Greek in Linear B.",
  },
  unescoYinXu: {
    shortTitle: "UNESCO: Yin Xu",
    title: "Yin Xu",
    organization: "UNESCO World Heritage Centre",
    citation: 'UNESCO World Heritage Centre, "Yin Xu."',
    url: "https://whc.unesco.org/en/list/1114/",
    notes:
      "Used for the late Shang capital at Yin around 1300 BCE and for oracle bones as the earliest known mature Chinese writing.",
  },
  britannicaAncientGreece: {
    shortTitle: "Britannica: ancient Greece",
    title: "ancient Greek civilization",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "ancient Greek civilization."',
    url: "https://www.britannica.com/place/ancient-Greece",
    notes:
      "Used for the broad ancient Greek civilization span from about 1200 BCE to the death of Alexander in 323 BCE.",
  },
  britannicaHellenisticAge: {
    shortTitle: "Britannica: Hellenistic age",
    title: "Hellenistic age",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Hellenistic age."',
    url: "https://www.britannica.com/event/Hellenistic-Age",
    notes:
      "Used for the Hellenistic period between Alexander's death in 323 BCE and the Roman conquest of Ptolemaic Egypt in 30 BCE.",
  },
  historyAncientRome: {
    shortTitle: "History: Ancient Rome",
    title: "Ancient Rome",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Ancient Rome."',
    url: "https://www.history.com/articles/ancient-rome",
    notes:
      "Used for broad Roman political periodization, including the Republic's beginning in 509 BCE, Augustus' accession in 27 BCE, and the western empire's fall in 476 CE.",
  },
  khanRomanRepublic: {
    shortTitle: "Khan: Roman Republic",
    title: "The Roman Republic",
    organization: "Khan Academy",
    citation: 'Khan Academy, "The Roman Republic."',
    url: "https://www.khanacademy.org/humanities/world-history/ancient-medieval/roman/a/roman-republic",
    notes:
      "Used for the conventional 509 BCE start of the Roman Republic and broad republican political framing.",
  },
  khanRomanEmpire: {
    shortTitle: "Khan: Roman Empire",
    title: "The Roman Empire",
    organization: "Khan Academy",
    citation: 'Khan Academy, "The Roman Empire."',
    url: "https://www.khanacademy.org/humanities/world-history/ancient-medieval/roman/a/roman-empire",
    notes:
      "Used for the Roman Empire's conventional start in 27 BCE under Augustus.",
  },
  britannicaHanDynasty: {
    shortTitle: "Britannica: Han dynasty",
    title: "Han dynasty",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Han dynasty."',
    url: "https://www.britannica.com/topic/Han-dynasty",
    notes:
      "Used for the Han dynasty's standard 206 BCE to 220 CE span in Chinese history surveys.",
  },
  britannicaMongolEmpire: {
    shortTitle: "Britannica: Mongol empire",
    title: "Mongol empire",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Mongol empire."',
    url: "https://www.britannica.com/topic/Mongol-empire",
    notes:
      "Used for the broad Mongol Empire span of 1206–1368, from Temujin's election as Genghis Khan to the fall of Yuan rule in China under the Ming.",
  },
  historyBlackDeath: {
    shortTitle: "History: Black Death",
    title: "Black Death",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Black Death."',
    url: "https://www.history.com/articles/black-death",
    notes:
      "Used for the Black Death's arrival in Europe in 1347 as a clean turning-point marker for the mid-14th-century pandemic.",
  },
  historyAlexanderGreat: {
    shortTitle: "History: Alexander the Great",
    title: "Alexander the Great",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Alexander the Great."',
    url: "https://www.history.com/articles/alexander-the-great",
    notes:
      "Used for Alexander's death in 323 BCE and for the public-history framing that his death opened the Hellenistic period.",
  },
  historyByzantineEmpire: {
    shortTitle: "History: Byzantine Empire",
    title: "Byzantine Empire",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Byzantine Empire."',
    url: "https://www.history.com/articles/byzantine-empire",
    notes:
      "Used for the fall of Constantinople in 1453, marking the end of the Byzantine Empire.",
  },
  historyIslam: {
    shortTitle: "History: Islam",
    title: "Islam",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Islam."',
    url: "https://www.history.com/articles/islam",
    notes:
      "Used for Muhammad's revelations beginning in 610, the Hijra in 622, and the public-history framing of Islam's early expansion.",
  },
  historyCharlemagne: {
    shortTitle: "History: Charlemagne",
    title: "Charlemagne",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Charlemagne."',
    url: "https://www.history.com/articles/charlemagne",
    notes:
      "Used for Charlemagne's reign and especially for his imperial coronation on December 25, 800.",
  },
  historyCrusades: {
    shortTitle: "History: Crusades",
    title: "Crusades",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Crusades."',
    url: "https://www.history.com/articles/crusades",
    notes:
      "Used for Pope Urban II's 1095 call at Clermont as the conventional beginning of the Crusades in public-history surveys.",
  },
  historyGenghisKhan: {
    shortTitle: "History: Genghis Khan",
    title: "Genghis Khan",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Genghis Khan."',
    url: "https://www.history.com/articles/genghis-khan",
    notes:
      "Used for Temujin's proclamation as Chinggis Khan in 1206 and the Mongol Empire's early expansion.",
  },
  metByzantium: {
    shortTitle: "Met: Byzantium",
    title: "Byzantium (ca. 330–1453)",
    organization: "The Metropolitan Museum of Art",
    citation: 'The Metropolitan Museum of Art, "Byzantium (ca. 330–1453)."',
    url: "https://www.metmuseum.org/toah/hd/byza/hd_byza.htm",
    notes:
      "Used for the conventional Byzantine span from Constantinople's refounding in 330 CE to the Ottoman conquest in 1453.",
  },
  khanGoldenAgeOfIslam: {
    shortTitle: "Khan: Golden age of Islam",
    title: "The golden age of Islam",
    organization: "Khan Academy",
    citation: 'Khan Academy, "The golden age of Islam."',
    url: "https://www.khanacademy.org/humanities/world-history/medieval-times/islam-medieval/a/the-golden-age-of-islam",
    notes:
      "Used for Abbasid-era Baghdad and Khan Academy's 750–1258 Abbasid political framing in its medieval Islam material.",
  },
  khanSongChina: {
    shortTitle: "Khan: Song China",
    title: "Prosperity in Song China (960-1279)",
    organization: "Khan Academy",
    citation: 'Khan Academy, "Prosperity in Song China (960-1279)."',
    url: "https://www.khanacademy.org/humanities/world-history/medieval-times/song-china/v/prosperity-in-song-china-960-1279",
    notes:
      "Used for the standard Song dynasty span of 960–1279 and for concise context on Song-era prosperity, trade, and innovation.",
  },
  historyOttomanEmpire: {
    shortTitle: "History: Ottoman Empire",
    title: "Ottoman Empire",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Ottoman Empire."',
    url: "https://www.history.com/topics/middle-east/ottoman-empire",
    notes:
      "Used for the Ottoman state's conventional origin around 1299 and its broader imperial duration to 1922; the app clips the overlay to 1800 for early-modern readability.",
  },
  historyMingDynasty: {
    shortTitle: "History: Ming Dynasty",
    title: "Ming Dynasty",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Ming Dynasty."',
    url: "https://www.history.com/topics/china/ming-dynasty",
    notes:
      "Used for the conventional Ming dynasty span from 1368 to 1644 in broad public-history surveys.",
  },
  historyAztecs: {
    shortTitle: "History: Aztecs",
    title: "Aztecs",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Aztecs."',
    url: "https://www.history.com/topics/ancient-americas/aztecs",
    notes:
      "Used for the Aztec Empire's concise imperial span from the 1428 Triple Alliance to the Spanish conquest of Tenochtitlan in 1521.",
  },
  historyInca: {
    shortTitle: "History: Inca",
    title: "Inca",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Inca."',
    url: "https://www.history.com/topics/south-america/inca",
    notes:
      "Used for the Inca Empire's rise under Pachacuti from about 1438 and the final fall of Vilcabamba in 1572.",
  },
  historyChristopherColumbus: {
    shortTitle: "History: Christopher Columbus",
    title: "Christopher Columbus",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Christopher Columbus."',
    url: "https://www.history.com/articles/christopher-columbus",
    notes:
      "Used for the 1492 Atlantic landfall that serves as a standard public-history anchor for the Columbian Exchange.",
  },
  historyReformation: {
    shortTitle: "History: Reformation",
    title: "The Reformation",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "The Reformation."',
    url: "https://www.history.com/articles/reformation",
    notes:
      "Used for the conventional 1517 start of the Protestant Reformation with Martin Luther's 95 Theses.",
  },
  historyFrenchRevolution: {
    shortTitle: "History: French Revolution",
    title: "French Revolution",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "French Revolution."',
    url: "https://www.history.com/articles/french-revolution",
    notes: "Used for the standard 1789 start of the French Revolution.",
  },
  historyWorldWarOne: {
    shortTitle: "History: World War I",
    title: "World War I",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "World War I."',
    url: "https://www.history.com/articles/world-war-i-history",
    notes: "Used for the canonical 1914 start year of World War I.",
  },
  britannicaTitanic: {
    shortTitle: "Britannica: Titanic",
    title: "Titanic",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Titanic."',
    url: "https://www.britannica.com/topic/Titanic",
    notes:
      "Used for Titanic's sinking in the North Atlantic on April 15, 1912, including the widely cited 2:20 a.m. sinking time in ship histories.",
  },
  historyRussianRevolution: {
    shortTitle: "History: Russian Revolution",
    title: "Russian Revolution",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Russian Revolution."',
    url: "https://www.history.com/articles/russian-revolution",
    notes: "Used for the Russian Revolution's canonical 1917 date anchor.",
  },
  historyWorldWarTwo: {
    shortTitle: "History: World War II",
    title: "World War II",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "World War II."',
    url: "https://www.history.com/articles/world-war-ii-history",
    notes: "Used for the canonical 1939 start year of World War II.",
  },
  historyIndustrialRevolution: {
    shortTitle: "History: Industrial Revolution",
    title: "Industrial Revolution",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Industrial Revolution."',
    url: "https://www.history.com/articles/industrial-revolution",
    notes:
      "Used for industrialization as a transformation of agrarian societies into industrial and urban ones, driven by factories, steam power, coal, and rail transport.",
  },
  historyColdWar: {
    shortTitle: "History: Cold War",
    title: "Cold War History",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Cold War History."',
    url: "https://www.history.com/articles/cold-war-history",
    notes:
      "Used for the post-1945 Cold War as a period of geopolitical tension, nuclear rivalry, and space-race competition between blocs led by the United States and Soviet Union.",
  },
  historyPrintingPress: {
    shortTitle: "History: Printing Press",
    title: "Printing Press",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Printing Press."',
    url: "https://www.history.com/articles/printing-press",
    notes:
      "Used for the Gutenberg press becoming commercially ready by 1450, a clean public-history anchor for print culture's acceleration in Europe.",
  },
  historyAmericanRevolution: {
    shortTitle: "History: Revolutionary War",
    title: "Revolutionary War",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Revolutionary War."',
    url: "https://www.history.com/articles/american-revolution-history",
    notes:
      "Used for the 1776 Declaration of Independence as a concise marker for the American Revolution's political break with Britain.",
  },
  natGeoGlobalization: {
    shortTitle: "NatGeo: Globalization",
    title: "Globalization",
    organization: "National Geographic Society",
    citation: 'National Geographic Society, "Globalization."',
    url: "https://education.nationalgeographic.org/resource/globalization/",
    notes:
      "Used for globalization as increasing connectedness and interdependence, especially through trade, technology, transportation, and the information age.",
  },
  unDecolonization: {
    shortTitle: "UN: Decolonization",
    title: "Decolonization",
    organization: "United Nations",
    citation: 'United Nations, "Decolonization."',
    url: "https://www.un.org/en/global-issues/decolonization",
    notes:
      "Used for decolonization after 1945, including the UN-backed wave of independence and self-determination that reshaped the modern world.",
  },
  britannicaHaitianRevolution: {
    shortTitle: "Britannica: Haitian Revolution",
    title: "Haitian Revolution",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Haitian Revolution."',
    url: "https://www.britannica.com/event/Haitian-Revolution",
    notes:
      "Used for the Haitian Revolution's standard 1791 start, when the major slave uprising began in Saint-Domingue.",
  },
  historyMeijiRestoration: {
    shortTitle: "History: Meiji Restoration",
    title: "Meiji Restoration",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "Meiji Restoration."',
    url: "https://www.history.com/articles/meiji-restoration",
    notes:
      "Used for the canonical 1868 date of the Meiji Restoration and the political overthrow of the Tokugawa shogunate.",
  },
  historyMoonLanding: {
    shortTitle: "History: 1969 Moon Landing",
    title: "1969 Moon Landing",
    organization: "HISTORY",
    citation: 'HISTORY.com Editors, "1969 Moon Landing."',
    url: "https://www.history.com/articles/moon-landing-1969",
    notes:
      "Used for the Apollo 11 moon landing on July 20, 1969, the first human landing on the Moon.",
  },
  periodo: {
    shortTitle: "PeriodO",
    title: "PeriodO: A Gazetteer of Period Definitions",
    organization: "PeriodO",
    citation:
      "Rabinowitz, A. et al., PeriodO: a public-domain gazetteer of scholarly period definitions.",
    url: "https://perio.do/en/",
    notes:
      "Used for archaeological and historical terminology. PeriodO preserves overlapping regional definitions, so the app uses canonical approximate dates for a clean non-overlapping primary track.",
  },
  stearnsPeriodization: {
    shortTitle: "Stearns on periodization",
    title: "Periodization in World History: Challenges and Opportunities",
    organization: "Palgrave / world-history scholarship",
    citation:
      'Stearns, Peter N. (2017). "Periodization in World History: Challenges and Opportunities." In 21st-Century Narratives of World History: Global and Multidisciplinary Perspectives. Palgrave Macmillan.',
    notes:
      "Used for world-history macroperiod labels such as ancient, post-classical, early modern, and contemporary.",
  },
  bentleyEarlyModern: {
    shortTitle: "Bentley on early modern",
    title: "Early Modern Europe and the Early Modern World",
    organization: "Rowman & Littlefield / world-history scholarship",
    citation:
      'Bentley, Jerry H. (2007). "Early Modern Europe and the Early Modern World." In Between the Middle Ages and Modernity: Individual and Community in the Early Modern World. Rowman & Littlefield.',
    notes: "Supports the app's c. 1500–1800 early-modern framing.",
  },
  brivatiContemporary: {
    shortTitle: "Brivati on contemporary history",
    title: "The Contemporary History Handbook",
    organization: "Manchester University Press",
    citation:
      'Brivati, Brian (1996). "Introduction." In The Contemporary History Handbook. Manchester University Press.',
    notes:
      "Supports contemporary history as c. 1945–present in English-language historiography.",
  },
} as const satisfies Record<string, EraSource>;

export type EraSourceId = keyof typeof ERA_SOURCES;
