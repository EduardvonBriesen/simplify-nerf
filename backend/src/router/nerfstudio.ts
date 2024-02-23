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
        dataType: z.enum(["images", "video"]),
        cameraType: z
          .enum(["equirectangular", "fisheye", "perspective"])
          .optional(),
        matchingMethod: z
          .enum(["vocab_tree", "exhaustive", "sequential"])
          .optional(),
        sfmTool: z.enum(["colmap", "pixsfm"]).optional(),
        refinePixsfm: z.boolean().optional(),
        refineIntrinsics: z.boolean().optional(),
        featureType: z.string().optional(),
        matcherType: z.string().optional(),
        numDownscales: z.number().optional(),
        skipColmap: z.boolean().optional(),
        imagesPerEquirect: z.number().optional(),
        numFrameTarget: z.number().optional(),
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
          { flag: "--refine-pixsfm", value: input.refinePixsfm?.toString() },
          {
            flag: "--refine-intrinsics",
            value: input.refineIntrinsics?.toString(),
          },
          { flag: "--feature-type", value: input.featureType },
          { flag: "--matcher-type", value: input.matcherType },
          { flag: "--num-downscales", value: input.numDownscales?.toString() },
          { flag: "--skip-colmap", value: input.skipColmap?.toString() },
          {
            flag: "--images-per-equirect",
            value: input.imagesPerEquirect?.toString(),
          },
          {
            flag: "--num-frame-target",
            value: input.numFrameTarget?.toString(),
          },
        ];

        options.forEach((option) => {
          if (option.value !== undefined) {
            args.push(option.flag, option.value);
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
          console.log("Sending data to client");
          emit.next({
            message: data.toString(),
          });
        });

        process.stderr.on("data", (data: any) => {
          console.log("Sending error to client");
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

        const existingOutput = fs.readdirSync(
          path.join(WORKSPACE, input.project, "./training-output"),
        );

        const projectPath = path.join(WORKSPACE, input.project);
        const targetPath = path.join(
          "training-output",
          `training-${existingOutput.length}`,
        );
        const dataPath = path.join("pre-process-output", input.data);

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
          "nerfacto",
          "--data",
          dataPath,
          "--output-dir",
          targetPath,
          "--project-name",
          input.project,
        ];

        const options = [
          { flag: "--steps-per-save", value: input.stepsPerSave?.toString() },
          {
            flag: "--steps-per-eval-batch",
            value: input.stepsPerEvalBatch?.toString(),
          },
          {
            flag: "--steps-per-eval-image",
            value: input.stepsPerEvalImage?.toString(),
          },
          {
            flag: "--steps-per-eval-all-images",
            value: input.stepsPerEvalAllImages?.toString(),
          },
          {
            flag: "--max-num-iterations",
            value: input.maxNumIterations?.toString(),
          },
          {
            flag: "--mixed-precision",
            value: input.mixedPrecision?.toString(),
          },
          {
            flag: "--use-grad-scaler",
            value: input.useGradScaler?.toString(),
          },
          {
            flag: "--save-only-latest-checkpoint",
            value: input.saveOnlyLatestCheckpoint?.toString(),
          },
        ];

        options.forEach((option) => {
          if (option.value !== undefined) {
            args.push(option.flag, option.value);
          }
        });

        const process = spawn("ns-train", args, {
          cwd: projectPath,
        }).on("error", (err) => {
          emit.error({
            message: err.message,
          });
          // Update params file
          processData.status = "error";
          processData.timestamp = new Date().toISOString;
          fs.writeFileSync(paramsPath, JSON.stringify(processData));
        });

        console.log("Command: ", process.spawnargs.join(" "));

        process.stdout.on("data", (data: any) => {
          console.log("Sending data to client");
          emit.next({
            message: data.toString(),
          });
        });

        process.stderr.on("data", (data: any) => {
          console.log("Sending data to client");
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
});
