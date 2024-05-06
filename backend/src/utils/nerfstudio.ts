import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export function renderCameraPath(
  projectPath: string,
  configPath: string,
  cameraPath: string,
  outputPath: string,
) {
  const fileName = outputPath.split("/").pop();

  setStatus(projectPath, fileName, "running");

  const process = spawn(
    "ns-render",
    [
      "camera-path",
      "--load-config",
      configPath,
      "--camera-path-filename",
      cameraPath,
      "--output-path",
      outputPath,
    ],
    {
      cwd: projectPath,
    },
  );

  console.log("Running command", process.spawnargs.join(" "));
  console.log("Working directory", process.spawnfile);

  process.stdout.on("data", (data: any) => {
    console.log("Sending data to client:", data.toString());
  });

  process.stderr.on("data", (data: any) => {
    console.log("Sending data to client:", data.toString());
    setStatus(projectPath, fileName, "error");
  });

  process.on("close", (code) => {
    console.log(`Render process exited with code ${code}`);
    setStatus(projectPath, fileName, "done");
  });
}

export function exportPointCloud(
  projectPath: string,
  exportName: string,
  configPath: string,
  numPoints: string,
  removeOutliers: string,
  normalMethod: string,
  useBoundingBox: string,
  saveWorldFrame: string,
  cropString: string,
) {
  setStatus(projectPath, exportName, "running");

  const process = spawn(
    "ns-export",
    [
      "pointcloud",
      "--load-config",
      configPath,
      "--output-dir",
      path.join(projectPath, "renders"),
      "--num-points",
      numPoints,
      "--remove-outliers",
      removeOutliers,
      "--normal-method",
      normalMethod,
      "--use-bounding-box",
      useBoundingBox,
      "--save-world-frame",
      saveWorldFrame,
      ...cropString.split(" "),
    ],
    {
      cwd: projectPath,
    },
  );

  console.log("Running command", process.spawnargs.join(" "));

  process.stdout.on("data", (data: any) => {
    console.log("Sending data to client:", data.toString());
  });

  process.stderr.on("data", (data: any) => {
    console.log("Sending data to client:", data.toString());
    setStatus(projectPath, exportName, "error");
  });

  process.on("close", (code) => {
    console.log(`Render process exited with code ${code}`);
    // rename the file to the export name
    const oldPath = path.join(projectPath, "renders", "point_cloud.ply");
    const newPath = path.join(projectPath, "renders", `${exportName}`);
    fs.renameSync(oldPath, newPath);
    setStatus(projectPath, exportName, "done");
  });
}

export function exportMesh(
  projectPath: string,
  exportName: string,
  configPath: string,
  numFaces: string,
  textureResolution: string,
  numPoints: string,
  removeOutliers: string,
  normalMethod: string,
  useBoundingBox: string,
  cropString: string,
) {
  setStatus(projectPath, exportName, "running");

  const process = spawn(
    "ns-export",
    [
      "poisson",
      "--load-config",
      configPath,
      "--output-dir",
      path.join(projectPath, "renders"),
      "--target-num-faces",
      numFaces,
      "--num-pixels-per-side",
      textureResolution,
      "--num-points",
      numPoints,
      "--remove-outliers",
      removeOutliers,
      "--normal-method",
      normalMethod,
      "--use-bounding-box",
      useBoundingBox,
      ...cropString.split(" "),
    ],
    {
      cwd: projectPath,
    },
  );

  console.log("Running command", process.spawnargs.join(" "));

  process.stdout.on("data", (data: any) => {
    console.log("Sending data to client:", data.toString());
  });

  process.stderr.on("data", (data: any) => {
    console.log("Sending data to client:", data.toString());
    setStatus(projectPath, exportName, "error");
  });

  process.on("close", (code) => {
    console.log(`Render process exited with code ${code}`);
    // rename the file to the export name
    const oldPath = path.join(projectPath, "renders", "mesh.obj");
    const newPath = path.join(projectPath, "renders", `${exportName}`);
    fs.renameSync(oldPath, newPath);
    setStatus(projectPath, exportName, "done");
  });
}

export function exportGaussianSplat(
  projectPath: string,
  exportName: string,
  configPath: string,
) {
  setStatus(projectPath, exportName, "running");

  const process = spawn(
    "ns-export",
    [
      "gaussian-splat",
      "--load-config",
      configPath,
      "--output-dir",
      path.join(projectPath, "renders"),
    ],
    {
      cwd: projectPath,
    },
  );

  console.log("Running command", process.spawnargs.join(" "));

  process.stdout.on("data", (data: any) => {
    console.log("Sending data to client:", data.toString());
  });

  process.stderr.on("data", (data: any) => {
    console.log("Sending data to client:", data.toString());
    setStatus(projectPath, exportName, "error");
  });

  process.on("close", (code) => {
    console.log(`Render process exited with code ${code}`);
    // rename the file to the export name
    const oldPath = path.join(projectPath, "renders", "gaussian_splat.ply");
    const newPath = path.join(projectPath, "renders", `${exportName}`);
    fs.renameSync(oldPath, newPath);
    setStatus(projectPath, exportName, "done");
  });
}

function setStatus(
  projectPath: string,
  fileName: string,
  status: "running" | "done" | "error",
) {
  const statusFile = path.join(projectPath, "renders", "status.json");

  const statusFileExists = fs.existsSync(statusFile);
  if (!statusFileExists) {
    fs.writeFileSync(statusFile, JSON.stringify({}));
  }

  const statusData: {
    [key: string]: "running" | "done" | "error";
  } = JSON.parse(fs.readFileSync(statusFile, "utf-8"));

  const updatedStatus = {
    ...statusData,
    [fileName]: status,
  };

  fs.writeFileSync(statusFile, JSON.stringify(updatedStatus, null, 2));
}
