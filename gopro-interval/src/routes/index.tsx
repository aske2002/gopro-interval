import { createFileRoute, useLinkProps } from "@tanstack/react-router";
("use client");

import { useEffect, useState } from "react";
import { parsePreset } from "@/components/preset-manager";
import { TimeOfDay, TimeSpan } from "@/lib/timeSpan";
import {
  LensFov,
  VideoFrameRates,
  VideoResolutions,
} from "@/lib/gopro/constants";
import { toast } from "sonner";
import { z } from "zod";
import SimpleView from "@/components/main/simple-view";
import FullView from "@/components/main/full-view";
import useModeControls from "@/hooks/use-mode-controls";

export type RecordingPreset = NewRecordingPreset & { id: string; name: string };

export type NewRecordingPreset =
  | RecordingPresetConstant
  | RecordingPresetDynamic;

export type RecordingPresetDynamic = RecordingPresetBase & {
  startTime: TimeOfDay;
  endTime: TimeOfDay;
  type: "dynamic";
};

type RecordingPresetConstant = RecordingPresetBase & {
  type: "constant";
  startTime: undefined;
  endTime: undefined;
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
  step: z.number().max(1).min(0).optional(),
});

export const Route = createFileRoute("/")({
  component: App,
  validateSearch: searchSchema,
});

const defaultPreset: NewRecordingPreset = {
  type: "dynamic",
  recordDuration: TimeSpan.fromMinutes(2),
  intervalDuration: TimeSpan.fromHours(1),
  resolution: VideoResolutions.R4K,
  lensWidth: LensFov.Wide,
  framerate: VideoFrameRates.FPS30,
  startTime: TimeOfDay.fromHours(6),
  endTime: TimeOfDay.fromHours(18),
};

function App() {
  const { simpleMode, setSimpleMode } = useModeControls();
  const [selectedSettings, setSelectedSettings] = useState<NewRecordingPreset>({
    ...defaultPreset,
  });
  const { command: sharedCommand } = Route.useSearch();

  const [selectedPreset, setSelectedPreset] = useState<{
    name: string;
    id: string;
  }>();

  const handlePresetSelect = (preset: RecordingPreset | NewRecordingPreset) => {
    if ("id" in preset) {
      setSelectedPreset({ name: preset.name, id: preset.id });
    } else {
      setSelectedPreset(undefined);
    }
    if (preset.type === "dynamic") {
      setSelectedSettings({
        ...preset,
        startTime: preset.startTime || defaultPreset.startTime,
        endTime: preset.endTime || defaultPreset.endTime,
      });
    } else {
      setSelectedSettings({
        ...preset,
      });
    }
  };

  const { href } = useLinkProps({
    to: Route.fullPath,
    params: {},
    search: {
      command: btoa(JSON.stringify(selectedSettings)),
    },
  });

  useEffect(() => {
    if (sharedCommand) {
      const parsed = parsePreset(JSON.parse(atob(sharedCommand)));
      if (parsed) {
        setSelectedSettings(parsed);
        setSelectedPreset(undefined);
        toast.success("Command parsed successfully from URL");
      } else {
        toast.error("Failed to parse command from URL");
      }
    }
  }, [sharedCommand]);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "GoPro Interval Command",

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

  return simpleMode ? (
    <SimpleView
      currentSettings={selectedSettings}
      onClose={() => setSimpleMode(false)}
    />
  ) : (
    <FullView
      currentSettings={selectedSettings}
      onPresetSelect={handlePresetSelect}
      selectedPreset={selectedPreset}
      share={share}
    />
  );
}
