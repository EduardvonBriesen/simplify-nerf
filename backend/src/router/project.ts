import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { fromFile } from "file-type";
import { getFirstImageOrVideoFrame } from "../utils/utils";
import { deleteExport, getStatus } from "../utils/nerfstudioExports";

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
          const editDate = fs.statSync(dataPath).mtime;

          let fileType: string | undefined = undefined;
          const files = fs.readdirSync(dataPath);
          if (files.length > 0) {
            fileType = files[0].split(".").pop();
          }

          const preProcessOutput: boolean = fs.existsSync(
            path.join(WORKSPACE, project, "pre-process-output"),
          );

          const trainingOutput: boolean = fs.existsSync(
            path.join(WORKSPACE, project, "pre-process-output", "outputs"),
          );

          return {
            name: project,
            timestamp: editDate,
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
        const result = await Promise.race([
          getFirstImageOrVideoFrame(dataPath),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Timeout after 5 seconds")),
              5000,
            ),
          ),
        ]);
        return result;
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
    .input(z.object({ projectId: z.string(), processData: z.string() }))
    .query(({ input }) => {
      console.log("Getting training output...");

      const dataPath = path.join(
        WORKSPACE,
        input.projectId,
        "pre-process-output",
        "outputs",
        input.processData,
        "nerfacto",
      );

      if (!fs.existsSync(dataPath)) {
        return [];
      }

      const result: {
        model: string;
        config: string;
        checkpoints: string[];
      }[] = [];

      const modelFolders = fs
        .readdirSync(dataPath, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => item.name);

      modelFolders.forEach((modelFolder) => {
        const configFile = path.join(dataPath, modelFolder, "config.yml");
        const checkpointFolder = path.join(
          dataPath,
          modelFolder,
          "nerfstudio_models",
        );

        let checkpoints: string[] = [];
        if (fs.existsSync(checkpointFolder)) {
          checkpoints = fs.readdirSync(checkpointFolder);
        }

        if (fs.existsSync(configFile)) {
          const configContent = fs.readFileSync(configFile, "utf-8");

          result.push({
            model: modelFolder,
            config: configContent,
            checkpoints: checkpoints,
          });
        }
      });

      return result;
    }),
  deleteTrainingOutput: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        processData: z.string(),
        name: z.string(),
      }),
    )
    .mutation(({ input }) => {
      console.log("Deleting training output...");

      const dataPath = path.join(
        WORKSPACE,
        input.projectId,
        "pre-process-output",
        "outputs",
        input.processData,
        "nerfacto",
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
  getExports: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ input }) => {
      console.log("Getting exports...");
      const status = getStatus(path.join(WORKSPACE, input.projectId));
      return status;
    }),
  deleteExport: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(({ input }) => {
      console.log("Deleting export...");
      deleteExport(path.join(WORKSPACE, input.projectId), input.name);
      return { message: "Export deleted successfully" };
    }),
});
