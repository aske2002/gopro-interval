import { generateCommand } from "@/lib/gopro/commands";
import type { NewRecordingPreset } from "@/routes";
import { useMemo } from "react";

export default function useSettingsCommand(settings: NewRecordingPreset) {
  return useMemo(() => {
    return generateCommand(settings);
  }, [settings]);
}
