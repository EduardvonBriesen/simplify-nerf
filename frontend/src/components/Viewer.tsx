import React, { useEffect, useState } from "react";
import client from "../utils/trpc";
import { get } from "react-hook-form";

export default function Viewer({ projectId }: { projectId: string }) {
  const [renders, setRenders] = useState<string[]>([]);

  useEffect(() => {
    getRenders();
  }, []);

  function getRenders() {
    client.project.getRenders.query({ projectId }).then((data) => {
      setRenders(data.files);
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
      <div className="card bg-base-300 h-full w-full p-4">
        <iframe
          src="http://localhost:7007/"
          title="Python"
          className="h-full w-full rounded-md"
        ></iframe>
      </div>
      <div className="card bg-base-300 flex w-full flex-col gap-2 p-8">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl">Renders</h1>
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={getRenders}
          >
            <i className="fa-solid fa-rotate text-lg"></i>
          </button>
        </div>
        {renders.map((data) => (
          <div className="bg-base-200 collapse" key={data}>
            <input type="checkbox" />
            <div className="collapse-title flex justify-between gap-2 text-xl font-medium">
              <button
                className="btn btn-ghost btn-circle btn-sm btn-error z-10"
                onClick={() => {
                  client.project.deleteRender
                    .mutate({
                      projectId,
                      name: data,
                    })
                    .then(() => getRenders());
                }}
              >
                <i className="fa-solid fa-remove text-lg"></i>
              </button>
              <span className="flex-1">{data}</span>
              <button
                className="btn btn-primary btn-sm z-10"
                onClick={() => downloadRender(data)}
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
