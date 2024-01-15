import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { project } = req.query;
    cb(null, path.join("./workspace", "projects", project as string, "data"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.originalname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({ storage });

router.post("/upload", upload.array("files"), (req, res) => {
  console.log("Uploading files...");

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files were uploaded" });
  }

  return res.status(200).json({
    files: (req.files as Express.Multer.File[]).map((file) => file.filename),
  });
});

export default router;
