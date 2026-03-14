import { Server, Socket } from "socket.io";
import {
  getGame,
  setPlayerSocketId,
  findGameBySocketId,
  clearPlayerSocketId,
  setGameStatus,
} from "../state/gameState";
import { startReconnectTimer, cancelReconnectTimer } from "./reconnect";
import {
  startRound,
  processObjection,
  processYield,
  cleanupRound,
  startRevealPhase,
} from "./roundManager";

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("game:join", (data: { code: string; playerId: string }) => {
      const { code, playerId } = data;
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
        socket.emit("game:reconnected", {
          gameState: serializeGame(game),
        });
      }

      io.to(code).emit("player:joined", {
        playerId: player.id,
        slot: player.slot,
        playerCount: game.players.length,
      });

      console.log(
        `Player ${playerId} (slot ${player.slot}) joined room ${code}`
      );
    });

    socket.on("game:getState", (data: { code: string }) => {
      const { code } = data;
      const game = getGame(code);
      if (game) {
        socket.emit("game:state", { gameState: serializeGame(game) });
      }
    });

    socket.on("game:start", (data: { code: string; playerId: string }) => {
      const { code, playerId } = data;
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

      io.to(code).emit("game:started", {
        code,
        topics: game.topics,
        candidates: game.players.map((p) => p.candidate),
        voters: game.voters,
      });
      startRevealPhase(io, game);
    });

    // Player raises an objection
    socket.on(
      "objection:raised",
      (data: { code: string; byPlayer: 1 | 2 }) => {
        const { code, byPlayer } = data;
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
      const { code, byPlayer } = data;
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
      const { code } = data;
      const game = getGame(code);
      if (!game) return;

      cleanupRound(code);

      if (game.currentRound >= 2) {
        // Game is over after 2 rounds
        setGameStatus(code, "voting");
        io.to(code).emit("voting:start", {});
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
        game.status === "reveal" ||
        game.status === "debate" ||
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
    })),
    voters: game.voters,
    rounds: game.rounds,
    topics: game.topics,
    currentRound: game.currentRound,
    debatePhase: game.debatePhase,
  };
}
