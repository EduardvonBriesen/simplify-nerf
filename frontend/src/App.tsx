import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

function App() {
  const terminalRef = useRef(null);
  const [socketData, setSocketData] = useState("");
  const [restData, setRestData] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const term = new Terminal();
    if (terminalRef.current) {
      term.open(terminalRef.current);
    }
    term.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");

    const socket = socketIOClient("http://localhost:3000");
    setSocket(socket);

    socket.on("data", (data: string) => {
      setSocketData(data);
      term.write(data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      socket?.removeAllListeners();
    });
  }, []);

  const handleRest = () => {
    setRestData("");
    fetch("http://localhost:3000/run-rest")
      .then((response) => response.text())
      .then((data) => {
        setRestData(data);
      });
  };

  const handleFileUpload = async (event: any) => {
    event.preventDefault();

    if (!selectedFiles) {
      alert("Please select files to upload");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i], selectedFiles[i].name);
    }

    try {
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Handle success
        console.log("Files uploaded successfully");
      } else {
        // Handle error
        console.error("Failed to upload files");
      }
    } catch (error) {
      console.error("Error occurred while uploading files:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      {/* <div ref={terminalRef}></div> */}
      <div className="prose card w-4/5 bg-slate-700 p-8 shadow-xl">
        <h1>Python Output</h1>
        <h2>Socket.io</h2>
        <div className="flex gap-4">
          <button
            className="btn btn-primary w-min"
            onClick={() => socket.emit("run")}
          >
            Run
          </button>
          <button
            className="btn btn-primary w-min"
            onClick={() => socket.emit("download")}
          >
            Download
          </button>
          <button
            className="btn btn-primary w-min"
            onClick={() => socket.emit("train")}
          >
            Train
          </button>
        </div>
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

        {/* <iframe
          src="https://viewer.nerf.studio/versions/23-05-15-1/?websocket_url=ws://localhost:7007"
          title="Python"
          className="h-96 w-full"
        ></iframe> */}

        <h2>Upload File</h2>
        <form className="flex justify-evenly" onSubmit={handleFileUpload}>
          <input
            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
            name="file"
            type="file"
            multiple
            onChange={(e) => setSelectedFiles(e.target.files)}
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
