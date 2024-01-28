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

const PORT_SERVER = process.env.VITE_PORT_SERVER || 3000;
const PORT_SOCKET = process.env.VITE_PORT_SOCKET || 3001;

app.listen(PORT_SERVER, () => {
  console.log(`✅ Express Server listening on http://localhost:${PORT_SERVER}`);
});

export default app;

export type AppRouter = typeof appRouter;

const wss = new ws.Server({
  port: +PORT_SOCKET,
});
const handler = applyWSSHandler({ wss, router: appRouter });
wss.on("connection", (ws) => {
  console.log(`➕ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`➖ Connection (${wss.clients.size})`);
  });
});
console.log(`✅ WebSocket Server listening on ws://localhost:${PORT_SOCKET}`);
process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
