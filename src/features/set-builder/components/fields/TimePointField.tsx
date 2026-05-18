import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
  TimelineRawElapsedTimestamp,
  TimelineRawExactTimestamp,
  TimelineRawTimelinePoint,
} from "@/lib/catalog/setSchema";
import { cn } from "@/lib/utils";

type TimeMode = "ce" | "bce" | "years-ago" | "after-big-bang";

type TimePointFieldProps = {
  approximate?: boolean;
  exactTime?: TimelineRawExactTimestamp;
  id: string;
  label: string;
  required?: boolean;
  value: TimelineRawTimelinePoint;
  onChange: (next: {
    approximate?: boolean;
    exactTime?: TimelineRawExactTimestamp;
    value: TimelineRawTimelinePoint;
  }) => void;
};

const PRECISIONS = ["year", "month", "day", "hour", "minute"] as const;
const MODE_LABELS = {
  ce: "CE",
  bce: "BCE",
  "years-ago": "Years ago",
  "after-big-bang": "After Big Bang",
} satisfies Record<TimeMode, string>;

const selectClassName =
  "h-9 rounded-md border border-border bg-background/70 px-2 text-sm text-foreground transition-[border-color,box-shadow] focus:outline-none focus:ring-1 focus:ring-ring";

type TimePointState = {
  day: number;
  exact: boolean;
  hour: number;
  minute: number;
  mode: TimeMode;
  month: number;
  precision: (typeof PRECISIONS)[number];
  value: number;
};

function getPrecisionRank(precision: TimePointState["precision"]) {
  return PRECISIONS.indexOf(precision);
}

function hasPrecision(
  precision: TimePointState["precision"],
  minimum: TimePointState["precision"],
) {
  return getPrecisionRank(precision) >= getPrecisionRank(minimum);
}

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function getTimestampState(
  timestamp: TimelineRawExactTimestamp,
): TimePointState {
  if (timestamp.kind === "calendar") {
    return {
      day: timestamp.day ?? 1,
      exact: true,
      hour: timestamp.hour ?? 0,
      minute: timestamp.minute ?? 0,
      mode: timestamp.era,
      month: timestamp.month ?? 1,
      precision: PRECISIONS.includes(timestamp.precision as never)
        ? (timestamp.precision as TimePointState["precision"])
        : "year",
      value: timestamp.year,
    };
  }

  return {
    day: toNumber(timestamp.days, 0),
    exact: true,
    hour: toNumber(timestamp.hours, 0),
    minute: toNumber(timestamp.minutes, 0),
    mode:
      timestamp.reference === "after-big-bang"
        ? "after-big-bang"
        : "years-ago",
    month: 1,
    precision: PRECISIONS.includes(timestamp.precision as never)
      ? (timestamp.precision as TimePointState["precision"])
      : "year",
    value: toNumber(timestamp.years, 0),
  };
}

function getPointState(
  point: TimelineRawTimelinePoint,
  exactTime?: TimelineRawExactTimestamp,
): TimePointState {
  if (exactTime) {
    return getTimestampState(exactTime);
  }

  if (typeof point === "object" && "kind" in point) {
    if (point.kind === "calendar" || point.kind === "elapsed") {
      return getTimestampState(point);
    }

    return {
      day: 0,
      exact: false,
      hour: 0,
      minute: 0,
      mode:
        point.reference === "after-big-bang"
          ? "after-big-bang"
          : "years-ago",
      month: 1,
      precision: "year",
      value: toNumber(point.value, 0),
    };
  }

  if (point < 1) {
    return {
      day: 1,
      exact: false,
      hour: 0,
      minute: 0,
      mode: "bce",
      month: 1,
      precision: "year",
      value: 1 - point,
    };
  }

  return {
    day: 1,
    exact: false,
    hour: 0,
    minute: 0,
    mode: "ce",
    month: 1,
    precision: "year",
    value: point,
  };
}

function buildExactTimestamp(state: TimePointState): TimelineRawExactTimestamp {
  if (state.mode === "ce" || state.mode === "bce") {
    return {
      kind: "calendar",
      era: state.mode,
      year: Math.max(1, Math.trunc(state.value)),
      precision: state.precision,
      month: hasPrecision(state.precision, "month") ? state.month : undefined,
      day: hasPrecision(state.precision, "day") ? state.day : undefined,
      hour: hasPrecision(state.precision, "hour") ? state.hour : undefined,
      minute: hasPrecision(state.precision, "minute") ? state.minute : undefined,
    };
  }

  return {
    kind: "elapsed",
    reference: state.mode === "after-big-bang" ? "after-big-bang" : "ago",
    precision: state.precision,
    years: String(Math.max(0, Math.trunc(state.value))),
    days: hasPrecision(state.precision, "day") ? String(state.day) : undefined,
    hours: hasPrecision(state.precision, "hour") ? String(state.hour) : undefined,
    minutes: hasPrecision(state.precision, "minute")
      ? String(state.minute)
      : undefined,
  } satisfies TimelineRawElapsedTimestamp;
}

