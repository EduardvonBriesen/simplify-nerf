import express from "express";
import cors from "cors";
import expressRouter from "./router/express";
import { nerfstudioRouter } from "./router/nerfstudio";
import { createContext, router } from "./trpc";
import * as trpcExpress from "@trpc/server/adapters/express";

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);

const appRouter = router({
  nerfstudio: nerfstudioRouter,
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
