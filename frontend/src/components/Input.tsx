import React, { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  InputField,
  NumberInput,
  SelectInput,
  ToggleInput,
  Comparison as ComparisonType,
} from "../utils/types";

export function Helper({
  tooltip,
  comparison,
}: {
  tooltip?: string;
  comparison?: ComparisonType;
}) {
  const modal = useRef<HTMLDialogElement>(null);
  return (
    <div className="flex gap-4">
      {comparison && (
        <>
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={(e) => {
              e.preventDefault();
              modal.current?.showModal();
            }}
          >
            <i className="fa-regular fa-eye label-text-alt hover:text-primary text-lg"></i>
          </button>

          <dialog className="modal" ref={modal}>
            <div className="modal-box">
              <div className="diff aspect-square">
                <div className="diff-item-1">
                  <img alt="daisy" src={comparison.imageA} />
                </div>
                <div className="diff-item-2">
                  <img alt="daisy" src={comparison.imageB} />
                </div>
                <div className="diff-resizer"></div>
                <div className="absolute right-0 top-0 flex w-full justify-between p-2">
                  <span>{comparison.valueA}</span>
                  <span>{comparison.valueB}</span>
                </div>
              </div>
            </div>

            <div className="modal-backdrop">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  modal.current?.close();
                }}
              >
                close
              </button>
            </div>
          </dialog>
        </>
      )}
      {tooltip && (
        <div className="tooltip tooltip-left" data-tip={tooltip}>
          <i className="fa-regular fa-circle-question label-text-alt text-lg"></i>
        </div>
      )}
    </div>
  );
}

function Select({ input }: { input: SelectInput }) {
  const { name, label, tooltip, options, comparison } = input;
  const { register } = useFormContext();

  return (
    <div>
      <div className="label">
        <span className="label-text">{label}</span>
        <Helper tooltip={tooltip} comparison={comparison} />
      </div>
      <select
        className="select select-primary w-full"
        defaultValue={input.defaultValue}
        {...register(name)}
      >
        <option value={undefined} disabled>
          --- Select an option ---
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Number({ input }: { input: NumberInput }) {
  const { name, label, tooltip, comparison } = input;
  const { register } = useFormContext();

  return (
    <div>
      <div className="label">
        <span className="label-text">{label}</span>
        <Helper tooltip={tooltip} comparison={comparison} />
      </div>
      <input
        type="number"
        className="input input-primary input-bordered w-full"
        defaultValue={input.defaultValue}
        {...register(name, { valueAsNumber: true })}
      />
    </div>
  );
}

function Toggle({ input }: { input: ToggleInput }) {
  const { name, label, tooltip, comparison } = input;
  const { register } = useFormContext();

  return (
    <label className="label cursor-pointer gap-4">
      <span className="label-text flex-1">{label}</span>
      <input
        type="checkbox"
        className="toggle"
        defaultChecked={input.defaultValue}
        {...register(name)}
      />
      <Helper tooltip={tooltip} comparison={comparison} />
    </label>
  );
}

export default function Input({
  input,
  filter,
}: {
  input: InputField;
  filter?: string[];
}) {
  const [dependencies, setDependencies] = useState<InputField[]>([]);
  const { watch } = useFormContext();
  const fieldValue = watch(input.name);

  useEffect(() => {
    if (!input.dependencies) return;
    setDependencies([]);
    input.dependencies.forEach((dependency) => {
      if (dependency.value.includes(fieldValue)) {
        setDependencies((prev) => [
          ...prev,
          ...dependency.input.filter(
            (input) => !filter || filter.includes(input.name),
          ),
        ]);
      }
    });
  }, [input, fieldValue, filter]);

  const inputField = () => {
    switch (input.inputType) {
      case "select":
        return <Select input={input} />;
      case "number":
        return <Number input={input} />;
      case "toggle":
        return <Toggle input={input} />;
      default:
        return null;
    }
  };

  if (dependencies.length < 1) return inputField();

  return (
    <>
      {inputField()}
      {dependencies
        .filter((dependency) => dependency.inputType !== "toggle")
        .map((dependency) => (
          <Input key={dependency.name} input={dependency} />
        ))}
      {dependencies
        .filter((dependency) => dependency.inputType === "toggle")
        .map((dependency) => (
          <Input key={dependency.name} input={dependency} />
        ))}
    </>
  );
}
