import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";

// Setup Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

io.listen(4000);

console.log("Socket.IO listening on port 4000");

export default io;
