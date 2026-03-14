import { Server, Socket } from "socket.io";
import {
  getGame,
  setPlayerSocketId,
  findGameBySocketId,
  clearPlayerSocketId,
  setGameStatus,
  resetGameSession,
} from "../state/gameState";
import { startReconnectTimer, cancelReconnectTimer } from "./reconnect";
import {
  startRound,
  processObjection,
  processYield,
  cleanupRound,
  startMeetVotersPhase,
  getRoundContext,
} from "./roundManager";
import { generateCandidatePair } from "../lib/candidateGenerator";

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("game:join", (data: { code: string; playerId: string }) => {
      const { code: rawCode, playerId } = data;
      const code = rawCode.toUpperCase();
      const game = getGame(code);

      if (!game) {
        socket.emit("error", { message: "Game not found" });
        return;
      }

      const player = game.players.find((p) => p.id === playerId);
      if (!player) {
        socket.emit("error", { message: "Player not in this game" });
        return;
      }

      const wasReconnect = cancelReconnectTimer(playerId);
      setPlayerSocketId(code, playerId, socket.id);
      socket.join(code);

      if (wasReconnect) {
        console.log(`Player ${playerId} reconnected to game ${code}`);
      }

      // Broadcast full state to everyone in the room to ensure consistency
      io.to(code).emit("game:state", { gameState: serializeGame(game) });

      io.to(code).emit("player:joined", {
        playerId: player.id,
        slot: player.slot,
        displayName: player.displayName,
        playerCount: game.players.length,
      });

      console.log(
        `Player ${playerId} (slot ${player.slot}) joined room ${code}. Total players: ${game.players.length}`
      );
    });

    socket.on("game:getState", (data: { code: string }) => {
      const { code: rawCode } = data;
      const code = rawCode.toUpperCase();
      const game = getGame(code);
      if (game) {
        socket.emit("game:state", { gameState: serializeGame(game) });
      }
    });

    socket.on(
      "player:setName",
      (data: { code: string; playerId: string; name: string }) => {
        const { code, playerId, name } = data;
        const game = getGame(code);
        if (!game) return;

        const player = game.players.find((p) => p.id === playerId);
        if (!player) return;

        player.displayName = name.trim().slice(0, 10) || null;

        io.to(code).emit("player:nameChanged", {
          playerId: player.id,
          slot: player.slot,
          displayName: player.displayName,
        });
      }
    );

    socket.on("game:start", (data: { code: string; playerId: string }) => {
      const { code: rawCode, playerId } = data;
      const code = rawCode.toUpperCase();
      const game = getGame(code);

      if (!game) {
        socket.emit("error", { message: "Game not found" });
        return;
      }

      if (game.hostId !== playerId) {
        socket.emit("error", { message: "Only the host can start the game" });
        return;
      }

      if (game.players.length < 2) {
        socket.emit("error", { message: "Need 2 players to start" });
        return;
      }

      if (game.status !== "lobby") {
        socket.emit("error", { message: "Game already started" });
        return;
      }

      const [candidate1, candidate2] = generateCandidatePair(game.topics);
      const player1 = game.players.find((p) => p.slot === 1);
      const player2 = game.players.find((p) => p.slot === 2);

      if (!player1 || !player2) {
        socket.emit("error", { message: "Game missing players" });
        return;
      }

      player1.candidate = candidate1;
      player2.candidate = candidate2;

      io.to(code).emit("game:started", {
        code,
        topics: game.topics,
        candidates: game.players.map((p) => p.candidate),
        voters: game.voters,
        players: game.players.map((p) => ({
          slot: p.slot,
          displayName: p.displayName,
        })),
      });
      startMeetVotersPhase(io, game);
    });

    socket.on("reveal:done", (data: { code: string; playerId?: string }) => {
      const { code: rawCode } = data;
      const code = rawCode.toUpperCase();
      const game = getGame(code);
      if (!game) return;

      let pId = data.playerId;
      if (!pId) {
        const found = findGameBySocketId(socket.id);
        if (found) pId = found.player.id;
      }

      if (pId && !game.revealReady.includes(pId)) {
        game.revealReady.push(pId);
        io.to(code).emit("reveal:ready", { playerId: pId, readyCount: game.revealReady.length });
      }

      const ctx = getRoundContext(code);
      if (game.revealReady.length >= 2 && ctx && ctx.revealIntervalId) {
        clearInterval(ctx.revealIntervalId);
        ctx.revealIntervalId = null;
        io.to(code).emit("reveal:end", {});
        startRound(io, game, 1);
      }
    });

    socket.on("game:reset", (data: { code: string }) => {
      const { code: rawCode } = data;
      const code = rawCode.toUpperCase();
      const game = resetGameSession(code);
      if (game) {
        cleanupRound(code);
        io.to(code).emit("game:state", { gameState: serializeGame(game) });
        io.to(code).emit("game:reset", { code });
      }
    });

    // Player raises an objection
    socket.on(
      "objection:raised",
      (data: { code: string; byPlayer: 1 | 2 }) => {
        const { code: rawCode, byPlayer } = data;
        const code = rawCode.toUpperCase();
        const game = getGame(code);
        if (!game) {
          socket.emit("error", { message: "Game not found" });
          return;
        }

        const result = processObjection(io, game, byPlayer);
        if (!result.success) {
          socket.emit("objection:rejected", { reason: result.reason });
        }
      }
    );

    // Player voluntarily yields the floor
    socket.on("floor:yield", (data: { code: string; byPlayer: 1 | 2 }) => {
      const { code: rawCode, byPlayer } = data;
      const code = rawCode.toUpperCase();
      const game = getGame(code);
      if (!game) {
        socket.emit("error", { message: "Game not found" });
        return;
      }

      const result = processYield(io, game, byPlayer);
      if (!result.success) {
        socket.emit("yield:rejected", { reason: result.reason });
      }
    });

    // After judging/voting for a round, advance to next round or end
    socket.on("round:advance", (data: { code: string }) => {
      const { code: rawCode } = data;
      const code = rawCode.toUpperCase();
      const game = getGame(code);
      if (!game || game.status !== "round_results") return;

      cleanupRound(code);

      if (game.currentRound >= 2) {
        // Game is over after 2 rounds
        setGameStatus(code, "complete");
        io.to(code).emit("game:complete", {});
      } else {
        // Start next round
        startRound(io, game, game.currentRound + 1);
      }
    });

    socket.on("disconnect", () => {
      const result = findGameBySocketId(socket.id);
      if (!result) return;

      const { game, player } = result;
      console.log(
        `Player ${player.id} (slot ${player.slot}) disconnected from game ${game.code}`
      );

      clearPlayerSocketId(player.id, game.code);

      if (game.status === "lobby") {
        io.to(game.code).emit("player:disconnected", {
          playerId: player.id,
          slot: player.slot,
        });
        return;
      }

      if (
        game.status === "meet_voters" ||
        game.status === "debate" ||
        game.status === "judging" ||
        game.status === "round_results" ||
        game.status === "voting"
      ) {
        io.to(game.code).emit("player:disconnected", {
          playerId: player.id,
          slot: player.slot,
          reconnectWindow: 15,
        });

        startReconnectTimer(player.id, game.code, 15_000, () => {
          const opponent = game.players.find((p) => p.id !== player.id);
          if (!opponent) return;

          cleanupRound(game.code);
          setGameStatus(game.code, "complete");
          io.to(game.code).emit("game:forfeit", {
            winner: opponent.id,
            winnerSlot: opponent.slot,
            reason: "opponent_disconnected",
          });

          console.log(
            `Game ${game.code} forfeited: Player ${player.id} failed to reconnect`
          );
        });
      }
    });
  });
}

function serializeGame(game: ReturnType<typeof getGame>) {
  if (!game) return null;
  return {
    id: game.id,
    code: game.code,
    status: game.status,
    players: game.players.map((p) => ({
      id: p.id,
      slot: p.slot,
      candidate: p.candidate,
      displayName: p.displayName,
    })),
    voters: game.voters,
    rounds: game.rounds,
    topics: game.topics,
    currentRound: game.currentRound,
    debatePhase: game.debatePhase,
  };
}
