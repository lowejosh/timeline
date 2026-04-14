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
    citation:
      "NASA, \"Universe: Cosmic History,\" Science Mission Directorate.",
    url: "https://science.nasa.gov/universe/overview/",
    notes:
      "Used for the age of the universe and the app's broad cosmic-history framing.",
  },
  nasaStarBasics: {
    shortTitle: "NASA: Star Basics",
    title: "Star Basics",
    organization: "NASA",
    citation: "NASA, \"Star Basics,\" Science Mission Directorate.",
    url: "https://science.nasa.gov/universe/stars/",
    notes:
      "Used for broad context on how stars form from dense clouds of gas and dust.",
  },
  nasaGalaxyBasics: {
    shortTitle: "NASA: Galaxy Basics",
    title: "Galaxy Basics",
    organization: "NASA",
    citation: "NASA, \"Galaxy Basics,\" Science Mission Directorate.",
    url: "https://science.nasa.gov/universe/galaxies/",
    notes:
      "Used for broad context on galaxy evolution and the Milky Way's place in cosmic history.",
  },
  nasaSolarSystemFacts: {
    shortTitle: "NASA: Solar System Facts",
    title: "Solar System Facts",
    organization: "NASA",
    citation:
      "NASA, \"Solar System Facts,\" Science Mission Directorate.",
    url: "https://science.nasa.gov/solar-system/solar-system-facts/",
    notes:
      "Used for the solar system's formation about 4.6 billion years ago.",
  },
  icsChart2024: {
    shortTitle: "ICS Chart v2024/12",
    title: "International Chronostratigraphic Chart v2024/12",
    organization: "International Commission on Stratigraphy",
    citation:
      "Cohen, K. M., Finney, S. C., Gibbard, P. L., Fan, J.-X. (2025). \"The ICS international chronostratigraphic chart this decade.\" Episodes. DOI: 10.18814/epiiugs/2025/025001.",
    url: "https://stratigraphy.org/chart",
    notes:
      "Used for formal deep-time boundaries. Some app bands are intentionally truncated where the timeline hands off to human-history periods.",
  },
  smithsonianHumanOrigins: {
    shortTitle: "Smithsonian Human Origins",
    title: "Interactive Human Origins Timeline",
    organization: "Smithsonian Institution Human Origins Program",
    citation:
      "Smithsonian Institution, Human Origins Program, \"Interactive Human Origins Timeline.\"",
    url: "https://humanorigins.si.edu/evidence/human-evolution-interactive-timeline",
    notes:
      "Used for the emergence of Homo sapiens and broad human-prehistory context.",
  },
  khanPaleolithicCulture: {
    shortTitle: "Khan: Paleolithic culture",
    title: "Paleolithic technology, culture, and art",
    organization: "Khan Academy",
    citation:
      "Khan Academy, \"Paleolithic technology, culture, and art.\"",
    url: "https://www.khanacademy.org/humanities/world-history/world-history-beginnings/origin-humans-early-societies/a/paleolithic-culture-and-technology",
    notes:
      "Used for standard Stone Age terminology and the broad Paleolithic-to-Neolithic sequence.",
  },
  khanNeolithicRevolution: {
    shortTitle: "Khan: Neolithic Revolution",
    title: "The Neolithic Revolution",
    organization: "Khan Academy / Smarthistory",
    citation: "Khan Academy, \"The Neolithic Revolution.\"",
    url: "https://www.khanacademy.org/humanities/world-history/world-history-beginnings/origin-humans-early-societies/a/the-neolithic-revolution",
    notes:
      "Used for Near Eastern Neolithic examples such as Pre-Pottery Neolithic B at Jericho.",
  },
  britannicaBronzeAge: {
    shortTitle: "Britannica: Bronze Age",
    title: "Bronze Age",
    organization: "Encyclopaedia Britannica",
    citation: "Encyclopaedia Britannica, \"Bronze Age.\"",
    url: "https://www.britannica.com/topic/Bronze-Age",
    notes:
      "Used for the standard Bronze Age to Iron Age sequence and the regional caveat that dates vary, including across the Middle East.",
  },
  britannicaMiddleEast: {
    shortTitle: "Britannica: Middle East",
    title: "Middle East",
    organization: "Encyclopaedia Britannica",
    citation: "Encyclopaedia Britannica, \"Middle East.\"",
    url: "https://www.britannica.com/place/Middle-East",
    notes:
      "Used for ancient Middle East framing, including Bronze Age and Iron Age influence in the Levant and Mesopotamia.",
  },
  britannicaMesopotamia: {
    shortTitle: "Britannica: Mesopotamia",
    title: "history of Mesopotamia",
    organization: "Encyclopaedia Britannica",
    citation: "Encyclopaedia Britannica, \"history of Mesopotamia.\"",
    url: "https://www.britannica.com/place/Mesopotamia-historical-region-Asia",
    notes:
      "Used for the late 4th-millennium BCE emergence of writing and early urban civilization in Mesopotamia.",
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
      "Stearns, Peter N. (2017). \"Periodization in World History: Challenges and Opportunities.\" In 21st-Century Narratives of World History: Global and Multidisciplinary Perspectives. Palgrave Macmillan.",
    notes:
      "Used for world-history macroperiod labels such as ancient, post-classical, early modern, and contemporary.",
  },
  bentleyEarlyModern: {
    shortTitle: "Bentley on early modern",
    title: "Early Modern Europe and the Early Modern World",
    organization: "Rowman & Littlefield / world-history scholarship",
    citation:
      "Bentley, Jerry H. (2007). \"Early Modern Europe and the Early Modern World.\" In Between the Middle Ages and Modernity: Individual and Community in the Early Modern World. Rowman & Littlefield.",
    notes:
      "Supports the app's c. 1500–1800 early-modern framing.",
  },
  brivatiContemporary: {
    shortTitle: "Brivati on contemporary history",
    title: "The Contemporary History Handbook",
    organization: "Manchester University Press",
    citation:
      "Brivati, Brian (1996). \"Introduction.\" In The Contemporary History Handbook. Manchester University Press.",
    notes:
      "Supports contemporary history as c. 1945–present in English-language historiography.",
  },
} as const satisfies Record<string, EraSource>;

export type EraSourceId = keyof typeof ERA_SOURCES;