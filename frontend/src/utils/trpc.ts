import {
  createTRPCProxyClient,
  createWSClient,
  httpLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../backend/src/app";

// create persistent WebSocket connection
const wsClient = createWSClient({
  url: `ws://localhost:3001`,
});

const client = createTRPCProxyClient<AppRouter>({
  links: [
    // call subscriptions through websockets and the rest over http
    splitLink({
      condition(op) {
        return op.type === "subscription";
      },
      true: wsLink({
        client: wsClient,
      }),
      false: httpLink({
        url: `http://localhost:3000/trpc`,
      }),
    }),
  ],
});

type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export default client;
export type { RouterInput, RouterOutput };
