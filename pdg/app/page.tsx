"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ScreenRoot from "./components/ScreenRoot";
import { apiUrl } from "./lib/api";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [existingGame, setExistingGame] = useState<{
    code: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    const playerId = sessionStorage.getItem("playerId");
    const gameCode = sessionStorage.getItem("gameCode");
    if (!playerId || !gameCode) return;

    fetch(apiUrl("/api/game/reconnect"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: gameCode, playerId }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.status !== "complete") {
          setExistingGame({ code: data.code, status: data.status });
          sessionStorage.setItem("isHost", String(data.isHost));
        } else {
          sessionStorage.removeItem("playerId");
          sessionStorage.removeItem("gameCode");
          sessionStorage.removeItem("isHost");
        }
      })
      .catch(() => {});
  }, []);

  const handleRejoin = () => {
    if (!existingGame) return;
    const targetRoute =
      existingGame.status === "lobby"
        ? `/lobby/${existingGame.code}`
        : existingGame.status === "meet_voters"
          ? `/reveal/${existingGame.code}`
          : ["debate", "judging", "round_results"].includes(existingGame.status)
            ? `/debate/${existingGame.code}`
            : `/results/${existingGame.code}`;
    router.push(targetRoute);
  };

  const handleNewGame = () => {
    sessionStorage.removeItem("playerId");
    sessionStorage.removeItem("gameCode");
    sessionStorage.removeItem("isHost");
    setExistingGame(null);
  };

  const handleCreateGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/api/game/create"), {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to create game");
      const data = await response.json();

      sessionStorage.setItem("playerId", data.playerId);
      sessionStorage.setItem("gameCode", data.code);
      sessionStorage.setItem("isHost", "true");

      router.push(`/lobby/${data.code}`);
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
      const response = await fetch(apiUrl("/api/game/join"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Invalid code");
      }
      const data = await response.json();

      sessionStorage.setItem("playerId", data.playerId);
      sessionStorage.setItem("gameCode", data.code);
      sessionStorage.setItem("isHost", "false");

      router.push(`/lobby/${data.code}`);
    } catch (error) {
      console.error("Failed to join game:", error);
      alert(error instanceof Error ? error.message : "Invalid game code");
    } finally {
      setIsLoading(false);
    }
  };

  if (existingGame) {
    return (
      <div className="screen active">
        <img src="/title.png" alt="Election Showdown" style={{ maxWidth: "680px", width: "90%", height: "auto" }} />
        <div className="flex flex-col justify-center items-center gap-8">
          <div
            style={{
              fontSize: "32px",
              fontWeight: "900",
              color: "var(--accent)",
              textShadow: "4px 4px 0 var(--dark)",
              textTransform: "uppercase",
            }}
          >
            GAME IN PROGRESS
          </div>
          <div
            style={{
              fontSize: "48px",
              fontWeight: "900",
              letterSpacing: "12px",
              color: "var(--light)",
              fontFamily: "monospace",
            }}
          >
            {existingGame.code}
          </div>
          <div className="flex flex-col justify-center items-center gap-5">
            <button className="btn green-color" onClick={handleRejoin}>
              REJOIN GAME
            </button>
            <button className="btn" onClick={handleNewGame}>
              NEW GAME
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showJoinInput) {
    return (
      <div className="screen active">
        <img src="/title.png" alt="Election Showdown" style={{ maxWidth: "680px", width: "90%", height: "auto" }} />
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
            autoFocus
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
