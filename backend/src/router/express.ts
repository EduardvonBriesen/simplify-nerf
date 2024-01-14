import express from "express";
import { exec, spawn } from "child_process";
import multer from "multer";
import path from "path";
import io from "../socket";

const folder = "./workspace";

const router = express.Router();

router.get("/test", (req: any, res: any) => {
  console.log("Test");

  const process = spawn("python", ["app.py"], {
    cwd: "./test",
  });

  process.stdout.on("data", (data: any) => {
    console.log("Sending data to client:", data.toString());
    io.emit("data", data.toString());
  });

  process.stderr.on("data", (data: any) => {
    console.log("Sending data to client:", data.toString());
    io.emit("data", data.toString());
  });

  return res.status(200).json({ message: "Test" });
});

router.get("/download", (req: any, res: any) => {
  console.log("Downloading file...");

  const process = spawn(
    "ns-download-data",
    ["nerfstudio", "--capture-name=poster"],
    {
      cwd: folder,
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

router.get("/process", (req: any, res: any) => {
  console.log("Processing...");

  const process = spawn(
    "ns-process-data",
    ["images", "--data", "./tmp/", "--output-dir", "./tmp/output"],
    {
      cwd: folder,
    },
  );

  process.stdout.on("data", (data: any) => {
    console.log("Sending data to client");
    io.emit("data", data.toString());
  });

  process.stderr.on("data", (data: any) => {
    console.log("Sending data to client");
    io.emit("data", data.toString());
  });

  process.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
    return res.status(200).json({ message: "Files processed successfully" });
  });
});

router.get("/train", (req: any, res: any) => {
  console.log("Training model...");
  const process = spawn(
    "ns-train",
    [
      "nerfacto",
      "--data",
      "/workspace/data/nerfstudio/poster",
      "--logging.local-writer.max-log-size=1",
    ],
    {
      cwd: "/workspace",
    },
  );

  console.log("Command: ", process.spawnargs.join(" "));

  process.stdout.on("data", (data: any) => {
    console.log("Sending data to client");
    io.emit("data", data.toString());
  });

  process.stderr.on("data", (data: any) => {
    console.log("Sending data to client");
    io.emit("data", data.toString());
  });

  process.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
    return res.status(200).json({ message: "Model trained successfully" });
  });
});

// // create new directory for project
router.post("/project", (req: any, res: any) => {
  console.log("Creating project...");
  exec(
    `mkdir ${folder}/projects/` + req.body.projectName,
    (err: any, stdout: any, stderr: any) => {
      if (err) {
        console.log(err);
      }
      console.log(stdout);
      console.log(stderr);
    },
  );
  return res.status(200).json({ message: "Project created successfully" });
});

const storage = multer.diskStorage({
  destination: `${folder}/projects/`,
  filename: (req, file, cb) => {
    // Preserve original file name
    cb(
      null,
      `${file.originalname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({ storage });

router.post("/upload", upload.array("files"), (req, res) => {
  // If using `upload.array('files')`, `req.files` will contain the uploaded files
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files were uploaded" });
  }

  // Process the uploaded files as needed
  // Example: Move files, save file details to database, etc.

  return res.status(200).json({ message: "Files uploaded successfully" });
});

export default router;
