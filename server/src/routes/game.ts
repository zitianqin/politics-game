import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { createGame, getGame, joinGame } from "../state/gameState";

const router = Router();

router.post("/create", (_req: Request, res: Response) => {
  const hostId = uuidv4();
  const game = createGame(hostId);

  res.status(201).json({
    code: game.code,
    gameId: game.id,
    playerId: hostId,
  });
});

router.post("/join", (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code || typeof code !== "string" || code.trim().length !== 6) {
    res.status(400).json({ error: "Invalid game code format. Must be 6 characters." });
    return;
  }

  const playerId = uuidv4();
  const result = joinGame(code.trim(), playerId);

  if ("error" in result) {
    res.status(404).json({ error: result.error });
    return;
  }

  res.status(200).json({
    code: result.game.code,
    gameId: result.game.id,
    playerId,
    slot: 2,
  });
});

router.get("/:code", (req: Request, res: Response) => {
  const game = getGame(req.params.code);

  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  res.status(200).json({
    id: game.id,
    code: game.code,
    status: game.status,
    players: game.players.map((p) => ({
      id: p.id,
      slot: p.slot,
      candidate: p.candidate,
    })),
    voters: game.voters,
    rounds: game.rounds,
    createdAt: game.createdAt,
  });
});

export default router;
