import type { EraDefinition } from "@/lib/core/timelineTypes";
import { ce } from "@/lib/core/timelineDateBuilders";
import { TIMELINE_MAX_YEAR } from "@/lib/core/timelineYears";

export const COMPUTING_HISTORY_ERA_DEFINITIONS: EraDefinition[] = [
  {
    id: "computing-foundations",
    name: "Foundations",
    startYear: ce(1614),
    endYear: ce(1936),
    approximateStart: true,
    approximateEnd: true,
    description:
      "Mechanical calculation, programmable-machine concepts, and formal computation take shape before electronic computers arrive.",
    scheme: "history-of-science",
  },
  {
    id: "electromechanical-wartime-computing",
    name: "Wartime Computing",
    startYear: ce(1936),
    endYear: ce(1948),
    approximateStart: true,
    approximateEnd: true,
    description:
      "Theory meets codebreaking and early electronic machines as computing becomes a practical wartime technology.",
    scheme: "history-of-science",
  },
  {
    id: "stored-program-computing",
    name: "Stored-Program Computing",
    startYear: ce(1948),
    endYear: ce(1958),
    approximateEnd: true,
    description:
      "Stored-program machines establish the basic architecture modern computers still inherit.",
    scheme: "history-of-science",
  },
  {
    id: "semiconductor-computing",
    name: "Semiconductor",
    startYear: ce(1958),
    endYear: ce(1971),
    approximateEnd: true,
    description:
      "Transistors, integrated circuits, and platform families make computers smaller, more reliable, and more scalable.",
    scheme: "history-of-science",
  },
  {
    id: "personal-computing",
    name: "Personal",
    startYear: ce(1971),
    endYear: ce(1989),
    approximateEnd: true,
    description:
      "Microcomputers move computing from institutions toward desks, homes, and schools.",
    scheme: "history-of-science",
  },
  {
    id: "web-mobile-cloud",
    name: "Web Era",
    startYear: ce(1989),
    endYear: TIMELINE_MAX_YEAR,
    description:
      "The web, smartphones, and large-scale network infrastructure make computing globally connected and ambient.",
    scheme: "history-of-science",
  },
];
