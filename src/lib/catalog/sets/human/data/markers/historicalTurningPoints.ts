import type { TimelineMarker } from "@/lib/core/timelineTypes";
import {
  createExactCalendarTimestamp,
  getTimelineYearFromExactTimestamp,
} from "@/lib/core/exactTimestamp";
import { bce, ce } from "@/lib/core/timelineDateBuilders";

const TITANIC_SINKS_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1912,
  month: 4,
  day: 15,
  hour: 2,
  minute: 20,
  precision: "minute",
});

const UN_DECOLONIZATION_DECLARATION_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1960,
  month: 12,
  day: 14,
  precision: "day",
});

const BERLIN_WALL_FALLS_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1989,
  month: 11,
  day: 9,
  precision: "day",
});

const SOVIET_UNION_DISSOLVES_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1991,
  month: 12,
  day: 31,
  precision: "day",
});

const IPHONE_INTRODUCED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2007,
  month: 1,
  day: 9,
  precision: "day",
});

const HIGGS_BOSON_ANNOUNCED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2012,
  month: 7,
  day: 4,
  precision: "day",
});

const CHATGPT_INTRODUCED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2022,
  month: 11,
  day: 30,
  precision: "day",
});

const WORLD_WIDE_WEB_OPENED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1993,
  month: 4,
  day: 30,
  precision: "day",
});

const COVID_19_PANDEMIC_DECLARED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2020,
  month: 3,
  day: 11,
  precision: "day",
});

const UNITED_NATIONS_FOUNDED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1945,
  month: 10,
  day: 24,
  precision: "day",
});

const UDHR_PROCLAIMED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1948,
  month: 12,
  day: 10,
  precision: "day",
});

const NATO_FOUNDED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1949,
  month: 4,
  day: 4,
  precision: "day",
});

const FIRST_TELEGRAPH_MESSAGE_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1844,
  month: 5,
  day: 24,
  precision: "day",
});

const FIRST_AUTOMOBILE_PATENT_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1886,
  month: 1,
  day: 29,
  precision: "day",
});

const FIRST_POWERED_FLIGHT_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1903,
  month: 12,
  day: 17,
  precision: "day",
});

const FIRST_HUMAN_IN_SPACE_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1961,
  month: 4,
  day: 12,
  precision: "day",
});

const CUBAN_MISSILE_CRISIS_RESOLVED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1962,
  month: 10,
  day: 28,
  precision: "day",
});

const IRANIAN_REVOLUTION_TOPPLES_MONARCHY_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1979,
  month: 2,
  day: 11,
  precision: "day",
});

const CHERNOBYL_DISASTER_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1986,
  month: 4,
  day: 26,
  precision: "day",
});

const SEPTEMBER_11_ATTACKS_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2001,
  month: 9,
  day: 11,
  precision: "day",
});

const LEHMAN_BROTHERS_BANKRUPTCY_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2008,
  month: 9,
  day: 15,
  precision: "day",
});

const PARIS_AGREEMENT_ADOPTED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2015,
  month: 12,
  day: 12,
  precision: "day",
});

