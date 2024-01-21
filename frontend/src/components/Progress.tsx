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
    export: "Export",
  };

  if (!stage) return null;

  return (
    <ul className="steps h-full">
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
