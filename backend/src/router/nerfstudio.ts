import { spawn } from "child_process";
import { publicProcedure, router } from "../trpc";
import io from "../socket";
import { z } from "zod";
import path from "path";

export const nerfstudioRouter = router({
  test: publicProcedure.query(() => {
    console.log("Test");

    const process = spawn("python", ["app.py"], {
      cwd: "./test",
    });

    process.stdout.on("data", (data: any) => {
      console.log("Sending data to client:", data.toString());
      io.emit("data", data.toString());
    });

    process.stderr.on("data", (data: any) => {
      console.log("Sending data to client:", data.toString());
      io.emit("data", data.toString());
    });

    return { message: "Test" };
  }),
  download: publicProcedure
    .input(
      z.object({
        captureName: z.enum([
          "nerfstudio-dataset",
          "stump",
          "bww_entrance",
          "storefront",
          "dozer",
          "vegetation",
          "aspen",
          "Giannini-Hall",
          "plane",
          "all",
          "campanile",
          "desolation",
          "library",
          "sculpture",
          "Egypt",
          "kitchen",
          "floating-tree",
          "redwoods2",
          "person",
          "poster",
        ]),
      }),
    )
    .query(({ input }) => {
      console.log("Downloading file...");

      const process = spawn(
        "ns-download-data",
        [
          "nerfstudio",
          "--capture-name=" + input.captureName,
          "--save-dir=./" + input.captureName,
        ],
        {
          cwd: "./workspace",
        },
      );

      process.stdout.on("data", (data: any) => {
        console.log("Sending data to client:", data.toString());
        io.emit("data", data.toString());
      });

      process.stderr.on("data", (data: any) => {
        console.log("Sending data to client:", data.toString());
        io.emit("data", data.toString());
      });

      process.on("close", (code) => {
        console.log(`Child process exited with code ${code}`);
        return { message: "Files downloaded successfully" };
      });
    }),
  process: publicProcedure
    .input(
      z.object({
        project: z.string(),
        dataType: z.enum(["images", "videos"]),
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
        numDownscale: z.number().optional(),
        skipColmap: z.boolean().optional(),
        imagesPerEquirect: z.number().optional(),
        numFrameTarget: z.number().optional(),
      }),
    )
    .query(({ input }) => {
      console.log("Processing...");

      const process = spawn(
        "ns-process-data",
        [
          input.dataType,
          "--data",
          "./data",
          "--output-dir",
          "./pre-process-output",
          input.cameraType && "--camera-type",
          input.cameraType,
          input.matchingMethod && "--matching-method",
          input.matchingMethod,
          input.sfmTool && "--sfm-tool",
          input.sfmTool,
          input.refinePixsfm && "--refine-pixsfm",
          input.refinePixsfm.toString(),
          input.refineIntrinsics && "--refine-intrinsics",
          input.refineIntrinsics.toString(),
          input.featureType && "--feature-type",
          input.featureType,
          input.matcherType && "--matcher-type",
          input.matcherType,
          input.numDownscale && "--num-downscale",
          input.numDownscale.toString(),
          input.skipColmap && "--skip-colmap",
          input.skipColmap.toString(),
          input.imagesPerEquirect && "--images-per-equirect",
          input.imagesPerEquirect.toString(),
          input.numFrameTarget && "--num-frame-target",
          input.numFrameTarget.toString(),
        ],
        {
          cwd: path.join("./workspace", "projects", input.project),
        },
      );

      console.log("Command: ", process.spawnargs.join(" "));

      process.stdout.on("data", (data: any) => {
        console.log("Sending data to client");
        io.emit("data", data.toString());
      });

      process.stderr.on("data", (data: any) => {
        console.log("Sending data to client");
        io.emit("data", data.toString());
      });

      process.on("close", (code) => {
        console.log(`Child process exited with code ${code}`);
        return { message: "Files processed successfully" };
      });
    }),
  train: publicProcedure
    .input(
      z.object({
        project: z.string(),
        stepsPerSave: z.number().default(2000),
        maxNumIterations: z.number().default(30000),
      }),
    )
    .query(({ input }) => {
      console.log("Training model...");
      const process = spawn(
        "ns-train",
        [
          "nerfacto",
          "--data",
          "./pre-process-output/",
          "--output-dir",
          "./training-output/",
          "--project-name",
          input.project,
          "--steps-per-save",
          input.stepsPerSave.toString(),
          "--max-num-iterations",
          input.maxNumIterations.toString(),
        ],
        {
          cwd: "./workspace" + "/projects/" + input.project,
        },
      );

      console.log("Command: ", process.spawnargs.join(" "));

      process.stdout.on("data", (data: any) => {
        console.log("Sending data to client");
        io.emit("data", data.toString());
      });

      process.stderr.on("data", (data: any) => {
        console.log("Sending data to client");
        io.emit("data", data.toString());
      });

      process.on("close", (code) => {
        console.log(`Child process exited with code ${code}`);
        return { message: "Model trained successfully" };
      });
    }),
});
