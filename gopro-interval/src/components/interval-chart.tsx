import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  getPayloadConfigFromPayload,
  useChart,
} from "@/components/ui/chart";
import { TimeSpan } from "@/lib/timeSpan";
import type { NewRecordingPreset } from "@/routes";

import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { estimateRecordingSize, formatSize } from "@/lib/gopro/recordingSize";

type SliceKind = "recording" | "idle" | "sleep";

type DaySlice = {
  kind: SliceKind;
  startSec: number; // [0..86399]
  endSec: number; // [0..86400], exclusive
  seconds: number;
  fill: string;
};

const SECONDS_PER_DAY = 24 * 60 * 60;

const toHHMM = (sec: number) =>
  TimeSpan.fromSeconds(sec % SECONDS_PER_DAY).toString("HH:MM");
const clampNonNegative = (n: number) => (n < 0 ? 0 : n);

// Return allowed "window" spans within [0, 86400), split if wrapping midnight.
function allowedWindows(preset: NewRecordingPreset): Array<[number, number]> {
  if (preset.type !== "dynamic") return [[0, SECONDS_PER_DAY]];
  const s = preset.startTime.totalSeconds;
  const e = preset.endTime.totalSeconds;
  if (e > s) return [[s, e]];
  if (e < s)
    return [
      [s, SECONDS_PER_DAY],
      [0, e],
    ];
  // equal -> no window
  return [];
}

function pushSlice(segments: DaySlice[], slice: Omit<DaySlice, "seconds">) {
  const seconds = clampNonNegative(
    (slice.endSec - slice.startSec + SECONDS_PER_DAY) % SECONDS_PER_DAY
  );
  if (seconds === 0) return;

  const last = segments[segments.length - 1];
  if (last && last.kind === slice.kind && last.endSec === slice.startSec) {
    // merge contiguous same-kind
    last.endSec = slice.endSec;
    last.seconds += seconds;
    return;
  }
  segments.push({
    ...slice,
    seconds,
  });
}
// Build chronological, non-overlapping slices covering 24h
function buildDaySegments(preset: NewRecordingPreset): DaySlice[] {
  const intervalSec = Math.max(1, preset.intervalDuration.totalMinutes * 60);
  const recordPerIntervalSec = Math.min(
    Math.max(0, preset.recordDuration.totalSeconds),
    intervalSec
  );

  // 1) Allowed windows (split if wrapping), sorted by start
  const windows = allowedWindows(preset).sort((a, b) => a[0] - b[0]);

  const segments: DaySlice[] = [];

  const pushSlice = (slice: Omit<DaySlice, "seconds">) => {
    const seconds = Math.max(0, slice.endSec - slice.startSec);
    if (seconds === 0) return;

    const last = segments[segments.length - 1];
    if (last && last.kind === slice.kind && last.endSec === slice.startSec) {
      // merge contiguous same-kind forward
      last.endSec = slice.endSec;
      last.seconds += seconds;
    } else {
      segments.push({ ...slice, seconds });
    }
  };

  // 2) Emit each window's Recording/Idle segments
  for (const [winStart, winEnd] of windows) {
    let t = winStart;
    while (t < winEnd) {
      const intervalEnd = Math.min(t + intervalSec, winEnd);
      const recEnd = Math.min(t + recordPerIntervalSec, intervalEnd);

      if (recEnd > t) {
        pushSlice({
          kind: "recording",
          startSec: t,
          endSec: recEnd,
          fill: "var(--color-recording)",
        });
      }
      if (intervalEnd > recEnd) {
        pushSlice({
          kind: "idle",
          startSec: recEnd,
          endSec: intervalEnd,
          fill: "var(--color-idle)",
        });
      }
      t = intervalEnd;
    }
  }

  if (windows.length === 0) {
    pushSlice({
      kind: "sleep",
      startSec: 0,
      endSec: SECONDS_PER_DAY,
      fill: "var(--color-sleep)",
    });
  } else {
    for (let i = 0; i < windows.length; i++) {
      const [curStart, curEnd] = windows[i];
      const [nextStart] = windows[(i + 1) % windows.length];

      if (nextStart === curEnd) continue;

      if (nextStart > curEnd) {
        // simple gap (no wrap)
        pushSlice({
          kind: "sleep",
          startSec: curEnd,
          endSec: nextStart,
          fill: "var(--color-sleep)",
        });
      } else {
        // gap crosses midnight → represent as a single chronological interval [curEnd, nextStart]
        // We’ll place it correctly after sorting below.
        pushSlice({
          kind: "sleep",
          startSec: curEnd,
          endSec: nextStart + SECONDS_PER_DAY, // temporary > 86400 to keep continuity
          fill: "var(--color-sleep)",
        });
      }
    }
  }

  const normalized: DaySlice[] = [];
  for (const s of segments) {
    if (s.endSec <= SECONDS_PER_DAY) {
      normalized.push(s);
    } else {
      // split at midnight
      const first: DaySlice = {
        ...s,
        endSec: SECONDS_PER_DAY,
        seconds: SECONDS_PER_DAY - s.startSec,
      };
      const second: DaySlice = {
        ...s,
        startSec: 0,
        endSec: s.endSec - SECONDS_PER_DAY,
        seconds: s.endSec - SECONDS_PER_DAY, // already normalized to [0..86400)
      };
      normalized.push(first, second);
    }
  }

  // 5) Sort chronologically by start time, then merge any adjacent same-kind
  normalized.sort((a, b) => a.startSec - b.startSec);

  const merged: DaySlice[] = [];
  for (const s of normalized) {
    const last = merged[merged.length - 1];
    if (last && last.kind === s.kind && last.endSec === s.startSec) {
      last.endSec = s.endSec;
      last.seconds += s.seconds;
    } else {
      merged.push({ ...s });
    }
  }

  // 6) Optionally merge head/tail if they’re same kind and touch midnight,
  //    to avoid a visual “split” exactly at 00:00.
  if (
    merged.length >= 2 &&
    merged[0].kind === merged[merged.length - 1].kind &&
    merged[merged.length - 1].endSec === SECONDS_PER_DAY &&
    merged[0].startSec === 0
  ) {
    merged[0].startSec = merged[merged.length - 1].startSec;
    merged[0].seconds += merged[merged.length - 1].seconds;
    merged.splice(merged.length - 1, 1);
  }

  return merged;
}

