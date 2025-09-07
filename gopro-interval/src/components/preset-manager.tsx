import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Settings, Terminal } from "lucide-react";
import type { NewRecordingPreset, RecordingPreset } from "@/routes/index";
import { TimeOfDay, TimeSpan } from "@/lib/timeSpan";
import {
  allCameraModels,
  calculateSupportedCamerasForSettings,
  CameraModelsLabels,
  LensFov,
  LensFovLabels,
  VideoFrameRateLabels,
  VideoFrameRates,
  VideoResLabels,
  VideoResolutions,
} from "@/lib/gopro/constants";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export const parsePreset = (preset: any): RecordingPreset => ({
  ...preset,

  recordDuration: TimeSpan.fromString(preset.recordDuration),
  intervalDuration: TimeSpan.fromString(preset.intervalDuration),
  startTime:
    preset.type === "dynamic"
      ? TimeOfDay.fromString(preset.startTime)
      : undefined,
  endTime:
    preset.type === "dynamic"
      ? TimeOfDay.fromString(preset.endTime)
      : undefined,
});

const loadCustomPresets = (): RecordingPreset[] => {
  const saved = localStorage.getItem("custom-presets");
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as any[];
      return parsed.map(parsePreset);
    } catch (error) {
      console.error("Failed to load custom presets:", error);
    }
  }
  return [];
};

const saveCustomPresets = (presets: RecordingPreset[]) => {
  localStorage.setItem("custom-presets", JSON.stringify(presets));
};

interface PresetManagerProps {
  currentSettings: NewRecordingPreset;
  onPresetSelect?: (preset: RecordingPreset) => void;
  selectedPreset: string | undefined;
}

const defaultPresets: RecordingPreset[] = [
  {
    id: "day-only-1",
    name: "Record only day 2/60",
    recordDuration: TimeSpan.fromMinutes(2), // 2 minutes
    intervalDuration: TimeSpan.fromMinutes(58),
    startTime: TimeOfDay.fromString("07:00"),
    endTime: TimeOfDay.fromString("20:00"),
    resolution: VideoResolutions.R2_7K,
    lensWidth: LensFov.Wide,
    framerate: VideoFrameRates.FPS30,
    type: "dynamic",
  },
  {
    id: "day-only-2",
    name: "Record only day 2/30",
    recordDuration: TimeSpan.fromMinutes(2), // 2 minutes
    intervalDuration: TimeSpan.fromMinutes(28),
    startTime: TimeOfDay.fromString("07:00"),
    endTime: TimeOfDay.fromString("20:00"),
    resolution: VideoResolutions.R2_7K,
    lensWidth: LensFov.Wide,
    framerate: VideoFrameRates.FPS30,
    type: "dynamic",
  },
  {
    id: "testing",
    name: "Night and day (for testing)",
    recordDuration: TimeSpan.fromSeconds(10), // 2 minutes
    intervalDuration: TimeSpan.fromHoursMinutesSeconds(0, 1, 50),
    resolution: VideoResolutions.R2_7K,
    lensWidth: LensFov.Wide,
    framerate: VideoFrameRates.FPS30,
    type: "constant",
    startTime: undefined,
    endTime: undefined,
  },
  {
    id: "night-and-day-1",
    name: "Night and day 2/20",
    recordDuration: TimeSpan.fromMinutes(2), // 2 minutes
    intervalDuration: TimeSpan.fromMinutes(18),
    resolution: VideoResolutions.R2_7K,
    lensWidth: LensFov.Wide,
    framerate: VideoFrameRates.FPS30,
    type: "constant",
    startTime: undefined,
    endTime: undefined,
  },
  {
    id: "night-and-day-2",
    name: "Night and day 2/30",
    recordDuration: TimeSpan.fromMinutes(2), // 2 minutes
    intervalDuration: TimeSpan.fromMinutes(28),
    resolution: VideoResolutions.R2_7K,
    lensWidth: LensFov.Wide,
    framerate: VideoFrameRates.FPS30,
    type: "constant",
    startTime: undefined,
    endTime: undefined,
  },
  {
    id: "night-and-day-3",
    name: "Night and day 2/60",
    recordDuration: TimeSpan.fromMinutes(2), // 2 minutes
    intervalDuration: TimeSpan.fromMinutes(58),
    resolution: VideoResolutions.R2_7K,
    lensWidth: LensFov.Wide,
    framerate: VideoFrameRates.FPS30,
    type: "constant",
    startTime: undefined,
    endTime: undefined,
  },
];

