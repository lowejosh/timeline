import { getTimelineYearFromExactTimestamp } from "@/lib/core/exactTimestamp";
import { createExactCalendarTimestamp } from "@/lib/core/exactTimestamp";
import { ce } from "@/lib/core/timelineDateBuilders";
import type { TimelineMarker } from "@/lib/core/timelineTypes";

const ENIAC_ANNOUNCED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1946,
  month: 2,
  day: 14,
  precision: "day",
});

const ARPANET_FIRST_NODE_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1969,
  month: 9,
  precision: "month",
});

const IBM_PC_UNVEILED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1981,
  month: 8,
  day: 12,
  precision: "day",
});

const TCP_IP_FLAG_DAY_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1983,
  month: 1,
  day: 1,
  precision: "day",
});

const WEB_PUBLIC_DOMAIN_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1993,
  month: 4,
  day: 30,
  precision: "day",
});

const IPHONE_INTRODUCED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2007,
  month: 1,
  day: 9,
  precision: "day",
});

export const COMPUTING_HISTORY_MARKERS: TimelineMarker[] = [
  {
    id: "difference-engine-designed",
    label: "Babbage designs the Difference Engine",
    shortLabel: "Difference Engine",
    year: ce(1822),
    dateLabel: "c. 1822–1830",
    approximate: true,
    minZoom: 15,
    priority: 90,
    description:
      "Babbage designs the Difference Engine, a mechanical calculator meant to remove tedious routine arithmetic work.",
    sourceIds: ["computingOxfordImaginingAi"],
  },
  {
    id: "ada-lovelace-describes-analytical-engine",
    label: "Ada Lovelace describes the Analytical Engine",
    shortLabel: "Ada Lovelace",
    year: ce(1843),
    minZoom: 15,
    priority: 89,
    description:
      "Lovelace collaborates on a description of Babbage's unbuilt Analytical Engine and lays out a step-by-step calculation.",
    sourceIds: ["computingOxfordImaginingAi"],
  },
  {
    id: "turing-computability-paper",
    label: "Turing frames computability",
    shortLabel: "Turing Machine",
    year: ce(1936),
    dateLabel: "1936–1937",
    approximate: true,
    minZoom: 15,
    priority: 96,
    description:
      "Turing's 1936–1937 paper introduces computability and the Turing machine, groundwork for computer science.",
    sourceIds: ["computingAlanTuringSep"],
  },
  {
    id: "eniac-announced",
    label: "ENIAC announced",
    shortLabel: "ENIAC",
    year: getTimelineYearFromExactTimestamp(ENIAC_ANNOUNCED_AT),
    exactTime: ENIAC_ANNOUNCED_AT,
    dateLabel: "Feb 14, 1946",
    minZoom: 16,
    priority: 93,
    description:
      "ENIAC is announced as the first general-purpose electronic computer.",
    sourceIds: ["computingPennEniac"],
  },
  {
    id: "first-transistor-invented",
    label: "First transistor invented",
    shortLabel: "Transistor",
    year: ce(1947),
    minZoom: 16,
    priority: 92,
    description:
      "Bell Telephone Laboratories invents the first transistor, a decisive move toward solid-state electronics.",
    sourceIds: ["computingEthwTransistor"],
  },
  {
    id: "manchester-baby-first-program",
    label: "Manchester Baby runs a stored program",
    shortLabel: "Manchester Baby",
    year: ce(1948),
    minZoom: 16,
    priority: 94,
    description:
      "The Manchester Baby runs the first computer program stored in electronic memory.",
    sourceIds: ["computingChmTimeline"],
  },
  {
    id: "first-integrated-circuit-invented",
    label: "First integrated circuit invented",
    shortLabel: "Integrated Circuit",
    year: ce(1958),
    minZoom: 16,
    priority: 91,
    description:
      "Jack Kilby invents the first integrated circuit at Texas Instruments.",
    sourceIds: ["computingTiIntegratedCircuit"],
  },
  {
    id: "ibm-system-360-introduced",
    label: "IBM System/360 introduced",
    shortLabel: "System/360",
    year: ce(1964),
    minZoom: 17,
    priority: 90,
    description:
      "IBM unifies a family of computers under a single architecture and platform model.",
    sourceIds: ["computingIbmSystem360"],
  },
  {
    id: "arpanet-first-node-installed",
    label: "ARPANET's first node installed",
    shortLabel: "ARPANET Node",
    year: getTimelineYearFromExactTimestamp(ARPANET_FIRST_NODE_AT),
    exactTime: ARPANET_FIRST_NODE_AT,
    dateLabel: "Sep 1969",
    minZoom: 17,
    priority: 89,
    description:
      "BBN installs the first ARPANET interface message processor at UCLA and connects the first host computer.",
    sourceIds: ["computingInternetSocietyBriefHistory"],
  },
  {
    id: "altair-8800-appears",
    label: "Altair 8800 appears",
    shortLabel: "Altair 8800",
    year: ce(1975),
    minZoom: 17,
    priority: 90,
    description:
      "The Altair 8800 kit kicks off the early microcomputer boom.",
    sourceIds: ["computingChmTimeline"],
  },
  {
    id: "apple-ii-introduced",
    label: "Apple II introduced",
    shortLabel: "Apple II",
    year: ce(1977),
    minZoom: 17,
    priority: 88,
    description:
      "Apple II pushes personal computing well beyond the hobbyist community.",
    sourceIds: ["computingChmTimeline"],
  },
  {
    id: "ibm-pc-unveiled",
    label: "IBM PC unveiled",
    shortLabel: "IBM PC",
    year: getTimelineYearFromExactTimestamp(IBM_PC_UNVEILED_AT),
    exactTime: IBM_PC_UNVEILED_AT,
    dateLabel: "Aug 12, 1981",
    minZoom: 18,
    priority: 91,
    description:
      "IBM unveils the IBM PC, helping move personal computing into the mainstream.",
    sourceIds: ["computingIbmPc"],
  },
  {
    id: "arpanet-adopts-tcp-ip",
    label: "ARPANET adopts TCP/IP",
    shortLabel: "TCP/IP Flag Day",
    year: getTimelineYearFromExactTimestamp(TCP_IP_FLAG_DAY_AT),
    exactTime: TCP_IP_FLAG_DAY_AT,
    dateLabel: "Jan 1, 1983",
    minZoom: 18,
    priority: 90,
    description:
      "ARPANET switches from NCP to TCP/IP in a coordinated flag-day transition.",
    sourceIds: ["computingInternetSocietyBriefHistory"],
  },
  {
    id: "world-wide-web-invented",
    label: "World Wide Web invented at CERN",
    shortLabel: "Web Invented",
    year: ce(1989),
    minZoom: 18,
    priority: 92,
    description:
      "Tim Berners-Lee invents the World Wide Web while working at CERN.",
    sourceIds: ["computingCernBirthWeb"],
  },
  {
    id: "world-wide-web-public-domain",
    label: "World Wide Web enters the public domain",
    shortLabel: "Web Public Domain",
    year: getTimelineYearFromExactTimestamp(WEB_PUBLIC_DOMAIN_AT),
    exactTime: WEB_PUBLIC_DOMAIN_AT,
    dateLabel: "Apr 30, 1993",
    minZoom: 19,
    priority: 93,
    description:
      "CERN places the World Wide Web software in the public domain.",
    sourceIds: ["computingCernBirthWeb"],
  },
  {
    id: "iphone-introduced-computing",
    label: "Apple introduces iPhone",
    shortLabel: "iPhone",
    year: getTimelineYearFromExactTimestamp(IPHONE_INTRODUCED_AT),
    exactTime: IPHONE_INTRODUCED_AT,
    dateLabel: "Jan 9, 2007",
    minZoom: 20,
    priority: 88,
    description:
      "Apple introduces iPhone as a phone, iPod, and Internet communicator in one device.",
    sourceIds: ["computingAppleIphone"],
  },
];
