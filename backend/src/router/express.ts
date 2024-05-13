import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  exportGaussianSplat,
  exportMesh,
  exportPointCloud,
  renderCameraPath,
} from "../utils/nerfstudioExports";
import archiver from "archiver";
import { PassThrough } from "stream";

const WORKSPACE = process.env.WORKSPACE || "./workspace";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { project } = req.query;
    cb(null, path.join(WORKSPACE, project as string, "data"));
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage });

router.use(express.json());

router.post("/upload", upload.array("files"), (req, res) => {
  console.log("Uploading files...");

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files were uploaded" });
  }

  return res.status(200).json({
    files: (req.files as Express.Multer.File[]).map((file) => file.filename),
  });
});

router.get("/download/:filename", (req, res) => {
  const { filename } = req.params;
  const { project } = req.query;
  const filePath = path.join(
    WORKSPACE,
    project as string,
    "pre-process-output",
    "renders",
    filename,
  );

  console.log(`Downloading file: ${filePath}`);

  if (fs.statSync(filePath).isDirectory()) {
    // If the target is a directory, zip it before sending
    const zip = archiver("zip", { zlib: { level: 9 } }); // Set the compression level
    zip.on("error", (err) =>
      res.status(500).json({ error: "Error zipping file" }),
    );

    res.attachment(`${filename}.zip`); // Set the file name for the download
    zip.pipe(res);

    zip.directory(filePath, false); // Add the directory to the archive
    zip.finalize();
    return;
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath, (err) => {
    if (err) {
      res.status(500).json({ error: "Error downloading file" });
    }
  });
});

router.post("/render-camera-path", (req, res) => {
  console.log("Rendering camera path...");
  console.log(req.body);

  renderCameraPath(
    req.body.projectPath,
    req.body.configPath,
    req.body.cameraPath,
    req.body.outputPath,
  );

  return res.status(200).json({ message: "Rendering video..." });
});

router.post("/pointcloud", (req, res) => {
  console.log("Pointclouding...");
  console.log(req.body);

  exportPointCloud(
    req.body.projectPath,
    req.body.exportName,
    req.body.configPath,
    req.body.numPoints,
    req.body.removeOutliers,
    req.body.normalMethod,
    req.body.useBoundingBox,
    req.body.saveWorldFrame,
    req.body.cropString,
  );

  return res.status(200).json({ message: "Pointclouding..." });
});

router.post("/mesh", (req, res) => {
  console.log("Meshing...");
  console.log(req.body);

  exportMesh(
    req.body.projectPath,
    req.body.exportName,
    req.body.configPath,
    req.body.numFaces,
    req.body.textureResolution,
    req.body.numPoints,
    req.body.removeOutliers,
    req.body.normalMethod,
    req.body.useBoundingBox,
    req.body.cropString,
  );

  return res.status(200).json({ message: "Meshing..." });
});

router.post("/splatter", (req, res) => {
  console.log("Splattering...");
  console.log(req.body);

  exportGaussianSplat(
    req.body.projectPath,
    req.body.exportName,
    req.body.configPath,
  );

  return res.status(200).json({ message: "Splattering..." });
});

export default router;
