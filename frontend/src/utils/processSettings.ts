import { SelectInput, ToggleInput, NumberInput, InputField } from "./types";

const cameraType: SelectInput = {
  name: "cameraType",
  label: "Camera Type",
  tooltip: "Select the type of camera used to capture the data.",
  defaultValue: "perspective",
  inputType: "select",
  options: [
    { label: "Equirectangular", value: "equirectangular" },
    { label: "Fisheye", value: "fisheye" },
    { label: "Perspective", value: "perspective" },
  ],
};

const matchingMethod: SelectInput = {
  name: "matchingMethod",
  label: "Matching Method",
  inputType: "select",
  tooltip:
    "Feature matching method to use. Vocab tree is recommended for a balance of speed and accuracy. Exhaustive is slower but more accurate. Sequential is faster but should only be used for videos.",
  defaultValue: "vocab_tree",
  options: [
    { label: "Vocab Tree", value: "vocab_tree" },
    { label: "Exhaustive", value: "exhaustive" },
    { label: "Sequential", value: "sequential" },
  ],
};

const refinePixsfm: ToggleInput = {
  name: "refinePixsfm",
  label: "Pixel Perfect SFM",
  tooltip:
    "If True, runs refinement using Pixel Perfect SFM. Only works with hloc sfm_tool.",
  inputType: "toggle",
};

const refineIntrinsics: ToggleInput = {
  name: "refineIntrinsics",
  label: "Refine Intrinsics",
  defaultValue: true,
  tooltip:
    "If True, do bundle adjustment to refine intrinsics. Only works with colmap sfm_tool.",
  inputType: "toggle",
};

const sfmTool: SelectInput = {
  name: "sfmTool",
  label: "SFM Tool",
  tooltip:
    "Structure from motion tool to use. Colmap will use sift features, hloc can use many modern methods such as superpoint features and superglue matcher.",
  inputType: "select",
  options: [
    { label: "Colmap", value: "colmap" },
    { label: "Hloc", value: "hloc" },
    { label: "Any", value: "any" },
  ],
  dependencies: [
    {
      value: ["hloc"],
      input: [refinePixsfm, refineIntrinsics],
    },
  ],
};

const featureType: SelectInput = {
  name: "featureType",
  label: "Feature Type",
  tooltip: "Type of feature to use.",
  inputType: "select",
  defaultValue: "any",
  options: [
    { label: "D2Net SS", value: "d2net-ss" },
    { label: "SOSNet", value: "sosnet" },
    { label: "SIFT", value: "sift" },
    { label: "Disk", value: "disk" },
    { label: "SuperPoint InLoc", value: "superpoint_inloc" },
    { label: "SuperPoint Max", value: "superpoint_max" },
    { label: "Any", value: "any" },
    { label: "SuperPoint Aachen", value: "superpoint_aachen" },
    { label: "SuperPoint", value: "superpoint" },
    { label: "R2D2", value: "r2d2" },
  ],
};

const matcherType: SelectInput = {
  name: "matcherType",
  label: "Matcher Type",
  tooltip: "Matching algorithm.",
  inputType: "select",
  defaultValue: "any",
  options: [
    { label: "Adalam", value: "adalam" },
    { label: "SuperPoint + LightGlue", value: "superpoint+lightglue" },
    { label: "NN SuperPoint", value: "NN-superpoint" },
    { label: "Disk + LightGlue", value: "disk+lightglue" },
    { label: "NN Ratio", value: "NN-ratio" },
    { label: "Any", value: "any" },
    { label: "SuperGlue", value: "superglue" },
    { label: "NN", value: "NN" },
    { label: "NN Mutual", value: "NN-mutual" },
    { label: "SuperGlue Fast", value: "superglue-fast" },
  ],
};

const numDownscales: NumberInput = {
  name: "numDownscales",
  label: "Number of Downscales",
  tooltip:
    "Number of times to downscale the images. Downscales by 2 each time. For example a value of 3 will downscale the images by 2x, 4x, and 8x.",
  inputType: "number",
  defaultValue: 3,
};

// TODO: Handle this appropriately
const colmapModelPath: SelectInput = {
  name: "colmapModelPath",
  label: "Colmap Model Path",
  tooltip:
    "Optionally sets the path of the colmap model. Used only when –skip-colmap is set to True. The path is relative to the output directory.",
  inputType: "select",
  defaultValue: "colmap/sparse/0",
  options: [
    { label: "colmap/sparse/0", value: "colmap/sparse/0" },
    { label: "colmap/sparse/1", value: "colmap/sparse/1" },
    { label: "colmap/sparse/2", value: "colmap/sparse/2" },
    { label: "colmap/sparse/3", value: "colmap/sparse/3" },
    { label: "colmap/sparse/4", value: "colmap/sparse/4" },
  ],
};

const skipColmap: ToggleInput = {
  name: "skipColmap",
  label: "Skip Colmap",
  tooltip: "If True, skips COLMAP and generates transforms.json if possible.",
  inputType: "toggle",
  defaultValue: false,
  dependencies: [
    {
      value: [true],
      input: [colmapModelPath],
    },
  ],
};

const skipImageProcessing: ToggleInput = {
  name: "skipImageProcessing",
  label: "Skip Image Processing",
  tooltip:
    "If True, skips copying and downscaling of images and only runs COLMAP if possible and enabled",
  inputType: "toggle",
};

const imagesPerEquirect: SelectInput = {
  name: "imagesPerEquirect",
  label: "Images Per Equirect",
  tooltip:
    "Number of samples per image to take from each equirectangular image. Used only when camera-type is equirectangular.",
  inputType: "select",
  defaultValue: "8",
  options: [
    { label: "14", value: "14" },
    { label: "8", value: "8" },
  ],
};

const numFramesTarget: NumberInput = {
  name: "numFramesTarget",
  label: "Number of Frames Target",
  tooltip:
    "Target number of frames to use per video, results may not be exact.",
  inputType: "number",
  defaultValue: 300,
};

export const processOptions: InputField[] = [
  {
    name: "dataType",
    label: "Data Type",
    tooltip: "Select the type of data you want to process.",
    inputType: "select",
    defaultValue: undefined,
    options: [
      { label: "Video", value: "video" },
      { label: "Images", value: "images" },
    ],
    dependencies: [
      {
        value: ["video", "images"],
        input: [
          cameraType,
          matchingMethod,
          sfmTool,
          featureType,
          matcherType,
          skipColmap,
          numDownscales,
          skipImageProcessing,
          imagesPerEquirect,
        ],
      },
      {
        value: ["video"],
        input: [numFramesTarget],
      },
    ],
  },
];

export const basicFilter = [
  processOptions[0].name,
  cameraType.name,
  matchingMethod.name,
  matcherType.name,
  numDownscales.name,
  numFramesTarget.name,
];
