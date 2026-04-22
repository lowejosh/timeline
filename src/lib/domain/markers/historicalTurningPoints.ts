import type { TimelineMarker } from "../../core/timelineTypes";
import {
  createExactCalendarTimestamp,
  getTimelineYearFromExactTimestamp,
} from "../../core/exactTimestamp";
import { bce, ce } from "../timelineDateBuilders";

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
    id: "gobekli-tepe-monuments",
    label: "Göbekli Tepe monuments",
    shortLabel: "Göbekli Tepe",
    description:
      "Hunter-gatherer communities at Göbekli Tepe raised monumental T-shaped stone enclosures, among the earliest known ritual architecture.",
    year: bce(9_600),
    regionalScopeLabel: "Southeastern Anatolia",
    approximate: true,
    minZoom: 19,
    priority: 69,
    sourceRefs: [
      {
        sourceId: "unescoGobekliTepe",
        note: "UNESCO dates Göbekli Tepe's monumental Pre-Pottery Neolithic structures to 9600–8200 BCE; the app uses c. 9600 BCE as a clean anchor for very early monumental ritual architecture.",
      },
    ],
  },
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
    sourceRefs: [
      {
        sourceId: "originsOfAgricultureInWestAsiaWikipedia",
        note: "The page explicitly says agriculture in West Asia can be traced back to between 10,000 and 8,000 BC; the marker now uses the opening date named by the source instead of an inferred midpoint.",
      },
      {
        sourceId: "prePotteryNeolithicAWikipedia",
        note: "PPNA is dated to c. 10,000–8,800 BCE in the Levant and Upper Mesopotamia and is explicitly characterized by crop cultivation and granaries, reinforcing 10,000 BCE as an early public-facing anchor for this marker.",
      },
    ],
  },
  {
    id: "catalhoyuk-settled-farming-community",
    label: "Çatalhöyük settled farming community",
    shortLabel: "Çatalhöyük",
    description:
      "Çatalhöyük was a densely settled farming community of mud-brick houses entered from the roof, reflecting early agricultural town life.",
    year: bce(7_400),
    regionalScopeLabel: "Anatolia",
    approximate: true,
    minZoom: 19,
    priority: 68,
    sourceRefs: [
      {
        sourceId: "unescoCatalhoyuk",
        note: "UNESCO dates the eastern mound's Neolithic occupation to 7400–6200 BCE and treats the site as a key witness to early settled agricultural life; the app uses its initial occupation as the marker year.",
      },
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
    sourceRefs: [
      {
        sourceId: "khanNeolithicRevolution",
        note: "Khan Academy highlights Jericho plastered skulls around 7200 BCE in Pre-Pottery Neolithic B, making it a useful marker for ritual and settled community life in the Neolithic Levant.",
      },
    ],
  },
  {
    id: "stonehenge-begins",
    label: "Stonehenge construction begins",
    shortLabel: "Stonehenge",
    description:
      "Stonehenge began within a vast ceremonial landscape whose earthworks and stone settings were built over many centuries.",
    year: bce(3_000),
    regionalScopeLabel: "Southern Britain",
    approximate: true,
    minZoom: 19,
    priority: 66,
    sourceRefs: [
      {
        sourceId: "unescoStonehenge",
        note: "UNESCO dates the broader Stonehenge and Avebury ceremonial landscape to roughly 3700–1600 BCE; the app uses c. 3000 BCE as a familiar late-Neolithic anchor for the beginning of Stonehenge's monument-building phases.",
      },
      {
        sourceId: "khanNeolithicRevolution",
        note: "Khan Academy describes Stonehenge as dating to approximately 3000 BCE, supporting its use here as an iconic marker for the start of Stonehenge's construction history.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaBronzeAge",
        note: "Britannica treats the Bronze Age's end as regionally variable; the app uses c. 1200 BCE as a conventional eastern Mediterranean collapse marker rather than a single-day event.",
      },
      {
        sourceId: "britannicaAncientGreece",
        note: "Britannica dates ancient Greek civilization from the end of Mycenaean civilization around 1200 BCE, which anchors this marker to the standard late-Bronze / early-Iron Age transition used here.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyAncientRome",
        note: "HISTORY dates Octavian's assumption of the title Augustus to 27 BCE, the conventional beginning of the Roman Empire.",
      },
      {
        sourceId: "khanRomanEmpire",
        note: "Supports the conventional 27 BCE imperial starting point under Augustus used by the app.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyAncientRome",
        note: "HISTORY dates the deposition of Romulus Augustulus by Odovacar to 476 CE, the standard public-history endpoint for the western Roman Empire.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyIslam",
        note: "HISTORY dates Muhammad's migration from Mecca to Medina to 622 CE and identifies that journey, the Hijra, as the beginning of the Islamic calendar.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyCharlemagne",
        note: "HISTORY dates Charlemagne's coronation by Pope Leo III to December 25, 800 and frames it as the start of his rule as Holy Roman Emperor.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyGenghisKhan",
        note: "HISTORY says Temujin was proclaimed Chinggis Khan in 1206 after unifying the Mongol steppe tribes, a clean threshold into the Mongol imperial era.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyBlackDeath",
        note: "HISTORY anchors the Black Death's arrival in Europe to 1347, when plague ships reached Messina.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyByzantineEmpire",
        note: "HISTORY dates the Ottoman capture of Constantinople to May 29, 1453; the app uses 1453 as the year marker.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyPrintingPress",
        note: "HISTORY says Gutenberg had a printing machine perfected and commercially ready by 1450; the app uses that year as the marker anchor.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyChristopherColumbus",
        note: "HISTORY dates Columbus's first Atlantic voyage and Caribbean landfall to 1492; the app uses that canonical year as a shorthand marker for the beginning of sustained transatlantic exchange.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyReformation",
        note: "HISTORY says historians usually date the start of the Protestant Reformation to Luther's 1517 publication of the 95 Theses.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyAztecs",
        note: "HISTORY's Aztecs overview gives the empire a concise 1428-1521 span ending with the Spanish conquest of Tenochtitlan, which the app uses as the clean public-facing marker year.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyFerdinandMagellan",
        note: "HISTORY says only the Victoria completed the voyage around the world and arrived back in Seville in September 1522, which the app uses as the clean public-facing circumnavigation marker.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyJamestown",
        note: "HISTORY says that on May 14, 1607 members of the Virginia Company founded Jamestown as the first permanent English settlement in North America.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyThirtyYearsWar",
        note: "HISTORY says the Defenestration of Prague in 1618 marked the beginning of open revolt and the start of the Thirty Years' War.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyEnglishCivilWars",
        note: "HISTORY says the First English Civil War broke out in earnest in August 1642 and frames the wider conflict as civil wars fought between 1642 and 1651 across England, Scotland, and Ireland.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyThirtyYearsWar",
        note: "HISTORY says that over the course of 1648 the various parties signed the Peace of Westphalia, effectively ending the Thirty Years' War.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaSiegeOfVienna",
        note: "Britannica dates the siege to July 17 to September 12, 1683, says it ended in Ottoman defeat by a combined force led by John III Sobieski, and calls the lifting of the siege the beginning of the end of Ottoman domination in eastern Europe.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaEncyclopedie",
        note: "Britannica says seventeen volumes of the Encyclopédie's text were published between 1751 and 1765; the app uses the 1751 opening as a concise marker for one of the Enlightenment's signature publications.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyAmericanRevolution",
        note: "HISTORY places the Declaration of Independence on July 4, 1776; the app uses that year as a concise American Revolution marker.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyFrenchRevolution",
        note: "HISTORY identifies 1789 as the beginning of the French Revolution and treats the storming of the Bastille that year as its symbolic start.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyIndustrialRevolution",
        note: "HISTORY says that in the 1760s James Watt began improving a Newcomen steam engine with a separate condenser, a change that made it far more efficient and helped steam power spread across British industries; the app uses c. 1760 as a concise public-facing anchor for Watt's steam-engine breakthrough.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyIndustrialRevolution",
        note: "HISTORY says that in 1830 steam-powered locomotives started transporting freight and passengers between Manchester and Liverpool; the app uses that year as a clean early-railway marker.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyTelegraph",
        note: 'HISTORY says that on May 24, 1844 Morse sent the first telegraph message, "What hath God wrought!", from Washington, D.C., to Baltimore, Maryland.',
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaRevolutionsOf1848",
        note: "Britannica describes the Revolutions of 1848 as a series of republican revolts against European monarchies, beginning in Sicily and spreading to France, Germany, Italy, and the Austrian Empire; the app uses 1848 as the clean shorthand year for that continent-wide revolutionary wave.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaRisorgimento",
        note: "Britannica says the Risorgimento was the 19th-century movement for Italian unification that culminated in the establishment of the Kingdom of Italy in 1861; the app uses that year as the principal state-formation marker.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyMeijiRestoration",
        note: "HISTORY says the Meiji Restoration of 1868 toppled the long-reigning Tokugawa shoguns and propelled Japan into the modern era; the app uses 1868 as the movement's canonical threshold year.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaGermanEmpire",
        note: "Britannica says the German Empire was founded on January 18, 1871, in the wake of Prussia's successful wars; the app uses 1871 as the clean marker year for German unification under imperial rule.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaTelephone",
        note: "Britannica says the modern telephone refers to electrical devices derived from Bell's inventions and notes that within 20 years of the 1876 Bell patent the instrument had taken on the functional design that would endure for more than a century.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "energyHistoryLightBulb",
        note: "The U.S. Department of Energy says Edison patented the incandescent light bulb in 1879 and that by October 1879 his team had produced a carbonized-filament bulb that could last for 14.5 hours.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "mercedesFirstAutomobile",
        note: 'Mercedes-Benz says that on January 29, 1886 Carl Benz applied for a patent for his "vehicle powered by a gas engine" and that patent number 37435 may be regarded as the birth certificate of the automobile.',
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "nobelMarconiBiographical",
        note: "The Nobel Prize biography says that in 1895 Marconi succeeded in sending wireless signals over a distance of one and a half miles at his father's estate, a clean early-radio milestone.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyWrightBrothers",
        note: "HISTORY says that on December 17, 1903 the Wright brothers succeeded in flying the first free, controlled flight of a power-driven, heavier-than-air plane.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaScrambleForAfrica",
        note: "Britannica's Scramble for Africa article says Bismarck's proposal led to the Berlin Conference held from November 15, 1884, to February 26, 1885, and that the conference formalized claims and accelerated the pace of colonization; the app uses the conference opening in 1884 as a clean marker anchor.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaTitanic",
        note: "Britannica dates Titanic's sinking to April 15, 1912 in the North Atlantic and standard ship histories place the final sinking at about 2:20 a.m.; the app uses that UTC instant as the marker anchor.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyWorldWarOne",
        note: "HISTORY dates the beginning of World War I to 1914, after the assassination of Archduke Franz Ferdinand escalated into general war.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyRussianRevolution",
        note: "HISTORY identifies 1917 as the key date of the Russian Revolution, encompassing both the February and October revolutions.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyGreatDepression",
        note: "HISTORY says the Great Depression lasted from 1929 until the beginning of World War II in 1939 and that the stock market crash in October 1929 triggered a crisis in the international economy.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyWorldWarTwo",
        note: "HISTORY dates the start of World War II to 1939, when Nazi Germany invaded Poland.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "unHistoryUnitedNations",
        note: "The UN says it officially began on 24 October 1945, after the Charter had been ratified by the major powers and a majority of other signatories.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "unUniversalDeclarationHumanRights",
        note: "The UN says the General Assembly proclaimed the UDHR in Paris on 10 December 1948 as a common standard of achievement for all peoples and all nations.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "natoFoundingTreaty",
        note: "NATO says 12 countries signed the North Atlantic Treaty in Washington, D.C., on 4 April 1949 and that collective defence is at the heart of the Treaty.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "unAntiColonialismDay",
        note: "The UN's anti-colonialism observance page identifies 14 December as the anniversary of Resolution 1514 (XV), the Declaration on the Granting of Independence to Colonial Countries and Peoples.",
      },
      {
        sourceId: "unDecolonization",
        note: "The UN calls the 1960 declaration a landmark in the decolonization process and links it to the acceleration of independence movements.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaYuriGagarin",
        note: "Britannica says Gagarin's Vostok 1 spacecraft was launched on April 12, 1961, when he became the first man to travel into space and orbit Earth.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyStateCubanMissileCrisis",
        note: "The State Department says Khrushchev issued a public statement on October 28, 1962, that Soviet missiles would be dismantled and removed from Cuba.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyMoonLanding",
        note: "HISTORY dates the Apollo 11 moon landing to July 20, 1969, when Armstrong and Aldrin became the first humans to land on the Moon.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaVietnamWar",
        note: "Britannica says that in 1975 South Vietnam fell to a full-scale invasion by the North, which the app uses as the canonical Fall of Saigon year marker.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaIranianRevolution",
        note: "Britannica says the Iranian monarchy was toppled on 11 February 1979 and that the revolution led to the establishment of an Islamic republic.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "whoSmallpoxEradication",
        note: "WHO says the 33rd World Health Assembly issued its official declaration in May 1980 that the world and all its peoples had won freedom from smallpox.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "iaeaChernobylFaq",
        note: "The IAEA says that on 26 April 1986 reactor number four at Chernobyl went out of control during a test, leading to an explosion and fire that released large amounts of radiation into the atmosphere.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historyStateFallCommunism",
        note: "The State Department dates the fall of the Berlin Wall to November 9, 1989 and frames it as the most visible symbol of the Cold War's collapse.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaSovietCollapse",
        note: "Britannica states that the Soviet Union dissolved on December 31, 1991, making it a clean endpoint for the Cold War world order.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "cernShortHistoryWeb",
        note: "CERN says Berners-Lee released his WWW software in 1991, that it became available to CERN colleagues in March 1991, and that he announced it on Internet newsgroups in August 1991.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "cernBirthWeb",
        note: "CERN says that on April 30, 1993 it placed the World Wide Web software in the public domain, allowing the web to spread globally.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "historySeptember11Attacks",
        note: "HISTORY says the September 11 attacks occurred on September 11, 2001, when al Qaeda-linked hijackers seized four airliners and attacked targets in the United States.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "appleIPhoneIntroduction",
        note: "Apple introduced iPhone on 9 January 2007 as a mobile phone, widescreen iPod, and breakthrough Internet communications device in one handheld product.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "investopediaLehmanCollapse",
        note: "Investopedia dates Lehman's bankruptcy filing to September 15, 2008 and describes it as a pivotal moment in the financial crisis driven by heavy exposure to subprime mortgages and complex securities.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "cernHiggsBoson2012",
        note: "CERN announced on 4 July 2012 that ATLAS and CMS had observed a new particle in the 125-126 GeV mass region, consistent with the long-sought Higgs boson.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "unParisAgreement",
        note: "The UN says world leaders reached the Paris Agreement on 12 December 2015 at COP21 in Paris.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "whoCovid19Pandemic",
        note: "WHO says it characterized the COVID-19 outbreak as a pandemic on March 11, 2020.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "openAiIntroducingChatGpt",
        note: 'OpenAI published "Introducing ChatGPT" on 30 November 2022 and presented it as a research-preview conversational model available for public use and feedback.',
      },
    ],
  },
];
