import { describe, expect, it } from "vitest";
import { ERA_SOURCES } from "../eraSources";
import { ROOT_ERA, ROOT_TIMELINE, TIMELINE_DISPLAY } from "../eras";
import {
  CIVILIZATION_OVERLAYS,
  CULTURE_OVERLAYS,
} from "../overlays";
import {
  TIMELINE_DECORATION_CATEGORIES,
  TIMELINE_DECORATION_GROUPS,
} from "../timelineDecorations";
import { bce, yearsAgo } from "../timelineDateBuilders";
import type { TimelineOverlayBand } from "../timelineTypes";

function flattenOverlayBands(
  bands: TimelineOverlayBand[],
): TimelineOverlayBand[] {
  return bands.flatMap((band) => [
    band,
    ...flattenOverlayBands(band.children ?? []),
  ]);
}

describe("root timeline display data", () => {
  it("keeps the stitched root era as the canonical root export", () => {
    expect(ROOT_TIMELINE.rootEra).toBe(ROOT_ERA);
    expect(ROOT_TIMELINE.display).toBe(TIMELINE_DISPLAY);
  });

  it("keeps decoration group metadata aligned with the assembled display data", () => {
    const categoryIds = new Set(
      TIMELINE_DECORATION_CATEGORIES.map((category) => category.id),
    );
    const groupIds = new Set(
      TIMELINE_DECORATION_GROUPS.map((group) => group.id),
    );

    expect(
      TIMELINE_DECORATION_GROUPS.every((group) =>
        categoryIds.has(group.categoryId),
      ),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.markers.every(
        (marker) => !marker.groupId || groupIds.has(marker.groupId),
      ),
    ).toBe(true);

    expect(
      flattenOverlayBands(TIMELINE_DISPLAY.overlays).every(
        (band) => !band.groupId || groupIds.has(band.groupId),
      ),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.markers
        .filter((marker) => marker.year >= bce(12_000))
        .every((marker) => marker.groupId === "human-history"),
    ).toBe(true);

    expect(
      CULTURE_OVERLAYS.every(
        (overlay) =>
          TIMELINE_DISPLAY.overlays.find((band) => band.id === overlay.id)
            ?.groupId === "cultures",
      ),
    ).toBe(true);

    expect(
      CIVILIZATION_OVERLAYS.every(
        (overlay) =>
          TIMELINE_DISPLAY.overlays.find((band) => band.id === overlay.id)
            ?.groupId === "civilizations",
      ),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.markers
        .filter((marker) =>
          [
            "great-oxidation-event",
            "first-eukaryotic-cells",
            "k-pg-asteroid-impact",
          ].includes(marker.id),
        )
        .every((marker) => marker.groupId === "deep-time-life"),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.overlays
        .filter((band) =>
          [
            "cambrian-explosion",
            "cambrian-substrate-revolution",
            "great-ordovician-biodiversification-event",
            "devonian-nekton-revolution",
            "carboniferous-rainforest-collapse",
            "mesozoic-marine-revolution",
            "age-of-dinosaurs",
            "paleocene-eocene-thermal-maximum",
          ].includes(band.id),
        )
        .every((band) => band.groupId === "deep-time-life"),
    ).toBe(true);
  });

  it("keeps core markers ordered chronologically with valid sources", () => {
    expect(TIMELINE_DISPLAY.markers.map((marker) => marker.id)).toEqual([
      "cosmic-microwave-background-released",
      "first-stars-ignite",
      "reionization-largely-complete",
      "milky-way-like-star-birth-peaks",
      "milky-way-like-spiral-shape-emerges",
      "solar-system-formation",
      "earth-formation",
      "moon-forms",
      "oldest-known-zircons-form",
      "early-oceans-and-hydrosphere",
      "earliest-evidence-of-life",
      "great-oxidation-event",
      "first-eukaryotic-cells",
      "first-large-multicellular-life",
      "first-land-plants",
      "late-ordovician-mass-extinction",
      "earliest-vascular-plants-appear",
      "first-forests-appear",
      "late-devonian-mass-extinction",
      "first-tetrapods-step-onto-land",
      "first-reptiles-appear",
      "giant-insects-fill-carboniferous-skies",
      "end-permian-mass-extinction",
      "first-mammals-appear",
      "end-triassic-mass-extinction",
      "archaeopteryx-first-known-bird",
      "first-flowering-plants-appear",
      "k-pg-asteroid-impact",
      "earliest-likely-bipedal-hominins-appear",
      "early-bipedal-femur-evidence-in-kenya",
      "earliest-stone-tools-associated-with-early-homo",
      "genus-homo-emerges",
      "early-humans-expand-beyond-africa",
      "acheulean-handaxes-appear",
      "hearths-and-fireplaces-appear-in-heidelbergensis-era",
      "neanderthal-and-modern-human-lineages-diverge",
      "homo-sapiens-evolves-in-africa",
      "ground-ocher-markings-appear-in-africa",
      "last-known-homo-floresiensis-survives-on-flores",
      "last-neanderthals-disappear",
      "chauvet-cave-figurative-art",
      "venus-of-dolni-vestonice",
      "agriculture-emerges-in-southwest-asia",
      "gobekli-tepe-monuments",
      "natufian-settled-hunter-gatherers-at-eynan",
      "mehrgarh-early-farming-community",
      "catalhoyuk-settled-farming-community",
      "jericho-ritual-community",
      "jiahu-bone-flutes-and-village-life",
      "canal-irrigation-appears-at-choga-mami",
      "wheeled-transport-appears-in-sumer",
      "cuneiform-writing-emerges",
      "stonehenge-begins",
      "great-pyramid-of-giza-completed",
      "sargon-of-akkad-builds-an-empire",
      "hammurabi-promulgates-his-laws",
      "earliest-attested-chinese-writing",
      "bronze-age-collapse",
      "alexander-dies-hellenistic-age-begins",
      "rome-destroys-carthage",
      "caesar-crosses-the-rubicon",
      "augustus-becomes-emperor",
      "fall-of-western-rome",
      "hijra",
      "charlemagne-crowned-emperor",
      "first-crusade-called",
      "genghis-khan-proclaimed",
      "black-death",
      "gutenberg-press",
      "fall-of-constantinople",
      "columbian-exchange-begins",
      "protestant-reformation",
      "american-independence-declared",
      "french-revolution",
      "berlin-conference-opens",
      "titanic-sinks",
      "world-war-i",
      "russian-revolution",
      "world-war-ii",
      "united-nations-founded",
      "udhr-proclaimed",
      "nato-founded",
      "un-decolonization-declaration",
      "first-human-in-space",
      "cuban-missile-crisis-resolved",
      "apollo-11-moon-landing",
      "berlin-wall-falls",
      "soviet-union-dissolves",
      "world-wide-web-opened",
      "september-11-attacks",
      "lehman-brothers-bankruptcy",
      "paris-agreement-adopted",
      "covid-19-pandemic-declared",
    ]);

    for (const marker of TIMELINE_DISPLAY.markers) {
      for (const reference of marker.sourceRefs ?? []) {
        expect(ERA_SOURCES[reference.sourceId]).toBeDefined();
      }
    }

    expect(
      TIMELINE_DISPLAY.markers.every(
        (marker, index, markers) =>
          index === 0 || markers[index - 1].year <= marker.year,
      ),
    ).toBe(true);
  });

  it("marks representative ancient markers and overlays with scope and approximation metadata", () => {
    const agriculture = TIMELINE_DISPLAY.markers.find(
      (marker) => marker.id === "agriculture-emerges-in-southwest-asia",
    );
    const collapse = TIMELINE_DISPLAY.markers.find(
      (marker) => marker.id === "bronze-age-collapse",
    );
    const cuneiform = TIMELINE_DISPLAY.markers.find(
      (marker) => marker.id === "cuneiform-writing-emerges",
    );
    const irrigation = TIMELINE_DISPLAY.markers.find(
      (marker) => marker.id === "canal-irrigation-appears-at-choga-mami",
    );
    const gobekliTepe = TIMELINE_DISPLAY.markers.find(
      (marker) => marker.id === "gobekli-tepe-monuments",
    );
    const homoSapiens = TIMELINE_DISPLAY.markers.find(
      (marker) => marker.id === "homo-sapiens-evolves-in-africa",
    );
    const mesopotamia = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "mesopotamia",
    );
    const natufian = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "natufian-culture",
    );
    const hittites = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "hittite-empire",
    );
    const uruk = mesopotamia?.children?.find(
      (band) => band.id === "uruk-period",
    );
    const jemdetNasr = mesopotamia?.children?.find(
      (band) => band.id === "jemdet-nasr-period",
    );
    const sumer = mesopotamia?.children?.find(
      (band) => band.id === "sumerian-city-states",
    );
    const akkad = mesopotamia?.children?.find(
      (band) => band.id === "akkadian-empire",
    );
    const urIII = mesopotamia?.children?.find(
      (band) => band.id === "ur-iii-empire",
    );
    const oldBabylonian = mesopotamia?.children?.find(
      (band) => band.id === "old-babylonian-empire",
    );
    const kassites = mesopotamia?.children?.find(
      (band) => band.id === "kassite-babylonia",
    );
    const middleAssyrian = mesopotamia?.children?.find(
      (band) => band.id === "middle-assyrian-empire",
    );
    const neoAssyrian = mesopotamia?.children?.find(
      (band) => band.id === "neo-assyrian-empire",
    );
    const neoBabylonian = mesopotamia?.children?.find(
      (band) => band.id === "neo-babylonian-empire",
    );

    expect(agriculture).toMatchObject({
      regionalScopeLabel: "Southwest Asia",
      approximate: true,
      description: expect.stringContaining(
        "cultivation preceding the appearance of fully domesticated crops",
      ),
    });
    expect(agriculture?.year).toBeLessThan(gobekliTepe?.year ?? Number.POSITIVE_INFINITY);
    expect(
      agriculture?.sourceRefs?.map((reference) => reference.sourceId),
    ).toEqual([
      "originsOfAgricultureInWestAsiaWikipedia",
      "prePotteryNeolithicAWikipedia",
    ]);
    expect(collapse).toMatchObject({
      regionalScopeLabel: "Eastern Mediterranean",
      approximate: true,
    });
    expect(cuneiform).toMatchObject({
      regionalScopeLabel: "Mesopotamia",
      approximate: true,
    });
    expect(irrigation).toMatchObject({
      regionalScopeLabel: "Mesopotamia",
      approximate: true,
      year: bce(6_000),
      label: "Canal irrigation appears at Choga Mami",
      description: expect.stringContaining(
        "man-made channels watering fields in lowland Mesopotamia",
      ),
    });
    expect(
      irrigation?.sourceRefs?.map((reference) => reference.sourceId),
    ).toEqual([
      "chogaMamiWikipedia",
      "originsOfAgricultureInWestAsiaWikipedia",
    ]);
    expect(homoSapiens).toMatchObject({
      regionalScopeLabel: "Africa",
      approximate: true,
    });
    expect(mesopotamia).toMatchObject({
      regionalScopeLabel: "Mesopotamia",
      approximateStart: true,
      startYear: bce(4_000),
      endYear: bce(539),
      description: expect.stringContaining(
        "earliest known civilization in southern Mesopotamia",
      ),
    });
    expect(
      mesopotamia?.sourceRefs?.map((reference) => reference.sourceId),
    ).toEqual(["britannicaSumer", "metBabylon"]);
    expect(uruk).toMatchObject({
      label: "Uruk period",
      startYear: bce(4_000),
      endYear: bce(3_100),
      regionalScopeLabel: "Southern Mesopotamia",
      approximateStart: true,
      approximateEnd: true,
      description: expect.stringContaining("appearance of cities and the state"),
    });
    expect(uruk?.sourceRefs?.map((reference) => reference.sourceId)).toEqual([
      "urukPeriodWikipedia",
      "metUrukFirstCity",
    ]);
    expect(jemdetNasr).toMatchObject({
      label: "Jemdet Nasr",
      startYear: bce(3_100),
      endYear: bce(2_900),
      regionalScopeLabel: "Southern Mesopotamia",
      description: expect.stringContaining(
        "developing out of the Uruk period",
      ),
    });
    expect(
      jemdetNasr?.sourceRefs?.map((reference) => reference.sourceId),
    ).toEqual(["jemdetNasrPeriodWikipedia"]);
    expect(sumer).toMatchObject({
      label: "Early Dynastic Sumer",
      startYear: bce(2_900),
      endYear: bce(2_350),
      regionalScopeLabel: "Southern Mesopotamia",
      approximateStart: true,
      approximateEnd: true,
      description: expect.stringContaining("city-states dominated Mesopotamia"),
    });
    expect(sumer?.sourceRefs?.map((reference) => reference.sourceId)).toEqual([
      "metEarlyDynasticSculpture",
    ]);
    expect(natufian).toMatchObject({
      regionalScopeLabel: "Levant",
      approximateStart: true,
      approximateEnd: true,
    });
    expect(hittites).toMatchObject({
      regionalScopeLabel: "Anatolia and northern Syria",
      approximateStart: true,
      approximateEnd: true,
    });
    expect(akkad).toMatchObject({
      label: "Akkadian period",
      startYear: bce(2_350),
      endYear: bce(2_150),
      regionalScopeLabel: "Mesopotamia",
      approximateStart: true,
      approximateEnd: true,
      description: expect.stringContaining(
        "Semitic monarchs united the rival Sumerian cities by conquest",
      ),
    });
    expect(akkad?.sourceRefs?.map((reference) => reference.sourceId)).toEqual([
      "metAkkadianPeriod",
    ]);
    expect(urIII).toMatchObject({
      label: "Ur III state",
      startYear: bce(2_112),
      endYear: bce(2_004),
      regionalScopeLabel: "Southern Mesopotamia",
      approximateStart: true,
      approximateEnd: true,
      description: expect.stringContaining(
        "southern Mesopotamian cities under the control of Ur",
      ),
    });
    expect(urIII?.sourceRefs?.map((reference) => reference.sourceId)).toEqual([
      "metUrZiggurat",
      "metIsinLarsaOldBabylonian",
    ]);
    expect(oldBabylonian).toMatchObject({
      label: "Old Babylonian period",
      startYear: bce(1_894),
      endYear: bce(1_595),
      regionalScopeLabel: "Babylonia",
      approximateStart: true,
      description: expect.stringContaining(
        "political capital of Mesopotamia",
      ),
    });
    expect(
      oldBabylonian?.sourceRefs?.map((reference) => reference.sourceId),
    ).toEqual(["metIsinLarsaOldBabylonian"]);
    expect(kassites).toMatchObject({
      label: "Middle Babylonian / Kassite",
      startYear: bce(1_595),
      endYear: bce(1_155),
      regionalScopeLabel: "Babylonia",
      approximateStart: true,
      approximateEnd: true,
      description: expect.stringContaining(
        "virtually synonymous with the Middle Babylonian period",
      ),
    });
    expect(kassites?.sourceRefs?.map((reference) => reference.sourceId)).toEqual([
      "metMiddleBabylonianKassite",
    ]);
    expect(middleAssyrian).toMatchObject({
      label: "Middle Assyrian period",
      startYear: bce(1_365),
      endYear: bce(1_076),
      regionalScopeLabel: "Northern Mesopotamia",
      approximateStart: true,
      description: expect.stringContaining(
        "projecting power from the Euphrates to the Mediterranean",
      ),
    });
    expect(
      middleAssyrian?.sourceRefs?.map((reference) => reference.sourceId),
    ).toEqual(["metAssyria"]);
    expect(neoAssyrian).toMatchObject({
      label: "Neo-Assyrian Empire",
      startYear: bce(912),
      endYear: bce(612),
      regionalScopeLabel: "Northern Mesopotamia",
      description: expect.stringContaining(
        "stretching across Mesopotamia, the Levant, Egypt, Anatolia",
      ),
    });
    expect(
      neoAssyrian?.sourceRefs?.map((reference) => reference.sourceId),
    ).toEqual(["worldHistoryNeoAssyrianEmpire"]);
    expect(neoBabylonian).toMatchObject({
      label: "Neo-Babylonian Empire",
      startYear: bce(625),
      endYear: bce(539),
      regionalScopeLabel: "Babylonia",
      description: expect.stringContaining(
        "Nabopolassar and Nebuchadnezzar II",
      ),
    });
    expect(
      neoBabylonian?.sourceRefs?.map((reference) => reference.sourceId),
    ).toEqual(["metBabylon"]);
  });

  it("keeps deep-time crisis markers descriptive and source-backed", () => {
    const crisisMarkerIds = [
      "great-oxidation-event",
      "late-ordovician-mass-extinction",
      "late-devonian-mass-extinction",
      "end-permian-mass-extinction",
      "end-triassic-mass-extinction",
      "k-pg-asteroid-impact",
    ];

    for (const markerId of crisisMarkerIds) {
      const marker = TIMELINE_DISPLAY.markers.find(
        (timelineMarker) => timelineMarker.id === markerId,
      );

      expect(marker?.description).toBeTruthy();
      expect(marker?.sourceRefs?.length).toBeGreaterThan(0);
    }

    expect(
      TIMELINE_DISPLAY.markers.find(
        (marker) => marker.id === "late-ordovician-mass-extinction",
      )?.description,
    ).toContain("85%");
    expect(
      TIMELINE_DISPLAY.markers.find(
        (marker) => marker.id === "late-devonian-mass-extinction",
      )?.description,
    ).toContain("75%");
    expect(
      TIMELINE_DISPLAY.markers.find(
        (marker) => marker.id === "end-permian-mass-extinction",
      )?.description,
    ).toContain("9 in 10");
    expect(
      TIMELINE_DISPLAY.markers.find(
        (marker) => marker.id === "end-triassic-mass-extinction",
      )?.description,
    ).toContain("more than a third");
    expect(
      TIMELINE_DISPLAY.markers.find(
        (marker) => marker.id === "k-pg-asteroid-impact",
      )?.description,
    ).toContain("75%");
    expect(
      TIMELINE_DISPLAY.markers
        .find((marker) => marker.id === "great-oxidation-event")
        ?.sourceRefs?.some(
          (reference) => reference.sourceId === "asmGreatOxidationEvent",
        ),
    ).toBe(true);
  });

  it("includes the historical overlay bands with valid sources", () => {
    expect(TIMELINE_DISPLAY.overlays.map((band) => band.id)).toEqual([
      "cambrian-substrate-revolution",
      "cambrian-explosion",
      "great-ordovician-biodiversification-event",
      "devonian-nekton-revolution",
      "carboniferous-rainforest-collapse",
      "mesozoic-marine-revolution",
      "age-of-dinosaurs",
      "paleocene-eocene-thermal-maximum",
      "sahelanthropus-tchadensis",
      "orrorin-tugenensis",
      "ardipithecus-kadabba",
      "ardipithecus-ramidus",
      "australopithecus-anamensis",
      "australopithecus-afarensis",
      "kenyanthropus-platyops",
      "australopithecus-africanus",
      "paranthropus-aethiopicus",
      "australopithecus-garhi",
      "homo-habilis",
      "paranthropus-boisei",
      "australopithecus-sediba",
      "homo-rudolfensis",
      "homo-erectus",
      "paranthropus-robustus",
      "homo-heidelbergensis",
      "homo-neanderthalensis",
      "homo-naledi",
      "homo-sapiens",
      "homo-floresiensis",
      "natufian-culture",
      "khiamian-culture",
      "mureybetian-culture",
      "cayonu-tepesi",
      "nevali-cori",
      "halaf-culture",
      "samarra-culture",
      "ubaid-period",
      "mesopotamia",
      "indus-valley-civilization",
      "ancient-egypt",
      "maya-civilization",
      "hittite-empire",
      "mycenaean-greece",
      "chinese-civilization",
      "ancient-greece",
      "carthage",
      "achaemenid-persia",
      "roman-republic",
      "roman-empire",
      "sasanian-empire",
      "byzantine-empire",
      "abbasid-caliphate",
      "holy-roman-empire",
      "mongol-empire",
      "mali-empire",
      "ottoman-empire",
      "aztec-empire",
      "inca-empire",
    ]);

    for (const band of flattenOverlayBands(TIMELINE_DISPLAY.overlays)) {
      for (const reference of band.sourceRefs ?? []) {
        expect(ERA_SOURCES[reference.sourceId]).toBeDefined();
      }
    }

    expect(
      TIMELINE_DISPLAY.overlays.every(
        (band, index, bands) =>
          index === 0 || bands[index - 1].startYear <= band.startYear,
      ),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.overlays
        .filter(
          (band) =>
            band.startYear <= yearsAgo(100_000) &&
            band.endYear <= yearsAgo(40_000),
        )
        .some((band) => band.id === "homo-neanderthalensis"),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.overlays
        .find((band) => band.id === "mesopotamia")
        ?.children?.map((band) => band.id),
    ).toEqual([
      "uruk-period",
      "jemdet-nasr-period",
      "sumerian-city-states",
      "akkadian-empire",
      "ur-iii-empire",
      "old-babylonian-empire",
      "kassite-babylonia",
      "middle-assyrian-empire",
      "neo-assyrian-empire",
      "neo-babylonian-empire",
    ]);

    expect(
      TIMELINE_DISPLAY.overlays
        .find((band) => band.id === "chinese-civilization")
        ?.children?.map((band) => band.id),
    ).toEqual([
      "shang-china",
      "zhou-china",
      "qin-dynasty",
      "han-china",
      "tang-dynasty",
      "song-china",
      "yuan-dynasty",
      "ming-dynasty",
      "qing-dynasty",
    ]);

    expect(
      TIMELINE_DISPLAY.overlays
        .find((band) => band.id === "maya-civilization")
        ?.children?.map((band) => band.id),
    ).toEqual(["preclassic-maya", "classic-maya", "postclassic-maya"]);

    const mesopotamiaChildren = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "mesopotamia",
    )?.children;

    const maya = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "maya-civilization",
    );

    const holyRomanEmpire = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "holy-roman-empire",
    );
    const natufian = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "natufian-culture",
    );
    const khiamian = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "khiamian-culture",
    );
    const mureybetian = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "mureybetian-culture",
    );
    const cayonu = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "cayonu-tepesi",
    );
    const nevaliCori = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "nevali-cori",
    );
    const halaf = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "halaf-culture",
    );
    const samarra = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "samarra-culture",
    );
    const ubaid = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "ubaid-period",
    );

    const chineseCivilization = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "chinese-civilization",
    );

    const chineseChildren = chineseCivilization?.children;
    const mayaChildren = maya?.children;

    expect(
      mesopotamiaChildren?.every(
        (band, index, bands) =>
          index === 0 || bands[index - 1].startYear <= band.startYear,
      ),
    ).toBe(true);

    expect(chineseCivilization).toMatchObject({
      label: "China",
      regionalScopeLabel: "China",
      approximateStart: true,
      subGroup: "east-asia",
    });

    expect(maya).toMatchObject({
      label: "Maya",
      regionalScopeLabel: "Mesoamerica",
      approximateStart: true,
      subGroup: "mesoamerica",
    });

    expect(holyRomanEmpire).toMatchObject({
      label: "Holy Roman Empire",
      startYear: 962,
      endYear: 1806,
      regionalScopeLabel: "Central Europe",
      subGroup: "central-europe",
    });

    expect(natufian).toMatchObject({
      label: "Natufian",
      startYear: yearsAgo(15_000),
      endYear: yearsAgo(11_500),
      regionalScopeLabel: "Levant",
      subGroup: "near-east",
    });

    expect(khiamian).toMatchObject({
      label: "Khiamian",
      startYear: bce(9_700),
      endYear: bce(8_650),
      regionalScopeLabel: "Levant and Middle Euphrates",
      subGroup: "near-east",
    });

    expect(mureybetian).toMatchObject({
      label: "Mureybetian",
      startYear: bce(9_300),
      endYear: bce(8_600),
      regionalScopeLabel: "Middle Euphrates",
      subGroup: "near-east",
    });

    expect(cayonu).toMatchObject({
      label: "Çayönü",
      startYear: bce(8_630),
      endYear: bce(6_800),
      regionalScopeLabel: "Upper Tigris",
      subGroup: "near-east",
    });

    expect(nevaliCori).toMatchObject({
      label: "Nevalı Çori",
      startYear: bce(8_400),
      endYear: bce(8_100),
      regionalScopeLabel: "Middle Euphrates",
      subGroup: "near-east",
    });

    expect(halaf).toMatchObject({
      label: "Halaf",
      startYear: bce(6_100),
      endYear: bce(5_100),
      regionalScopeLabel: "Upper Mesopotamia",
      subGroup: "near-east",
    });

    expect(samarra).toMatchObject({
      label: "Samarra",
      startYear: bce(5_500),
      endYear: bce(4_800),
      regionalScopeLabel: "Northern Mesopotamia",
      subGroup: "near-east",
    });

    expect(ubaid).toMatchObject({
      label: "Ubaid",
      startYear: bce(5_500),
      endYear: bce(3_800),
      regionalScopeLabel: "Southern Mesopotamia",
      subGroup: "near-east",
      description: expect.stringContaining(
        "earliest known settlements on the alluvial plain",
      ),
    });
    expect(ubaid?.sourceRefs?.map((reference) => reference.sourceId)).toEqual([
      "ubaidPeriodWikipedia",
    ]);

    expect(
      chineseChildren?.every(
        (band, index, bands) =>
          index === 0 || bands[index - 1].startYear <= band.startYear,
      ),
    ).toBe(true);

    expect(
      mayaChildren?.every(
        (band, index, bands) =>
          index === 0 || bands[index - 1].startYear <= band.startYear,
      ),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.overlays
        .find((band) => band.id === "age-of-dinosaurs")
        ?.children?.map((band) => band.id),
    ).toBeUndefined();

    expect(
      TIMELINE_DISPLAY.overlays
        .filter((band) => band.groupId === "civilizations")
        .every((band) => band.regionalScopeLabel && band.subGroup),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.overlays
        .filter((band) => band.groupId === "cultures")
        .every((band) => band.regionalScopeLabel && band.subGroup),
    ).toBe(true);
  });

  it("keeps deep-time overlays descriptive and source-backed", () => {
    const cambrianExplosion = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "cambrian-explosion",
    );
    const substrateRevolution = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "cambrian-substrate-revolution",
    );
    const gobe = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "great-ordovician-biodiversification-event",
    );
    const nektonRevolution = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "devonian-nekton-revolution",
    );
    const rainforestCollapse = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "carboniferous-rainforest-collapse",
    );
    const marineRevolution = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "mesozoic-marine-revolution",
    );
    const ageOfDinosaurs = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "age-of-dinosaurs",
    );
    const petm = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "paleocene-eocene-thermal-maximum",
    );

    expect(cambrianExplosion).toMatchObject({
      description: expect.stringContaining("major animal lineages"),
    });
    expect(substrateRevolution).toMatchObject({
      description: expect.stringContaining("burrowed, mixed sediments"),
      approximateStart: true,
      approximateEnd: true,
    });
    expect(gobe).toMatchObject({
      description: expect.stringContaining("marine communities diversified"),
      approximateStart: true,
      approximateEnd: true,
    });
    expect(nektonRevolution).toMatchObject({
      description: expect.stringContaining("open water column"),
      approximateStart: true,
      approximateEnd: true,
    });
    expect(rainforestCollapse).toMatchObject({
      description: expect.stringContaining("humid coal-forest habitats"),
      approximateStart: true,
      approximateEnd: true,
    });
    expect(marineRevolution).toMatchObject({
      description: expect.stringContaining("predator-prey arms race"),
      approximateStart: true,
      approximateEnd: true,
    });
    expect(ageOfDinosaurs).toMatchObject({
      description: expect.stringContaining("archosaurs"),
    });
    expect(petm).toMatchObject({
      description: expect.stringContaining("5 to 9°C"),
      approximateStart: true,
      approximateEnd: true,
    });
    expect(cambrianExplosion?.sourceRefs?.length).toBeGreaterThan(0);
    expect(substrateRevolution?.sourceRefs?.length).toBeGreaterThan(0);
    expect(gobe?.sourceRefs?.length).toBeGreaterThan(0);
    expect(nektonRevolution?.sourceRefs?.length).toBeGreaterThan(0);
    expect(rainforestCollapse?.sourceRefs?.length).toBeGreaterThan(0);
    expect(marineRevolution?.sourceRefs?.length).toBeGreaterThan(0);
    expect(ageOfDinosaurs?.sourceRefs?.length).toBeGreaterThan(0);
    expect(petm?.sourceRefs?.length).toBeGreaterThan(0);
    expect(ageOfDinosaurs?.children).toBeUndefined();
  });

  it("keeps the flattened root era child chronology stitched in the expected order", () => {
    expect(ROOT_TIMELINE.rootEra.children?.map((child) => child.id)).toEqual(
      ROOT_ERA.children?.map((child) => child.id),
    );
    expect(ROOT_TIMELINE.rootEra.children?.map((child) => child.id)).toEqual([
      "early-universe",
      "dark-ages",
      "first-stars-and-reionization",
      "galaxy-assembly",
      "hadean",
      "archean",
      "siderian",
      "rhyacian",
      "orosirian",
      "statherian",
      "calymmian",
      "ectasian",
      "stenian",
      "tonian",
      "cryogenian",
      "ediacaran",
      "cambrian",
      "ordovician",
      "silurian",
      "devonian",
      "carboniferous",
      "permian",
      "triassic",
      "jurassic",
      "cretaceous",
      "paleogene",
      "neogene",
      "quaternary",
      "paleolithic",
      "epipaleolithic",
      "neolithic",
      "chalcolithic",
      "bronze-age",
      "iron-age",
      "classical-antiquity",
      "post-classical-history",
      "early-modern-period",
      "age-of-industry-and-empire",
      "contemporary-history",
    ]);
  });
});
