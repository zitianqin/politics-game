import express from "express";
import cors from "cors";
import http from "node:http";
import gameRouter from "./routes/game";

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/game", gameRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { server };
