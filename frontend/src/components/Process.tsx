import React, { useEffect } from "react";
import client, { RouterInput } from "../utils/trpc";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { basicFilter, processOptions } from "../utils/processSettings";
import Input from "./Input";
import { useState } from "react";
import { toast } from "react-toastify";
import Console from "./Console";
import Upload from "./Upload";
import { Link } from "react-router-dom";

export default function Process({ projectId }: { projectId: string }) {
  const methods = useForm();
  const [filter, setFilter] = useState<string[] | undefined>(basicFilter);
  const [loading, setLoading] = useState(false);
  const [consoleData, setConsoleData] = useState<string[]>([]);
  const [processedData, setProcessedData] = useState<
    {
      name: string;
      status: "running" | "done" | "error";
    }[]
  >([]);

  useEffect(() => {
    if (!projectId) return;
    getPreProcessData();
  }, [projectId]);

  const handlePreProcess: SubmitHandler<
    RouterInput["nerfstudio"]["process"]
  > = (data) => {
    console.log(data);
    if (!projectId) return;

    setLoading(true);

    client.nerfstudio.process.subscribe(
      {
        ...data,
        project: projectId,
      },
      {
        onData(data) {
          setConsoleData((prev) => [...prev, data.message]);
        },
        onError(err) {
          toast.error(err.message);
          console.error(err);
          setLoading(false);
        },
        onComplete() {
          toast.success("Pre-Processing complete");
          getPreProcessData();
          setLoading(false);
        },
      },
    );
  };

  function setDataType(type: string) {
    const dataType = type === "image" ? "images" : type;
    methods.setValue("dataType", dataType);
  }

  function getPreProcessData() {
    client.project.getPreProcessOutput.query({ projectId }).then((data) => {
      console.log(data);
      setProcessedData(data.outputs);
    });
  }

  return (
    <>
      <Upload projectId={projectId} setDataType={setDataType} />
      <div className="card bg-base-300 w-full p-8">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl">Pre-Process</h1>
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
            onSubmit={methods.handleSubmit(handlePreProcess as any)}
          >
            <div className="grid grid-cols-2 gap-4">
              {processOptions
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

      <div className="card bg-base-300 flex w-full flex-col  p-8">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl">Processed Data Sets</h1>
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={getPreProcessData}
          >
            <i className="fa-solid fa-rotate text-lg"></i>
          </button>
        </div>
        {processedData.map((data) => (
          <div className="hover:bg-base-100 flex items-center justify-between gap-4 rounded-xl p-2">
            <h1 className="flex-1 text-xl">{data.name}</h1>
            {data.status === "running" && (
              <span className="loading loading-spinner"></span>
            )}
            {data.status === "error" && (
              <span className="badge badge-error">Failed</span>
            )}
            {data.status === "done" && (
              <Link
                className="btn btn-primary btn-sm"
                to={`/project/${projectId}/train?data=${data}`}
              >
                Start Training
              </Link>
            )}
          </div>
        ))}
      </div>

      {consoleData.length > 0 && <Console data={consoleData} />}
    </>
  );
}
