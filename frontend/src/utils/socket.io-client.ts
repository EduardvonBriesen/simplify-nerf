import io from "socket.io-client";
import auth from "./auth";

const URL = "http://localhost:3000";

export const socket = io(URL, {
  autoConnect: false,
  auth(cb) {
    cb({
      token: auth.getAuthUser()?.access_token,
    });
  },
});
