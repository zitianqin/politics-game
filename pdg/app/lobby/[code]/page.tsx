"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ScreenLobby from "@/app/components/ScreenLobby";
import { getSocket } from "@/app/lib/socket";

export default function LobbyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();

  const [playerCount, setPlayerCount] = useState(0);
  const [isHost] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("isHost") === "true";
  });
  const [hasMic, setHasMic] = useState<boolean | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [opponentName, setOpponentName] = useState("");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        setHasMic(true);
      })
      .catch(() => setHasMic(false));
  }, []);

  useEffect(() => {
    const playerId = sessionStorage.getItem("playerId");

    if (!playerId) {
      router.push("/");
      return;
    }

    const socket = getSocket();
    socket.connect();

    const joinRoom = () => {
      console.log("Emitting game:join and game:getState for", code);
      socket.emit("game:join", { code, playerId });
      socket.emit("game:getState", { code });
      const savedName = sessionStorage.getItem("playerName");
      if (savedName) {
        socket.emit("player:setName", { code, playerId, name: savedName });
      }
    };

    socket.on("game:state", (data: { gameState: any }) => {
      console.log("Received game:state in lobby:", data.gameState?.players?.length);
      if (data.gameState) {
        setPlayerCount(data.gameState.players.length);
        const myId = sessionStorage.getItem("playerId");
        const opponent = data.gameState.players.find(
          (p: any) => p.id !== myId
        );
        if (opponent?.displayName) {
          setOpponentName(opponent.displayName);
        }
      }
    });

socket.on("player:joined", (data: { playerCount: number }) => {
  console.log("Received player:joined in lobby. Count:", data.playerCount);
  setPlayerCount(data.playerCount);
});

    socket.on("game:started", () => {
      console.log("Received game:started in lobby");
      router.push(`/reveal/${code}`);
    });

    socket.on("game:reconnected", (data: { gameState: { status: string } }) => {
      const status = data.gameState?.status;
      if (status && status !== "lobby") {
        const route =
          status === "meet_voters"
            ? `/reveal/${code}`
            : ["debate", "judging", "round_results"].includes(status)
            ? `/debate/${code}`
            : `/results/${code}`;
        router.push(route);
      }
    });

    socket.on("error", (data: { message: string }) => {
      setIsStarting(false);
      console.error("Socket error:", data.message);
    });

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on("connect", joinRoom);
    }

    return () => {
      socket.off("connect");
      socket.off("game:state");
      socket.off("player:joined");
      socket.off("player:nameChanged");
      socket.off("game:started");
      socket.off("game:reconnected");
      socket.off("error");
    };
  }, [code, router]);

  const handleStart = () => {
    const playerId = sessionStorage.getItem("playerId");
    if (!playerId || hasMic === false) return;
    console.log("Start game clicked");
    setIsStarting(true);
    getSocket().emit("game:start", { code, playerId });
  };

  const handleNameChange = (name: string) => {
    const playerId = sessionStorage.getItem("playerId");
    if (!playerId) return;
    getSocket().emit("player:setName", { code, playerId, name });
  };

  return (
    <ScreenLobby
      screen="lobby"
      gameCode={code}
      isHost={isHost}
      playersConnected={playerCount}
      opponentName={opponentName}
      startGame={handleStart}
      onNameChange={handleNameChange}
    />
  );
}
