import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "node:http";
import { Server } from "socket.io";
import gameRouter from "./routes/game";
import { createTranscribeRouter } from "./routes/transcribe";
import { registerSocketHandlers } from "./socket/handler";

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: true,
  methods: ["GET", "POST"],
};

const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/game", gameRouter);
app.use("/api/transcribe", createTranscribeRouter(io));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", sockets: io.engine.clientsCount });
});

registerSocketHandlers(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { server, io };
