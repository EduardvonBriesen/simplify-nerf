import { NumberInput } from "./types";

const stepsPerSave: NumberInput = {
  name: "stepsPerSave",
  label: "Steps Per Save",
  tooltip: "Number of steps between each save of the model.",
  inputType: "number",
  defaultValue: 1000,
};

export const trainingOptions: NumberInput[] = [stepsPerSave];
