import { spawn } from "child_process";
import { publicProcedure, router } from "../trpc";
import io from "../socket";

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
});
