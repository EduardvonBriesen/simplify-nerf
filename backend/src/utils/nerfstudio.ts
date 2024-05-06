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

  // Remove mock file when render is complete
  process.on("close", (code) => {
    console.log(`Render process exited with code ${code}`);
    setStatus(projectPath, fileName, "done");
  });
}

export function exportPointCloud(
  configPath: string,
  numPoints: string,
  removeOutliers: string,
  normalMethod: string,
  useBoundingBox: string,
  saveWorldFrame: string,
  cropString: string,
) {}

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

  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
}
