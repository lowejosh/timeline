import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { slugifyTimelineSetId } from "@/lib/catalog/setDocumentValidation";
import type {
  TimelineRawDecorationGroup,
  TimelineRawEraNode,
  TimelineRawOverlay,
  TimelineRawSetDocument,
  TimelineRawSetMetadata,
} from "@/lib/catalog/setSchema";

type SetBuilderMetadataFormProps = {
  document: TimelineRawSetDocument;
  lockSetId: boolean;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
};

function replaceGeneratedId(value: string | undefined, fromId: string, toId: string) {
  if (!value || !fromId || fromId === toId) {
    return value;
  }

  if (value === fromId) {
    return toId;
  }

  if (value.startsWith(`${fromId}-`)) {
    return `${toId}${value.slice(fromId.length)}`;
  }

  return value;
}

function replaceGeneratedIds(
  values: readonly string[] | undefined,
  fromId: string,
  toId: string,
) {
  return values?.map((value) => replaceGeneratedId(value, fromId, toId) ?? value);
}

function renameRecordKeys<T>(
  record: Record<string, T>,
  fromId: string,
  toId: string,
) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      replaceGeneratedId(key, fromId, toId) ?? key,
      value,
    ]),
  ) as Record<string, T>;
}

function renameGroupIds(
  group: TimelineRawDecorationGroup,
  fromId: string,
  toId: string,
): TimelineRawDecorationGroup {
  return {
    ...group,
    id: replaceGeneratedId(group.id, fromId, toId) ?? group.id,
    children: group.children?.map((child) =>
      renameGroupIds(child, fromId, toId),
    ),
  };
}

function renameEraIds(
  era: TimelineRawEraNode,
  fromId: string,
  toId: string,
): TimelineRawEraNode {
  return {
    ...era,
    id: replaceGeneratedId(era.id, fromId, toId) ?? era.id,
    sourceIds: replaceGeneratedIds(era.sourceIds, fromId, toId),
    children: era.children?.map((child) => renameEraIds(child, fromId, toId)),
  };
}

function renameOverlayIds(
  overlay: TimelineRawOverlay,
  fromId: string,
  toId: string,
): TimelineRawOverlay {
  return {
    ...overlay,
    id: replaceGeneratedId(overlay.id, fromId, toId) ?? overlay.id,
    groupId: replaceGeneratedId(overlay.groupId, fromId, toId),
    sourceIds: replaceGeneratedIds(overlay.sourceIds, fromId, toId),
    children: overlay.children?.map((child) =>
      renameOverlayIds(child, fromId, toId),
    ),
  };
}

function renameGeneratedDocumentIds(
  document: TimelineRawSetDocument,
  fromId: string,
  toId: string,
): TimelineRawSetDocument {
  if (!fromId || fromId === toId) {
    return document;
  }

  return {
    ...document,
    metadata: {
      ...document.metadata,
      id: toId,
    },
    sources: renameRecordKeys(document.sources, fromId, toId),
    categories: document.categories.map((category) => ({
      ...category,
      id: replaceGeneratedId(category.id, fromId, toId) ?? category.id,
      groups: category.groups.map((group) =>
        renameGroupIds(group, fromId, toId),
      ),
    })),
    families: document.families.map((family) => ({
      ...family,
      id: replaceGeneratedId(family.id, fromId, toId) ?? family.id,
      root: renameEraIds(family.root, fromId, toId),
    })),
    markers: document.markers.map((marker) => ({
      ...marker,
      id: replaceGeneratedId(marker.id, fromId, toId) ?? marker.id,
      groupId: replaceGeneratedId(marker.groupId, fromId, toId),
      sourceIds: replaceGeneratedIds(marker.sourceIds, fromId, toId),
    })),
    overlays: document.overlays.map((overlay) =>
      renameOverlayIds(overlay, fromId, toId),
    ),
    overlayLaneBias: document.overlayLaneBias
      ? renameRecordKeys(document.overlayLaneBias, fromId, toId)
      : document.overlayLaneBias,
  };
}

export function SetBuilderMetadataForm({
  document,
  lockSetId,
  onDocumentChange,
}: SetBuilderMetadataFormProps) {
  const updateMetadata = (metadata: TimelineRawSetMetadata) => {
    onDocumentChange({
      ...document,
      metadata,
    });
  };

  const updateName = (label: string) => {
    const currentId = document.metadata.id;
    const previousAutoId = slugifyTimelineSetId(document.metadata.label);
    const nextId = slugifyTimelineSetId(label);
    const shouldRenameGeneratedIds =
      !lockSetId &&
      currentId.length > 0 &&
      currentId === previousAutoId &&
      currentId !== nextId;

    const nextDocument = shouldRenameGeneratedIds
      ? renameGeneratedDocumentIds(document, currentId, nextId)
      : document;

    onDocumentChange({
      ...nextDocument,
      metadata: {
        ...nextDocument.metadata,
        id: shouldRenameGeneratedIds ? nextId : nextDocument.metadata.id,
        label,
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-sm:h-auto max-sm:overflow-visible max-sm:p-3">
      <div className="grid w-full gap-6 max-sm:gap-4">
        <Field htmlFor="set-builder-name" label="Set name">
          <Input
            autoComplete="off"
            className="h-11 rounded-md bg-background/70 px-4"
            id="set-builder-name"
            onChange={(event) => updateName(event.target.value)}
            placeholder="Custom set"
            value={document.metadata.label}
          />
        </Field>

        <Field htmlFor="set-builder-description" label="Description">
          <Textarea
            className="bg-background/70 px-4"
            id="set-builder-description"
            onChange={(event) =>
              updateMetadata({
                ...document.metadata,
                description: event.target.value,
              })
            }
            placeholder="Describe this set"
            value={document.metadata.description ?? ""}
          />
        </Field>

        <Field htmlFor="set-builder-tags" label="Tags">
          <TagInput
            className="bg-background/70"
            id="set-builder-tags"
            onValueChange={(tags) =>
              updateMetadata({
                ...document.metadata,
                tags,
              })
            }
            value={document.metadata.tags ?? []}
          />
        </Field>
      </div>
    </div>
  );
}
