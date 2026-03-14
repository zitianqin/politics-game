"use client";

import { use, useState } from "react";
import ScreenLobby from "@/app/components/ScreenLobby";
import { useGameState } from "@/app/hooks/useGameState";

export default function LobbyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { startGame } = useGameState();
  // TODO: Replace with actual server state / Socket.io connection
  const [isHost] = useState(true);
  const [playersConnected] = useState(2);

  return (
    <ScreenLobby
      screen="lobby"
      gameCode={code}
      isHost={isHost}
      playersConnected={playersConnected}
      startGame={startGame}
    />
  );
}
