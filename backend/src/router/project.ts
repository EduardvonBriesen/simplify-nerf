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

      exec(
        `mkdir ${folder}/projects/` + input.name,
        (err: any, stdout: any, stderr: any) => {
          if (err) {
            console.log(err);
          }
          console.log(stdout);
          console.log(stderr);
        },
      );

      return { message: "Project created successfully" };
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
