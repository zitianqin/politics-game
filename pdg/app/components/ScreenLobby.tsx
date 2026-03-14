import { useState } from "react";
import { ScreenId } from "../lib/gameConstants";

interface ScreenLobbyProps {
  screen: ScreenId;
  gameCode: string;
  isHost: boolean;
  playersConnected: number;
  startGame: () => void;
}

export default function ScreenLobby({
  screen,
  gameCode,
  isHost,
  playersConnected,
  startGame,
}: ScreenLobbyProps) {
  const bothPlayersConnected = playersConnected === 2;
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!gameCode) return;
    await navigator.clipboard.writeText(gameCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      id="screen-lobby"
      className={`screen ${screen === "lobby" ? "active" : ""} min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-y-auto`}
    >
      <h1 className="title-text bouncing text-center text-4xl sm:text-6xl md:text-7xl leading-tight mb-6 sm:mb-8">
        ELECTION
        <br />
        SHOWDOWN
      </h1>

      <div className="flex flex-col items-center justify-center mb-8 sm:mb-10 w-full">
        <div
          className="text-3xl sm:text-5xl font-black tracking-widest uppercase mb-2"
          style={{
            color: "var(--accent)",
            textShadow: "4px 4px 0 var(--dark)",
          }}
        >
          GAME CODE
        </div>
        <div className="text-sm sm:text-base text-white mb-4 text-center">
          Share this code with your opponent to join!
        </div>
        <div
          className="relative text-xl sm:text-2xl font-black tracking-[8px] sm:tracking-[12px] uppercase text-left px-6 py-5 sm:py-6 rounded-2xl w-full max-w-xs sm:max-w-sm"
          style={{
            border: "6px solid var(--dark)",
            backgroundColor: "white",
            color: "var(--dark)",
            boxShadow: "8px 8px 0 var(--accent)",
          }}
        >
          {gameCode || "??????"}
          <button
            onClick={copyCode}
            title="Copy code"
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center transition-all duration-100 active:translate-x-[3px] active:translate-y-[calc(-50%+3px)] active:shadow-none"
            style={{
              background: copied ? "var(--green)" : "#FFD700",
              border: `2.5px solid ${copied ? "#15803d" : "var(--dark)"}`,
              borderRadius: "10px",
              boxShadow: copied
                ? "3px 3px 0px #15803d"
                : "3px 3px 0px var(--dark)",
              cursor: "pointer",
              padding: "6px 10px",
              color: copied ? "#14532d" : "var(--dark)",
            }}
          >
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-row justify-center items-center gap-4 sm:gap-6 mb-8 w-full flex-wrap">
        <div
          className="player-badge flex flex-col justify-center items-center rounded-2xl p-4 w-36 h-44 sm:w-64 sm:h-48"
          style={{
            background: "var(--p1)",
            border: "5px solid var(--dark)",
            boxShadow: "6px 6px 0px var(--dark)",
          }}
        >
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 mb-3 text-center">
            <div
              className="avatar text-2xl sm:text-3xl flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                background: "var(--dark)",
                width: "48px",
                height: "48px",
                border: "3px solid #fff",
              }}
            >
              🦄
            </div>
            <div className="apply-font text-base sm:text-xl leading-tight text-center">
              PLAYER 1{isHost && <span className="text-sm">(YOU)</span>}
            </div>
          </div>
          <div
            className="flex justify-center items-center gap-2 px-3 py-2 rounded-full font-bold text-xs sm:text-sm"
            style={{
              backgroundColor: playersConnected >= 1 ? "#00fc88" : "#ffd500",
              border: "3px solid var(--dark)",
              boxShadow: "4px 4px 0px var(--dark)",
              color: "var(--dark)",
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full opacity-60"
              style={{ backgroundColor: "var(--dark)" }}
            />
            <span>{playersConnected >= 1 ? "READY" : "WAITING"}</span>
          </div>
        </div>

        {/* VS */}
        <div
          className="text-2xl sm:text-4xl font-black"
          style={{
            color: "var(--accent)",
            WebkitTextStroke: "2px var(--dark)",
            textShadow: "4px 4px 0 var(--dark)",
          }}
        >
          VS
        </div>

        {/* Player 2 */}
        <div
          className="player-badge flex flex-col justify-center items-center rounded-2xl p-4 w-36 h-44 sm:w-64 sm:h-48"
          style={{
            background: "var(--p2)",
            border: "5px solid var(--dark)",
            boxShadow: "6px 6px 0px var(--dark)",
          }}
        >
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 mb-3 text-center">
            <div
              className="avatar text-2xl sm:text-3xl flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                background: "var(--dark)",
                width: "48px",
                height: "48px",
                border: "3px solid #fff",
              }}
            >
              🦖
            </div>
            <div className="apply-font text-base sm:text-xl leading-tight text-center">
              PLAYER 2
              {!isHost && (
                <>
                  <br />
                  <span className="text-sm">(YOU)</span>
                </>
              )}
            </div>
          </div>
          <div
            className="flex justify-center items-center gap-2 px-3 py-2 rounded-full font-bold text-xs sm:text-sm"
            style={{
              backgroundColor: playersConnected >= 2 ? "#00fc88" : "#ffd500",
              border: "3px solid var(--dark)",
              boxShadow: "4px 4px 0px var(--dark)",
              color: "var(--dark)",
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full opacity-60"
              style={{ backgroundColor: "var(--dark)" }}
            />
            <span>{playersConnected >= 2 ? "READY" : "WAITING"}</span>
          </div>
        </div>
      </div>

      {isHost && (
        <button
          onClick={startGame}
          disabled={!bothPlayersConnected}
          className="btn w-full max-w-xs sm:max-w-sm text-lg sm:text-xl py-3 sm:py-4"
          onMouseDown={(e) => {
            if (bothPlayersConnected) {
              e.currentTarget.style.transform = "translate(3px, 3px)";
              e.currentTarget.style.boxShadow = "6px 6px 0 var(--dark)";
            }
          }}
          onMouseUp={(e) => {
            if (bothPlayersConnected) {
              e.currentTarget.style.transform = "translate(0, 0)";
              e.currentTarget.style.boxShadow = "12px 12px 0 var(--dark)";
            }
          }}
        >
          {bothPlayersConnected ? "START" : "WAITING FOR OPPONENT..."}
        </button>
      )}

      {!isHost && playersConnected === 2 && (
        <div
          className="sub-text text-center mt-4 text-sm sm:text-base"
          style={{ animation: "pulse 1.5s ease-in-out infinite" }}
        >
          Waiting for host to start...
        </div>
      )}
    </div>
  );
}
