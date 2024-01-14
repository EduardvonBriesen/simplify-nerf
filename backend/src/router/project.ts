import { exec, spawn } from "child_process";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";

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
  getProjects: publicProcedure.query(() => {
    console.log("Getting projects...");

    const projects: string[] = [];

    exec(`ls ${folder}/projects`, (err: any, stdout: any, stderr: any) => {
      if (err) {
        console.log(err);
      }
      console.log(stdout);
      console.log(stderr);
      projects.push(stdout);
    });

    return { projects };
  }),
  getData: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      console.log("Getting data...");

      const data: string[] = [];

      exec(
        `ls ${folder}/projects/` + input.name,
        (err: any, stdout: any, stderr: any) => {
          if (err) {
            console.log(err);
          }
          console.log(stdout);
          console.log(stderr);
          data.push(stdout);
        },
      );

      return { data };
    }),
});
