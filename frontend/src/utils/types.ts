type baseInput = {
  name: string;
  label: string;
  tooltip?: string;
  dependencies?: {
    value: any[];
    input: InputField[];
  }[];
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
