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

const met = { title: "The Phoenicians (1500–300 BCE)", organization: "The Metropolitan Museum of Art", url: "https://www.metmuseum.org/essays/the-phoenicians-1500-300-b-c" };
const tyre = { title: "Tyre", organization: "World History Encyclopedia", url: "https://www.worldhistory.org/Tyre/" };

export const PHOENICIA_EXPERIENCE: GuidedExperience = {
  id: "phoenicia",
  title: "Phoenicia",
  description: "Coastal cities, Mediterranean trade, and life under larger empires.",
  eraId: "human-history-root",
  subjectIds: ["phoenicia", "carthage"],
  contextIds: ["ancient-egypt", "assyria", "babylonia", "achaemenid-persia"],
  stops: [
    {
      id: "coastal-cities", title: "Independent coastal cities", dateLabel: "c. 1100 BCE", year: -1100,
      region: "Levantine coast", range: [-1280, -900], focusBandId: "phoenicia",
      description: "Tyre, Sidon, Byblos, and Arwad developed as independent city-states. As Egyptian influence declined after about 1200 BCE, their ports continued trading across the eastern Mediterranean.",
      sources: [met],
    },
    {
      id: "writing-and-trade", title: "Writing and trade", dateLabel: "Early first millennium BCE", year: -1000,
      region: "Levant and eastern Mediterranean", range: [-1190, -810], focusBandId: "phoenicia",
      description: "Phoenician merchants traded timber, textiles, metalwork, and purple dye. Their alphabet used consonant signs; its later adaptation by Greek speakers helped shape the alphabets used around the Mediterranean.",
      sources: [met],
    },
    {
      id: "carthage", title: "The founding of Carthage", dateLabel: "814 BCE · traditional foundation date", year: -814,
      region: "Gulf of Tunis, North Africa", range: [-1020, -610], focusBandId: "carthage",
      description: "Settlers linked to Tyre founded Carthage on the North African coast. It became an important western center in a wider network of Phoenician settlements and trading ports.",
      sources: [met, { title: "Archaeological Site of Carthage", organization: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/37" }],
    },
    {
      id: "assyrian-pressure", title: "Assyrian rule", dateLabel: "c. 700 BCE", year: -700,
      region: "Phoenicia and Assyria", range: [-900, -500], focusBandId: "phoenicia",
      description: "Assyrian expansion brought tribute demands and military pressure to the coastal cities. Tyre paid tribute to Assyrian kings; its island defenses helped it withstand sieges.",
      sources: [tyre, { title: "Assyria, 1365–609 BCE", organization: "The Metropolitan Museum of Art", url: "https://www.metmuseum.org/essays/assyria-1365-609-b-c" }],
    },
    {
      id: "persian-rule", title: "Within the Persian Empire", dateLabel: "539 BCE onward", year: -539,
      region: "Phoenicia and the Achaemenid Empire", range: [-730, -350], focusBandId: "phoenicia",
      description: "After Babylon fell to Cyrus, the Phoenician cities came under Persian rule. Tyre continued as a trading center, and Phoenician ships and crews became important to the empire's naval forces.",
      sources: [tyre],
    },
    {
      id: "tyre-332", title: "Alexander captures Tyre", dateLabel: "332 BCE", year: -332,
      region: "Tyre, present-day Lebanon", range: [-570, -190], focusBandId: "phoenicia",
      description: "Alexander captured the island city after a prolonged siege using a causeway and a naval blockade. Many inhabitants were killed or enslaved. Phoenician language and religious traditions continued under Hellenistic rule.",
      sources: [{ title: "Alexander's Siege of Tyre, 332 BCE", organization: "World History Encyclopedia", url: "https://www.worldhistory.org/article/107/alexanders-siege-of-tyre-332-bce/" }, met],
    },
  ],
};

export const GUIDED_EXPERIENCES: readonly GuidedExperience[] = [PHOENICIA_EXPERIENCE];

export function resolveStopIndex(experience: GuidedExperience, index: number) {
  return Math.max(0, Math.min(experience.stops.length - 1, Number.isFinite(index) ? Math.trunc(index) : 0));
}