// ---- Chart config -------------------------------------------
const chartConfig = {
  seconds: { label: "Seconds" },
  recording: { label: "Recording", color: "var(--primary)" },
  idle: { label: "Idle", color: "var(--muted-foreground)" },
  sleep: { label: "Sleep", color: "var(--border)" },
} satisfies ChartConfig;

type Props = {
  preset: NewRecordingPreset;
  title?: string;
  subtitle?: string;
};

export function RecordingSchedulePie({ preset, subtitle }: Props) {
  const segments = buildDaySegments(preset);

  const totalSeconds = segments.reduce((s, d) => s + d.seconds, 0) || 1;
  const percent = (n: number) => ((n / totalSeconds) * 100).toFixed(1);

  // Recharts draws from 3 o’clock by default. Rotate so 00:00 is at 12 o’clock and clockwise.
  const START_ANGLE = 90;
  const END_ANGLE = 450;

  // Recharts "nameKey" is just the label; we’ll show a concise time range in the tooltip instead.
  const chartData = segments.map((s, i) => ({
    id: i,
    slice: s.kind,
    seconds: s.seconds,
    fill: s.fill,
    start: s.startSec,
    end: s.endSec,
  }));

  const description = useMemo(() => {
    const toalRecordingSegments = segments.filter(
      (s) => s.kind === "recording"
    );
    const toalRecordingSeconds = toalRecordingSegments.reduce(
      (a, b) => a + b.seconds,
      0
    );
    const estimatedSize = estimateRecordingSize(
      preset.resolution,
      preset.framerate,
      toalRecordingSeconds
    );

    return (
      <>
        Will output {toalRecordingSegments.length} recording segments (
        {TimeSpan.fromSeconds(toalRecordingSeconds).toString(
          "hh hours mm minutes ss seconds"
        )}
        ) every 24 hours{" "}
        {estimatedSize && (
          <>
            • Approximately 
            <span className="font-semibold"> {formatSize(estimatedSize)}</span>
          </>
        )}
      </>
    );
  }, [preset, segments, totalSeconds]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recording Schedule For 24 Hours</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-96 w-full"
        >
          <PieChart width={400} height={200}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => {
                    const secs = Number(value) || 0;
                    const start =
                      item && typeof item.payload?.start === "number"
                        ? item.payload.start
                        : 0;
                    const end =
                      item && typeof item.payload?.end === "number"
                        ? item.payload.end
                        : 0;
                    const label =
                      chartConfig[name as keyof typeof chartConfig]?.label ??
                      name;
                    return (
                      <>
                        <div className="font-medium">{label}</div>
                        <div>
                          {toHHMM(start)}–{toHHMM(end)} •{" "}
                          {TimeSpan.fromSeconds(secs).toString(
                            "hh hours mm minutes ss seconds"
                          )}{" "}
                          ({percent(secs)}%)
                        </div>
                      </>
                    );
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="seconds"
              nameKey="slice"
              innerRadius={"60%"}
              paddingAngle={0.6}
              startAngle={START_ANGLE}
              endAngle={END_ANGLE}
              isAnimationActive={false}
            />
            <ChartLegend
              className="flex-col items-start"
              align="right"
              layout="vertical"
              verticalAlign="middle"
              content={<ChartLegendContent />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean;
    nameKey?: string;
  }) {
  const { config } = useChart();
  if (!payload?.length) {
    return null;
  }

  const uniqueKinds = Array.from(new Set(payload.map((p) => p.value))).map(
    (v) => {
      const allPayloads = payload.filter((p) => p.value === v)!;
      const percentSum = allPayloads.reduce((a, b) => {
        const p =
          b.payload &&
          "percent" in b.payload &&
          typeof b.payload.percent === "number"
            ? b.payload.percent
            : 0;
        return a + p;
      }, 0);
      const totalTimeSum = allPayloads.reduce((a, b) => {
        const t =
          b.payload &&
          "seconds" in b.payload &&
          typeof b.payload.seconds === "number"
            ? b.payload.seconds
            : 0;
        return a + t;
      }, 0);

      return {
        percent: percentSum,
        totalTime: TimeSpan.fromSeconds(totalTimeSum),
        ...allPayloads[0],
        payload: {
          ...allPayloads[0].payload,
        },
      };
    }
  );

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {uniqueKinds.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className={cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            <div>
              {itemConfig?.label} ({(item.percent * 100).toFixed(1)}%)
              <div className="text-xs text-muted-foreground">
                Total {item.value} time is{" "}
                {item.totalTime.toString("hh hours mm minutes ss seconds")}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
