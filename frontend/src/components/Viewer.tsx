import React, { useEffect, useState } from "react";
import client from "../utils/trpc";
import { get } from "react-hook-form";

export default function Viewer({ projectId }: { projectId: string }) {
  const [renders, setRenders] = useState<{
    [key: string]: "running" | "done" | "error";
  }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      getExports();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  function getExports() {
    client.project.getExports.query({ projectId }).then((data) => {
      setRenders(data);
    });
  }

  async function downloadRender(filename: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/download/${filename}?project=${projectId}`,
      );
      if (!response.ok) {
        throw new Error("Error downloading file");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }

  return (
    <>
      <div className="card bg-base-300 aspect-square w-full p-4 shadow-lg">
        <iframe
          src="http://localhost:7007/"
          title="Python"
          className="h-full w-full rounded-md"
        ></iframe>
        <div
          className="tooltip absolute bottom-4 left-4 z-10 m-4"
          data-tip="Open Viewer in new Tab"
        >
          <a
            className="btn btn-primary btn-circle btn-lg shadow-lg"
            href="http://localhost:7007/"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-solid fa-external-link-alt text-lg"></i>
          </a>
        </div>
      </div>
      <div className="card bg-base-300 flex w-full flex-col gap-2 p-8 shadow-lg">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl">Renders</h1>
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={getExports}
          >
            <i className="fa-solid fa-rotate text-lg"></i>
          </button>
        </div>
        {Object.keys(renders).map((data) => (
          <div className="bg-base-200 collapse" key={data}>
            <input type="checkbox" />
            <div className="collapse-title flex justify-between gap-2 text-xl font-medium">
              <button
                className="btn btn-ghost btn-circle btn-sm btn-error z-10"
                onClick={() => {
                  client.project.deleteExport
                    .mutate({
                      projectId,
                      name: data,
                    })
                    .then(() => getExports());
                }}
              >
                <i className="fa-solid fa-remove text-lg"></i>
              </button>
              <span className="flex-1">{data}</span>
              {renders[data] === "running" ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <button
                  className="btn btn-primary btn-sm z-10"
                  onClick={() => downloadRender(data)}
                >
                  Download
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
