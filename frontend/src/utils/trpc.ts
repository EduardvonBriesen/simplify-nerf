import {
  createTRPCProxyClient,
  createWSClient,
  httpLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../backend/src/app";

const PORT_SERVER = import.meta.env.VITE_PORT_SERVER || 3000;
const PORT_SOCKET = import.meta.env.VITE_PORT_SOCKET || 3001;

// create persistent WebSocket connection
const wsClient = createWSClient({
  url: `ws://localhost:${PORT_SOCKET}`,
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
        url: `http://localhost:${PORT_SERVER}/trpc`,
      }),
    }),
  ],
});

type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export default client;
export type { RouterInput, RouterOutput };
