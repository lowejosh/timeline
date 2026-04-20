import type {
  TimelineSidebarChildState,
  TimelineSidebarSetState,
} from "../../lib/data/timelineSidebar";
import type { TimelineSetId } from "../../lib/data/timelineTypes";
import { OverlayGroupIconSvg } from "../timeline/OverlayGroupIconSvg";

type TimelineSidebarProps = {
  sets: TimelineSidebarSetState[];
  expandedSetIds: ReadonlySet<TimelineSetId>;
  onToggleSet: (setId: TimelineSetId, nextEnabled: boolean) => void;
  onToggleSetExpanded: (setId: TimelineSetId, nextExpanded: boolean) => void;
  onToggleEntry: (
    entryId: string,
    groupIds: string[],
    nextEnabled: boolean,
  ) => void;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatVisibleCounts({
  markerCount,
  overlayCount,
}: Pick<TimelineSidebarChildState, "markerCount" | "overlayCount">) {
  const parts: string[] = [];

  if (overlayCount > 0) {
    parts.push(pluralize(overlayCount, "band"));
  }

  if (markerCount > 0) {
    parts.push(pluralize(markerCount, "marker"));
  }

  return parts;
}

function formatSetMeta(set: TimelineSidebarSetState) {
  const parts = formatVisibleCounts(set);

  if (parts.length === 0) {
    return "No visible items";
  }

  return parts.join(" · ");
}

function formatChildMeta(child: TimelineSidebarChildState) {
  const parts = formatVisibleCounts(child);

  if (parts.length === 0) {
    switch (child.contentType) {
      case "markers":
        parts.push("No visible markers");
        break;
      case "overlays":
        parts.push("No visible bands");
        break;
      case "mixed":
        parts.push("No visible items");
        break;
    }
  }

  return parts.join(" · ");
}

export function TimelineSidebar({
  sets,
  expandedSetIds,
  onToggleSet,
  onToggleSetExpanded,
  onToggleEntry,
}: TimelineSidebarProps) {
  return (
    <aside className="timeline-sidebar" aria-label="Timeline layer controls">
      <div className="timeline-sidebar__inner">
        <header className="timeline-sidebar__header">
          <h1 className="timeline-sidebar__title">Layers</h1>
          <span className="timeline-sidebar__title-meta">
            {pluralize(sets.length, "set")}
          </span>
        </header>

        <div className="timeline-sidebar__tree">
          {sets.map((set) => {
            const expanded = expandedSetIds.has(set.id);

            return (
              <section
                className="timeline-sidebar__set-shell"
                data-enabled={set.enabled ? "true" : "false"}
                key={set.id}
              >
                <div className="timeline-sidebar__set-card">
                  <div
                    className="timeline-sidebar__set-row"
                    onClick={() => {
                      onToggleSetExpanded(set.id, !expanded);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded}
                    aria-label={`${expanded ? "Collapse" : "Expand"} ${set.label}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onToggleSetExpanded(set.id, !expanded);
                      }
                    }}
                    data-expanded={expanded ? "true" : "false"}
                  >
                    <label
                      className="timeline-sidebar__toggle timeline-sidebar__toggle--set-checkbox"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      <input
                        checked={set.enabled}
                        onChange={(event) => {
                          onToggleSet(set.id, event.currentTarget.checked);
                        }}
                        type="checkbox"
                      />
                      <span
                        aria-hidden="true"
                        className="timeline-sidebar__checkbox"
                      />
                    </label>

                    <span className="timeline-sidebar__set-copy">
                      <span
                        className="timeline-sidebar__item-title"
                        title={set.description}
                      >
                        {set.label}
                      </span>
                      <span className="timeline-sidebar__item-meta">
                        {formatSetMeta(set)}
                      </span>
                    </span>

                    <svg
                      aria-hidden="true"
                      className="timeline-sidebar__disclosure-glyph"
                      viewBox="0 0 12 12"
                    >
                      <path d="M3 4.5 6 7.5 9 4.5" />
                    </svg>
                  </div>

                  {expanded ? (
                    <ul className="timeline-sidebar__item-list timeline-sidebar__child-list">
                      {set.children.map((child) => (
                        <li
                          className="timeline-sidebar__item timeline-sidebar__item--child"
                          data-parent-enabled={set.enabled ? "true" : "false"}
                          key={child.id}
                        >
                          <label className="timeline-sidebar__toggle timeline-sidebar__toggle--item timeline-sidebar__toggle--child">
                            <input
                              checked={child.enabled}
                              disabled={!set.enabled}
                              onChange={(event) => {
                                onToggleEntry(
                                  child.id,
                                  child.groupIds,
                                  event.currentTarget.checked,
                                );
                              }}
                              ref={(element) => {
                                if (element) {
                                  element.indeterminate = child.mixed;
                                }
                              }}
                              type="checkbox"
                            />
                            <span
                              className="timeline-sidebar__checkbox"
                              aria-hidden="true"
                            />
                            <span className="timeline-sidebar__toggle-copy">
                              <span className="timeline-sidebar__item-header">
                                <span className="timeline-sidebar__item-title">
                                  {child.label}
                                </span>
                                <OverlayGroupIconSvg
                                  className="timeline-sidebar__item-icon"
                                  groupId={child.id}
                                />
                              </span>
                              <span className="timeline-sidebar__item-meta">
                                {formatChildMeta(child)}
                              </span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