function buildPoint(state: TimePointState): {
  exactTime?: TimelineRawExactTimestamp;
  value: TimelineRawTimelinePoint;
} {
  if (state.exact) {
    const exactTime = buildExactTimestamp(state);

    return {
      exactTime,
      value: exactTime,
    };
  }

  if (state.mode === "ce") {
    return { value: state.value };
  }

  if (state.mode === "bce") {
    return { value: 1 - state.value };
  }

  return {
    value: {
      kind: "relative",
      reference: state.mode === "after-big-bang" ? "after-big-bang" : "ago",
      unit: "years",
      value: String(Math.max(0, state.value)),
    },
  };
}

export function TimePointField({
  approximate = false,
  exactTime,
  id,
  label,
  onChange,
  required = false,
  value,
}: TimePointFieldProps) {
  const state = getPointState(value, exactTime);

  const commit = (nextState: TimePointState, nextApproximate = approximate) => {
    onChange({
      ...buildPoint(nextState),
      approximate: nextApproximate,
    });
  };

  return (
    <Field htmlFor={`${id}-value`} label={label} required={required}>
      <div className="grid gap-2 rounded-md border border-border/70 bg-surface/25 p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_9rem] gap-2 max-sm:grid-cols-1">
          <Input
            className="h-9 rounded-md bg-background/70"
            id={`${id}-value`}
            min={state.mode === "bce" ? 1 : 0}
            onChange={(event) =>
              commit({
                ...state,
                value: toNumber(event.target.value, state.value),
              })
            }
            type="number"
            value={state.value}
          />
          <select
            className={selectClassName}
            onChange={(event) =>
              commit({
                ...state,
                mode: event.target.value as TimeMode,
              })
            }
            value={state.mode}
          >
            {Object.entries(MODE_LABELS).map(([mode, modeLabel]) => (
              <option key={mode} value={mode}>
                {modeLabel}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[0.76rem] font-semibold text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            <Checkbox
              checked={approximate}
              onChange={(event) => commit(state, event.target.checked)}
            />
            Approximate
          </label>
          <label className="inline-flex items-center gap-2">
            <Checkbox
              checked={state.exact}
              onChange={(event) =>
                commit({
                  ...state,
                  exact: event.target.checked,
                })
              }
            />
            Exact
          </label>
        </div>

        {state.exact ? (
          <div
            className={cn(
              "grid gap-2 border-t border-border/60 pt-2",
              state.mode === "ce" || state.mode === "bce"
                ? "grid-cols-4 max-sm:grid-cols-2"
                : "grid-cols-3 max-sm:grid-cols-2",
            )}
          >
            <select
              className={selectClassName}
              onChange={(event) =>
                commit({
                  ...state,
                  precision: event.target.value as TimePointState["precision"],
                })
              }
              value={state.precision}
            >
              {PRECISIONS.map((precision) => (
                <option key={precision} value={precision}>
                  {precision}
                </option>
              ))}
            </select>

            {(state.mode === "ce" || state.mode === "bce") &&
            hasPrecision(state.precision, "month") ? (
              <Input
                className="h-9 rounded-md bg-background/70"
                max={12}
                min={1}
                onChange={(event) =>
                  commit({
                    ...state,
                    month: toNumber(event.target.value, state.month),
                  })
                }
                type="number"
                value={state.month}
              />
            ) : null}
            {hasPrecision(state.precision, "day") ? (
              <Input
                className="h-9 rounded-md bg-background/70"
                max={state.mode === "ce" || state.mode === "bce" ? 31 : undefined}
                min={0}
                onChange={(event) =>
                  commit({
                    ...state,
                    day: toNumber(event.target.value, state.day),
                  })
                }
                type="number"
                value={state.day}
              />
            ) : null}
            {hasPrecision(state.precision, "hour") ? (
              <Input
                className="h-9 rounded-md bg-background/70"
                max={23}
                min={0}
                onChange={(event) =>
                  commit({
                    ...state,
                    hour: toNumber(event.target.value, state.hour),
                  })
                }
                type="number"
                value={state.hour}
              />
            ) : null}
            {hasPrecision(state.precision, "minute") ? (
              <Input
                className="h-9 rounded-md bg-background/70"
                max={59}
                min={0}
                onChange={(event) =>
                  commit({
                    ...state,
                    minute: toNumber(event.target.value, state.minute),
                  })
                }
                type="number"
                value={state.minute}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </Field>
  );
}
