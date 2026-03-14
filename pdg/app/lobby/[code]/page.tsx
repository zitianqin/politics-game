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
      socket.emit("game:join", { code, playerId });
      socket.emit("game:getState", { code });
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on("connect", joinRoom);
    }

    socket.on("game:state", (data: { gameState: any }) => {
      if (data.gameState) {
        setPlayerCount(data.gameState.players.length);
      }
    });

    socket.on("player:joined", (data: { playerCount: number }) => {
      setPlayerCount(data.playerCount);
    });

    socket.on("game:started", () => {
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

    return () => {
      socket.off("connect");
      socket.off("game:state");
      socket.off("player:joined");
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

  return (
    <ScreenLobby
      screen="lobby"
      gameCode={code}
      isHost={isHost}
      playersConnected={playerCount}
      startGame={handleStart}
    />
  );
}
