"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ScreenRoot from "./components/ScreenRoot";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleCreateGame = async () => {
    setIsLoading(true);
    try {
      // TODO: Call API to create game and get code
      // const response = await fetch("/api/game/create", { method: "POST" });
      // const data = await response.json();
      // const gameCode = data.code;

      // For now, generate a mock code
      const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      router.push(`/lobby/${gameCode}`);
    } catch (error) {
      console.error("Failed to create game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a game code");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call API to validate code and join game
      // const response = await fetch("/api/game/join", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ code: joinCode }),
      // });
      // if (!response.ok) throw new Error("Invalid code");

      router.push(`/lobby/${joinCode.toUpperCase()}`);
    } catch (error) {
      console.error("Failed to join game:", error);
      alert("Invalid game code");
    } finally {
      setIsLoading(false);
    }
  };

  if (showJoinInput) {
    return (
      <div className="screen active">
        <h1 className="title-text bouncing">
          ELECTION
          <br />
          SHOWDOWN
        </h1>
        <div className="flex flex-col justify-center items-center gap-8">
          <div
            style={{
              fontSize: "48px",
              fontWeight: "900",
              letterSpacing: "8px",
              textTransform: "uppercase",
              color: "var(--accent)",
              textShadow: "4px 4px 0 var(--dark)",
            }}
          >
            ENTER CODE
          </div>
          <input
            type="text"
            placeholder="??????"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            disabled={isLoading}
            style={{
              fontSize: "24px",
              fontWeight: "900",
              letterSpacing: "12px",
              textTransform: "uppercase",
              textAlign: "center",
              padding: "24px 32px",
              border: "6px solid var(--dark)",
              borderRadius: "16px",
              backgroundColor: "white",
              color: "var(--dark)",
              boxShadow: "12px 12px 0 var(--accent)",
              transition: "all 0.2s ease",
              outline: "none",
              minWidth: "400px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.transform = "translate(2px, 2px)";
              e.currentTarget.style.boxShadow = "8px 8px 0 var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.transform = "translate(0, 0)";
              e.currentTarget.style.boxShadow = "12px 12px 0 var(--accent)";
            }}
          />

          <div className="flex flex-col justify-center items-center gap-5">
            <button
              className="btn green-color"
              onClick={handleJoinGame}
              disabled={isLoading}
            >
              {isLoading ? "JOINING..." : "JOIN GAME"}
            </button>
            <button
              className="btn"
              onClick={() => setShowJoinInput(false)}
              disabled={isLoading}
            >
              BACK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScreenRoot
      screen="lobby"
      createGame={handleCreateGame}
      joinGame={() => setShowJoinInput(true)}
    />
  );
}
