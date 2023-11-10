const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { spawn, exec } = require("child_process");
const cors = require("cors");

const corsOptions = {
  origin: "*",
};
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Enable CORS with permissive options
app.use(cors(corsOptions));

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("run", () => {
    console.log("Running Python script...");
    const process = spawn("python", ["../test/app.py"]);

    // Handle data from Python script
    process.stdout.on("data", (data) => {
      console.log("Sending data to client");
      socket.emit("data", data.toString());
    });
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    process.kill();
  });
});

app.get("/run-rest", (req, res) => {
  console.log("Processing request...");
  exec("python ../test/app.py", (error, stdout, stderr) => {
    if (error) {
      res.send(error.message);
      return;
    }
    if (stderr) {
      res.send(stderr);
      return;
    }
    res.send(stdout);
    console.log("Request processed");
  });
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
