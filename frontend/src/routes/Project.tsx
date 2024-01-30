import React from "react";
import { useParams } from "react-router-dom";
import Process from "../components/Process";
import Train from "../components/Train";
import Upload from "../components/Upload";
import Progress from "../components/Progress";
import Viewer from "../components/Viewer";

export default function Project() {
  const { projectId, stage } = useParams<{
    projectId: string;
    stage: string;
  }>();

  if (!projectId) return null;

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <h1 className="text-center text-3xl font-bold">{projectId}</h1>
      <Progress projectId={projectId} stage={stage} />
      {stage === "process" && (
        <>
          <Process projectId={projectId} />
        </>
      )}
      {stage === "train" && <Train projectId={projectId} />}
      {stage === "viewer" && <Viewer />}
      {stage === "export" && <div>Export</div>}
    </div>
  );
}
