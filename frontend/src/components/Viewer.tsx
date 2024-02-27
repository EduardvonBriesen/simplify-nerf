import React from "react";
import client from "../utils/trpc";

export default function Viewer({ projectId }: { projectId: string }) {
  function getCameraPaths() {
    client.project.getCameraPaths.query({ projectId }).then((data) => {
      console.log(data);
    });
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
      <div className="card bg-base-300 w-full p-4">
        <button onClick={getCameraPaths} className="btn btn-primary">
          Get Camera Paths
        </button>
      </div>
    </>
  );
}
