import express from "express";
import multer from "multer";
import path from "path";
import { renderCameraPath } from "../utils/nerfstudio";

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

export default router;
