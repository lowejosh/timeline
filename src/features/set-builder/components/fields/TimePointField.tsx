import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import type {
  TimelineRawElapsedTimestamp,
  TimelineRawExactTimestamp,
  TimelineRawTimelinePoint,
} from "@/lib/catalog/setSchema";

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

const EXACT_PRECISION = "minute";
const PRECISIONS = ["year", "month", "day", "hour", "minute"] as const;
const MODE_LABELS = {
  ce: "CE",
  bce: "BCE",
  "years-ago": "Years ago",
  "after-big-bang": "After Big Bang",
} satisfies Record<TimeMode, string>;
const MODE_OPTIONS = Object.entries(MODE_LABELS).map(([value, label]) => ({
  label,
  value: value as TimeMode,
})) satisfies SelectOption<TimeMode>[];

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
      precision: EXACT_PRECISION,
      month: state.month,
      day: state.day,
      hour: state.hour,
      minute: state.minute,
    };
  }

  return {
    kind: "elapsed",
    reference: state.mode === "after-big-bang" ? "after-big-bang" : "ago",
    precision: EXACT_PRECISION,
    years: String(Math.max(0, Math.trunc(state.value))),
    days: String(state.day),
    hours: String(state.hour),
    minutes: String(state.minute),
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

type ExactNumberFieldProps = {
  id: string;
  label: string;
  max?: number;
  min?: number;
  value: number;
  onChange: (value: number) => void;
};

function ExactNumberField({
  id,
  label,
  max,
  min = 0,
  onChange,
  value,
}: ExactNumberFieldProps) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      <span className="text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <NumberInput
        className="h-9 rounded-md bg-background/70"
        id={id}
        max={max}
        min={min}
        onValueChange={onChange}
        value={value}
      />
    </label>
  );
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
    <Field
      className="h-full grid-rows-[auto_minmax(0,1fr)]"
      htmlFor={`${id}-value`}
      label={label}
      required={required}
    >
      <div className="grid h-full content-start gap-3 rounded-md border border-border/70 bg-surface/25 p-3 max-sm:gap-2.5 max-sm:p-2.5">
        <div className="grid grid-cols-[minmax(0,1fr)_9rem] gap-2 max-sm:grid-cols-[minmax(0,1fr)_7rem]">
          <label className="grid gap-1.5" htmlFor={`${id}-value`}>
            <span className="text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {state.mode === "years-ago" || state.mode === "after-big-bang"
                ? "Years"
                : "Year"}
            </span>
            <NumberInput
              className="h-9 rounded-md bg-background/70"
              id={`${id}-value`}
              min={state.mode === "bce" ? 1 : 0}
              onValueChange={(nextValue) =>
                commit({
                  ...state,
                  value: nextValue,
                })
              }
              value={state.value}
            />
          </label>
          <div className="grid gap-1.5">
            <span className="text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Scale
            </span>
            <Select
              onValueChange={(mode) =>
                commit({
                  ...state,
                  mode,
                })
              }
              options={MODE_OPTIONS}
              value={state.mode}
            />
          </div>
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
                  precision: EXACT_PRECISION,
                })
              }
            />
            Exact
          </label>
        </div>

        {state.exact ? (
          <div className="grid grid-cols-4 gap-2 border-t border-border/60 pt-3 max-sm:grid-cols-2">
            {state.mode === "ce" || state.mode === "bce" ? (
              <ExactNumberField
                id={`${id}-month`}
                label="Month"
                max={12}
                min={1}
                onChange={(month) => commit({ ...state, month })}
                value={state.month}
              />
            ) : null}
            <ExactNumberField
              id={`${id}-day`}
              label={state.mode === "ce" || state.mode === "bce" ? "Day" : "Days"}
              max={state.mode === "ce" || state.mode === "bce" ? 31 : undefined}
              min={state.mode === "ce" || state.mode === "bce" ? 1 : 0}
              onChange={(day) => commit({ ...state, day })}
              value={state.day}
            />
            <ExactNumberField
              id={`${id}-hour`}
              label="Hour"
              max={23}
              onChange={(hour) => commit({ ...state, hour })}
              value={state.hour}
            />
            <ExactNumberField
              id={`${id}-minute`}
              label="Minute"
              max={59}
              onChange={(minute) => commit({ ...state, minute })}
              value={state.minute}
            />
          </div>
        ) : null}
      </div>
    </Field>
  );
}
