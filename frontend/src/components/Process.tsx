import { useState } from "react";
import client, { RouterInput } from "../utils/trpc";

export default function Process({ projectId }: { projectId: string }) {
  const [dataType, setDataType] =
    useState<RouterInput["nerfstudio"]["process"]["dataType"]>("videos");
  const [cameraType, setCameraType] =
    useState<RouterInput["nerfstudio"]["process"]["cameraType"]>();

  function handlePreProcess(e: any) {
    e.preventDefault();

    client.nerfstudio.process.query({
      project: projectId,
      dataType: dataType,
      cameraType: cameraType,
    });
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <div className="card bg-base-300 w-full p-8">
        <h1 className="pb-4 text-xl">Pre-Process</h1>
        <form className="form-control" onSubmit={handlePreProcess}>
          <span className="label label-text">Data Type</span>
          <select
            id="data-type"
            className="select select-primary w-full"
            value={dataType}
            onChange={(e) => setDataType(e.target.value as any)}
          >
            <option value={"videos"}>Video</option>
            <option value={"images"}>Images</option>
          </select>
          <span className="label label-text">Camera Type</span>
          <select
            id="camera-type"
            className="select select-primary w-full"
            value={cameraType}
            onChange={(e) => setCameraType(e.target.value as any)}
          >
            <option>equirectangular</option>
            <option>fisheye</option>
            <option>perspective</option>
          </select>
          <button type="submit" className="btn btn-primary mt-4">
            Start Processing
          </button>
        </form>
      </div>
    </div>
  );
}
