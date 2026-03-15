import { Request, Response, Router } from "express";
import { RtcRole, RtcTokenBuilder } from "agora-token";
import { getGame } from "../state/gameState";

const router: Router = Router();

const TOKEN_TTL_SECONDS = 60 * 60;

router.post("/token", (req: Request, res: Response) => {
  const { gameCode, playerId, roundNumber } = req.body as {
    gameCode?: string;
    playerId?: string;
    roundNumber?: number;
  };

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    res.status(503).json({ error: "Agora is not configured on the server" });
    return;
  }

  if (!gameCode || !playerId) {
    res.status(400).json({ error: "Missing gameCode or playerId" });
    return;
  }

  const normalizedRound = Number(roundNumber);
  if (!Number.isInteger(normalizedRound) || normalizedRound < 1) {
    res.status(400).json({ error: "Invalid roundNumber" });
    return;
  }

  const game = getGame(gameCode);
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  const player = game.players.find((candidate) => candidate.id === playerId);
  if (!player) {
    res.status(403).json({ error: "Player not in this game" });
    return;
  }

  const channelName = `debate_${game.code}_r${normalizedRound}`;
  const uid = player.slot;
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    TOKEN_TTL_SECONDS,
    TOKEN_TTL_SECONDS
  );

  res.status(200).json({
    appId,
    channelName,
    token,
    uid,
    expiresInSeconds: TOKEN_TTL_SECONDS,
  });
});

export default router;
