import React from "react";
import { Link } from "react-router-dom";

export default function Progress({
  projectId,
  stage,
}: {
  projectId: string;
  stage?: string;
}) {
  const stages = {
    process: "Process",
    train: "Train",
    viewer: "Viewer",
  };

  if (!stage) return null;

  return (
    <div className="w-full">
      <ul className="steps w-full">
        {Object.entries(stages).map(([key, value], i) => (
          <Link
            key={key}
            className={`step step-neutral ${
              i <= Object.keys(stages).indexOf(stage) ? "step-primary" : ""
            }`}
            to={`/project/${projectId}/${key}`}
          >
            {value}
          </Link>
        ))}
      </ul>
    </div>
  );
}
