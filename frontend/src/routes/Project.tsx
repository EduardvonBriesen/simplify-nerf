import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Console from "../components/Console";
import Process from "../components/Process";
import Train from "../components/Train";
import Upload from "../components/Upload";
import { socket } from "../utils/socket";
import Progress from "../components/Progress";

export default function Project() {
  const { projectId, stage } = useParams<{
    projectId: string;
    stage: string;
  }>();

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketData, setSocketData] = useState<string[]>([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("data", (data: string) => {
      setSocketData((prev) => [...prev, data]);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("data");
    };
  }, []);

  if (!projectId) return null;

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <h1 className="text-center text-3xl font-bold">{projectId}</h1>
      <Progress projectId={projectId} stage={stage} />
      {stage === "upload" && <Upload projectId={projectId} />}
      {stage === "process" && <Process projectId={projectId} />}
      {stage === "train" && <Train projectId={projectId} />}
      {stage === "export" && <div>Export</div>}
      {stage !== "upload" && (
        <div className="h-full">
          <Console socketData={socketData} connected={isConnected} />
        </div>
      )}
    </div>
  );
}
