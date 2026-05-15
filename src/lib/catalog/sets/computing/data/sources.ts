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
  computingEniacWikipedia: {
    shortTitle: "Wikipedia: ENIAC",
    title: "ENIAC",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "ENIAC." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/ENIAC",
  },
  computingUnivacWikipedia: {
    shortTitle: "Wikipedia: UNIVAC I",
    title: "UNIVAC I",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "UNIVAC I." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/UNIVAC_I",
  },
  computingIbm1401Wikipedia: {
    shortTitle: "Wikipedia: IBM 1401",
    title: "IBM 1401",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "IBM 1401." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/IBM_1401",
  },
  computingCdc6600Wikipedia: {
    shortTitle: "Wikipedia: CDC 6600",
    title: "CDC 6600",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "CDC 6600." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/CDC_6600",
  },
  computingIbmSystem360Wikipedia: {
    shortTitle: "Wikipedia: System/360",
    title: "IBM System/360",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "IBM System/360." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/IBM_System/360",
  },
  computingXeroxAltoWikipedia: {
    shortTitle: "Wikipedia: Xerox Alto",
    title: "Xerox Alto",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Xerox Alto." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Xerox_Alto",
  },
  computingPdp8Wikipedia: {
    shortTitle: "Wikipedia: PDP-8",
    title: "PDP-8",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "PDP-8." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/PDP-8",
  },
  computingVax11780Wikipedia: {
    shortTitle: "Wikipedia: VAX-11/780",
    title: "VAX-11/780",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "VAX-11/780." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/VAX-11/780",
  },
  computingCray1Wikipedia: {
    shortTitle: "Wikipedia: Cray-1",
    title: "Cray-1",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Cray-1." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Cray-1",
  },
  computingKenbak1Wikipedia: {
    shortTitle: "Wikipedia: Kenbak-1",
    title: "Kenbak-1",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Kenbak-1." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Kenbak-1",
  },
  computingAltair8800Wikipedia: {
    shortTitle: "Wikipedia: Altair 8800",
    title: "Altair 8800",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Altair 8800." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Altair_8800",
  },
  computingAppleIiWikipedia: {
    shortTitle: "Wikipedia: Apple II",
    title: "Apple II",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Apple II." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Apple_II",
  },
  computingCommodorePetWikipedia: {
    shortTitle: "Wikipedia: Commodore PET",
    title: "Commodore PET",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Commodore PET." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Commodore_PET",
  },
  computingTrs80Wikipedia: {
    shortTitle: "Wikipedia: TRS-80",
    title: "TRS-80",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "TRS-80." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/TRS-80",
  },
  computingAtari8BitWikipedia: {
    shortTitle: "Wikipedia: Atari 8-bit",
    title: "Atari 8-bit computers",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Atari 8-bit computers." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Atari_8-bit_computers",
  },
  computingBbcMicroWikipedia: {
    shortTitle: "Wikipedia: BBC Micro",
    title: "BBC Micro",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "BBC Micro." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/BBC_Micro",
  },
  computingZxSpectrumWikipedia: {
    shortTitle: "Wikipedia: ZX Spectrum",
    title: "ZX Spectrum",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "ZX Spectrum." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/ZX_Spectrum",
  },
  computingOsborne1Wikipedia: {
    shortTitle: "Wikipedia: Osborne 1",
    title: "Osborne 1",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Osborne 1." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Osborne_1",
  },
  computingIbmPcWikipedia: {
    shortTitle: "Wikipedia: IBM PC",
    title: "IBM Personal Computer",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "IBM Personal Computer." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/IBM_Personal_Computer",
  },
  computingCompaqPortableWikipedia: {
    shortTitle: "Wikipedia: Compaq Portable",
    title: "Compaq Portable",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Compaq Portable." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Compaq_Portable",
  },
  computingCommodore64Wikipedia: {
    shortTitle: "Wikipedia: Commodore 64",
    title: "Commodore 64",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Commodore 64." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Commodore_64",
  },
  computingAppleLisaWikipedia: {
    shortTitle: "Wikipedia: Apple Lisa",
    title: "Apple Lisa",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Apple Lisa." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Apple_Lisa",
  },
  computingNextcubeWikipedia: {
    shortTitle: "Wikipedia: NeXTcube",
    title: "NeXTcube",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "NeXTcube." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/NeXTcube",
  },
  computingPowerBook100Wikipedia: {
    shortTitle: "Wikipedia: PowerBook 100",
    title: "PowerBook 100",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "PowerBook 100." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/PowerBook_100",
  },
  computingMacintosh128kWikipedia: {
    shortTitle: "Wikipedia: Macintosh 128K",
    title: "Macintosh 128K",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Macintosh 128K." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Macintosh_128K",
  },
  computingImacG3Wikipedia: {
    shortTitle: "Wikipedia: iMac G3",
    title: "iMac G3",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "iMac G3." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/IMac_G3",
  },
  computingMacbookAirWikipedia: {
    shortTitle: "Wikipedia: MacBook Air",
    title: "MacBook Air (Intel-based)",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "MacBook Air (Intel-based)." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/MacBook_Air_(Intel-based)",
  },
  computingIphone1Wikipedia: {
    shortTitle: "Wikipedia: iPhone (1st gen)",
    title: "iPhone (1st generation)",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "iPhone (1st generation)." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/IPhone_(1st_generation)",
  },
  computingUnixWikipedia: {
    shortTitle: "Wikipedia: Unix",
    title: "Unix",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Unix." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Unix",
  },
  computingEthernetWikipedia: {
    shortTitle: "Wikipedia: Ethernet",
    title: "Ethernet",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Ethernet." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Ethernet",
  },
  computingIntel4004Wikipedia: {
    shortTitle: "Wikipedia: Intel 4004",
    title: "Intel 4004",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Intel 4004." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Intel_4004",
  },
  computingVisicalcWikipedia: {
    shortTitle: "Wikipedia: VisiCalc",
    title: "VisiCalc",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "VisiCalc." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/VisiCalc",
  },
  computingGnuProjectWikipedia: {
    shortTitle: "Wikipedia: GNU Project",
    title: "GNU Project",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "GNU Project." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/GNU_Project",
  },
  computingLinuxWikipedia: {
    shortTitle: "Wikipedia: Linux",
    title: "Linux",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Linux." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Linux",
  },
  computingMosaicWikipedia: {
    shortTitle: "Wikipedia: NCSA Mosaic",
    title: "NCSA Mosaic",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "NCSA Mosaic." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/NCSA_Mosaic",
  },
  computingJavascriptWikipedia: {
    shortTitle: "Wikipedia: JavaScript",
    title: "JavaScript",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "JavaScript." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/JavaScript",
  },
  computingUsbWikipedia: {
    shortTitle: "Wikipedia: USB",
    title: "USB",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "USB." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/USB",
  },
  computingWifiWikipedia: {
    shortTitle: "Wikipedia: Wi-Fi",
    title: "Wi-Fi",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Wi-Fi." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Wi-Fi",
  },
  computingAwsWikipedia: {
    shortTitle: "Wikipedia: AWS",
    title: "Amazon Web Services",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Amazon Web Services." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Amazon_Web_Services",
  },
  computingShannonWikipedia: {
    shortTitle: "Wikipedia: Shannon",
    title: "Claude Shannon",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Claude Shannon." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Claude_Shannon",
  },
  computingFortranWikipedia: {
    shortTitle: "Wikipedia: Fortran",
    title: "Fortran",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Fortran." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Fortran",
  },
  computingCobolWikipedia: {
    shortTitle: "Wikipedia: COBOL",
    title: "COBOL",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "COBOL." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/COBOL",
  },
  computingRelationalModelWikipedia: {
    shortTitle: "Wikipedia: relational model",
    title: "Relational model",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Relational model." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Relational_model",
  },
  computingBasicWikipedia: {
    shortTitle: "Wikipedia: BASIC",
    title: "BASIC",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "BASIC." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/BASIC",
  },
  computingCLanguageWikipedia: {
    shortTitle: "Wikipedia: C",
    title: "C (programming language)",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "C (programming language)." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/C_(programming_language)",
  },
  computingEmailWikipedia: {
    shortTitle: "Wikipedia: email",
    title: "Email",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Email." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Email",
  },
  computingPublicKeyCryptographyWikipedia: {
    shortTitle: "Wikipedia: public-key crypto",
    title: "Public-key cryptography",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Public-key cryptography." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Public-key_cryptography",
  },
  computingCpmWikipedia: {
    shortTitle: "Wikipedia: CP/M",
    title: "CP/M",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "CP/M." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/CP/M",
  },
  computingDnsWikipedia: {
    shortTitle: "Wikipedia: DNS",
    title: "Domain Name System",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Domain Name System." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Domain_Name_System",
  },
  computingWindowsWikipedia: {
    shortTitle: "Wikipedia: Windows",
    title: "Microsoft Windows",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Microsoft Windows." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Microsoft_Windows",
  },
  computingPythonWikipedia: {
    shortTitle: "Wikipedia: Python",
    title: "Python (programming language)",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Python (programming language)." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Python_(programming_language)",
  },
  computingJavaWikipedia: {
    shortTitle: "Wikipedia: Java",
    title: "Java (programming language)",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Java (programming language)." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Java_(programming_language)",
  },
  computingBooleanAlgebraWikipedia: {
    shortTitle: "Wikipedia: Boolean algebra",
    title: "Boolean algebra",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Boolean algebra." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Boolean_algebra",
  },
  computingHollerithWikipedia: {
    shortTitle: "Wikipedia: Hollerith machine",
    title: "Tabulating machine",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Tabulating machine." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Tabulating_machine",
  },
  computingColossusWikipedia: {
    shortTitle: "Wikipedia: Colossus",
    title: "Colossus computer",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Colossus computer." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Colossus_computer",
  },
  computingVonNeumannArchitectureWikipedia: {
    shortTitle: "Wikipedia: von Neumann architecture",
    title: "Von Neumann architecture",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Von Neumann architecture." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Von_Neumann_architecture",
  },
  computingJacquardWikipedia: {
    shortTitle: "Wikipedia: Jacquard machine",
    title: "Jacquard machine",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Jacquard machine." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Jacquard_machine",
  },
  computingLambdaCalculusWikipedia: {
    shortTitle: "Wikipedia: lambda calculus",
    title: "Lambda calculus",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Lambda calculus." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Lambda_calculus",
  },
  computingShannonThesisWikipedia: {
    shortTitle: "Wikipedia: Shannon thesis",
    title: "A Symbolic Analysis of Relay and Switching Circuits",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "A Symbolic Analysis of Relay and Switching Circuits." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/A_Symbolic_Analysis_of_Relay_and_Switching_Circuits",
  },
  computingManchesterBabyWikipedia: {
    shortTitle: "Wikipedia: Manchester Baby",
    title: "Manchester Baby",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Manchester Baby." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Manchester_Baby",
  },
  computingMosfetWikipedia: {
    shortTitle: "Wikipedia: MOSFET",
    title: "MOSFET",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "MOSFET." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/MOSFET",
  },
  computingLispWikipedia: {
    shortTitle: "Wikipedia: Lisp",
    title: "Lisp (programming language)",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Lisp (programming language)." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Lisp_(programming_language)",
  },
  computingAlgolWikipedia: {
    shortTitle: "Wikipedia: ALGOL",
    title: "ALGOL",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "ALGOL." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/ALGOL",
  },
  computingSimulaWikipedia: {
    shortTitle: "Wikipedia: Simula",
    title: "Simula",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Simula." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Simula",
  },
  computingStructuredProgrammingWikipedia: {
    shortTitle: "Wikipedia: structured programming",
    title: "Structured programming",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Structured programming." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Structured_programming",
  },
  computingPascalWikipedia: {
    shortTitle: "Wikipedia: Pascal",
    title: "Pascal (programming language)",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Pascal (programming language)." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Pascal_(programming_language)",
  },
  computingSmalltalkWikipedia: {
    shortTitle: "Wikipedia: Smalltalk",
    title: "Smalltalk",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Smalltalk." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Smalltalk",
  },
  computingSqlWikipedia: {
    shortTitle: "Wikipedia: SQL",
    title: "SQL",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "SQL." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/SQL",
  },
  computingCppWikipedia: {
    shortTitle: "Wikipedia: C++",
    title: "C++",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "C++." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/C%2B%2B",
  },
  computingPhpWikipedia: {
    shortTitle: "Wikipedia: PHP",
    title: "PHP",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "PHP." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/PHP",
  },
  computingRubyWikipedia: {
    shortTitle: "Wikipedia: Ruby",
    title: "Ruby (programming language)",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Ruby (programming language)." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Ruby_(programming_language)",
  },
  computingBinaryNumberWikipedia: {
    shortTitle: "Wikipedia: binary number",
    title: "Binary number",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Binary number." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Binary_number",
  },
  computingDifferentialAnalyzerWikipedia: {
    shortTitle: "Wikipedia: differential analyser",
    title: "Differential analyser",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Differential analyser." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Differential_analyser",
  },
  computingLogarithmWikipedia: {
    shortTitle: "Wikipedia: logarithm",
    title: "Logarithm",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Logarithm." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Logarithm",
  },
  computingPascalineWikipedia: {
    shortTitle: "Wikipedia: Pascaline",
    title: "Pascal's calculator",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Pascal\'s calculator." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Pascal%27s_calculator",
  },
  computingSteppedReckonerWikipedia: {
    shortTitle: "Wikipedia: Stepped Reckoner",
    title: "Stepped Reckoner",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Stepped Reckoner." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Stepped_Reckoner",
  },
  computingAnalyticalEngineWikipedia: {
    shortTitle: "Wikipedia: Analytical Engine",
    title: "Analytical Engine",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Analytical Engine." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Analytical_Engine",
  },
  computingGodelWikipedia: {
    shortTitle: "Wikipedia: Godel incompleteness",
    title: "Godel's incompleteness theorems",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Gödel\'s incompleteness theorems." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/G%C3%B6del%27s_incompleteness_theorems",
  },
  computingZ1Wikipedia: {
    shortTitle: "Wikipedia: Z1",
    title: "Z1 (computer)",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Z1 (computer)." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Z1_(computer)",
  },
  computingZ3Wikipedia: {
    shortTitle: "Wikipedia: Z3",
    title: "Z3 (computer)",
    organization: "Wikimedia Foundation",
    citation:
      'Wikipedia contributors, "Z3 (computer)." In Wikipedia, The Free Encyclopedia.',
    url: "https://en.wikipedia.org/wiki/Z3_(computer)",
  },
} as const satisfies Record<string, EraSource>;
