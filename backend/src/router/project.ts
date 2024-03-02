import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { fromFile } from "file-type";
import { getFirstImageOrVideoFrame } from "../utils";

const WORKSPACE = process.env.WORKSPACE || "./workspace";

export const projectRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(({ input }) => {
      console.log("Creating project...");

      const projectPath = path.join(WORKSPACE, input.name);

      try {
        fs.mkdirSync(projectPath, { recursive: true });
        fs.mkdirSync(path.join(projectPath, "data"));
        console.log("Project created successfully");
        return { message: "Project created successfully" };
      } catch (error) {
        console.error("Error creating project:", error.message);
        return { message: "Failed to create project" };
      }
    }),
  getProjects: publicProcedure.query(async () => {
    console.log("Getting projects...");

    try {
      const projects = fs.readdirSync(WORKSPACE);
      console.log("Projects:", projects);

      const projectsWithStats = await Promise.all(
        projects.map(async (project) => {
          const dataPath = path.join(WORKSPACE, project, "data");

          let fileType;
          const files = fs.readdirSync(dataPath);
          if (files.length > 0) {
            fileType = files[0].split(".").pop();
          }

          const preProcessOutput: boolean = fs.existsSync(
            path.join(WORKSPACE, project, "pre-process-output"),
          );

          const trainingOutput: boolean = fs.existsSync(
            path.join(WORKSPACE, project, "training-output"),
          );

          return {
            name: project,
            fileType,
            preProcessOutput,
            trainingOutput,
          };
        }),
      );

      return { projects: projectsWithStats };
    } catch (error) {
      console.error("Error reading projects folder:", error.message);
      return { projects: [] };
    }
  }),
  getProjectPreview: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      console.log("Getting project preview...");

      const dataPath = path.join(WORKSPACE, input.name, "data");

      try {
        return await getFirstImageOrVideoFrame(dataPath);
      } catch (error) {
        console.error("Error getting project preview:", error.message);
        return undefined;
      }
    }),
  deleteProject: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      console.log("Deleting project...");

      const projectPath = path.join(WORKSPACE, input.name);

      try {
        fs.rmdirSync(projectPath, { recursive: true });
        console.log("Project deleted successfully");
        return { message: "Project deleted successfully" };
      } catch (error) {
        console.error("Error deleting project:", error.message);
        return { message: "Failed to delete project" };
      }
    }),
  getFiles: publicProcedure
    .input(z.object({ project: z.string() }))
    .query(async ({ input }) => {
      console.log("Getting data...");

      const dataPath = path.join(WORKSPACE, input.project, "data");

      try {
        const files = fs.readdirSync(dataPath);
        if (files.length === 0) {
          return { data: [] };
        }
        const data = await Promise.all(
          files.map(async (file) => {
            const { size } = fs.statSync(path.join(dataPath, file));
            const type = (await fromFile(path.join(dataPath, file))).mime.split(
              "/",
            )[0];
            return { name: file, type, size };
          }),
        );
        return { data };
      } catch (error) {
        console.error("Error reading data folder:", error.message);
        return { data: [] };
      }
    }),
  deleteFiles: publicProcedure
    .input(
      z.object({
        project: z.string(),
        files: z.array(z.string()),
      }),
    )
    .mutation(({ input }) => {
      console.log("Deleting files...");

      const dataPath = path.join(WORKSPACE, input.project, "data");

      try {
        input.files.forEach((file) => {
          fs.unlinkSync(path.join(dataPath, file));
        });
        console.log("Files deleted successfully");
        return { message: "Files deleted successfully" };
      } catch (error) {
        console.error("Error deleting files:", error.message);
        return { message: "Failed to delete files" };
      }
    }),
  getPreProcessOutput: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ input }) => {
      console.log("Getting pre-process output...");

      const dataPath = path.join(
        WORKSPACE,
        input.projectId,
        "pre-process-output",
      );

      const outputDirs = fs.readdirSync(dataPath);

      const outputs = outputDirs
        .filter((dir) => fs.existsSync(path.join(dataPath, dir, "params.json")))
        .map((dir) => {
          const params = fs.readFileSync(
            path.join(dataPath, dir, "params.json"),
            "utf-8",
          );
          return { name: dir, ...JSON.parse(params) };
        });

      return { outputs };
    }),
  deletePreProcessOutput: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(({ input }) => {
      console.log("Deleting pre-process output...");

      const dataPath = path.join(
        WORKSPACE,
        input.projectId,
        "pre-process-output",
        input.name,
      );

      try {
        fs.rmdirSync(dataPath, { recursive: true });
        console.log("Pre-process output deleted successfully");
        return { message: "Pre-process output deleted successfully" };
      } catch (error) {
        console.error("Error deleting pre-process output:", error.message);
        return { message: "Failed to delete pre-process output" };
      }
    }),
  getTrainingOutput: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ input }) => {
      console.log("Getting training output...");

      const dataPath = path.join(
        WORKSPACE,
        input.projectId,
        "pre-process-output",
        "outputs",
      );

      const outputDirs = fs.readdirSync(dataPath);

      return { outputDirs };
    }),
  deleteTrainingOutput: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(({ input }) => {
      console.log("Deleting training output...");

      const dataPath = path.join(
        WORKSPACE,
        input.projectId,
        "training-output",
        input.name,
      );

      try {
        fs.rmdirSync(dataPath, { recursive: true });
        console.log("Training output deleted successfully");
        return { message: "Training output deleted successfully" };
      } catch (error) {
        console.error("Error deleting training output:", error.message);
        return { message: "Failed to delete training output" };
      }
    }),
  getRenders: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ input }) => {
      console.log("Getting video...");

      const dataPath = path.join(
        WORKSPACE,
        input.projectId,
        "pre-process-output",
        "renders",
      );

      const files = fs.readdirSync(dataPath);

      return { files };
    }),
  deleteRender: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(({ input }) => {
      console.log("Deleting video...");

      const dataPath = path.join(
        WORKSPACE,
        input.projectId,
        "pre-process-output",
        "renders",
        input.name,
      );

      try {
        fs.rmdirSync(dataPath, { recursive: true });
        console.log("Video deleted successfully");
        return { message: "Video deleted successfully" };
      } catch (error) {
        console.error("Error deleting video:", error.message);
        return { message: "Failed to delete video" };
      }
    }),
});
