// Approximate average bitrates (in Mbps) for GoPro-like cameras.

import { VideoFrameRates, VideoResolutions } from "./constants";

// These are rough values and vary depending on compression, scene complexity, etc.
const ApproxBitrates: {
  [key in VideoResolutions]: { [key in VideoFrameRates]?: number };
} = {
  [VideoResolutions.R5_3K]: {
    [VideoFrameRates.FPS25]: 60,
    [VideoFrameRates.FPS30]: 80,
    [VideoFrameRates.FPS50]: 100,
    [VideoFrameRates.FPS60]: 120,
    [VideoFrameRates.FPS100]: 150,
    [VideoFrameRates.FPS120]: 180,
  },
  [VideoResolutions.R4K]: {
    [VideoFrameRates.FPS25]: 45,
    [VideoFrameRates.FPS30]: 60,
    [VideoFrameRates.FPS50]: 90,
    [VideoFrameRates.FPS60]: 100,
    [VideoFrameRates.FPS100]: 135,
    [VideoFrameRates.FPS120]: 160,
    [VideoFrameRates.FPS240]: 200,
  },
  [VideoResolutions.R2_7K]: {
    [VideoFrameRates.FPS25]: 35,
    [VideoFrameRates.FPS30]: 45,
    [VideoFrameRates.FPS60]: 75,
    [VideoFrameRates.FPS120]: 120,
  },
  [VideoResolutions.R1440P]: {
    [VideoFrameRates.FPS25]: 20,
    [VideoFrameRates.FPS30]: 25,
    [VideoFrameRates.FPS60]: 50,
    [VideoFrameRates.FPS120]: 80,
  },
  [VideoResolutions.R1080P]: {
    [VideoFrameRates.FPS25]: 15,
    [VideoFrameRates.FPS30]: 20,
    [VideoFrameRates.FPS60]: 40,
    [VideoFrameRates.FPS120]: 60,
    [VideoFrameRates.FPS240]: 120,
  },
};

// Function to calculate approximate file size
export const estimateRecordingSize = (
  resolution: VideoResolutions,
  framerate: VideoFrameRates,
  durationSeconds: number
): number | null => {
  const bitrate = ApproxBitrates[resolution]?.[framerate];
  if (!bitrate) return null; // not supported

  // bitrate is in Mbps (megabits per second)
  // Convert: Mbps → MBps (divide by 8), then × duration
  const sizeMB = (bitrate / 8) * durationSeconds;

  return sizeMB; // in Megabytes
};

// Convert MB → Human readable string
export const formatSize = (sizeMB: number): string => {
  if (sizeMB >= 1024) {
    return `${(sizeMB / 1024).toFixed(2)} GB`;
  }
  return `${sizeMB.toFixed(1)} MB`;
};