export function PresetManager({
  currentSettings,
  onPresetSelect,
  selectedPreset,
}: PresetManagerProps) {
  const [presets] = useState<RecordingPreset[]>(defaultPresets);
  const [customPresets, setCustomPresets] =
    useState<RecordingPreset[]>(loadCustomPresets());
  const [newPresetName, setNewPresetName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    saveCustomPresets(customPresets);
  }, [customPresets]);

  const saveCurrentAsPreset = () => {
    if (!newPresetName.trim()) {
      toast.error("Name required", {
        description: "Please enter a name for your preset",
      });
      return;
    }

    const newPreset: RecordingPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      ...currentSettings,
    };

    setCustomPresets((prev) => [...prev, newPreset]);
    setNewPresetName("");
    setIsDialogOpen(false);

    toast.success("Preset saved!", {
      description: `"${newPreset.name}" has been saved to your presets`,
    });
  };

  const deleteCustomPreset = (id: string) => {
    setCustomPresets((prev) => prev.filter((preset) => preset.id !== id));
    toast.success("Preset deleted", {
      description: "Custom preset has been removed",
    });
  };

  const supportedCameras = useMemo(() => {
    return calculateSupportedCamerasForSettings(
      currentSettings.resolution,
      currentSettings.framerate,
      currentSettings.lensWidth
    ).map((m) => CameraModelsLabels[m]);
  }, [
    currentSettings.resolution,
    currentSettings.framerate,
    currentSettings.lensWidth,
  ]);

  return (
    <div className="space-y-6">
      {supportedCameras.length !== allCameraModels.length && (
        <Alert
          variant={supportedCameras.length > 0 ? "default" : "destructive"}
        >
          <Terminal />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            {supportedCameras.length > 0 ? (
              <>
                Based on your current settings, the following cameras are
                supported:
              </>
            ) : (
              <>
                Uh-oh! Your current settings don't match any supported GoPro
                models. Please adjust your settings.
              </>
            )}
            <div className="flex flex-row flex-wrap gap-1 mt-2">
              {supportedCameras.map((cam) => (
                <Badge key={cam} variant="outline" className="text-xs">
                  {cam}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Built-in Presets</CardTitle>
          <CardDescription>
            Pre-configured settings for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedPreset === preset.id
                    ? "border-accent bg-accent/10"
                    : "border-border"
                }`}
                onClick={() => onPresetSelect?.(preset)}
              >
                <div className="space-y-2">
                  <h4 className="font-medium">{preset.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      Record:{" "}
                      {preset.recordDuration.toString(
                        "hh hours mm minutes ss seconds"
                      )}{" "}
                      every {preset.intervalDuration.totalMinutes} minute
                    </div>
                    {preset.type === "dynamic" && (
                      <div>
                        Time: {preset.startTime.toString("HH:MM")} -{" "}
                        {preset.endTime.toString("HH:MM")}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {VideoResLabels[preset.resolution]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {LensFovLabels[preset.lensWidth]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {VideoFrameRateLabels[preset.framerate]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Presets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Presets</CardTitle>
              <CardDescription>Your saved configurations</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Save Current
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Current Settings</DialogTitle>
                  <DialogDescription>
                    Give your preset a name to save the current configuration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="preset-name">Preset Name</Label>
                    <Input
                      id="preset-name"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="e.g., My Custom Setup"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveCurrentAsPreset}>Save Preset</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {customPresets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No custom presets yet</p>
              <p className="text-sm">
                Save your current settings to create a preset
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customPresets.map((preset) => (
                <div
                  key={preset.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedPreset === preset.id
                      ? "border-accent bg-accent/10"
                      : "border-border"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4
                        className="font-medium"
                        onClick={() => onPresetSelect?.(preset)}
                      >
                        {preset.name}
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomPreset(preset.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div
                      className="text-sm text-muted-foreground space-y-1"
                      onClick={() => onPresetSelect?.(preset)}
                    >
                      <div>
                        Record:{" "}
                        {preset.recordDuration.toString(
                          "hh hours mm minutes ss seconds"
                        )}{" "}
                        every {preset.intervalDuration.totalMinutes} minute
                      </div>
                      {preset.type === "dynamic" && (
                        <div>
                          Time: {preset.startTime.toString("HH:MM")} -{" "}
                          {preset.endTime.toString("HH:MM")}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {VideoResLabels[preset.resolution]}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {LensFovLabels[preset.lensWidth]}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {VideoFrameRateLabels[preset.framerate]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
