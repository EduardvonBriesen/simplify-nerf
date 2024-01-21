import { useState } from "react";
import client, { RouterInput } from "../utils/trpc";
import Select from "./Select";

type ProcessOption = {
  label: string;
  value: string;
  tooltip?: string;
  options: {
    label: string;
    value: string;
  }[];
};

const processOptions: ProcessOption[] = [
  {
    label: "Data Type",
    value: "dataType",
    tooltip: "Select the type of data you want to process.",
    options: [
      { label: "Video", value: "videos" },
      { label: "Images", value: "images" },
    ],
  },
  {
    label: "Camera Type",
    value: "cameraType",
    tooltip: "Select the type of camera used to capture the data.",
    options: [
      { label: "Equirectangular", value: "equirectangular" },
      { label: "Fisheye", value: "fisheye" },
      { label: "Perspective", value: "perspective" },
    ],
  },
];

export default function Process({ projectId }: { projectId: string }) {
  const [config, setConfig] = useState<RouterInput["nerfstudio"]["process"]>({
    project: projectId,
    dataType: "videos",
    cameraType: "equirectangular",
  });

  function handlePreProcess(e: any) {
    e.preventDefault();

    if (!config) return;

    client.nerfstudio.process.query({
      ...config,
      project: projectId,
    });
  }

  return (
    <div className="card bg-base-300 w-full p-8">
      <h1 className="text-xl">Pre-Process</h1>
      <form className="grid grid-cols-2 gap-4" onSubmit={handlePreProcess}>
        {processOptions.map((option) => (
          <Select
            key={option.label}
            label={option.label}
            tooltip={option.tooltip}
            options={option.options}
            value={config[option.value as keyof typeof config]}
            onChange={(value) =>
              setConfig((prev) => ({ ...prev, [option.value]: value }))
            }
          />
        ))}
        <button type="submit" className="btn btn-primary w-48">
          Start Processing
        </button>
      </form>
    </div>
  );
}