export const HISTORICAL_TURNING_POINT_MARKERS: TimelineMarker[] = [
  {
    id: "agriculture-emerges-in-southwest-asia",
    label: "Agriculture emerges in Southwest Asia",
    shortLabel: "Early Agriculture",
    description:
      "Southwest Asian communities had entered a long agricultural transition, with cultivation preceding the appearance of fully domesticated crops.",
    year: bce(10_000),
    regionalScopeLabel: "Southwest Asia",
    approximate: true,
    minZoom: 19,
    priority: 81,
    sourceIds: [
      "originsOfAgricultureInWestAsiaWikipedia",
      "prePotteryNeolithicAWikipedia",
    ],
  },
  {
    id: "jericho-ritual-community",
    label: "Jericho ritual community",
    shortLabel: "Jericho",
    description:
      "Jericho's plastered skulls and settled life show a Neolithic community combining village life with elaborate ritual practices.",
    year: bce(7_200),
    regionalScopeLabel: "Levant",
    approximate: true,
    minZoom: 19,
    priority: 67,
    sourceIds: ["khanNeolithicRevolution"],
  },
  {
    id: "stonehenge-begins",
    label: "Stonehenge construction begins",
    shortLabel: "Stonehenge",
    description:
      "Stonehenge began within a vast ceremonial landscape whose earthworks and stone settings were built over many centuries.",
    year: bce(3_700),
    regionalScopeLabel: "Southern Britain",
    approximate: true,
    minZoom: 19,
    priority: 66,
    sourceIds: ["unescoStonehenge", "khanNeolithicRevolution"],
  },
  {
    id: "bronze-age-collapse",
    label: "Bronze Age collapse",
    shortLabel: "Bronze Age Collapse",
    description:
      "A wave of destruction and disruption brought down major palace societies across the eastern Mediterranean at the end of the Bronze Age.",
    year: bce(1_200),
    regionalScopeLabel: "Eastern Mediterranean",
    approximate: true,
    minZoom: 18,
    priority: 78,
    sourceIds: ["britannicaBronzeAge", "britannicaAncientGreece"],
  },
  {
    id: "augustus-becomes-emperor",
    label: "Augustus becomes first emperor",
    shortLabel: "Augustus becomes emperor",
    description:
      "Octavian took the title Augustus, marking the start of imperial rule and the Roman Empire under its first emperor.",
    year: bce(27),
    minZoom: 18,
    priority: 83,
    sourceIds: ["historyAncientRome", "khanRomanEmpire"],
  },
  {
    id: "fall-of-western-rome",
    label: "Fall of Western Rome",
    shortLabel: "Western Rome Falls",
    description:
      "The deposition of Romulus Augustulus in 476 CE became the conventional endpoint of the western Roman Empire.",
    year: ce(476),
    minZoom: 18,
    priority: 81,
    sourceIds: ["historyAncientRome"],
  },
  {
    id: "hijra",
    label: "Muhammad's migration to Medina",
    shortLabel: "Migration to Medina",
    description:
      "Muhammad's migration from Mecca to Medina, the Hijra, became the founding event of the Islamic calendar.",
    year: ce(622),
    minZoom: 18,
    priority: 82,
    sourceIds: ["historyIslam"],
  },
  {
    id: "charlemagne-crowned-emperor",
    label: "Charlemagne crowned Holy Roman Emperor",
    shortLabel: "Holy Roman Emperor",
    description:
      "On Christmas Day 800, Pope Leo III crowned Charlemagne emperor, binding Frankish power more closely to Latin Christendom.",
    year: ce(800),
    minZoom: 18,
    priority: 81,
    sourceIds: ["historyCharlemagne"],
  },
  {
    id: "genghis-khan-proclaimed",
    label: "Genghis Khan proclaimed ruler",
    shortLabel: "Mongol Empire Begins",
    description:
      "After uniting the Mongol tribes, Temujin was proclaimed Genghis Khan, launching the empire that would span much of Eurasia.",
    year: ce(1206),
    minZoom: 18,
    priority: 83,
    sourceIds: ["historyGenghisKhan"],
  },
  {
    id: "black-death",
    label: "Black Death reaches Europe",
    shortLabel: "Black Death",
    description:
      "Plague-bearing ships brought the Black Death to Europe, beginning a catastrophe that killed more than 20 million people there.",
    year: ce(1347),
    minZoom: 18,
    priority: 80,
    sourceIds: ["historyBlackDeath"],
  },
  {
    id: "fall-of-constantinople",
    label: "Fall of Constantinople",
    shortLabel: "Constantinople",
    description:
      "Ottoman forces captured Constantinople, ending the Byzantine Empire and remaking the balance of power in the eastern Mediterranean.",
    year: ce(1453),
    minZoom: 18,
    priority: 82,
    sourceIds: ["historyByzantineEmpire"],
  },
  {
    id: "gutenberg-press",
    label: "Gutenberg press",
    shortLabel: "Printing Press",
    description:
      "Gutenberg's movable-type press made large-scale book production far faster and transformed the spread of ideas in Europe.",
    year: ce(1450),
    minZoom: 20,
    priority: 72,
    sourceIds: ["historyPrintingPress"],
  },
  {
    id: "columbian-exchange-begins",
    label: "Columbian Exchange begins",
    shortLabel: "Columbian Exchange",
    description:
      "Columbus's 1492 Atlantic voyage opened sustained exchange of plants, animals, diseases, and people between the Americas and Afro-Eurasia.",
    year: ce(1492),
    minZoom: 18,
    priority: 84,
    sourceIds: ["historyChristopherColumbus"],
  },
  {
    id: "protestant-reformation",
    label: "Protestant Reformation",
    shortLabel: "Reformation",
    description:
      "Luther's 95 Theses challenged indulgences and helped ignite the Protestant Reformation across Europe.",
    year: ce(1517),
    minZoom: 18,
    priority: 85,
    sourceIds: ["historyReformation"],
  },
  {
    id: "fall-of-tenochtitlan",
    label: "Tenochtitlan falls to Spanish conquest",
    shortLabel: "Tenochtitlan Falls",
    description:
      "Spanish and Indigenous allied forces captured Tenochtitlan, breaking Aztec imperial power and transforming the future of Mesoamerica.",
    year: ce(1521),
    regionalScopeLabel: "Mesoamerica",
    minZoom: 18,
    priority: 82,
    sourceIds: ["historyAztecs"],
  },
  {
    id: "magellan-expedition-circumnavigates-globe",
    label: "Magellan expedition completes circumnavigation",
    shortLabel: "First Circumnavigation",
    description:
      "The Victoria returned to Spain after Magellan's expedition, completing the first circumnavigation and proving the world's oceans were globally connected.",
    year: ce(1522),
    minZoom: 18,
    priority: 80,
    sourceIds: ["historyFerdinandMagellan"],
  },
  {
    id: "jamestown-founded",
    label: "Jamestown founded",
    shortLabel: "Jamestown Founded",
    description:
      "Jamestown became the first permanent English settlement in North America, giving England a durable foothold in Atlantic colonization.",
    year: ce(1607),
    regionalScopeLabel: "British North America",
    minZoom: 18,
    priority: 79,
    sourceIds: ["historyJamestown"],
  },
  {
    id: "thirty-years-war-begins",
    label: "Thirty Years' War begins",
    shortLabel: "Thirty Years' War",
    description:
      "Open revolt in Bohemia began a brutal continental conflict that drew in dynasties, states, and rival confessions across Europe.",
    year: ce(1618),
    regionalScopeLabel: "Central Europe",
    minZoom: 18,
    priority: 82,
    sourceIds: ["historyThirtyYearsWar"],
  },
  {
    id: "english-civil-wars-begin",
    label: "English Civil Wars begin",
    shortLabel: "English Civil Wars",
    description:
      "Armies loyal to King Charles I and Parliament went to war over religion, taxation, and sovereignty across the three kingdoms.",
    year: ce(1642),
    regionalScopeLabel: "British Isles",
    minZoom: 18,
    priority: 80,
    sourceIds: ["historyEnglishCivilWars"],
  },
  {
    id: "peace-of-westphalia",
    label: "Peace of Westphalia ends Thirty Years' War",
    shortLabel: "Peace of Westphalia",
    description:
      "A series of treaties ended the Thirty Years' War and helped reset the balance of power among European states.",
    year: ce(1648),
    regionalScopeLabel: "Europe",
    minZoom: 18,
    priority: 81,
    sourceIds: ["historyThirtyYearsWar"],
  },
  {
    id: "siege-of-vienna-broken",
    label: "Siege of Vienna broken",
    shortLabel: "Siege of Vienna",
    description:
      "A relief army led by John III Sobieski broke the Ottoman siege of Vienna, a turning point that checked Ottoman power in central Europe.",
    year: ce(1683),
    regionalScopeLabel: "Central Europe",
    minZoom: 18,
    priority: 80,
    sourceIds: ["britannicaSiegeOfVienna"],
  },
  {
    id: "encyclopedie-begins-publication",
    label: "Encyclopédie begins publication",
    shortLabel: "Encyclopédie",
    description:
      "Diderot's Encyclopédie began publication, gathering science, crafts, and criticism into one of the Enlightenment's signature works.",
    year: ce(1751),
    regionalScopeLabel: "France",
    minZoom: 18,
    priority: 79,
    sourceIds: ["britannicaEncyclopedie"],
  },
  {
    id: "american-independence-declared",
    label: "American independence declared",
    shortLabel: "American Independence",
    description:
      "The Continental Congress declared the colonies free and independent states, giving the American Revolution its defining political statement.",
    year: ce(1776),
    minZoom: 20,
    priority: 75,
    sourceIds: ["historyAmericanRevolution"],
  },
  {
    id: "french-revolution",
    label: "French Revolution begins",
    shortLabel: "French Revolution",
    description:
      "The French Revolution began as a revolt against monarchy and privilege, then reordered French politics in the name of liberty and citizenship.",
    year: ce(1789),
    minZoom: 18,
    priority: 86,
    sourceIds: ["historyFrenchRevolution"],
  },
  {
    id: "watt-steam-engine",
    label: "Watt steam engine improves industrial power",
    shortLabel: "Steam Engine",
    description:
      "James Watt's improvements made steam engines far more efficient, helping steam power spread through mills, mines, and transport.",
    year: ce(1760),
    approximate: true,
    minZoom: 20,
    priority: 78,
    sourceIds: ["historyIndustrialRevolution"],
  },
  {
    id: "steam-railway-opens",
    label: "Steam railway links industrial cities",
    shortLabel: "Steam Railway",
    description:
      "Steam locomotives began hauling freight and passengers between industrial cities, making rail transport a backbone of the industrial age.",
    year: ce(1830),
    minZoom: 20,
    priority: 79,
    sourceIds: ["historyIndustrialRevolution"],
  },
  {
    id: "first-telegraph-message",
    label: "First telegraph message sent",
    shortLabel: "Telegraph",
    description:
      "Morse's system sent its first public message, showing that electrical communication could move information across distance almost instantly.",
    year: getTimelineYearFromExactTimestamp(FIRST_TELEGRAPH_MESSAGE_AT),
    exactTime: FIRST_TELEGRAPH_MESSAGE_AT,
    dateLabel: "May 24, 1844",
    minZoom: 20,
    priority: 80,
    sourceIds: ["historyTelegraph"],
  },
  {
    id: "revolutions-of-1848",
    label: "Revolutions of 1848 spread across Europe",
    shortLabel: "Revolutions of 1848",
    description:
      "Republican uprisings against monarchy spread from Sicily to France, Germany, Italy, and the Austrian Empire, tying nationalism to liberal revolt across Europe.",
    year: ce(1848),
    regionalScopeLabel: "Europe",
    minZoom: 18,
    priority: 83,
    sourceIds: ["britannicaRevolutionsOf1848"],
  },
  {
    id: "kingdom-of-italy-established",
    label: "Kingdom of Italy established",
    shortLabel: "Italy Unifies",
    description:
      "The Risorgimento produced a new Kingdom of Italy under Piedmontese leadership, turning Italian nationalism from movement into state.",
    year: ce(1861),
    regionalScopeLabel: "Italy",
    minZoom: 18,
    priority: 82,
    sourceIds: ["britannicaRisorgimento"],
  },
  {
    id: "meiji-restoration",
    label: "Meiji Restoration begins",
    shortLabel: "Meiji Restoration",
    description:
      "The Tokugawa shogunate fell and imperial rule was restored, opening Japan's rapid program of state reform, modernization, and military strengthening.",
    year: ce(1868),
    regionalScopeLabel: "Japan",
    minZoom: 18,
    priority: 84,
    sourceIds: ["historyMeijiRestoration"],
  },
  {
    id: "german-empire-founded",
    label: "German Empire founded",
    shortLabel: "German Unification",
    description:
      "The German Empire was proclaimed under Prussian leadership, uniting the major German states in a new continental power.",
    year: ce(1871),
    regionalScopeLabel: "Germany",
    minZoom: 18,
    priority: 84,
    sourceIds: ["britannicaGermanEmpire"],
  },
  {
    id: "telephone-patented",
    label: "Telephone patented",
    shortLabel: "Telephone",
    description:
      "Bell's 1876 patent helped turn the telephone into a practical new way to carry human speech over distance.",
    year: ce(1876),
    minZoom: 20,
    priority: 80,
    sourceIds: ["britannicaTelephone"],
  },
  {
    id: "practical-light-bulb",
    label: "Practical incandescent light bulb",
    shortLabel: "Light Bulb",
    description:
      "Edison's team produced a longer-lasting carbon-filament bulb, helping electric light become practical for everyday use.",
    year: ce(1879),
    minZoom: 20,
    priority: 85,
    sourceIds: ["energyHistoryLightBulb"],
  },
  {
    id: "first-automobile-patent",
    label: "First automobile patent filed",
    shortLabel: "Automobile",
    description:
      "Carl Benz filed the patent for a gas-powered vehicle widely treated as the birth certificate of the automobile.",
    year: getTimelineYearFromExactTimestamp(FIRST_AUTOMOBILE_PATENT_AT),
    exactTime: FIRST_AUTOMOBILE_PATENT_AT,
    dateLabel: "Jan 29, 1886",
    minZoom: 20,
    priority: 81,
    sourceIds: ["mercedesFirstAutomobile"],
  },
  {
    id: "marconi-wireless-signals",
    label: "Marconi sends wireless signals",
    shortLabel: "Radio",
    description:
      "Marconi sent wireless signals over more than a mile, showing that messages could travel without wires.",
    year: ce(1895),
    minZoom: 20,
    priority: 80,
    sourceIds: ["nobelMarconiBiographical"],
  },
  {
    id: "wright-brothers-first-flight",
    label: "First powered airplane flight",
    shortLabel: "Powered Flight",
    description:
      "The Wright brothers made the first free, controlled flight of a power-driven, heavier-than-air airplane.",
    year: getTimelineYearFromExactTimestamp(FIRST_POWERED_FLIGHT_AT),
    exactTime: FIRST_POWERED_FLIGHT_AT,
    dateLabel: "Dec 17, 1903",
    minZoom: 20,
    priority: 82,
    sourceIds: ["historyWrightBrothers"],
  },
  {
    id: "berlin-conference-opens",
    label: "Berlin Conference opens",
    shortLabel: "Scramble for Africa",
    description:
      "European powers met in Berlin to reconcile rival claims in Africa and set rules that accelerated colonial partition across most of the continent.",
    year: ce(1884),
    regionalScopeLabel: "Africa",
    minZoom: 18,
    priority: 84,
    sourceIds: ["britannicaScrambleForAfrica"],
  },
  {
    id: "titanic-sinks",
    label: "Titanic sinks in North Atlantic",
    shortLabel: "Titanic Sinks",
    description:
      "Titanic struck an iceberg on its maiden voyage and sank in the North Atlantic, killing more than 1,500 people.",
    year: getTimelineYearFromExactTimestamp(TITANIC_SINKS_AT),
    exactTime: TITANIC_SINKS_AT,
    dateLabel: "Apr 15, 1912",
    minZoom: 20,
    priority: 77,
    sourceIds: ["britannicaTitanic"],
  },
  {
    id: "world-war-i",
    label: "World War I begins",
    shortLabel: "World War I",
    description:
      "The assassination of Archduke Franz Ferdinand helped trigger a general European war that grew into World War I.",
    year: ce(1914),
    minZoom: 18,
    priority: 88,
    sourceIds: ["historyWorldWarOne"],
  },
  {
    id: "russian-revolution",
    label: "Russian Revolution",
    shortLabel: "Russian Revolution",
    description:
      "Revolutions in 1917 toppled the Romanov dynasty and eventually brought the Bolsheviks to power.",
    year: ce(1917),
    minZoom: 18,
    priority: 87,
    sourceIds: ["historyRussianRevolution"],
  },
  {
    id: "great-depression-begins",
    label: "Great Depression begins",
    shortLabel: "Great Depression",
    description:
      "The 1929 stock market crash helped trigger the worst economic crisis in modern history, with worldwide unemployment, bank failures, and collapsing demand.",
    year: ce(1929),
    minZoom: 20,
    priority: 84,
    sourceIds: ["historyGreatDepression"],
  },
  {
    id: "world-war-ii",
    label: "World War II begins",
    shortLabel: "World War II",
    description:
      "Germany's invasion of Poland in 1939 began a global war of unprecedented scale and destruction.",
    year: ce(1939),
    minZoom: 18,
    priority: 90,
    sourceIds: ["historyWorldWarTwo"],
  },
  {
    id: "united-nations-founded",
    label: "United Nations founded",
    shortLabel: "United Nations Founded",
    description:
      "The United Nations officially began after the UN Charter had been ratified by China, France, the Soviet Union, the United Kingdom, the United States, and a majority of other signatories.",
    year: getTimelineYearFromExactTimestamp(UNITED_NATIONS_FOUNDED_AT),
    exactTime: UNITED_NATIONS_FOUNDED_AT,
    dateLabel: "Oct 24, 1945",
    minZoom: 20,
    priority: 83,
    sourceIds: ["unHistoryUnitedNations"],
  },
  {
    id: "udhr-proclaimed",
    label: "Universal Declaration of Human Rights proclaimed",
    shortLabel: "UDHR Proclaimed",
    description:
      "The UN General Assembly proclaimed the Universal Declaration of Human Rights as a common standard of achievement for all peoples and all nations.",
    year: getTimelineYearFromExactTimestamp(UDHR_PROCLAIMED_AT),
    exactTime: UDHR_PROCLAIMED_AT,
    dateLabel: "Dec 10, 1948",
    minZoom: 20,
    priority: 78,
    sourceIds: ["unUniversalDeclarationHumanRights"],
  },
  {
    id: "nato-founded",
    label: "NATO founded",
    shortLabel: "NATO",
    description:
      "Twelve countries signed the North Atlantic Treaty in Washington, D.C., establishing the alliance with collective defence at its heart.",
    year: getTimelineYearFromExactTimestamp(NATO_FOUNDED_AT),
    exactTime: NATO_FOUNDED_AT,
    dateLabel: "Apr 4, 1949",
    minZoom: 20,
    priority: 80,
    sourceIds: ["natoFoundingTreaty"],
  },
  {
    id: "un-decolonization-declaration",
    label: "UN decolonization declaration adopted",
    shortLabel: "UN Decolonization Declaration",
    description:
      "The General Assembly adopted its landmark declaration affirming self-determination and calling for colonialism to be brought to a speedy and unconditional end.",
    year: getTimelineYearFromExactTimestamp(UN_DECOLONIZATION_DECLARATION_AT),
    exactTime: UN_DECOLONIZATION_DECLARATION_AT,
    dateLabel: "Dec 14, 1960",
    minZoom: 20,
    priority: 79,
    sourceIds: ["unAntiColonialismDay", "unDecolonization"],
  },
  {
    id: "first-human-in-space",
    label: "First human orbits Earth",
    shortLabel: "First Human in Space",
    description:
      "Yuri Gagarin became the first human to travel into space and orbit Earth aboard Vostok 1.",
    year: getTimelineYearFromExactTimestamp(FIRST_HUMAN_IN_SPACE_AT),
    exactTime: FIRST_HUMAN_IN_SPACE_AT,
    dateLabel: "Apr 12, 1961",
    minZoom: 20,
    priority: 81,
    sourceIds: ["britannicaYuriGagarin"],
  },
  {
    id: "cuban-missile-crisis-resolved",
    label: "Cuban Missile Crisis de-escalates",
    shortLabel: "Cuban Missile Crisis",
    description:
      "Khrushchev publicly stated that Soviet missiles would be dismantled and removed from Cuba, ending the most dangerous U.S.-Soviet confrontation of the Cold War.",
    year: getTimelineYearFromExactTimestamp(CUBAN_MISSILE_CRISIS_RESOLVED_AT),
    exactTime: CUBAN_MISSILE_CRISIS_RESOLVED_AT,
    dateLabel: "Oct 28, 1962",
    minZoom: 20,
    priority: 82,
    sourceIds: ["historyStateCubanMissileCrisis"],
  },
  {
    id: "apollo-11-moon-landing",
    label: "Apollo 11 Moon landing",
    shortLabel: "Moon Landing",
    description:
      "Apollo 11 carried Neil Armstrong and Buzz Aldrin to the Moon, making them the first humans to land on another world.",
    year: ce(1969),
    minZoom: 20,
    priority: 83,
    sourceIds: ["historyMoonLanding"],
  },
  {
    id: "fall-of-saigon",
    label: "Fall of Saigon",
    shortLabel: "Saigon Falls",
    description:
      "South Vietnam collapsed as northern forces took Saigon, closing the long Vietnam War.",
    year: ce(1975),
    minZoom: 20,
    priority: 82,
    sourceIds: ["britannicaVietnamWar"],
  },
  {
    id: "iranian-revolution",
    label: "Iranian Revolution topples monarchy",
    shortLabel: "Iranian Revolution",
    description:
      "Iran's monarchy fell and Khomeini's movement opened the way to an Islamic republic.",
    year: getTimelineYearFromExactTimestamp(
      IRANIAN_REVOLUTION_TOPPLES_MONARCHY_AT,
    ),
    exactTime: IRANIAN_REVOLUTION_TOPPLES_MONARCHY_AT,
    dateLabel: "Feb 11, 1979",
    minZoom: 20,
    priority: 83,
    sourceIds: ["britannicaIranianRevolution"],
  },
  {
    id: "smallpox-eradicated",
    label: "Smallpox eradication declared",
    shortLabel: "Smallpox Eradicated",
    description:
      "The world officially declared smallpox eradicated, the first human disease eliminated worldwide.",
    year: ce(1980),
    minZoom: 20,
    priority: 81,
    sourceIds: ["whoSmallpoxEradication"],
  },
  {
    id: "chernobyl-disaster",
    label: "Chernobyl disaster",
    shortLabel: "Chernobyl",
    description:
      "A reactor explosion at Chernobyl spread radioactive contamination far beyond the plant itself.",
    year: getTimelineYearFromExactTimestamp(CHERNOBYL_DISASTER_AT),
    exactTime: CHERNOBYL_DISASTER_AT,
    dateLabel: "Apr 26, 1986",
    minZoom: 20,
    priority: 82,
    sourceIds: ["iaeaChernobylFaq"],
  },
  {
    id: "berlin-wall-falls",
    label: "Berlin Wall falls",
    shortLabel: "Berlin Wall Falls",
    description:
      "The East German government announced the opening of all East German borders, and the Wall's fall came to represent the end of the Cold War.",
    year: getTimelineYearFromExactTimestamp(BERLIN_WALL_FALLS_AT),
    exactTime: BERLIN_WALL_FALLS_AT,
    dateLabel: "Nov 9, 1989",
    minZoom: 20,
    priority: 83,
    sourceIds: ["historyStateFallCommunism"],
  },
  {
    id: "soviet-union-dissolves",
    label: "Soviet Union dissolves",
    shortLabel: "Soviet Union Dissolves",
    description:
      "The Soviet Union dissolved and was replaced by 15 independent countries.",
    year: getTimelineYearFromExactTimestamp(SOVIET_UNION_DISSOLVES_AT),
    exactTime: SOVIET_UNION_DISSOLVES_AT,
    dateLabel: "Dec 31, 1991",
    minZoom: 20,
    priority: 85,
    sourceIds: ["britannicaSovietCollapse"],
  },
  {
    id: "www-software-released",
    label: "WWW software released beyond CERN",
    shortLabel: "WWW Software Released",
    description:
      "Berners-Lee released WWW software, including the line-mode browser and server tools, helping the web spread beyond CERN.",
    year: ce(1991),
    approximate: true,
    minZoom: 20,
    priority: 80,
    sourceIds: ["cernShortHistoryWeb"],
  },
  {
    id: "world-wide-web-opened",
    label: "World Wide Web opened to the public",
    shortLabel: "Web Opens",
    description:
      "CERN put the World Wide Web software in the public domain, a move that allowed the web to flourish.",
    year: getTimelineYearFromExactTimestamp(WORLD_WIDE_WEB_OPENED_AT),
    exactTime: WORLD_WIDE_WEB_OPENED_AT,
    dateLabel: "Apr 30, 1993",
    minZoom: 20,
    priority: 81,
    sourceIds: ["cernBirthWeb"],
  },
  {
    id: "september-11-attacks",
    label: "September 11 attacks",
    shortLabel: "9/11 Attacks",
    description:
      "Al Qaeda terrorists hijacked four commercial passenger airplanes and carried out attacks on the World Trade Center, the Pentagon, and rural Pennsylvania.",
    year: getTimelineYearFromExactTimestamp(SEPTEMBER_11_ATTACKS_AT),
    exactTime: SEPTEMBER_11_ATTACKS_AT,
    dateLabel: "Sep 11, 2001",
    minZoom: 20,
    priority: 86,
    sourceIds: ["historySeptember11Attacks"],
  },
  {
    id: "iphone-introduced",
    label: "Apple introduces iPhone",
    shortLabel: "iPhone Introduced",
    description:
      "Apple unveiled the iPhone, combining a phone, iPod, and Internet communicator in one touchscreen device.",
    year: getTimelineYearFromExactTimestamp(IPHONE_INTRODUCED_AT),
    exactTime: IPHONE_INTRODUCED_AT,
    dateLabel: "Jan 9, 2007",
    minZoom: 20,
    priority: 82,
    sourceIds: ["appleIPhoneIntroduction"],
  },
  {
    id: "lehman-brothers-bankruptcy",
    label: "2008 financial crisis",
    shortLabel: "2008 Financial Crisis",
    description:
      "Lehman Brothers filed for bankruptcy after heavy exposure to subprime mortgages and mortgage-backed securities, sending shock waves through global markets.",
    year: getTimelineYearFromExactTimestamp(LEHMAN_BROTHERS_BANKRUPTCY_AT),
    exactTime: LEHMAN_BROTHERS_BANKRUPTCY_AT,
    dateLabel: "Sep 15, 2008",
    minZoom: 20,
    priority: 83,
    sourceIds: ["investopediaLehmanCollapse"],
  },
  {
    id: "higgs-boson-announced",
    label: "Higgs boson announced at CERN",
    shortLabel: "Higgs Boson",
    description:
      "CERN experiments announced a new particle consistent with the long-sought Higgs boson, a milestone in modern physics.",
    year: getTimelineYearFromExactTimestamp(HIGGS_BOSON_ANNOUNCED_AT),
    exactTime: HIGGS_BOSON_ANNOUNCED_AT,
    dateLabel: "Jul 4, 2012",
    minZoom: 20,
    priority: 81,
    sourceIds: ["humanCernHiggsBoson2012"],
  },
  {
    id: "paris-agreement-adopted",
    label: "Paris Agreement adopted",
    shortLabel: "Paris Agreement",
    description:
      "World leaders reached the Paris Agreement, a breakthrough climate accord aimed at keeping warming well below 2°C while pursuing 1.5°C.",
    year: getTimelineYearFromExactTimestamp(PARIS_AGREEMENT_ADOPTED_AT),
    exactTime: PARIS_AGREEMENT_ADOPTED_AT,
    dateLabel: "Dec 12, 2015",
    minZoom: 20,
    priority: 80,
    sourceIds: ["unParisAgreement"],
  },
  {
    id: "covid-19-pandemic-declared",
    label: "WHO declares COVID-19 pandemic",
    shortLabel: "COVID-19 Pandemic",
    description:
      "WHO characterized the COVID-19 outbreak as a pandemic after cases spread rapidly to countries across the world.",
    year: getTimelineYearFromExactTimestamp(COVID_19_PANDEMIC_DECLARED_AT),
    exactTime: COVID_19_PANDEMIC_DECLARED_AT,
    dateLabel: "Mar 11, 2020",
    minZoom: 20,
    priority: 84,
    sourceIds: ["whoCovid19Pandemic"],
  },
  {
    id: "chatgpt-introduced",
    label: "ChatGPT introduced",
    shortLabel: "ChatGPT",
    description:
      "OpenAI released ChatGPT as a public research preview, helping push generative AI into everyday use.",
    year: getTimelineYearFromExactTimestamp(CHATGPT_INTRODUCED_AT),
    exactTime: CHATGPT_INTRODUCED_AT,
    dateLabel: "Nov 30, 2022",
    minZoom: 20,
    priority: 82,
    sourceIds: ["openAiIntroducingChatGpt"],
  },
];
