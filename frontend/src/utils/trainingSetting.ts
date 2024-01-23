import { NumberInput } from "./types";

const stepsPerSave: NumberInput = {
  name: "stepsPerSave",
  label: "Steps Per Save",
  tooltip: "Number of steps between each save of the model.",
  inputType: "number",
  defaultValue: 1000,
};

const maxNumIterations: NumberInput = {
  name: "maxNumIterations",
  label: "Max Number of Iterations",
  tooltip: "Maximum number of iterations to train the model.",
  inputType: "number",
  defaultValue: 30000,
};

export const trainingOptions: NumberInput[] = [stepsPerSave, maxNumIterations];
