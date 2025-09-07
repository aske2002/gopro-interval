import type { NewRecordingPreset } from "@/routes";
import { TimeOfDay, TimeSpan } from "../timeSpan";
import {
  type LensFov,
  type VideoFrameRates,
  type VideoResolutions,
} from "./constants";

export const generateCommand = (currentFullPreset: NewRecordingPreset) => {
  if (currentFullPreset.type === "dynamic") {
    return generateDynamicIntervalCommand(
      currentFullPreset.startTime,
      currentFullPreset.endTime,
      currentFullPreset.recordDuration,
      currentFullPreset.intervalDuration,
      currentFullPreset.resolution,
      currentFullPreset.framerate,
      currentFullPreset.lensWidth
    );
  } else {
    return generateConstantIntervalCommand(
      currentFullPreset.recordDuration,
      currentFullPreset.intervalDuration,
      currentFullPreset.resolution,
      currentFullPreset.framerate,
      currentFullPreset.lensWidth
    );
  }
};

const generateCameraSettingsCommand = (
  resolution: VideoResolutions,
  framerate: VideoFrameRates,
  lensFov: LensFov
): string => {
  return `mV${resolution}${framerate}${lensFov}`;
};

export const generateDynamicIntervalCommand = (
  startTime: TimeOfDay,
  endTime: TimeOfDay,
  recordTimeS: TimeSpan,
  pauseTimeS: TimeSpan,
  resolution: VideoResolutions,
  framerate: VideoFrameRates,
  lensFov: LensFov,
  delayS: number = 2
): string => {
  const start = startTime.toString("HH:MM");
  const end = endTime.toString("HH:MM");
  const endWithBuffer = endTime.add(TimeSpan.fromMinutes(1)).toString("HH:MM");
  return `>${start}<${end}${generateCameraSettingsCommand(resolution, framerate, lensFov)}!S!${recordTimeS.totalSeconds}E!${delayS}N!${pauseTimeS.totalSeconds}RQ~!${endWithBuffer}N!${start}R`;
};

export const generateConstantIntervalCommand = (
  recordTimeS: TimeSpan,
  pauseTimeS: TimeSpan,
  resolution: VideoResolutions,
  framerate: VideoFrameRates,
  lensFov: LensFov,
  delayS: number = 2
): string => {
  return `${generateCameraSettingsCommand(resolution, framerate, lensFov)}!S!${recordTimeS.totalSeconds}E!${delayS}N!${pauseTimeS.totalSeconds}RQ`;
};
