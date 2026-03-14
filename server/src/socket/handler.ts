import { Server, Socket } from "socket.io";
import {
  getGame,
  setPlayerSocketId,
  findGameBySocketId,
  clearPlayerSocketId,
  setGameStatus,
} from "../state/gameState";
import { startReconnectTimer, cancelReconnectTimer } from "./reconnect";

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

      setGameStatus(code, "reveal");
      io.to(code).emit("game:started", { code });
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
  };
}
