import { Router, Request, Response } from "express";
import multer from "multer";
import { Server } from "socket.io";
import { transcribeAudio } from "../services/transcribe";
import {
  getGame,
  addTranscriptEntry,
  ensureRound,
  TranscriptEntry,
} from "../state/gameState";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB — Groq's limit
});

export function createTranscribeRouter(io: Server): Router {
  const router = Router();

  /**
   * POST /api/transcribe
   *
   * Multipart fields:
   *   audio        — audio blob (required)
   *   gameCode     — 6-char game code (required)
   *   playerId     — UUID of the speaking player (required)
   *   roundNumber  — 1 or 2 (required)
   *   topic        — round topic string (required on first call per round)
   *   timestamp    — epoch ms of when this audio chunk started (required)
   *   isObjectionEnd — "true" if this chunk ends an objection turn (optional)
   */
  router.post(
    "/",
    upload.single("audio"),
    async (req: Request, res: Response) => {
      const file = req.file;
      const { gameCode, playerId, roundNumber, topic, timestamp, isObjectionEnd } =
        req.body as Record<string, string>;

      if (!file) {
        res.status(400).json({ error: "Missing audio file" });
        return;
      }
      if (!gameCode || !playerId || !roundNumber || !timestamp) {
        res.status(400).json({ error: "Missing required fields: gameCode, playerId, roundNumber, timestamp" });
        return;
      }

      const game = getGame(gameCode);
      if (!game) {
        res.status(404).json({ error: "Game not found" });
        return;
      }

      const player = game.players.find((p) => p.id === playerId);
      if (!player) {
        res.status(403).json({ error: "Player not in this game" });
        return;
      }

      const roundNum = parseInt(roundNumber, 10);
      const chunkTimestamp = parseInt(timestamp, 10);

      // Ensure the round exists in state (idempotent).
      ensureRound(gameCode, roundNum, topic ?? `Round ${roundNum}`);

      // Call Groq Whisper (with retry + inaudible fallback).
      const mimeType = file.mimetype || "audio/webm";
      const result = await transcribeAudio(file.buffer, mimeType);

      if (result.inaudible) {
        console.warn(
          `[transcribe] Inaudible segment — game=${gameCode} player=${playerId} round=${roundNum} t=${chunkTimestamp}`
        );
      }

      // Build the canonical speaker label (slot-based, consistent with voter scoring).
      const speakerLabel = `player${player.slot}`;

      const entry: TranscriptEntry = {
        speaker: speakerLabel,
        text: result.text,
        timestamp: chunkTimestamp,
        isObjectionEnd: isObjectionEnd === "true" ? true : undefined,
        inaudible: result.inaudible ? true : undefined,
      };

      // Persist in round state.
      addTranscriptEntry(gameCode, roundNum, entry);

      // Broadcast to all clients in the room.
      io.to(gameCode).emit("transcript:update", {
        speaker: entry.speaker,
        text: entry.text,
        timestamp: entry.timestamp,
        roundNumber: roundNum,
        isObjectionEnd: entry.isObjectionEnd,
        inaudible: entry.inaudible,
      });

      res.status(200).json({ ok: true, entry });
    }
  );

  return router;
}
