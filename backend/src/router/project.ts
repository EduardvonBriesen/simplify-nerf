import { exec, execSync, spawn } from "child_process";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import path from "path";
import fs from "fs";

const folder = "./workspace";

export const projectRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(({ input }) => {
      console.log("Creating project...");

      const projectPath = path.join(folder, "projects", input.name);

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

    const projectsPath = path.join(folder, "projects");

    try {
      const projects = fs.readdirSync(projectsPath);
      console.log("Projects:", projects);
      return { projects };
    } catch (error) {
      console.error("Error reading projects folder:", error.message);
      return { projects: [] };
    }
  }),
  getData: publicProcedure
    .input(z.object({ project: z.string() }))
    .query(({ input }) => {
      console.log("Getting data...");

      const dataPath = path.join(folder, "projects", input.project, "data");

      try {
        const files = fs.readdirSync(dataPath);
        console.log("Data:", files);
        return { files };
      } catch (error) {
        console.error("Error reading data folder:", error.message);
        return { files: [] };
      }
    }),
});
