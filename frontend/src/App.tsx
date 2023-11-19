import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

function App() {
  const [socketData, setSocketData] = useState("");

  const [socket, setSocket] = useState<any>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSocket(socketIOClient("http://localhost:3000"));
  }, []);

  const handleSocket = () => {
    socket.emit("run");
    setRunning(true);

    socket.on("data", (data: any) => {
      setSocketData(data);
    });

    socket.on("done", () => {
      setRunning(false);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      socket?.removeAllListeners();
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="prose card w-4/5 bg-slate-700 p-8 shadow-xl">
        <h1>Python Output</h1>

        <h2>Socket.io</h2>
        <button className="btn btn-primary w-32" onClick={handleSocket}>
          {!running ? (
            <span>Run</span>
          ) : (
            <span className="loading loading-spinner loading-sm"></span>
          )}
        </button>
        <p>Socket.io output:</p>
        <div className="mockup-code h-32">
          <pre data-prefix=">">
            <code>{socketData}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
