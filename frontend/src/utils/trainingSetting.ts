import { InputField, NumberInput, ToggleInput } from "./types";

const stepsPerSave: NumberInput = {
  name: "stepsPerSave",
  label: "Steps Per Save",
  tooltip: "Number of steps between each save of the model.",
  inputType: "number",
  defaultValue: 1000,
};

const stepsPerEvalBatch: NumberInput = {
  name: "stepsPerEvalBatch",
  label: "Steps Per Eval Batch",
  tooltip: "Number of steps between randomly sampled batches of rays.",
  inputType: "number",
  defaultValue: 500,
};

const stepsPerEvalImage: NumberInput = {
  name: "stepsPerEvalImage",
  label: "Steps Per Eval Image",
  tooltip: "Number of steps between single eval images.",
  inputType: "number",
  defaultValue: 500,
};

const stepsPerEvalAllImages: NumberInput = {
  name: "stepsPerEvalAllImages",
  label: "Steps Per Eval All Images",
  tooltip: "Number of steps between eval all images.",
  inputType: "number",
  defaultValue: 25000,
};

const maxNumIterations: NumberInput = {
  name: "maxNumIterations",
  label: "Max Number of Iterations",
  tooltip: "Maximum number of iterations to train the model.",
  inputType: "number",
  defaultValue: 30000,
};

const mixedPrecision: ToggleInput = {
  name: "mixedPrecision",
  label: "Mixed Precision",
  tooltip: "Whether or not to use mixed precision for training.",
  inputType: "toggle",
  defaultValue: true,
};

const useGradScaler: ToggleInput = {
  name: "useGradScaler",
  label: "Use Grad Scaler",
  tooltip:
    "Use gradient scaler even if the automatic mixed precision is disabled.",
  inputType: "toggle",
  defaultValue: false,
};

const saveOnlyLatestCheckpoint: ToggleInput = {
  name: "saveOnlyLatestCheckpoint",
  label: "Save Only Latest Checkpoint",
  tooltip: "Whether to only save the latest checkpoint or all checkpoints.",
  inputType: "toggle",
  defaultValue: true,
};

export const trainingOptions: InputField[] = [
  stepsPerSave,
  stepsPerEvalBatch,
  stepsPerEvalImage,
  stepsPerEvalAllImages,
  maxNumIterations,
  mixedPrecision,
  useGradScaler,
  saveOnlyLatestCheckpoint,
];

export const basicFilter = [maxNumIterations.name, stepsPerSave.name];
