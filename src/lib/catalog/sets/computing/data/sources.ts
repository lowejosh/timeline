import type { EraSource } from "@/lib/core/timelineTypes";

export const COMPUTING_SOURCES = {
  computingOxfordImaginingAi: {
    shortTitle: "Oxford HSM: Babbage & Lovelace",
    title: "Imagining AI - Babbage & Lovelace",
    organization: "History of Science Museum, University of Oxford",
    citation:
      'History of Science Museum, University of Oxford, "Imagining AI - Babbage & Lovelace."',
    url: "https://hsm.ox.ac.uk/imagining-ai",
  },
  computingAlanTuringSep: {
    shortTitle: "SEP: Alan Turing",
    title: "Alan Turing",
    organization: "Stanford Encyclopedia of Philosophy",
    citation:
      'Copeland, B. J., "Alan Turing," Stanford Encyclopedia of Philosophy.',
    url: "https://plato.stanford.edu/entries/turing/",
  },
  computingPennEniac: {
    shortTitle: "Penn Engineering: ENIAC",
    title: "ENIAC",
    organization: "Penn Engineering",
    citation: 'Penn Engineering, "ENIAC."',
    url: "https://www.seas.upenn.edu/about/history-heritage/eniac/",
  },
  computingEthwTransistor: {
    shortTitle: "ETHW: first transistor",
    title:
      "Milestones: Invention of the First Transistor at Bell Telephone Laboratories, Inc., 1947",
    organization: "Engineering and Technology History Wiki",
    citation:
      'Engineering and Technology History Wiki, "Milestones: Invention of the First Transistor at Bell Telephone Laboratories, Inc., 1947."',
    url: "https://ethw.org/Milestones:Invention_of_the_First_Transistor_at_Bell_Telephone_Laboratories,_Inc.,_1947",
  },
  computingChmTimeline: {
    shortTitle: "CHM: computer timeline",
    title: "Computers | Timeline of Computer History",
    organization: "Computer History Museum",
    citation: 'Computer History Museum, "Computers | Timeline of Computer History."',
    url: "https://computerhistory.org/timeline/computers/",
  },
  computingTiIntegratedCircuit: {
    shortTitle: "TI: integrated circuit",
    title: "The chip that changed the world",
    organization: "Texas Instruments",
    citation: 'Texas Instruments, "The chip that changed the world."',
    url: "https://www.ti.com/about-ti/newsroom/company-blog/the-chip-that-changed-the-world.html",
  },
  computingIbmSystem360: {
    shortTitle: "IBM: System/360",
    title: "The IBM System/360",
    organization: "IBM",
    citation: 'IBM, "The IBM System/360."',
    url: "https://www.ibm.com/history/system-360",
  },
  computingInternetSocietyBriefHistory: {
    shortTitle: "Internet Society: internet history",
    title: "A Brief History of the Internet",
    organization: "Internet Society",
    citation: 'Internet Society, "A Brief History of the Internet."',
    url: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/",
  },
  computingIbmPc: {
    shortTitle: "IBM: IBM PC",
    title: "The IBM PC",
    organization: "IBM",
    citation: 'IBM, "The IBM PC."',
    url: "https://www.ibm.com/history/personal-computer",
  },
  computingCernBirthWeb: {
    shortTitle: "CERN: birth of the Web",
    title: "The birth of the Web",
    organization: "CERN",
    citation: 'CERN, "The birth of the Web."',
    url: "https://home.cern/science/computing/birth-web",
  },
  computingAppleIphone: {
    shortTitle: "Apple: iPhone intro",
    title: "Apple Reinvents the Phone with iPhone",
    organization: "Apple",
    citation: 'Apple, "Apple Reinvents the Phone with iPhone."',
    url: "https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/",
  },
} as const satisfies Record<string, EraSource>;
