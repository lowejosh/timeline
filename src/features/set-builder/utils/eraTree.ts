import { slugifyTimelineSetId } from "@/lib/catalog/setDocumentValidation";
import type {
  TimelineRawEraNode,
  TimelineRawSetDocument,
} from "@/lib/catalog/setSchema";

type EraNodeUpdater = (node: TimelineRawEraNode) => TimelineRawEraNode;

function collectEraIds(node: TimelineRawEraNode): string[] {
  return [
    node.id,
    ...(node.children ?? []).flatMap((child) => collectEraIds(child)),
  ];
}

export function getAllEraIds(document: TimelineRawSetDocument) {
  return new Set(
    document.families.flatMap((family) => collectEraIds(family.root)),
  );
}

export function createUniqueEraId(
  document: TimelineRawSetDocument,
  label: string,
) {
  const allIds = getAllEraIds(document);
  const baseId = `${document.metadata.id}-${slugifyTimelineSetId(label)}`;
  let candidate = baseId;
  let index = 2;

  while (allIds.has(candidate)) {
    candidate = `${baseId}-${index}`;
    index += 1;
  }

  return candidate;
}

export function createEraNode(
  document: TimelineRawSetDocument,
  label = "Untitled era",
): TimelineRawEraNode {
  return {
    id: createUniqueEraId(document, label),
    name: label,
    startYear: 1900,
    endYear: 2000,
    color: "#4f8a8b",
    description: "",
    children: [],
  };
}

function updateNode(
  node: TimelineRawEraNode,
  nodeId: string,
  updater: EraNodeUpdater,
): TimelineRawEraNode {
  if (node.id === nodeId) {
    return updater(node);
  }

  return {
    ...node,
    children: node.children?.map((child) => updateNode(child, nodeId, updater)),
  };
}

function insertChildNode(
  node: TimelineRawEraNode,
  parentId: string,
  childNode: TimelineRawEraNode,
): TimelineRawEraNode {
  if (node.id === parentId) {
    return {
      ...node,
      children: [...(node.children ?? []), childNode],
    };
  }

  return {
    ...node,
    children: node.children?.map((child) =>
      insertChildNode(child, parentId, childNode),
    ),
  };
}

function removeNode(
  node: TimelineRawEraNode,
  nodeId: string,
): TimelineRawEraNode {
  return {
    ...node,
    children: node.children
      ?.filter((child) => child.id !== nodeId)
      .map((child) => removeNode(child, nodeId)),
  };
}

export function updateEraNodeInDocument(
  document: TimelineRawSetDocument,
  nodeId: string,
  updater: EraNodeUpdater,
): TimelineRawSetDocument {
  return {
    ...document,
    families: document.families.map((family) => ({
      ...family,
      root: updateNode(family.root, nodeId, updater),
    })),
  };
}

export function addEraChildToDocument(
  document: TimelineRawSetDocument,
  familyId: string,
  parentId: string,
  childNode = createEraNode(document),
): TimelineRawSetDocument {
  return {
    ...document,
    families: document.families.map((family) =>
      family.id === familyId
        ? {
            ...family,
            root: insertChildNode(family.root, parentId, childNode),
          }
        : family,
    ),
  };
}

export function removeEraFromDocument(
  document: TimelineRawSetDocument,
  nodeId: string,
): TimelineRawSetDocument {
  return {
    ...document,
    families: document.families.map((family) => ({
      ...family,
      root:
        family.root.id === nodeId ? family.root : removeNode(family.root, nodeId),
    })),
  };
}
