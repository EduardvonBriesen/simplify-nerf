import { spawn } from "child_process";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import path from "path";
import { observable } from "@trpc/server/observable";
import fs from "fs";

const WORKSPACE = process.env.WORKSPACE || "./workspace";

export const nerfstudioRouter = router({
  test: publicProcedure.subscription(() => {
    return observable<{ message: string }>((emit) => {
      const process = spawn("python", ["app.py"], {
        cwd: "./test",
      });

      process.stdout.on("data", (data: any) => {
        console.log("Sending data to client:", data.toString());
        emit.next({ message: data.toString() });
      });

      process.stderr.on("data", (data: any) => {
        console.log("Sending data to client:", data.toString());
        emit.next({ message: data.toString() });
      });

      return () => {
        process.kill();
      };
    });
  }),
  process: publicProcedure
    .input(
      z.object({
        project: z.string(),
        dataType: z.enum(["images", "video", "polycam", "record3d"]),
        cameraType: z
          .enum(["equirectangular", "fisheye", "perspective"])
          .optional(),
        matchingMethod: z
          .enum(["vocab_tree", "exhaustive", "sequential"])
          .optional(),
        sfmTool: z.enum(["colmap", "hloc", "any"]).optional(),
        refinePixsfm: z.boolean().optional(),
        refineIntrinsics: z.boolean().optional(),
        featureType: z.string().optional(),
        matcherType: z.string().optional(),
        numDownscales: z.number().optional(),
        skipColmap: z.boolean().optional(),
        imagesPerEquirect: z.enum(["8", "14"]).optional(),
        numFrameTarget: z.number().optional(),
        useUncorrectedImages: z.boolean().optional(),
        maxDatasetSize: z.number().optional(),
        minBlurScore: z.number().optional(),
        cropBorderPixels: z.number().optional(),
        useDepth: z.boolean().optional(),
      }),
    )
    .subscription(({ input }) => {
      return observable<{
        message: string;
      }>((emit) => {
        console.log("Processing...");

        const projectPath = path.join(WORKSPACE, input.project);
        let dataPath = "./data";
        // In case of video, we need to get the direct file path
        if (input.dataType !== "images") {
          const files = fs.readdirSync(path.join(projectPath, dataPath));
          dataPath = path.join(dataPath, files[0]);
        }

        // Get number of files in pre-process-output
        let existingFiles = [];
        try {
          existingFiles = fs.readdirSync(
            path.join(projectPath, "./pre-process-output"),
          );
        } catch (error) {
          console.error("Error reading directory:", error);
        }

        let targetPath = path.join(
          "./pre-process-output",
          `${input.dataType}-${
            existingFiles.filter((file) => file.includes(input.dataType)).length
          }`,
        );

        // save params to file
        fs.mkdirSync(path.join(projectPath, targetPath), {
          recursive: true,
        });
        const paramsPath = path.join(projectPath, targetPath, "params.json");
        const processData = {
          status: "running",
          timestamp: new Date().toISOString,
          params: { ...input },
        };
        fs.writeFileSync(paramsPath, JSON.stringify(processData));

        const args = [
          input.dataType,
          "--data",
          dataPath,
          "--output-dir",
          targetPath,
          "--verbose",
        ];

        const options = [
          { flag: "--camera-type", value: input.cameraType },
          { flag: "--matching-method", value: input.matchingMethod },
          { flag: "--sfm-tool", value: input.sfmTool },
          { flag: "--refine-pixsfm", value: input.refinePixsfm },
          {
            flag: "--refine-intrinsics",
            value: input.refineIntrinsics,
          },
          { flag: "--feature-type", value: input.featureType },
          { flag: "--matcher-type", value: input.matcherType },
          { flag: "--num-downscales", value: input.numDownscales },
          { flag: "--skip-colmap", value: input.skipColmap },
          {
            flag: "--images-per-equirect",
            value: input.imagesPerEquirect,
          },
          {
            flag: "--num-frame-target",
            value: input.numFrameTarget,
          },
          {
            flag: "--use-uncorrected-images",
            value: input.useUncorrectedImages,
          },
          { flag: "--max-dataset-size", value: input.maxDatasetSize },
          { flag: "--min-blur-score", value: input.minBlurScore },
          { flag: "--crop-border-pixels", value: input.cropBorderPixels },
          { flag: "--use-depth", value: input.useDepth },
        ];

        options.forEach((option) => {
          if (option.value !== undefined) {
            if (typeof option.value === "boolean") {
              if (option.value) args.push(option.flag);
            } else {
              args.push(option.flag, option.value.toString());
            }
          }
        });

        const process = spawn("ns-process-data", args, {
          cwd: path.join(WORKSPACE, input.project),
        }).on("error", (err) => {
          emit.error({
            message: err.message,
          });
          // Update params file
          processData.status = "error";
          processData.timestamp = new Date().toISOString;
          fs.writeFileSync(paramsPath, JSON.stringify(processData));
        });

        emit.next({
          message: "Running: " + process.spawnargs.join(" "),
        });

        process.stdout.on("data", (data: any) => {
          console.log("Sending data to client", data.toString().slice(0, 100));
          emit.next({
            message: data.toString(),
          });
        });

        process.stderr.on("data", (data: any) => {
          console.log("Sending error to client", data.toString().slice(0, 100));
          emit.next({
            message: data.toString(),
          });
        });

        process.on("close", (code) => {
          console.log(`Child process exited with code ${code}`);
          emit.complete();
          // Update params file
          processData.status = code === 0 ? "done" : "error";
          processData.timestamp = new Date().toISOString;
          fs.writeFileSync(paramsPath, JSON.stringify(processData));
        });
      });
    }),
  train: publicProcedure
    .input(
      z.object({
        project: z.string(),
        data: z.string(),
        stepsPerSave: z.number().optional(),
        stepsPerEvalBatch: z.number().optional(),
        stepsPerEvalImage: z.number().optional(),
        stepsPerEvalAllImages: z.number().optional(),
        maxNumIterations: z.number().optional(),
        mixedPrecision: z.boolean().optional(),
        useGradScaler: z.boolean().optional(),
        saveOnlyLatestCheckpoint: z.boolean().optional(),
      }),
    )
    .subscription(({ input }) => {
      return observable<{ message: string }>((emit) => {
        console.log("Training model...");

        const projectPath = path.join(
          WORKSPACE,
          input.project,
          "pre-process-output",
        );
        const dataPath = path.join(input.data);

        const args = ["nerfacto", "--data", dataPath];

        const options = [
          { flag: "--steps-per-save", value: input.stepsPerSave?.toString() },
          {
            flag: "--steps-per-eval-batch",
            value: input.stepsPerEvalBatch,
          },
          {
            flag: "--steps-per-eval-image",
            value: input.stepsPerEvalImage,
          },
          {
            flag: "--steps-per-eval-all-images",
            value: input.stepsPerEvalAllImages,
          },
          {
            flag: "--max-num-iterations",
            value: input.maxNumIterations,
          },
          {
            flag: "--mixed-precision",
            value: input.mixedPrecision,
          },
          {
            flag: "--use-grad-scaler",
            value: input.useGradScaler,
          },
          {
            flag: "--save-only-latest-checkpoint",
            value: input.saveOnlyLatestCheckpoint,
          },
        ];

        options.forEach((option) => {
          if (option.value !== undefined) {
            if (typeof option.value === "boolean") {
              args.push(option.flag, option.value ? "True" : "False");
            } else {
              args.push(option.flag, option.value.toString());
            }
          }
        });

        const process = spawn("ns-train", args, {
          cwd: projectPath,
        }).on("error", (err) => {
          emit.error({
            message: err.message,
          });
        });

        console.log("Command: ", process.spawnargs.join(" "));

        process.stdout.on("data", (data: any) => {
          console.log("Sending data to client", data.toString().slice(0, 100));
          emit.next({
            message: data.toString(),
          });
        });

        process.stderr.on("data", (data: any) => {
          console.log("Sending data to client", data.toString().slice(0, 100));
          emit.next({
            message: data.toString(),
          });
        });

        process.on("close", (code) => {
          console.log(`Child process exited with code ${code}`);
          emit.complete();
        });
      });
    }),
  loadCheckpoint: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        data: z.string(),
        model: z.string(),
        checkpoint: z.string(),
      }),
    )
    .subscription(({ input }) => {
      return observable<{ message: string }>((emit) => {
        console.log("Loading checkpoint...");

        const projectPath = path.join(
          WORKSPACE,
          input.projectId,
          "pre-process-output",
        );
        const checkpointPath = path.join(
          "outputs",
          input.data,
          "nerfacto",
          input.model,
          "nerfstudio_models",
          input.checkpoint,
        );

        const process = spawn(
          "ns-train",
          [
            "nerfacto",
            "--load-checkpoint",
            checkpointPath,
            "--data",
            input.data,
          ],
          {
            cwd: projectPath,
          },
        ).on("error", (err) => {
          emit.error({
            message: err.message,
          });
        });

        process.stdout.on("data", (data: any) => {
          console.log("Sending data to client:", data.toString().slice(0, 100));
          emit.next({
            message: data.toString(),
          });
        });

        process.stderr.on("data", (data: any) => {
          console.log("Sending data to client:", data.toString().slice(0, 100));
          emit.next({
            message: data.toString(),
          });
        });

        process.on("close", (code) => {
          console.log(`Child process exited with code ${code}`);
          emit.complete();
        });
      });
    }),
  viewer: publicProcedure
    // TODO: Make Subscription
    .input(
      z.object({
        projectId: z.string(),
        processData: z.string(),
        name: z.string(),
      }),
    )
    .query(async ({ input }) => {
      console.log("Starting viewer...");

      const projectPath = path.join(
        WORKSPACE,
        input.projectId,
        "pre-process-output",
      );
      const configPath = path.join(
        projectPath,
        "outputs",
        input.processData,
        "nerfacto",
        input.name,
        "config.yml",
      );

      if (!fs.existsSync(configPath)) {
        throw new Error(`Model '${input.name}' not found.`);
      }

      const process = spawn("ns-viewer", ["--load-config", configPath], {
        cwd: projectPath,
      });

      return new Promise((resolve, reject) => {
        process.stdout.on("data", (data: Buffer) => {
          const logMessage = data.toString();
          console.log(logMessage);
          if (logMessage.includes("Done loading checkpoint")) {
            resolve({ success: true });
          }
        });

        process.on("error", (err) => {
          throw new Error(err.message);
        });

        process.on("close", (code: number) => {
          if (code !== 0) {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    }),
});
