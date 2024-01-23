import express from "express";
import cors from "cors";
import expressRouter from "./router/express";
import { projectRouter } from "./router/project";
import { nerfstudioRouter } from "./router/nerfstudio";
import { createContext, router } from "./trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import ws from "ws";

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);

const appRouter = router({
  nerfstudio: nerfstudioRouter,
  project: projectRouter,
});

export const trpcRouter = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
});

app.use("/trpc", trpcRouter);
app.use("/", expressRouter);

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

export default app;

export type AppRouter = typeof appRouter;

const wss = new ws.Server({
  port: 3001,
});
const handler = applyWSSHandler({ wss, router: appRouter });
wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log("✅ WebSocket Server listening on ws://localhost:3001");
process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
