import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export function renderCameraPath(
  projectPath: string,
  configPath: string,
  cameraPath: string,
  outputPath: string,
) {
  const fileName = cameraPath.split("/").pop();

  // Represents the status of all renders in a JSON file
  const statusFile = path.join(projectPath, "renders", "status.json");

  const statusFileExists = fs.existsSync(statusFile);
  if (!statusFileExists) {
    fs.writeFileSync(statusFile, JSON.stringify({}));
  }

  const statusData: {
    [key: string]: "running" | "done" | "error";
  } = JSON.parse(fs.readFileSync(statusFile, "utf-8"));

  const status = {
    ...statusData,
    [fileName]: "running",
  };

  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));

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
    const status = {
      ...statusData,
      [fileName]: "error",
    };
    fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
  });

  // Remove mock file when render is complete
  process.on("close", (code) => {
    console.log(`Render process exited with code ${code}`);
    const status = {
      ...statusData,
      [fileName]: "done",
    };
    fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
  });
}
