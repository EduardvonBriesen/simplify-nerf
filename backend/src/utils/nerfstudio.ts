import { spawn } from "child_process";
import path from "path";

// export function trainModel(
//   dataPath: string,
//   stepsPerSave?: number,
//   stepsPerEvalBatch?: number,
//   stepsPerEvalImage?: number,
//   stepsPerEvalAllImages?: number,
//   maxNumIterations?: number,
//   mixedPrecision?: boolean,
//   useGradScaler?: boolean,
//   saveOnlyLatestCheckpoint?: boolean,
// ) {
//   const options = [
//     { flag: "--steps-per-save", value: stepsPerSave?.toString() },
//     {
//       flag: "--steps-per-eval-batch",
//       value: stepsPerEvalBatch?.toString(),
//     },
//     {
//       flag: "--steps-per-eval-image",
//       value: stepsPerEvalImage?.toString(),
//     },
//     {
//       flag: "--steps-per-eval-all-images",
//       value: stepsPerEvalAllImages?.toString(),
//     },
//     {
//       flag: "--max-num-iterations",
//       value: maxNumIterations?.toString(),
//     },
//     {
//       flag: "--mixed-precision",
//       value: mixedPrecision?.toString(),
//     },
//     {
//       flag: "--use-grad-scaler",
//       value: useGradScaler?.toString(),
//     },
//     {
//       flag: "--save-only-latest-checkpoint",
//       value: saveOnlyLatestCheckpoint?.toString(),
//     },
//   ];
// }

export function renderCameraPath(
  projectPath: string,
  configPath: string,
  cameraPath: string,
  outputPath: string,
) {
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
}
