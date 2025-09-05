import { createFileRoute, useLinkProps } from "@tanstack/react-router";
("use client");

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { QRCodeDisplayCard } from "@/components/qr-code-display";
import { parsePreset, PresetManager } from "@/components/preset-manager";
import { TimeSettingCard } from "@/components/time-setting-card";
import { ArrowRight, ArrowLeft, Check, Share } from "lucide-react";
import { getTimeFormattedForCommand } from "@/lib/gopro/utils";
import { TimeSpan } from "@/lib/timeSpan";
import { EnumAndLabelSelect } from "@/components/enum-and-label-select";
import {
  LensFov,
  LensFovLabels,
  VideoFrameRateLabels,
  VideoFrameRates,
  VideoResLabels,
  VideoResolutions,
} from "@/lib/gopro/constants";
import { TimePicker } from "@/components/ui/TimeInput";
import { generateCommand } from "@/lib/gopro/commands";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { z } from "zod";

export type RecordingPreset = NewRecordingPreset & { id: string; name: string };

export type NewRecordingPreset =
  | RecordingPresetConstant
  | RecordingPresetDynamic;

type RecordingPresetDynamic = RecordingPresetBase & {
  startTime: TimeSpan;
  endTime: TimeSpan;
  type: "dynamic";
};

type RecordingPresetConstant = RecordingPresetBase & {
  type: "constant";
};

type RecordingPresetBase = {
  recordDuration: TimeSpan; // seconds
  intervalDuration: TimeSpan; // minutes
  resolution: VideoResolutions;
  lensWidth: LensFov;
  framerate: VideoFrameRates;
};

const searchSchema = z.object({
  command: z.string().optional(),
});

