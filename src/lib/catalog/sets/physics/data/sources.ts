import type { EraSource } from "@/lib/core/timelineTypes";

export const PHYSICS_SOURCES = {
  britannicaPhysicalScience: {
    shortTitle: "Britannica: physical science",
    title: "physical science",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "physical science."',
    url: "https://www.britannica.com/science/physical-science",
  },
  britannicaRelativity: {
    shortTitle: "Britannica: relativity",
    title: "relativity",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "relativity."',
    url: "https://www.britannica.com/science/relativity",
  },
  britannicaScientificRevolution: {
    shortTitle: "Britannica: Scientific Revolution",
    title: "Scientific Revolution",
    organization: "Encyclopaedia Britannica",
    citation: 'Encyclopaedia Britannica, "Scientific Revolution."',
    url: "https://www.britannica.com/event/Scientific-Revolution",
  },
  cernHiggsBoson2012: {
    shortTitle: "CERN: Higgs boson",
    title:
      "Observation of a new particle with the mass of the Higgs boson at CERN",
    organization: "CERN",
    citation:
      'CERN, "Observation of a new particle with the mass of the Higgs boson at CERN."',
    url: "https://home.cern/news/press-release/cern/observation-new-particle-mass-higgs-boson-cern",
  },
  cernPrecisionEra: {
    shortTitle: "CERN: precision era",
    title: "Welcome to the precision era",
    organization: "CERN",
    citation: 'CERN, "Welcome to the precision era."',
    url: "https://home.cern/news/series/lhc-physics-ten/welcome-precision-era",
  },
  iopNuclearPhysics: {
    shortTitle: "IOP: nuclear physics",
    title: "100 incredible years of physics – nuclear physics",
    organization: "Institute of Physics",
    citation:
      'Institute of Physics, "100 incredible years of physics – nuclear physics."',
    url: "https://www.iop.org/about/iop-history/100th-anniversary/100-incredible-years/nuclear-physics",
  },
  jamesClerkMaxwellWikipedia: {
    shortTitle: "Wikipedia: James Clerk Maxwell",
    title: "James Clerk Maxwell",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "James Clerk Maxwell." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/James_Clerk_Maxwell",
  },
  khanGoldenAgeOfIslam: {
    shortTitle: "Khan: Golden age of Islam",
    title: "The golden age of Islam",
    organization: "Khan Academy",
    citation: 'Khan Academy, "The golden age of Islam."',
    url: "https://www.khanacademy.org/humanities/world-history/medieval-times/islam-medieval/a/the-golden-age-of-islam",
  },
  libreTextsFailuresOfClassicalPhysics: {
    shortTitle: "LibreTexts: failures of classical physics",
    title: "1.4: Failures of Classical Physics",
    organization: "LibreTexts / California State University East Bay",
    citation:
      'Fleming, Patrick, "1.4: Failures of Classical Physics," Quantum Chemistry with Applications in Spectroscopy, LibreTexts.',
    url: "https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps/Quantum_Chemistry_with_Applications_in_Spectroscopy_(Fleming)/01%3A_Foundations_and_Review/1.04%3A_Failures_of_Classical_Physics",
  },
  physicsOfUniverseDates: {
    shortTitle: "Physics of the Universe: Dates",
    title: "Important Dates and Discoveries",
    organization: "The Physics of the Universe",
    citation: '"Important Dates and Discoveries," The Physics of the Universe.',
    url: "https://www.physicsoftheuniverse.com/dates.html",
  },
  sepNewtonPrincipia: {
    shortTitle: "SEP: Newton's Principia",
    title: "Newton’s Principia",
    organization: "Stanford Encyclopedia of Philosophy",
    citation:
      'Smith, G. E. (2023), "Newton’s Principia," SEP. https://plato.stanford.edu/entries/newton-principia/',
    url: "https://plato.stanford.edu/entries/newton-principia/",
  },
  timelineOfFundamentalPhysicsDiscoveriesWikipedia: {
    shortTitle: "Wikipedia: physics discoveries timeline",
    title: "Timeline of fundamental physics discoveries",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Timeline of fundamental physics discoveries." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Timeline_of_fundamental_physics_discoveries",
  },
} as const satisfies Record<string, EraSource>;
