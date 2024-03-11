type baseInput = {
  name: string;
  label: string;
  tooltip?: string;
  comparison?: Comparison;
  dependencies?: {
    value: any[];
    input: InputField[];
  }[];
};

export type Comparison = {
  valueA: string;
  imageA: string;
  valueB: string;
  imageB: string;
};

export type SelectInput = baseInput & {
  inputType: "select";
  defaultValue?: string;
  options: {
    label: string;
    value: string;
  }[];
};

export type NumberInput = baseInput & {
  inputType: "number";
  defaultValue?: number;
};

export type ToggleInput = baseInput & {
  inputType: "toggle";
  defaultValue?: boolean;
};

export type InputField = SelectInput | NumberInput | ToggleInput;
