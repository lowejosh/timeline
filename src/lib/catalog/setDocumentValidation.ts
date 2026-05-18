import {
  normalizeTimelineSetDocument,
  type TimelineRawSetDocument,
} from "./setSchema";
import {
  compileTimelineCatalog,
  STATIC_TIMELINE_CATALOG,
  type TimelineCatalogSnapshot,
} from "./timelineCatalog";

export type TimelineSetDocumentIssue = {
  severity: "error" | "warning";
  message: string;
};

export function slugifyTimelineSetId(label: string) {
  const slug = label
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "custom-set";
}

export function createEmptyTimelineSetDocument(
  seed = "Custom Set",
): TimelineRawSetDocument {
  const id = slugifyTimelineSetId(seed);
  const groupId = `${id}-markers`;
  const categoryId = `${id}-category`;
  const familyId = `${id}-eras`;
  const rootEraId = `${id}-root`;
  const sourceId = `${id}-source`;

  return {
    version: 1,
    metadata: {
      id,
      label: seed,
      description: "",
      tags: ["custom"],
      order: 10_000,
      defaultEnabled: true,
    },
    sources: {
      [sourceId]: {
        shortTitle: "Custom source",
        title: "Custom source",
        organization: "User supplied",
        citation: "User supplied custom timeline set.",
      },
    },
    categories: [
      {
        id: categoryId,
        label: "Custom timeline",
        description: "",
        order: 10_000,
        groups: [
          {
            id: groupId,
            label: "Milestones",
            description: "",
            contentType: "mixed",
            order: 1,
            defaultEnabled: true,
          },
        ],
      },
    ],
    families: [
      {
        id: familyId,
        label: "Custom eras",
        description: "",
        order: 10_000,
        priority: 10,
        defaultEnabled: true,
        root: {
          id: rootEraId,
          name: seed,
          startYear: 1900,
          endYear: 2000,
          color: "#4f8a8b",
          description: "",
          children: [],
        },
      },
    ],
    markers: [],
    overlays: [],
    overlayLaneBias: {},
  } satisfies TimelineRawSetDocument;
}

export function getTimelineSetDocumentIssues(
  document: TimelineRawSetDocument,
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
): TimelineSetDocumentIssue[] {
  const issues: TimelineSetDocumentIssue[] = [];

  try {
    const normalized = normalizeTimelineSetDocument(document);

    compileTimelineCatalog([...catalog.sets, normalized]);
  } catch (error) {
    issues.push({
      severity: "error",
      message: error instanceof Error ? error.message : "Invalid set document.",
    });
  }

  return issues;
}

export function validateTimelineSetDocument(
  document: TimelineRawSetDocument,
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
) {
  return getTimelineSetDocumentIssues(document, catalog).every(
    (issue) => issue.severity !== "error",
  );
}
