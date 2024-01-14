import { useState, useEffect } from "react";
import { socket } from "./utils/socket";
import Prototype from "./components/Prototype";
import Console from "./components/Console";

export default function App() {
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

  return (
    <div className="flex max-w-5xl flex-col items-center justify-center gap-8 p-8">
      <Prototype />
      <Console socketData={socketData} connected={isConnected} />
    </div>
  );
}
