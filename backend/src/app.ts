import express from "express";
const app = express();
const server = require("http").createServer(app);
import { spawn, exec } from "child_process";
import cors from "cors";
import fileUpload from "express-fileupload";

const corsOptions = {
  origin: "*",
};
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Enable CORS with permissive options
app.use(cors(corsOptions));

// Socket.IO connection handler
io.on("connection", (socket: any) => {
  console.log("Client connected");

  let process: any;

  socket.on("run", () => {
    console.log("Running Python script...");
    process = spawn("python", ["./test/app.py"]);

    // Handle data from Python script
    process.stdout.on("data", (data: any) => {
      console.log("Sending data to client");
      socket.emit("data", data.toString());
    });
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    if (process) {
      process.kill(undefined);
    }
  });
});

app.get("/run-rest", (req: any, res: any) => {
  console.log("Processing request...");
  exec(
    "python ./test/app.py",
    (error: { message: any }, stdout: any, stderr: any) => {
      if (error) {
        res.send(error.message);
        return;
      }
      if (stderr) {
        res.send(stderr);
        return;
      }
      res.send(stdout);
      console.log("Request processed");
    },
  );
});

app.use(
  fileUpload({
    useTempFiles: true,
    safeFileNames: true,
    preserveExtension: true,
    tempFileDir: `./temp`,
  }),
);

app.post("/upload", (req: any, res: any) => {
  let uploadFile = req.files.file;
  const name = uploadFile.name;
  uploadFile.mv(`./temp/${name}`, function (err: any) {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(200).json({ status: "uploaded", name });
  });
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
