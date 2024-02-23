import React, { useState } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import client, { RouterInput } from "../utils/trpc";
import { basicFilter, trainingOptions } from "../utils/trainingSetting";
import Input from "./Input";
import Console from "./Console";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

export default function Train({ projectId }: { projectId: string }) {
  const methods = useForm();
  const [filter, setFilter] = useState<string[] | undefined>(basicFilter);
  const [loading, setLoading] = useState(false);
  const [consoleData, setConsoleData] = useState<string[]>([]);

  // get training data from url params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const trainingData = queryParams.get("data");

  const handleTrain: SubmitHandler<RouterInput["nerfstudio"]["train"]> = (
    data,
  ) => {
    if (!projectId || !trainingData) return;

    setLoading(true);

    const process = client.nerfstudio.train.subscribe(
      {
        ...data,
        project: projectId,
        data: trainingData,
      },
      {
        onData(data) {
          setConsoleData((prev) => [...prev, data.message]);
        },
        onError(err) {
          toast.error(err.message);
          setLoading(false);
        },
        onComplete() {
          toast.success("Training complete");
          setLoading(false);
        },
      },
    );

    console.log(process);
  };

  return (
    <>
      <div className="card bg-base-300 w-full p-8">
        <div className="flex items-center justify-between pb-4">
          <h1 className="pb-4 text-xl">Training</h1>
          <label className="label cursor-pointer gap-4">
            <span className="label-text">Advanced Setting</span>
            <input
              type="checkbox"
              className="toggle"
              checked={filter === undefined}
              onChange={(e) => {
                setFilter(e.target.checked ? undefined : basicFilter);
              }}
            />
          </label>
        </div>
        <FormProvider {...methods}>
          <form
            className="form-control gap-8"
            onSubmit={methods.handleSubmit(handleTrain as any)}
          >
            <div className="grid grid-cols-2 gap-4">
              {trainingOptions
                .filter((option) => !filter || filter.includes(option.name))
                .map((option) => (
                  <Input input={option} key={option.name} filter={filter} />
                ))}
            </div>
            <button
              type="submit"
              className="btn btn-primary w-48 self-end"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Start Processing"
              )}
            </button>
          </form>
        </FormProvider>
      </div>
      {consoleData.length > 0 && <Console data={consoleData} />}
    </>
  );
}
