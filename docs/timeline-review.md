# Timeline review and next steps

## Content decisions in this change

The default civilization layer should answer who held power, where, and when. Archaeological phases belong under a civilization where useful; individual objects, texts, and battles work better as markers. A band ending should describe a political or archaeological boundary, not imply that a people disappeared.

Mesopotamia is now Sumerian Cities → Akkad → Ur III along the southern sequence, followed by Babylonia. Assyria has its own northern sequence. Babylonia and Assyria retain expandable periods, including their Neo empires. Their parent spans describe regional traditions with interruptions in independence, not uninterrupted empires. The palette uses ochre for Sumer, terracotta for Akkad, muted violet for Assyria, and teal for Babylonia. Canaan and Elam bands and the Isin–Larsa detail band are removed to reduce density; necessary historical references remain.

The lane allocator reserves an entire affinity sequence before filling gaps with unrelated bands, checks actual interval overlap even when sorting uses date biases, and places lanes with the same regional home together. It reuses rows where possible; a row can still contain different regions in different centuries.

The focused description audit covers Mesopotamia, Egypt, the principal Bronze Age civilizations, Phoenicia, and selected Bronze Age markers. The entire later-history catalog has not had a new source-by-source review.

| Correction or addition | Evidence and editorial treatment |
| --- | --- |
| Neo-Assyria ends in 609 BCE | [Met: Assyria](https://www.metmuseum.org/essays/assyria-1365-609-b-c). Keep Nineveh's 612 BCE destruction as a separate marker. |
| Neo-Babylonia begins in 626 BCE | [SNL: Nabopolassar](https://snl.no/Nabopolassar). Ends with Cyrus's 539 BCE conquest, described in [Met: Babylon](https://www.metmuseum.org/essays/babylon). |
| Hittite Kingdom, approximately 1650–1200 BCE | [Met: Hittites](https://www.metmuseum.org/essays/the-hittites). “Kingdom” covers its early and imperial phases; southern successor states outlasted Hattusa. |
| Egyptian boundaries | Early Dynastic now starts with its parent at approximately 3100 BCE; First Intermediate ends at the existing Middle Kingdom start of approximately 2040 BCE. New Kingdom starts around 1550 BCE. Third Intermediate/Late Period handoff uses 664 BCE, following [UCL chronology](https://www.ucl.ac.uk/museums-static/digitalegypt/chronology/index.html) and [Met: Late Period](https://www.metmuseum.org/essays/egypt-in-the-late-period-ca-712-332-b-c). Earlier dates remain approximate; published chronologies differ. |
| Punt expedition | Replaced the inconsistent 1493 BCE date with approximately 1470 BCE, a conventional placement within Hatshepsut's reign. [Met exhibition](https://www.metmuseum.org/exhibitions/listings/2006/hatshepsut) establishes her reign and trading activity; [NOVA](https://www.pbs.org/wgbh/nova/ancient/expedition-punt.html) discusses the expedition. This is not an exact year claim. |
| Enheduanna, approximately 2300 BCE | [Morgan exhibition](https://www.themorgan.org/exhibitions/online/she-who-wrote/introduction). Distinguish the historical priestess from the later copies of works attributed to her. |
| Ur III collapse and early Akkadian Gilgamesh texts | [Met: Isin–Larsa and Old Babylonian periods](https://www.metmuseum.org/essays/the-isin-larsa-and-old-babylonian-periods-2004-1595-b-c). The Gilgamesh marker dates surviving textual tradition, not events in a legend. |
| Kassite southern unification, approximately 1475 BCE | [Met: Kassite period](https://www.metmuseum.org/essays/the-middle-babylonian-kassite-period-ca-1595-1155-b-c-in-mesopotamia). Distinguish regional consolidation from the conventional 1595 BCE period boundary. |
| Linear B, approximately 1450 BCE | [University of Oslo: DAMOS](https://damos.hf.uio.no/about/content/). Documents palace administration and early Greek, rather than claiming an exact invention date. |
| Akhetaten founded, approximately 1347 BCE | [Amarna Project](https://www.amarnaproject.com/discover-amarna/history-and-nature/). Uses the excavation project's approximate chronology. |

The strongest next additions would be **Kerma** for Bronze Age Nubia and **Urartu** as an Iron Age rival to Assyria. Kerma adds an African power alongside Egypt rather than another small Near Eastern polity; [British Museum](https://www.britishmuseum.org/collection/galleries/sudan-egypt-and-nubia) places its urban society around 2500–1500 BCE. Urartu adds a distinct northern region and material tradition; its destruction should retain uncertainty rather than name a definite conqueror ([Met](https://www.metmuseum.org/essays/urartu)). Add these before adding more small states. Revisit the current Kush label as “Napatan and Meroitic Kush” if Kerma is introduced.

The Iron Age subdivisions still deserve a separate editorial pass: their political boundaries are a viewing convention for the Near East, not universal stages of iron technology. Regional date schemes should eventually be explicit metadata. Likewise, culture bands such as Minoan and Indus should not be mistaken for single centralized states.

## Time implementation

Precision helpers now live in `src/lib/core/time/preciseYear.ts`, independent of the camera. Calendar conversion preserves the fractional year before adding the approximate index, so adjacent microseconds survive. Both camera animation implementations interpolate the split coordinates and preserve the exact target. Catalog compilation retains inline exact timestamps and derives approximate years from the authoritative timestamp.

`duration.ts` represents decimal seconds using a bigint coefficient and base-10 exponent. It centralizes elapsed-unit conversion and the minimum viewport span, supports exact subtraction before conversion to pixels, and serializes the coefficient as a string. Planck-scale differences can be represented and subtracted. The current calendar camera still has its existing precision and microsecond zoom limits; a dedicated Big Bang-relative logarithmic axis remains separate future work. This change does not claim Planck-scale navigation.

## Guided experiences: rebuilt reading mode

The compass menu opens a dedicated reading mode with six sourced Phoenician chapters. It uses the same `TimelineCanvas`, full Human catalog bands, era shading, expandable details, hover behavior, and pan/zoom gestures as the explorer. Future bands remain visible; the colored subject grows to the chapter date and future markers are withheld. Other powers retain faint versions of their existing colors. Chapter labels and descriptions use the site's paper, ink, and display type.

The explorer stays mounted behind a native modal dialog. The guide owns a local animated camera and chapter state; it never writes to navigation, layer, or viewport stores. Closing simply removes the dialog, leaving the explorer's camera, expanded bands, scroll offset, and preferences intact. The former global controller and changes to App's measured layout have been removed.

Every chapter centers its focal year horizontally. Reading mode extends the overlay scroll bounds so either the first or last row can reach the vertical center. Chapter changes and Recenter animate the focal row into place; direct scrolling cancels that movement. Normal explorer scroll bounds are unchanged. Labels crossing the growing highlight use the appropriate text color on each side.

Desktop uses a centered reading area above the canvas, with a small sourced catalog image. Phones omit the image and allow the description to collapse. Short landscape screens put the reader beside the canvas. Very short canvases omit ordinary event markers to preserve room for the bands and year axis. Chapter sources expand inside the scrollable reader. A chapter picker and Previous/Next controls stay outside that scroll area. Escape closes the picker first, then the experience; arrow keys step through chapters. Reduced motion disables the chapter/reveal animation.

Authored content lives in `experiences.ts`; camera framing and catalog selection live in `experienceModel.ts`. The UI and canvas controller are separate components. Regression checks cover catalog identity and future geometry, centering across widths and heights, normal scroll bounds, and deterministic emphasis. A browser connection is still required for visual QA and interaction checks on actual portrait/landscape devices.

## Further content and layout audit

Aksum is removed from the default civilization catalog as requested. The remaining default bands represent major regional powers or foundational archaeological civilizations. Retained Olmec culture because of its early influence across Mesoamerica ([British Museum](https://www.britishmuseum.org/collection/galleries/mexico)); it is not presented as a unified empire. Retained Mitanni, Kush, Minoan and Mycenaean societies, Khmer, Mali, and Songhai as substantial regional subjects rather than removing regional coverage to meet a modern superpower definition. No additional minor states were added.

Iranian and South Asian powers now have explicit lane sequences across eras. Olmec and Aztec share a regional sequence beside Maya; this is a placement preference, not a claim of political succession. The allocator handles regional sequences together, reuses compatible rows, and then reduces gaps between regional neighbors by reordering rows. Real overlaps still require separate rows. Checks cover Iranian alignment, Aztec/Maya adjacency, overlap safety, and density on the full civilization catalog.

Safavid and Aztec descriptions now identify their foundations and political endpoints. Safavid chronology follows [Met](https://www.metmuseum.org/essays/the-art-of-the-safavids-before-1600) and [Iranica](https://www.iranicaonline.org/articles/chronology-of-iranian-history-part-1/); Aztec chronology follows the existing [HISTORY source](https://www.history.com/topics/ancient-americas/aztecs). The broader catalog audit checked inclusion and lane metadata, not every later-history sentence against new sources.

## Tooltip and label adjustments

Desktop hover waits 220 ms before showing a tooltip. Touch remains immediate. Images start loading when the tooltip appears, with no additional image timer. The source expander has a pointer cursor. Native timeline zoom and overlay-scroll handlers exclude tooltip content, allowing its own scrolling to work. Tooltips use available viewport height before scrolling and still clear floating controls. Secondary era names occupy a separate italic line, with wrapping and clipping inside the column.
