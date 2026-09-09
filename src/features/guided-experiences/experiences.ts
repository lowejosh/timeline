export type ExperienceSource = { title: string; organization: string; url: string };
export type ExperienceStop = {
  id: string;
  title: string;
  dateLabel: string;
  year: number;
  region: string;
  description: string;
  range: readonly [number, number];
  sources: readonly ExperienceSource[];
  focusBandId?: string;
};
export type GuidedExperience = {
  id: string;
  title: string;
  description: string;
  eraId: string;
  subjectIds: readonly string[];
  contextIds: readonly string[];
  stops: readonly ExperienceStop[];
};

const met = { title: "The Phoenicians (1500-300 BCE)", organization: "The Metropolitan Museum of Art", url: "https://www.metmuseum.org/essays/the-phoenicians-1500-300-b-c" };
const byblos = { title: "Byblos", organization: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/295/" };
const alphabet = { title: "Alphabet Origins: From Kipling to Sinai", organization: "The Metropolitan Museum of Art", url: "https://www.metmuseum.org/exhibitions/listings/2014/assyria-to-iberia/blog/posts/alphabet" };
const tribute = { title: "Balawat gate band: tribute from Tyre and Sidon", organization: "British Museum", url: "https://www.britishmuseum.org/collection/object/W_Rm-1041" };
const carthage = { title: "Archaeological Site of Carthage", organization: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/37/" };
const tyre = { title: "Tyre", organization: "World History Encyclopedia", url: "https://www.worldhistory.org/Tyre/" };
const sidon = { title: "Sidon under Persian rule", organization: "Livius", url: "https://www.livius.org/articles/place/sidon/sidon-2/" };
const mariners = { title: "The Phoenicians: Master Mariners", organization: "World History Encyclopedia", url: "https://www.worldhistory.org/article/897/the-phoenicians---master-mariners/" };
const siege = { title: "Alexander's Siege of Tyre, 332 BCE", organization: "World History Encyclopedia", url: "https://www.worldhistory.org/article/107/alexanders-siege-of-tyre-332-bce/" };
const wars = { title: "Punic Wars", organization: "World History Encyclopedia", url: "https://www.worldhistory.org/Punic_Wars/" };

export const PHOENICIA_EXPERIENCE: GuidedExperience = {
  id: "phoenicia",
  title: "Phoenicia",
  description: "Coastal origins, overseas trade, imperial rule, and the fall of Carthage.",
  eraId: "human-history-root",
  subjectIds: ["phoenicia", "carthage"],
  contextIds: ["ancient-egypt", "assyria", "babylonia", "achaemenid-persia", "roman-republic"],
  stops: [
    {
      id: "bronze-age-ports", title: "The coastal origins", dateLabel: "c. 1500 BCE", year: -1500,
      region: "Byblos, Sidon, Tyre, and Arwad / Levantine coast", range: [-1950, -1050], focusBandId: "phoenicia",
      description: "Phoenician society developed from the coastal communities of the Bronze Age Levant. Byblos already had a long history of settlement and exchange with Egypt. These ports connected the Mediterranean with inland markets; the Phoenician cities of the Iron Age inherited their trading networks and local traditions.",
      sources: [byblos, met],
    },
    {
      id: "coastal-cities", title: "Cities after the Bronze Age", dateLabel: "c. 1200 BCE", year: -1200,
      region: "Levantine coast", range: [-1500, -900], focusBandId: "phoenicia",
      description: "Egyptian authority weakened as the eastern Mediterranean underwent widespread disruption. Coastal cities retained important elements of their earlier culture and developed greater independence. Tyre, Sidon, Byblos, and Arwad had separate rulers and competing interests. Phoenicia is the collective name used for these communities.",
      sources: [met],
    },
    {
      id: "alphabet", title: "An alphabet in circulation", dateLabel: "c. 1050 BCE / early alphabetic tradition", year: -1050,
      region: "Byblos and the Levant", range: [-1300, -800], focusBandId: "phoenicia",
      description: "Phoenician writing developed from earlier alphabetic scripts. Its letters represented consonants and were written from right to left. Inscriptions preserve names, dedications, and royal claims. The script later spread across Mediterranean communities; Greek writers adapted it, assigning some signs to vowels. This chapter marks a period of development rather than a single invention date.",
      sources: [alphabet, byblos],
    },
    {
      id: "workshops", title: "Timber, textiles, and workshops", dateLabel: "c. 1000 BCE", year: -1000,
      region: "Lebanese coast and eastern Mediterranean", range: [-1250, -750], focusBandId: "phoenicia",
      description: "Coastal exports included cedar, dyed textiles, carved ivory, and metalwork. Purple dye was extracted from marine shellfish. Craftspeople combined Egyptian and other regional designs for different customers. Trade depended on both local resources and the ability to manufacture goods for overseas markets.",
      sources: [met],
    },
    {
      id: "tribute", title: "Tribute to Assyria", dateLabel: "Ninth century BCE", year: -850,
      region: "Tyre, Sidon, and Assyria", range: [-1050, -650], focusBandId: "phoenicia",
      description: "Assyrian kings demanded wealth from the coastal cities. A bronze band from Shalmaneser III's gates at Balawat depicts tribute from Tyre and Sidon. It records how the Assyrian court presented this relationship: coastal wealth delivered to the king. Such royal monuments document imperial claims as well as historical encounters.",
      sources: [tribute],
    },
    {
      id: "carthage", title: "A Tyrian settlement at Carthage", dateLabel: "814 BCE / traditional foundation date", year: -814,
      region: "Gulf of Tunis / present-day Tunisia", range: [-1014, -614], focusBandId: "carthage",
      description: "Carthage was founded by Phoenician settlers linked to Tyre in the ninth century BCE. The traditional date is 814 BCE; the story of its founder Dido belongs to later literary tradition. Its position on the Gulf of Tunis gave the settlement access to Mediterranean shipping routes and the North African mainland.",
      sources: [carthage, met],
    },
    {
      id: "western-routes", title: "Ports across the Mediterranean", dateLabel: "c. 750 BCE", year: -750,
      region: "Cyprus, North Africa, Sardinia, and Iberia", range: [-1000, -500], focusBandId: "phoenicia",
      description: "Phoenician voyages connected a network of ports and settlements extending into the western Mediterranean. Ships carried cargo between regional markets, stopping to trade and resupply. Winds, sailing seasons, and suitable harbours shaped the routes. Overseas communities developed through sustained contact with local populations.",
      sources: [mariners],
    },
    {
      id: "western-power", title: "Carthage becomes a regional power", dateLabel: "Sixth century BCE", year: -600,
      region: "North Africa and western Mediterranean", range: [-850, -350], focusBandId: "carthage",
      description: "From the sixth century BCE, Carthage developed into a major trading and political power in the western Mediterranean. Its history increasingly followed a separate course from the Levantine cities. The term Punic is used for the Phoenician-derived culture of Carthage and related western communities.",
      sources: [carthage, wars],
    },
    {
      id: "babylonian-siege", title: "Babylon besieges Tyre", dateLabel: "Early sixth century BCE", year: -580,
      region: "Tyre / present-day Lebanon", range: [-730, -430], focusBandId: "phoenicia",
      description: "Nebuchadnezzar II subjected Tyre to a siege traditionally reported as lasting thirteen years. Its island position protected the fortified city, while the prolonged pressure disrupted commerce. Babylonian expansion followed the collapse of Assyrian power. Surviving accounts leave uncertainties about the siege's chronology and final settlement.",
      sources: [tyre],
    },
    {
      id: "persian-rule", title: "Cities within the Persian Empire", dateLabel: "539 BCE onward", year: -539,
      region: "Phoenicia and the Achaemenid Empire", range: [-719, -359], focusBandId: "phoenicia",
      description: "Cyrus's conquest of Babylon brought its western territories under Persian authority. The Phoenician cities accepted Persian rule, and Sidon remained an administrative centre. Local institutions continued within the imperial system. Their ports and naval resources made the coastal cities valuable to Persian rulers.",
      sources: [sidon, tyre],
    },
    {
      id: "persian-fleet", title: "Phoenician crews in Persian service", dateLabel: "480 BCE", year: -480,
      region: "Phoenician ports and the Aegean", range: [-640, -320], focusBandId: "phoenicia",
      description: "Phoenician ships served in Xerxes's expedition against Greece. Sidonian crews feature prominently in Herodotus's account. Naval service connected local kings and sailors to Persian military campaigns far from their home ports; the same maritime resources supported commerce and imperial warfare.",
      sources: [sidon],
    },
    {
      id: "tyre-332", title: "Alexander captures Tyre", dateLabel: "332 BCE", year: -332,
      region: "Tyre / present-day Lebanon", range: [-482, -182], focusBandId: "phoenicia",
      description: "Byblos and Sidon submitted to Alexander, while Tyre resisted. His forces built a causeway towards the island and used ships to blockade its harbours. After seven months, they breached the defences. Many inhabitants were killed or enslaved. The conquest ends the Phoenicia band here; settlement and cultural traditions continued.",
      sources: [siege],
    },
    {
      id: "hellenistic-cities", title: "The coast under Alexander's successors", dateLabel: "c. 300 BCE", year: -300,
      region: "Levantine coast", range: [-500, -100], focusBandId: "phoenicia",
      description: "After Alexander's death, the coastal cities became possessions contested by his successors. Tyre was rebuilt and continued as a port. Ptolemaic and later Seleucid rule placed Phoenician communities within Hellenistic kingdoms. Political control changed repeatedly while urban life continued on the coast.",
      sources: [tyre],
    },
    {
      id: "sicily", title: "Carthage loses Sicily", dateLabel: "241 BCE", year: -241,
      region: "Sicily and North Africa", range: [-391, -91], focusBandId: "carthage",
      description: "The First Punic War began in 264 BCE over competing interests in Sicily. After years of fighting on land and at sea, Carthage accepted defeat, withdrew from the island, and agreed to pay Rome an indemnity. Rome gained its first overseas province, altering the balance of power in the western Mediterranean.",
      sources: [wars],
    },
    {
      id: "hannibal", title: "The settlement after Hannibal's war", dateLabel: "201 BCE", year: -201,
      region: "Italy, Iberia, and North Africa", range: [-321, -81], focusBandId: "carthage",
      description: "During the Second Punic War, Hannibal invaded Italy and defeated Roman armies, but failed to secure Rome's surrender. Scipio's campaign in Africa brought him home; defeat at Zama in 202 BCE was followed by peace. Carthage lost its overseas possessions and faced severe restrictions on its military independence.",
      sources: [wars],
    },
    {
      id: "carthage-146", title: "Rome destroys Carthage", dateLabel: "146 BCE", year: -146,
      region: "Carthage / present-day Tunisia", range: [-266, -26], focusBandId: "carthage",
      description: "The Third Punic War ended with the Roman capture and destruction of Carthage. Its fall removed the independent Carthaginian state. A Roman city was later established on the site, adding another period of settlement to the archaeological remains. This is the endpoint of the Carthage band.",
      sources: [carthage, wars],
    },
    {
      id: "roman-coast", title: "The Levantine cities under Rome", dateLabel: "64 BCE", year: -64,
      region: "Phoenician coast and Roman Syria", range: [-424, 296], focusBandId: "phoenicia",
      description: "Roman expansion incorporated the Phoenician coast into its eastern sphere. Tyre continued as a commercial city under Roman rule. The conquests of Tyre and Carthage mark different political endings in this guide. The region's older communities and traditions continued within the societies that followed.",
      sources: [tyre, carthage],
    },
  ],
};

export const GUIDED_EXPERIENCES: readonly GuidedExperience[] = [PHOENICIA_EXPERIENCE];

export function resolveStopIndex(experience: GuidedExperience, index: number) {
  return Math.max(0, Math.min(experience.stops.length - 1, Number.isFinite(index) ? Math.trunc(index) : 0));
}
