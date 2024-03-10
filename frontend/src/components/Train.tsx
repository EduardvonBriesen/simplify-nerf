import React, { useEffect, useRef, useState } from "react";
import { useForm, FormProvider, SubmitHandler, set } from "react-hook-form";
import client, { RouterInput } from "../utils/trpc";
import { basicFilter, trainingOptions } from "../utils/trainingSetting";
import Input, { ToolTip } from "./Input";
import Console from "./Console";
import { toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function Train({ projectId }: { projectId: string }) {
  const methods = useForm();
  const [filter, setFilter] = useState<string[] | undefined>(basicFilter);
  const [loading, setLoading] = useState(false);
  const [consoleData, setConsoleData] = useState<string[]>([]);
  const [modelData, setModelData] = useState<
    {
      model: string;
      config: string;
      checkpoints: string[];
    }[]
  >([]);
  const [processedData, setProcessedData] = useState<string[]>([]);

  const checkpointModal = useRef<HTMLDialogElement>(null);
  const [checkpointData, setCheckpointData] = useState<{
    model: string;
    checkpoints: string[];
  }>();

  const loadingViewerModal = useRef<HTMLDialogElement>(null);
  const [viewerReady, setViewerReady] = useState(false);

  const navigate = useNavigate();

  // get training data from url params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const inputData = queryParams.get("data");

  useEffect(() => {
    if (!projectId) return;
    if (inputData) getTrainingData(inputData);
    client.project.getPreProcessOutput.query({ projectId }).then((data) => {
      setProcessedData(data.outputs.map((output) => output.name));
      if (!inputData) {
        navigate(`/project/${projectId}/train?data=${data.outputs[0].name}`);
      }
    });
  }, [projectId]);

  const handleTrain: SubmitHandler<RouterInput["nerfstudio"]["train"]> = (
    data,
  ) => {
    if (!projectId || !inputData) return;
    setLoading(true);
    loadingViewerModal.current?.showModal();
    client.nerfstudio.train.subscribe(
      {
        ...data,
        project: projectId,
        data: inputData,
      },
      {
        onData(data) {
          setConsoleData((prev) => [...prev, data.message]);
          if (data.message.includes("Viewer running")) setViewerReady(true);
        },
        onError(err) {
          setConsoleData((prev) => [...prev, err.message]);
        },
        onComplete() {
          toast.success("Training complete");
          setLoading(false);
        },
      },
    );
  };

  const loadCheckpoint = (checkpoint: string, model: string) => {
    if (!projectId || !inputData) return;
    setLoading(true);
    loadingViewerModal.current?.showModal();
    client.nerfstudio.loadCheckpoint.subscribe(
      {
        projectId,
        data: inputData,
        model,
        checkpoint,
      },
      {
        onData(data) {
          setConsoleData((prev) => [...prev, data.message]);
          if (data.message.includes("Viewer running")) setViewerReady(true);
        },
        onError(err) {
          toast.error(err.message);
          setLoading(false);
        },
        onComplete() {
          toast.success("Checkpoint loaded");
          setLoading(false);
        },
      },
    );
  };

  function getTrainingData(inputData: string) {
    if (!projectId) {
      setModelData([]);
      return;
    }
    client.project.getTrainingOutput
      .query({ projectId, processData: inputData })
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
              <div>
                <div className="label">
                  <span className="label-text">Select Data</span>
                  <ToolTip tooltip="Select the data to train the model" />
                </div>
                <select
                  className="select select-primary w-full"
                  required
                  value={inputData || undefined}
                  onChange={(e) => {
                    navigate(
                      `/project/${projectId}/train?data=${e.target.value}`,
                    );
                    getTrainingData(e.target.value);
                  }}
                >
                  <option value={undefined} disabled>
                    --- Select an option ---
                  </option>
                  {processedData.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {trainingOptions
                .filter((option) => !filter || filter.includes(option.name))
                .map((option) => (
                  <Input input={option} key={option.name} filter={filter} />
                ))}
            </div>
            <div className="flex justify-end gap-4">
              {viewerReady && (
                <Link
                  to={`/project/${projectId}/viewer`}
                  className="btn btn-primary w-48"
                >
                  Open Viewer
                </Link>
              )}
              <button
                type="submit"
                className="btn btn-primary w-48"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Start Processing"
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>

      <div className="card bg-base-300 flex w-full flex-col gap-2 p-8">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl">Training Processes</h1>
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={() => {
              if (inputData) getTrainingData(inputData);
            }}
          >
            <i className="fa-solid fa-rotate text-lg"></i>
          </button>
        </div>

        {modelData.length === 0 && (
          <div className="text-center text-lg font-bold">
            No training processes found
          </div>
        )}

        {modelData.map((data) => (
          <div className="bg-base-200 collapse-arrow collapse" key={data.model}>
            <input type="checkbox" />
            <div className="collapse-title flex justify-between gap-2 text-xl font-medium">
              <button
                className="btn btn-ghost btn-circle btn-sm btn-error z-10"
                onClick={() => {
                  if (!projectId || !inputData) return;
                  client.project.deleteTrainingOutput
                    .mutate({
                      projectId,
                      processData: inputData,
                      name: data.model,
                    })
                    .then(() => {
                      getTrainingData(inputData);
                    });
                }}
              >
                <i className="fa-solid fa-remove text-lg"></i>
              </button>
              <span className="flex-1">{data.model}</span>
              {data.checkpoints.length > 0 && (
                <button
                  className="btn btn-primary btn-sm z-10"
                  disabled={loading}
                  onClick={(e) => {
                    setCheckpointData({
                      model: data.model,
                      checkpoints: data.checkpoints,
                    });
                    checkpointModal.current?.showModal();
                  }}
                >
                  Load Checkpoint
                </button>
              )}
              <button
                className="btn btn-primary btn-outline btn-sm z-10"
                disabled={loading}
                onClick={() => {
                  if (!projectId || !inputData) return;
                  setLoading(true);
                  loadingViewerModal.current?.showModal();
                  client.nerfstudio.viewer
                    .query({
                      projectId,
                      processData: inputData,
                      name: data.model,
                    })
                    .then(() => {
                      setViewerReady(true);
                    })
                    .catch((err) => {
                      setLoading(false);
                      loadingViewerModal.current?.close();
                      toast.error(err.message);
                    });
                }}
              >
                Open Viewer
              </button>
            </div>
            <div className="collapse-content w-fit">
              <div className="mockup-code">
                <SyntaxHighlighter
                  language="yaml"
                  style={atomOneDark}
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

      <dialog className="modal" ref={checkpointModal}>
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="pb-4 text-lg font-bold">Checkpoints</h3>
          {checkpointData && (
            <ul>
              {checkpointData.checkpoints.map((checkpoint) => (
                <li
                  key={checkpoint}
                  className="bg-base-300 flex items-center justify-between rounded-md p-4"
                >
                  {checkpoint}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      loadCheckpoint(checkpoint, checkpointData.model);
                    }}
                  >
                    Load
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>

      <dialog className="modal" ref={loadingViewerModal}>
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          {viewerReady ? (
            <>
              <h3 className="mb-6 text-lg font-bold">Viewer is Ready</h3>
              <div className="modal-action">
                <Link
                  to={`/project/${projectId}/viewer`}
                  className="btn btn-primary"
                >
                  Open Viewer
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="mb-6 text-lg font-bold">
                The Viewer is Starting...
              </h3>
              <div className="flex justify-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
