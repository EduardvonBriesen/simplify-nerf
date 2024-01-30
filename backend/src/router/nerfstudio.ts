import { spawn } from "child_process";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import path from "path";
import { observable } from "@trpc/server/observable";

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
        fileName: z.string().optional(),
      }),
    )
    .subscription(({ input }) => {
      return observable<{
        message: string;
      }>((emit) => {
        console.log("Processing...");

        const args = [
          input.dataType,
          "--data",
          "./data" + (input.fileName ? "/" + input.fileName : ""),
          "--output-dir",
          "./pre-process-output",
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
          emit.error({
            message: data.toString(),
          });
        });

        process.on("close", (code) => {
          console.log(`Child process exited with code ${code}`);
          emit.complete();
        });
      });
    }),
  train: publicProcedure
    .input(
      z.object({
        project: z.string(),
        stepsPerSave: z.number().optional(),
        maxNumIterations: z.number().optional(),
      }),
    )
    .subscription(({ input }) => {
      return observable<{ message: string }>((emit) => {
        console.log("Training model...");

        const args = [
          "nerfacto",
          "--data",
          "./pre-process-output/",
          "--output-dir",
          "./training-output/",
          "--project-name",
          input.project,
        ];

        const options = [
          { flag: "--steps-per-save", value: input.stepsPerSave?.toString() },
          {
            flag: "--max-num-iterations",
            value: input.maxNumIterations?.toString(),
          },
        ];

        options.forEach((option) => {
          if (option.value !== undefined) {
            args.push(option.flag, option.value);
          }
        });

        const process = spawn("ns-train", args, {
          cwd: path.join(WORKSPACE, input.project),
        }).on("error", (err) => {
          emit.error({
            message: err.message,
          });
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
          emit.error({
            message: data.toString(),
          });
        });

        process.on("close", (code) => {
          console.log(`Child process exited with code ${code}`);
          emit.complete();
        });
      });
    }),
});
