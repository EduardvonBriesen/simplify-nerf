import { useState, useEffect } from "react";
import { socket } from "./utils/socket";
import Prototype from "./components/Prototype";
import Console from "./components/Console";
import Projects from "./components/Projects";
import Files from "./components/Files";
import Upload from "./components/Upload";
import Process from "./components/Process";
import Train from "./components/Train";

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketData, setSocketData] = useState<string[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);

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

  return (
    <div className="grid  grid-cols-2 gap-8 p-8">
      <div className="flex flex-col gap-8  ">
        <Prototype />
        <Projects
          activeProject={activeProject}
          setActiveProject={setActiveProject}
        />
        {activeProject && (
          <>
            <Upload activeProject={activeProject} />
            <Files activeProject={activeProject} />
            <Process activeProject={activeProject} />
            <Train activeProject={activeProject} />
          </>
        )}
      </div>
      <Console socketData={socketData} connected={isConnected} />
    </div>
  );
}
