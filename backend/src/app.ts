import express from "express";
const app = express();
const server = require("http").createServer(app);
import { spawn, exec } from "child_process";
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

  socket.on("download", () => {
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
      socket.emit("data", data.toString());
    });
  });

  socket.on("train", () => {
    console.log("Training model...");
    process = spawn(
      "ns-train",
      ["nerfacto", " --data", "/workspace/data/nerfstudio/poster"],
      {
        cwd: "/workspace", // Set the working directory to /workspace
      },
    );
    process.stdout.on("data", (data: any) => {
      console.log("Sending data to client");
      socket.emit("data", data.toString());
    });

    process.stderr.on("data", (data) => {
      console.error("Sending stderr data to client");
      socket.emit("data", data.toString());
    });

    process.on("close", (code) => {
      console.log(`Child process exited with code ${code}`);
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

app.get("/run-rest", (req: any, res: any) => {
  console.log("Processing request...");
  exec(
    "ns-train nerfacto --data /workspace/data/nerfstudio/poster --output-dir /workspace/outputs",
    (error: { message: any }, stdout: any, stderr: any) => {
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
    },
  );
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