export const Route = createFileRoute("/")({
  component: App,
  validateSearch: searchSchema,
});

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQrTime, setQurrentQrTime] = useState<Date | null>(null);
  const [type, setType] = useState<"dynamic" | "constant">("dynamic");
  const [recordDuration, setRecordDuration] = useState(TimeSpan.fromMinutes(2)); // 2 minutes in seconds
  const [intervalDuration, setIntervalDuration] = useState(
    TimeSpan.fromMinutes(60)
  ); // 60 minutes
  const [startTime, setStartTime] = useState<TimeSpan | null>(
    TimeSpan.fromString("06:00")
  );
  const [endTime, setEndTime] = useState<TimeSpan | null>(
    TimeSpan.fromString("23:00")
  );
  const [resolution, setResolution] = useState<VideoResolutions>(
    VideoResolutions.R2_7K
  );
  const { command } = Route.useSearch();

  const [lensWidth, setLensWidth] = useState(LensFov.Wide);
  const [framerate, setFramerate] = useState(VideoFrameRates.FPS30);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const handlePresetSelect = (preset: RecordingPreset) => {
    toast.success(`Preset "${preset.name}" selected`);

    setRecordDuration(preset.recordDuration);
    setIntervalDuration(preset.intervalDuration);
    setResolution(preset.resolution);
    setLensWidth(preset.lensWidth);
    setFramerate(preset.framerate);
    setSelectedPreset(preset.id);

    if (preset.type === "dynamic") {
      setType("dynamic");
      setStartTime(preset.startTime);
      setEndTime(preset.endTime);
    } else {
      setType("constant");
      setStartTime(null);
      setEndTime(null);
    }
  };

  const currentFullPreset: NewRecordingPreset = useMemo(() => {
    if (type === "dynamic") {
      return {
        type: "dynamic",
        recordDuration,
        intervalDuration,
        startTime: startTime!,
        endTime: endTime!,
        resolution,
        lensWidth,
        framerate,
      };
    } else {
      return {
        type: "constant",
        recordDuration,
        intervalDuration,
        resolution,
        lensWidth,
        framerate,
      };
    }
  }, [
    type,
    recordDuration,
    intervalDuration,
    startTime,
    endTime,
    resolution,
    lensWidth,
    framerate,
  ]);

  const currentCommand = useMemo(() => {
    return generateCommand(currentFullPreset);
  }, [currentFullPreset]);

  const { href } = useLinkProps({
    to: Route.fullPath,
    params: {},
    search: {
      command: btoa(JSON.stringify(currentFullPreset)),
    },
  });

  useEffect(() => {
    if (command) {
      console.log(atob(command));
      const parsed = parsePreset(JSON.parse(atob(command)));
      console.log("Parsed command from URL:", parsed);
      if (parsed) {
        setRecordDuration(parsed.recordDuration);
        setIntervalDuration(parsed.intervalDuration);
        setResolution(parsed.resolution);
        setLensWidth(parsed.lensWidth);
        setFramerate(parsed.framerate);
        setType(parsed.type);
        if (parsed.type === "dynamic") {
          setStartTime(parsed.startTime);
          setEndTime(parsed.endTime);
        } else {
          setStartTime(null);
          setEndTime(null);
        }
        setSelectedPreset("");
        toast.success("Command parsed successfully from URL");
      } else {
        toast.error("Failed to parse command from URL");
      }
    }
  }, [command]);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "GoPro Interval Command",
          text: `Use this command to configure your GoPro for interval recording:\n${currentCommand}`,
          url: href,
        });
        toast.success("Command shared successfully!");
      } catch (error) {
        toast.error("Error sharing the command.");
        console.error("Error sharing:", error);
      }
    } else {
      toast.error("Web Share API is not supported in your browser.");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          <div
            className="flex items-center space-x-2 cursor-pointer transition-all hover:bg-neutral-50 p-2 rounded-2xl"
            onClick={() => setCurrentStep(1)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                currentStep === 1
                  ? "bg-accent text-accent-foreground"
                  : currentStep > 1
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <span
              className={`font-medium ${currentStep === 1 ? "text-foreground" : "text-muted-foreground"}`}
            >
              Set Time
            </span>
          </div>

          <ArrowRight className="h-4 w-4 text-muted-foreground" />

          <div
            className="flex items-center space-x-2 cursor-pointer transition-all hover:bg-neutral-50 p-2 rounded-2xl"
            onClick={() => setCurrentStep(2)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 2
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <span
              className={`font-medium ${currentStep === 2 ? "text-foreground" : "text-muted-foreground"}`}
            >
              Configure Recording
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <TimeSettingCard timeChanged={setQurrentQrTime} />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Presets */}
              <PresetManager
                currentSettings={currentFullPreset}
                onPresetSelect={handlePresetSelect}
                selectedPreset={selectedPreset}
              />

              {/* Recording Intervals */}
              <Card>
                <CardHeader>
                  <CardTitle>Recording Intervals</CardTitle>
                  <CardDescription>
                    Configure how long to record and how often
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Record Duration {recordDuration.toString()}</Label>
                      <Slider
                        value={[recordDuration.totalSeconds]}
                        onValueChange={(value) =>
                          setRecordDuration(TimeSpan.fromHMS(0, 0, value[0]))
                        }
                        max={TimeSpan.fromHMS(0, 30).totalSeconds}
                        min={10}
                        step={10}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>
                        Interval: Every {intervalDuration.totalMinutes} minutes
                      </Label>
                      <Slider
                        value={[intervalDuration.totalMinutes]}
                        onValueChange={(value) =>
                          setIntervalDuration(TimeSpan.fromMinutes(value[0]))
                        }
                        max={600}
                        min={5}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {type === "dynamic" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid items-center gap-3">
                        <Label htmlFor="start-time">Start Time</Label>
                        <TimePicker
                          placeholder="Select time"
                          value={startTime}
                          onChange={(v) => v && setStartTime(v)}
                        />
                      </div>
                      <div className="grid items-center gap-3">
                        <Label htmlFor="end-time">End Time</Label>
                        <TimePicker
                          placeholder="Select time"
                          value={endTime}
                          onChange={(v) => v && setEndTime(v)}
                        />
                      </div>
                    </div>
                  )}
                  <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950 w-full">
                    <Checkbox
                      id="toggle-2"
                      checked={type === "dynamic"}
                      onCheckedChange={(checked) =>
                        setType(checked ? "dynamic" : "constant")
                      }
                      className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                    />
                    <div className="grid gap-1.5 font-normal">
                      <p className="text-sm leading-none font-medium">
                        Enable dynamic interval
                      </p>
                      <p className="text-muted-foreground text-sm">
                        When enabled, the GoPro will only record during the time
                        interval defined above. When disabled, it will record at
                        the set interval, 24 hours a day. interval all day.
                      </p>
                    </div>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="gap-3 flex flex-col">
                      <Label>Resolution</Label>
                      <EnumAndLabelSelect
                        labels={VideoResLabels}
                        value={resolution}
                        className="w-full"
                        onChange={setResolution}
                        placeholder="Select resolution"
                      />
                    </div>

                    <div className="gap-3 flex flex-col">
                      <Label>Lens Width</Label>
                      <EnumAndLabelSelect
                        labels={LensFovLabels}
                        value={lensWidth}
                        onChange={setLensWidth}
                        className="w-full"
                        placeholder="Select lens width"
                      />
                    </div>

                    <div className="gap-3 flex flex-col">
                      <Label>Framerate</Label>
                      <EnumAndLabelSelect
                        labels={VideoFrameRateLabels}
                        value={framerate}
                        onChange={setFramerate}
                        className="w-full"
                        placeholder="Select framerate"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {currentQrTime && currentStep === 1 && (
            <>
              <QRCodeDisplayCard
                title="Step 1: Time Sync"
                command={getTimeFormattedForCommand(currentQrTime)}
                description="Scan this QR code first to set the current time on your GoPro camera"
              />
              <Button
                size={"lg"}
                onClick={() => setCurrentStep(2)}
                className="w-full"
              >
                Configure Recording
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <QRCodeDisplayCard
                title="Step 2: Recording Configuration"
                command={currentCommand}
                description={`Record for ${recordDuration.toString("mm minutes ss seconds")} every ${intervalDuration.totalMinutes} minute between ${startTime}-${endTime}`}
              />
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  size={"lg"}
                  className="grow"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Time Setup
                </Button>
                <Button onClick={share} size={"lg"} className="grow">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
