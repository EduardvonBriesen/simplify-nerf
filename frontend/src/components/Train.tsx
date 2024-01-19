import { useState } from "react";
import client from "../utils/trpc";

export default function Train({ projectId }: { projectId: string }) {
  const [stepsPerSave, setStepsPerSave] = useState<number>(2000);
  const [maxNumIterations, setMaxNumIterations] = useState<number>(30000);

  function handleTrain(e: any) {
    e.preventDefault();

    client.nerfstudio.train.query({
      project: projectId,
      stepsPerSave: stepsPerSave,
      maxNumIterations: maxNumIterations,
    });
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <div className="card bg-base-300 w-full p-8">
        <h1 className="pb-4 text-xl">Training</h1>
        <form className="form-control" onSubmit={handleTrain}>
          <span className="label label-text">Steps per Save</span>
          <input
            type="number"
            className="input input-primary input-bordered w-full"
            value={stepsPerSave}
            onChange={(e) => setStepsPerSave(parseInt(e.target.value))}
          />
          <span className="label label-text">Max Number of Iterations</span>
          <input
            type="number"
            className="input input-primary input-bordered w-full"
            value={maxNumIterations}
            onChange={(e) => setMaxNumIterations(parseInt(e.target.value))}
          />
          <button type="submit" className="btn btn-primary mt-4">
            Start Training
          </button>
        </form>
      </div>
    </div>
  );
}
