import { Link } from "react-router-dom";

export default function Progress({
  projectId,
  stage,
}: {
  projectId: string;
  stage?: string;
}) {
  const stages = {
    upload: "Upload",
    process: "Process",
    train: "Train",
    export: "Export",
  };

  if (!stage) return null;

  return (
    <ul className="steps pb-8">
      {Object.entries(stages).map(([key, value], i) => (
        <Link
          key={key}
          className={`step ${
            i <= Object.keys(stages).indexOf(stage) ? "step-primary" : ""
          }`}
          to={`/project/${projectId}/${key}`}
        >
          {value}
        </Link>
      ))}
    </ul>
  );
}
