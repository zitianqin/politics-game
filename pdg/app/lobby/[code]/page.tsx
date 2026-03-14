"use client";

import ScreenLobby from "@/app/components/ScreenLobby";
import { useGameState } from "@/app/hooks/useGameState";

export default function LobbyPage({ params }: { params: { code: string } }) {
  const { startGame } = useGameState();

  return <ScreenLobby screen="lobby" startGame={startGame} />;
}
