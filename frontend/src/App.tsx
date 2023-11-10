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
    fetch("http://localhost:3000/run-rest")
      .then((response) => response.text())
      .then((data) => {
        setRestData((prev) => (prev += data + "\n"));
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
    <>
      <h1>Python Output</h1>

      <h2>Socket.io</h2>
      <button onClick={handleSocket}>Run</button>
      <p>Socket.io output:</p>
      <p>{socketData}</p>

      <h2>REST</h2>
      <button onClick={handleRest}>Run</button>
      <p>REST output:</p>
      <p>{restData}</p>

      <h2>Upload File</h2>
      <form onSubmit={handleFileUpload}>
        <input name="file" type="file" />
        <button type="submit">Upload</button>
      </form>
    </>
  );
}

export default App;
