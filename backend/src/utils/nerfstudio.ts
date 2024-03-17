import { spawn } from "child_process";
import path from "path";

export function renderCameraPath(
  projectPath: string,
  configPath: string,
  cameraPath: string,
  outputPath: string,
) {
  // Create mock file in the output path to reflect the progress of the render
  const mockFilePath = path.join(projectPath, outputPath + ".running");
  spawn("touch", [mockFilePath]);

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
  });

  // Remove mock file when render is complete
  process.on("close", (code) => {
    console.log(`Render process exited with code ${code}`);
    spawn("rm", [mockFilePath]);
  });
}
