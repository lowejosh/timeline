import { useEffect, useState } from "react";
import type { TimelineSidebarSectionState } from "../../lib/data/timelineSidebar";
import { OverlayGroupIconSvg } from "../timeline/OverlayGroupIconSvg";

type RenderedTimelineSidebarSection = TimelineSidebarSectionState & {
  phase: "entering" | "present" | "exiting";
};

const SIDEBAR_SECTION_TRANSITION_MS = 260;
const SIDEBAR_SECTION_ORDER: Record<string, number> = {
  overlays: 0,
  markers: 1,
};

function sortRenderedSections(
  left: Pick<RenderedTimelineSidebarSection, "id">,
  right: Pick<RenderedTimelineSidebarSection, "id">,
) {
  return (
    (SIDEBAR_SECTION_ORDER[left.id] ?? Number.MAX_SAFE_INTEGER) -
      (SIDEBAR_SECTION_ORDER[right.id] ?? Number.MAX_SAFE_INTEGER) ||
    left.id.localeCompare(right.id)
  );
}

function mergeRenderedSections(
  previous: RenderedTimelineSidebarSection[],
  next: TimelineSidebarSectionState[],
) {
  const previousById = new Map(
    previous.map((section) => [section.id, section]),
  );
  const nextIds = new Set(next.map((section) => section.id));
  const merged = next.map<RenderedTimelineSidebarSection>((section) => {
    const existing = previousById.get(section.id);

    return {
      ...section,
      phase: existing
        ? existing.phase === "exiting"
          ? "entering"
          : "present"
        : "entering",
    };
  });

  for (const section of previous) {
    if (!nextIds.has(section.id)) {
      merged.push({
        ...section,
        phase: "exiting",
      });
    }
  }

  return merged.sort(sortRenderedSections);
}

type TimelineSidebarProps = {
  sections: TimelineSidebarSectionState[];
  onToggleEntry: (
    entryId: string,
    groupIds: string[],
    nextEnabled: boolean,
  ) => void;
};

export function TimelineSidebar({
  sections,
  onToggleEntry,
}: TimelineSidebarProps) {
  const [renderedSections, setRenderedSections] = useState<
    RenderedTimelineSidebarSection[]
  >(() =>
    sections
      .map((section) => ({
        ...section,
        phase: "present" as const,
      }))
      .sort(sortRenderedSections),
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRenderedSections((previous) => {
        if (previous.length === 0) {
          return sections
            .map((section) => ({
              ...section,
              phase: "present" as const,
            }))
            .sort(sortRenderedSections);
        }

        return mergeRenderedSections(previous, sections);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  useEffect(() => {
    const enteringIds = renderedSections
      .filter((section) => section.phase === "entering")
      .map((section) => section.id);

    if (enteringIds.length === 0) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setRenderedSections((previous) =>
        previous.map((section) =>
          enteringIds.includes(section.id)
            ? {
                ...section,
                phase: "present",
              }
            : section,
        ),
      );
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [renderedSections]);

  useEffect(() => {
    const hasExitingSections = renderedSections.some(
      (section) => section.phase === "exiting",
    );

    if (!hasExitingSections) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setRenderedSections((previous) =>
        previous.filter((section) => section.phase !== "exiting"),
      );
    }, SIDEBAR_SECTION_TRANSITION_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [renderedSections]);

  return (
    <aside className="timeline-sidebar" aria-label="Timeline layer controls">
      <div className="timeline-sidebar__inner">
        <header className="timeline-sidebar__header">
          <h1 className="timeline-sidebar__title">Layers</h1>
        </header>

        <div className="timeline-sidebar__sections">
          {renderedSections.map((section) => {
            return (
              <div
                className="timeline-sidebar__section-shell"
                data-phase={section.phase}
                key={section.id}
              >
                <section className="timeline-sidebar__section">
                  <h2 className="timeline-sidebar__section-title">
                    {section.label}
                  </h2>

                  <ul className="timeline-sidebar__item-list">
                    {section.entries.map((entry) => (
                      <li className="timeline-sidebar__item" key={entry.id}>
                        <label className="timeline-sidebar__toggle timeline-sidebar__toggle--item">
                          <input
                            checked={entry.enabled}
                            disabled={section.phase === "exiting"}
                            onChange={(event) => {
                              onToggleEntry(
                                entry.id,
                                entry.groupIds,
                                event.currentTarget.checked,
                              );
                            }}
                            ref={(element) => {
                              if (element) {
                                element.indeterminate = entry.mixed;
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
                                {entry.label}
                              </span>
                              <OverlayGroupIconSvg
                                className="timeline-sidebar__item-icon"
                                groupId={section.id === "overlays" ? entry.id : undefined}
                              />
                            </span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
