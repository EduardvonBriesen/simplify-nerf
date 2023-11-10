import { useState } from "react";
import socketIOClient from "socket.io-client";
import "./App.css";

function App() {
  const [socketData, setSocketData] = useState("");
  const [restData, setRestData] = useState("");

  const socket = socketIOClient("http://localhost:3000");

  const handleSocket = () => {
    socket.connect();

    socket.emit("run");

    socket.on("data", (data) => {
      setSocketData(data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      socket.removeAllListeners();
    });
  };

  const handleRest = () => {
    fetch("http://localhost:3000/run-rest")
      .then((response) => response.text())
      .then((data) => {
        setRestData((prev) => (prev += data + "\n"));
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
    </>
  );
}

export default App;
