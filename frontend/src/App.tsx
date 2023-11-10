import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

function App() {
  const [socketData, setSocketData] = useState("");
  const [restData, setRestData] = useState("");

  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    setSocket(socketIOClient("http://localhost:3000"));
  }, []);

  const handleSocket = () => {
    socket.emit("run");

    socket.on("data", (data: any) => {
      setSocketData(data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      socket?.removeAllListeners();
    });
  };

  const handleRest = () => {
    setRestData("");
    fetch("http://localhost:3000/run-rest")
      .then((response) => response.text())
      .then((data) => {
        setRestData(data);
      });
  };

  const handleFileUpload = (event: any) => {
    event.preventDefault();
    const data = new FormData(event.target);
    fetch("http://localhost:3000/upload", {
      method: "POST",
      body: data,
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
      });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="prose card w-4/5 bg-slate-700 p-8 shadow-xl">
        <h1>Python Output</h1>

        <h2>Socket.io</h2>
        <button className="btn btn-primary w-min" onClick={handleSocket}>
          Run
        </button>
        <p>Socket.io output:</p>
        <div className="mockup-code">
          <pre data-prefix=">">
            <code>{socketData}</code>
          </pre>
        </div>

        <h2>REST</h2>
        <button className="btn btn-primary w-min" onClick={handleRest}>
          Run
        </button>
        <p>REST output:</p>
        <div className="mockup-code">
          <pre data-prefix=">">
            <code>{restData}</code>
          </pre>
        </div>

        <h2>Upload File</h2>
        <form className="flex justify-evenly" onSubmit={handleFileUpload}>
          <input
            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
            name="file"
            type="file"
          />
          <button className="btn btn-primary" type="submit">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
