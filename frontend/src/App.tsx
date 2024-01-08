import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

function App() {
  const [socketData, setSocketData] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const socket = socketIOClient("http://localhost:3000");

    socket.on("data", (data: string) => {
      setSocketData((prev) => [...prev, data]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      socket?.removeAllListeners();
    });
  }, []);

  const handleDownload = () => {
    fetch("http://localhost:3000/download")
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
      });
  };

  const handleTrain = () => {
    fetch("http://localhost:3000/train")
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
      });
  };

  const handleProcess = () => {
    fetch("http://localhost:3000/process")
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="card w-full max-w-5xl bg-slate-700 p-8 shadow-xl">
        <h1>Upload File</h1>
        <form className="flex justify-evenly" onSubmit={handleFileUpload}>
          <input
            className="file-input file-input-bordered file-input-primary w-full max-w-lg"
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
      <div className="card w-full max-w-5xl bg-slate-700 p-8 shadow-xl">
        <div className="flex gap-4 pb-8">
          <button className="btn btn-primary w-min" onClick={handleDownload}>
            Download
          </button>
          <button className="btn btn-primary w-min" onClick={handleProcess}>
            Process
          </button>
          <button className="btn btn-primary w-min" onClick={handleTrain}>
            Train
          </button>
        </div>
        <div className="mockup-code h-96 overflow-y-scroll">
          {socketData.map((data, index) => (
            <pre key={index}>{data}</pre>
          ))}
        </div>
      </div>
      {/* <iframe
        src="https://viewer.nerf.studio/versions/23-05-15-1/?websocket_url=ws://localhost:7007"
        title="Python"
        className="h-screen  w-full p-4"
      ></iframe> */}
    </div>
  );
}

export default App;
