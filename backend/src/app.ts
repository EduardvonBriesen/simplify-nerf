import express from "express";
const app = express();
const server = require("http").createServer(app);
import { spawn } from "child_process";
import cors from "cors";
import multer from "multer";
import path from "path";

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
io.on("connection", (socket: any) => {
  console.log("Client connected");

  let process: any;

  socket.on("run", () => {
    console.log("Running Python script...");
    process = spawn("python3", ["./test/app.py"]);

    // Handle data from Python script
    process.stdout.on("data", (data: any) => {
      console.log("Sending data to client");
      socket.emit("data", data.toString());
    });
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    if (process) {
      process.kill(undefined);
    }
  });
});

app.get("/run", (req: any, res: any) => {
  console.log("Running Python script...");
  const process = spawn("python3", ["./test/app.py"]);

  // Handle data from Python script
  process.stdout.on("data", (data: any) => {
    console.log("Sending data to client");
    io.emit("data", data.toString());
  });

  process.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
    return res.status(200).json({ message: "Script executed successfully" });
  });
});

app.get("/download", (req: any, res: any) => {
  console.log("Downloading file...");
  const process = spawn(
    "ns-download-data",
    ["nerfstudio", "--capture-name=poster"],
    {
      cwd: "/workspace", // Set the working directory to /workspace
    },
  );
  process.stdout.on("data", (data: any) => {
    console.log("Sending data to client");
    io.emit("data", data.toString());
  });

  process.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
    return res.status(200).json({ message: "Files downloaded successfully" });
  });
});

app.get("process", (req: any, res: any) => {
  console.log("Processing...");
  const process = spawn(
    "ns-process-data",
    ["images", "--data", "./tmp/", "--output-dir", "./tmp/output"],
    {
      cwd: "/workspace", // Set the working directory to /workspace
    },
  );
  process.stdout.on("data", (data: any) => {
    console.log("Sending data to client");
    io.emit("data", data.toString());
  });

  process.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
    return res.status(200).json({ message: "Files processed successfully" });
  });
});

app.get("train", (req: any, res: any) => {
  console.log("Training model...");
  const process = spawn(
    "ns-train",
    ["nerfacto", " --data", "/workspace/data/nerfstudio/poster"],
    {
      cwd: "/workspace", // Set the working directory to /workspace
    },
  );
  process.stdout.on("data", (data: any) => {
    console.log("Sending data to client");
    io.emit("data", data.toString());
  });

  process.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
    return res.status(200).json({ message: "Model trained successfully" });
  });
});

const storage = multer.diskStorage({
  destination: "tmp/",
  filename: (req, file, cb) => {
    // Preserve original file name
    cb(
      null,
      `${file.originalname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({ storage });

app.post("/upload", upload.array("files"), (req, res) => {
  // If using `upload.array('files')`, `req.files` will contain the uploaded files
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files were uploaded" });
  }

  // Process the uploaded files as needed
  // Example: Move files, save file details to database, etc.

  return res.status(200).json({ message: "Files uploaded successfully" });
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
