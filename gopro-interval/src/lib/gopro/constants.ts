enum CameraModels {
  H13 = "H13",
  H12 = "H12",
  H11 = "H11",
  M11 = "M11",
  H10 = "H10",
  Bones = "Bones",
  H9 = "H9",
  H8 = "H8",
  H7 = "H7",
  MAX = "MAX",
}

const allCameraModels = Object.values(CameraModels);

const allCameraModelsExcept = (excluded: CameraModels[]): CameraModels[] => {
  return allCameraModels.filter((model) => !excluded.includes(model));
};

enum VideoResolutions {
  R5_3K = "r5",
  R4K = "r4",
  R2_7K = "r27",
  R1440P = "r1440",
  R1080P = "r1080",
}

enum VideoFrameRates {
  FPS25 = "p25",
  FPS30 = "p30",
  FPS50 = "p50",
  FPS60 = "p60",
  FPS100 = "p100",
  FPS120 = "p120",
  FPS200 = "p200",
  FPS240 = "p240",
}

enum LensFov {
  Narrow = "fn",
  Medium = "fm",
  Wide = "fw",
  Linear = "fl",
  Superview = "fs",
  Hyperview = "fv",
  HorizonalLinear = "fh",
  SupermaxWide = "fx",
}

const LensFovLabels: { [key in LensFov]: string } = {
  [LensFov.Narrow]: "Narrow",
  [LensFov.Medium]: "Medium",
  [LensFov.Wide]: "Wide",
  [LensFov.Linear]: "Linear",
  [LensFov.Superview]: "SuperView",
  [LensFov.Hyperview]: "HyperView",
  [LensFov.HorizonalLinear]: "Horizon",
  [LensFov.SupermaxWide]: "Max SuperView",
};

const VideoResLabels: { [key in VideoResolutions]: string } = {
  [VideoResolutions.R5_3K]: "5.3K",
  [VideoResolutions.R4K]: "4K",
  [VideoResolutions.R2_7K]: "2.7K",
  [VideoResolutions.R1440P]: "1440p",
  [VideoResolutions.R1080P]: "1080p",
};

const VideoFrameRateLabels: { [key in VideoFrameRates]: string } = {
  [VideoFrameRates.FPS25]: "25 fps",
  [VideoFrameRates.FPS30]: "30 fps",
  [VideoFrameRates.FPS50]: "50 fps",
  [VideoFrameRates.FPS60]: "60 fps",
  [VideoFrameRates.FPS100]: "100 fps",
  [VideoFrameRates.FPS120]: "120 fps",
  [VideoFrameRates.FPS200]: "200 fps",
  [VideoFrameRates.FPS240]: "240 fps",
};

const CameraModelsLabels: { [key in CameraModels]: string } = {
  [CameraModels.H13]: "HERO13 Black",
  [CameraModels.H12]: "HERO12 Black",
  [CameraModels.H11]: "HERO11 Black",
  [CameraModels.M11]: "MAX 11",
  [CameraModels.H10]: "HERO10 Black",
  [CameraModels.Bones]: "HERO9 Black",
  [CameraModels.H9]: "HERO8 Black",
  [CameraModels.H8]: "HERO7 Black",
  [CameraModels.H7]: "HERO7 Silver",
  [CameraModels.MAX]: "MAX",
};

