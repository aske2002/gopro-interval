import type { NewRecordingPreset, RecordingPreset } from "@/routes";
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
import { PresetManager } from "@/components/preset-manager";
import { TimeSettingCard } from "@/components/time-setting-card";
import { ArrowRight, ArrowLeft, Check, Share } from "lucide-react";
import { getTimeFormattedForCommand } from "@/lib/gopro/utils";
import { TimeSpan } from "@/lib/timeSpan";
import { EnumAndLabelSelect } from "@/components/enum-and-label-select";
import {
  LensFovLabels,
  VideoFrameRateLabels,
  VideoResLabels,
} from "@/lib/gopro/constants";
import { TimePicker } from "@/components/ui/TimeInput";
import { Checkbox } from "@/components/ui/checkbox";
import useTimeCommand from "@/hooks/use-time-command";
import useSettingsCommand from "@/hooks/use-settings-command";
import { RecordingSchedulePie } from "../interval-chart";
import { Route as IndexRoute } from "@/routes/index";
import { useDebounce } from "@uidotdev/usehooks";

interface FullViewProps {
  currentSettings: NewRecordingPreset;
  onPresetSelect?: (preset: RecordingPreset | NewRecordingPreset) => void;
  selectedPreset?: {
    name: string;
    id: string;
  };
  share?: () => void;
}

export default function FullView({
  currentSettings,
  selectedPreset,
  share,
  onPresetSelect,
}: FullViewProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const [currentInterval, setCurrentInterval] = useState<TimeSpan>(
    currentSettings.intervalDuration
  );
  const [currentDuration, setCurrentDuration] = useState<TimeSpan>(
    currentSettings.recordDuration
  );
  const { time: currentQrTime } = useTimeCommand();
  const navigate = IndexRoute.useNavigate();

  const { step: searchStep } = IndexRoute.useSearch();

  const debouncedDuration = useDebounce(currentDuration, 200);
  const debouncedInterval = useDebounce(currentInterval, 200);

  useEffect(() => {
    if (debouncedDuration !== currentSettings.recordDuration) {
      settingsChanged?.("recordDuration", debouncedDuration);
    }
    if (debouncedInterval !== currentSettings.intervalDuration) {
      settingsChanged?.("intervalDuration", debouncedInterval);
    }
  }, [debouncedDuration, debouncedInterval]);

  useEffect(() => {
    setCurrentDuration(currentSettings.recordDuration);
    setCurrentInterval(currentSettings.intervalDuration);
  }, [currentSettings.intervalDuration, currentSettings.recordDuration]);

  useEffect(() => {
    if (searchStep !== undefined) {
      setCurrentStep(searchStep);
    }
  }, [searchStep]);

  useEffect(() => {
    navigate({ search: (old) => ({ ...old, step: currentStep }) });
  }, [currentStep]);

  const {
    recordDuration,
    intervalDuration,
    lensWidth,
    resolution,
    type,
    startTime,
    endTime,
    framerate,
  } = useMemo(() => {
    return currentSettings;
  }, [currentSettings]);

  const settingsChanged = <T extends keyof RecordingPreset>(
    key: T,
    value: RecordingPreset[T]
  ) => {
    onPresetSelect?.({
      ...currentSettings,
      [key]: value,
    });
  };

  const currentCommand = useSettingsCommand(currentSettings);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4 flex-wrap">
          <div
            className="flex items-center space-x-2 cursor-pointer transition-all hover:bg-neutral-50 p-2 rounded-2xl"
            onClick={() => setCurrentStep(0)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                currentStep === 0
                  ? "bg-primary text-primary-foreground"
                  : currentStep > 0
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <span
              className={`font-medium ${currentStep === 0 ? "text-foreground" : "text-muted-foreground"}`}
            >
              Set Time
            </span>
          </div>

          <ArrowRight className="h-4 w-4 text-muted-foreground" />

          <div
            className="flex items-center space-x-2 cursor-pointer transition-all hover:bg-neutral-50 p-2 rounded-2xl"
            onClick={() => setCurrentStep(1)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 1
                  ? "bg-primary text-primary-foreground"
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
          {currentStep === 0 && (
            <div className="space-y-6">
              <TimeSettingCard time={currentQrTime} />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Presets */}
              <PresetManager
                currentSettings={currentSettings}
                onPresetSelect={onPresetSelect}
                selectedPreset={selectedPreset?.id}
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
                      <Label>Record Duration {currentDuration.toString()}</Label>
                      <Slider
                        value={[currentDuration.totalSeconds]}
                        onValueChange={(value) =>
                          setCurrentDuration(TimeSpan.fromSeconds(value[0]))
                        }
                        max={
                          TimeSpan.fromHoursMinutesSeconds(0, 30).totalSeconds
                        }
                        min={10}
                        step={10}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>
                        Interval: Every {currentInterval.totalMinutes} minutes
                      </Label>
                      <Slider
                        value={[currentInterval.totalMinutes]}
                        onValueChange={(value) =>
                          setCurrentInterval(TimeSpan.fromMinutes(value[0]))
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
                          onChange={(v) => v && settingsChanged("startTime", v)}
                        />
                      </div>
                      <div className="grid items-center gap-3">
                        <Label htmlFor="end-time">End Time</Label>
                        <TimePicker
                          placeholder="Select time"
                          value={endTime}
                          onChange={(v) => v && settingsChanged("endTime", v)}
                        />
                      </div>
                    </div>
                  )}
                  <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950 w-full">
                    <Checkbox
                      id="toggle-2"
                      checked={type === "dynamic"}
                      onCheckedChange={(checked) =>
                        settingsChanged(
                          "type",
                          checked ? "dynamic" : "constant"
                        )
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
                        onChange={(v) => settingsChanged("resolution", v)}
                        placeholder="Select resolution"
                      />
                    </div>

                    <div className="gap-3 flex flex-col">
                      <Label>Lens Width</Label>
                      <EnumAndLabelSelect
                        labels={LensFovLabels}
                        value={lensWidth}
                        onChange={(v) => settingsChanged("lensWidth", v)}
                        className="w-full"
                        placeholder="Select lens width"
                      />
                    </div>

                    <div className="gap-3 flex flex-col">
                      <Label>Framerate</Label>
                      <EnumAndLabelSelect
                        labels={VideoFrameRateLabels}
                        value={framerate}
                        onChange={(v) => settingsChanged("framerate", v)}
                        className="w-full"
                        placeholder="Select framerate"
                      />
                    </div>
                  </div>
                  <RecordingSchedulePie preset={currentSettings} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {currentQrTime && currentStep === 0 && (
            <>
              <QRCodeDisplayCard
                title="Step 1: Time Sync"
                command={getTimeFormattedForCommand(currentQrTime)}
                description="Scan this QR code first to set the current time on your GoPro camera"
              />
              <Button
                size={"lg"}
                onClick={() => setCurrentStep(1)}
                className="w-full"
              >
                Configure Recording
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {currentStep === 1 && (
            <>
              <QRCodeDisplayCard
                title="Step 2: Recording Configuration"
                command={currentCommand}
                description={`Record for ${recordDuration.toString("mm minutes ss seconds")} every ${intervalDuration.totalMinutes} minute between ${startTime}-${endTime}`}
              />
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
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
