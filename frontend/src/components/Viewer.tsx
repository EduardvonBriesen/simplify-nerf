import React from "react";

export default function Viewer() {
  return (
    <div className="card bg-base-300 h-full w-full p-4">
      <iframe
        src="http://localhost:7007/"
        title="Python"
        className="h-full w-full rounded-md"
      ></iframe>
    </div>
  );
}
