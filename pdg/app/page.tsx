"use client";

import ScreenLobby from "./components/ScreenLobby";
import { useGameState } from "./hooks/useGameState";

export default function Page() {
  const { startGame } = useGameState();

  return <ScreenLobby screen="lobby" startGame={startGame} />;
}
