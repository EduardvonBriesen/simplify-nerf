import React, { useEffect, useState } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import client, { RouterInput } from "../utils/trpc";
import { basicFilter, trainingOptions } from "../utils/trainingSetting";
import Input from "./Input";
import Console from "./Console";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function Train({ projectId }: { projectId: string }) {
  const methods = useForm();
  const [filter, setFilter] = useState<string[] | undefined>(basicFilter);
  const [loading, setLoading] = useState(false);
  const [consoleData, setConsoleData] = useState<string[]>([]);
  const [modelData, setModelData] = useState<
    {
      model: string;
      config: string;
    }[]
  >([]);

  // get training data from url params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const inputData = queryParams.get("data");

  useEffect(() => {
    if (!projectId) return;
    getTrainingData();
  }, [projectId]);

  const handleTrain: SubmitHandler<RouterInput["nerfstudio"]["train"]> = (
    data,
  ) => {
    if (!projectId || !inputData) return;

    setLoading(true);

    client.nerfstudio.train.subscribe(
      {
        ...data,
        project: projectId,
        data: inputData,
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
  };

  function getTrainingData() {
    client.project.getTrainingOutput
      .query({ projectId, processData: inputData ?? "" })
      .then((data) => {
        console.log(data);
        setModelData(data);
      });
  }

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

      <div className="card bg-base-300 flex w-full flex-col gap-2 p-8">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl">Training Processes</h1>
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={getTrainingData}
          >
            <i className="fa-solid fa-rotate text-lg"></i>
          </button>
        </div>

        {modelData.map((data) => (
          <div className="bg-base-200 collapse-arrow collapse" key={data.model}>
            <input type="checkbox" />
            <div className="collapse-title flex justify-between gap-2 text-xl font-medium">
              <button
                className="btn btn-ghost btn-circle btn-sm btn-error z-10"
                onClick={() => {
                  client.project.deleteTrainingOutput
                    .mutate({
                      projectId,
                      name: data.model,
                    })
                    .then(() => {
                      getTrainingData();
                    });
                }}
              >
                <i className="fa-solid fa-remove text-lg"></i>
              </button>
              <span className="flex-1">{data.model}</span>
              <button className="btn btn-primary btn-sm z-10">
                Open Viewer
              </button>
            </div>
            <div className="collapse-content w-fit">
              <div className="mockup-code">
                <SyntaxHighlighter
                  language="yaml"
                  style={dark}
                  customStyle={{
                    background: "transparent",
                    maxHeight: "1000px",
                    overflow: "auto",
                  }}
                  wrapLongLines
                >
                  {data.config}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        ))}
      </div>

      {consoleData.length > 0 && <Console data={consoleData} />}
    </>
  );
}