const CameraSupport: {
  Resolutions: { [key in VideoResolutions]: CameraModels[] };
  FrameRates: { [key in VideoFrameRates]: CameraModels[] };
  LensFov: { [key in LensFov]: CameraModels[] };
} = {
  Resolutions: {
    [VideoResolutions.R4K]: allCameraModels,
    [VideoResolutions.R2_7K]: allCameraModels,
    [VideoResolutions.R1440P]: allCameraModels,
    [VideoResolutions.R1080P]: allCameraModels,
    [VideoResolutions.R5_3K]: [
      CameraModels.H10,
      CameraModels.H11,
      CameraModels.H12,
      CameraModels.H13,
    ],
  },
  FrameRates: {
    [VideoFrameRates.FPS25]: allCameraModels,
    [VideoFrameRates.FPS30]: allCameraModels,
    [VideoFrameRates.FPS50]: allCameraModels,
    [VideoFrameRates.FPS60]: allCameraModels,
    [VideoFrameRates.FPS100]: allCameraModels,
    [VideoFrameRates.FPS120]: allCameraModels,
    [VideoFrameRates.FPS200]: allCameraModelsExcept([
      CameraModels.H7,
      CameraModels.MAX,
    ]),
    [VideoFrameRates.FPS240]: allCameraModelsExcept([
      CameraModels.H7,
      CameraModels.MAX,
    ]),
  },
  LensFov: {
    [LensFov.Narrow]: allCameraModels,
    [LensFov.Medium]: allCameraModels,
    [LensFov.Wide]: allCameraModels,
    [LensFov.Linear]: allCameraModelsExcept([CameraModels.H7]),
    [LensFov.Superview]: allCameraModelsExcept([
      CameraModels.H7,
      CameraModels.MAX,
    ]),
    [LensFov.Hyperview]: [CameraModels.H11, CameraModels.H12, CameraModels.H13],
    [LensFov.HorizonalLinear]: [
      CameraModels.H9,
      CameraModels.H10,
      CameraModels.H11,
      CameraModels.H12,
      CameraModels.H13,
    ],
    [LensFov.SupermaxWide]: [],
  },
};

const calculateSupportedCamerasForSettings = (
  resolution: VideoResolutions,
  framerate: VideoFrameRates,
  lensFov: LensFov
): CameraModels[] => {
  const camerasByRes = CameraSupport.Resolutions[resolution];
  const camerasByFr = CameraSupport.FrameRates[framerate];
  const camerasByFov = CameraSupport.LensFov[lensFov];

  return allCameraModels.filter(
    (model) =>
      camerasByRes.includes(model) &&
      camerasByFr.includes(model) &&
      camerasByFov.includes(model)
  );
};

const frameRateFromString = (s: string): VideoFrameRates | null => {
  const mapping: { [key: string]: VideoFrameRates } = {
    "25": VideoFrameRates.FPS25,
    "30": VideoFrameRates.FPS30,
    "50": VideoFrameRates.FPS50,
    "60": VideoFrameRates.FPS60,
    "100": VideoFrameRates.FPS100,
    "120": VideoFrameRates.FPS120,
    "200": VideoFrameRates.FPS200,
    "240": VideoFrameRates.FPS240,
  };
  return mapping[s] || null;
};

const resolutionFromString = (s: string): VideoResolutions | null => {
  const mapping: { [key: string]: VideoResolutions } = {
    "5.3K": VideoResolutions.R5_3K,
    "4K": VideoResolutions.R4K,
    "2.7K": VideoResolutions.R2_7K,
    "1440p": VideoResolutions.R1440P,
    "1080p": VideoResolutions.R1080P,
  };
  return mapping[s] || null;
};

const lensFovFromString = (s: string): LensFov | null => {
  const mapping: { [key: string]: LensFov } = {
    Narrow: LensFov.Narrow,
    Medium: LensFov.Medium,
    Wide: LensFov.Wide,
    Linear: LensFov.Linear,
    SuperView: LensFov.Superview,
    HyperView: LensFov.Hyperview,
    Horizon: LensFov.HorizonalLinear,
    "Max SuperView": LensFov.SupermaxWide,
  };
  return mapping[s] || null;
};

export {
  CameraModels,
  VideoResolutions,
  VideoFrameRates,
  LensFov,
  LensFovLabels,
  VideoResLabels,
  VideoFrameRateLabels,
  CameraModelsLabels,
  CameraSupport,
  allCameraModels,
  calculateSupportedCamerasForSettings,
  frameRateFromString,
  resolutionFromString,
  lensFovFromString,
};
