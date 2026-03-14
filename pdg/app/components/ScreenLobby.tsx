import { useState, useRef, useEffect } from "react";
import { ScreenId } from "../lib/gameConstants";

interface ScreenLobbyProps {
  screen: ScreenId;
  gameCode: string;
  isHost: boolean;
  playersConnected: number;
  opponentName: string;
  startGame: () => void;
  onNameChange: (name: string) => void;
}

export default function ScreenLobby({
  screen,
  gameCode,
  isHost,
  playersConnected,
  opponentName,
  startGame,
  onNameChange,
}: ScreenLobbyProps) {
  const bothPlayersConnected = playersConnected === 2;
  const [copied, setCopied] = useState(false);
  const [playerName, setPlayerName] = useState(() => {
    if (typeof globalThis.window !== "undefined") {
      return sessionStorage.getItem("playerName") ?? "";
    }
    return "";
  });
  const [isEditing, setIsEditing] = useState(false);
  const [partyMode, setPartyMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const MAX_NAME_LENGTH = 10;

  const saveName = (value: string) => {
    const trimmed = value.trim().slice(0, MAX_NAME_LENGTH);
    setPlayerName(trimmed);
    sessionStorage.setItem("playerName", trimmed);
    setIsEditing(false);
    onNameChange(trimmed);
  };

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

      <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 w-full"> 
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
        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
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

        {/* Party Mode Toggle */}
        <div
          className="flex items-center gap-4 w-full max-w-xs sm:max-w-sm mt-4 px-5 py-4 rounded-2xl"
          style={{
            border: "5px solid var(--dark)",
            backgroundColor: partyMode ? "#fff9db" : "#ffffff",
            boxShadow: partyMode
              ? "8px 8px 0 #f59e0b"
              : "8px 8px 0 var(--dark)",
            transition: "background-color 0.2s, box-shadow 0.2s",
          }}
        >
          {/* Emoji badge */}
          <div
            className="text-2xl flex-shrink-0 flex items-center justify-center rounded-xl"
            style={{
              width: "46px",
              height: "46px",
              background: partyMode ? "#FFD700" : "#f3f4f6",
              border: "3px solid var(--dark)",
              boxShadow: "3px 3px 0 var(--dark)",
              fontSize: "22px",
              transition: "background 0.2s",
            }}
          >
            🎉
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div
              className="font-black uppercase tracking-wider text-sm sm:text-base leading-tight"
              style={{ color: "var(--dark)" }}
            >
              Party Mode
            </div>
            <div
              className="text-xs mt-0.5 leading-snug"
              style={{ color: "#666" }}
            >
              Fun questions only — like "is pineapple on pizza good?" 🍕
            </div>
          </div>

          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={partyMode}
            onClick={() => setPartyMode((p) => !p)}
            className="flex-shrink-0 relative transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            style={{
              width: "52px",
              height: "30px",
              borderRadius: "999px",
              background: partyMode ? "#FFD700" : "#d1d5db",
              border: "3px solid var(--dark)",
              boxShadow: "3px 3px 0 var(--dark)",
              cursor: "pointer",
              padding: 0,
              transition: "background 0.2s, box-shadow 0.1s",
            }}
          >
            <span
              style={{
                display: "block",
                position: "absolute",
                top: "3px",
                left: partyMode ? "calc(100% - 25px)" : "3px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#fff",
                border: "2.5px solid var(--dark)",
                transition: "left 0.15s cubic-bezier(.4,1.4,.6,1)",
              }}
            />
          </button>
          </div>
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
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 mb-3 text-center min-w-0 w-full">
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
            <div className="apply-font text-base sm:text-xl leading-tight text-center min-w-0 w-full">
              {isHost ? (
                isEditing ? (
                  <input
                    ref={inputRef}
                    defaultValue={playerName || "PLAYER 1"}
                    maxLength={MAX_NAME_LENGTH}
                    onBlur={(e) => saveName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName(e.currentTarget.value);
                      if (e.key === "Escape") setIsEditing(false);
                    }}
                    className="bg-transparent text-center outline-none border-b-2 border-white w-full apply-font text-base sm:text-xl"
                  />
                ) : (
                  <>
                    <div className="flex flex-col items-center gap-0.5 w-full">
                      <div className="flex items-center gap-1 w-full min-w-0">
                        <span
                          className="apply-font text-base sm:text-xl truncate min-w-0 flex-1 text-center"
                          title={playerName || "PLAYER 1"}
                        >
                          {playerName || "PLAYER 1"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          title="Edit name"
                          className="inline-flex flex-shrink-0 items-center justify-center transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                          style={{
                            background: "#FFD700",
                            border: "2.5px solid var(--dark)",
                            borderRadius: "10px",
                            boxShadow: "3px 3px 0px var(--dark)",
                            cursor: "pointer",
                            padding: "4px 8px",
                            color: "var(--dark)",
                          }}
                        >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                      <span className="text-sm">(YOU)</span>
                    </div>
                  </>
                )
              ) : (
                <span
                  className="apply-font text-base sm:text-xl truncate min-w-0 block w-full"
                  title={opponentName || "PLAYER 1"}
                >
                  {opponentName || "PLAYER 1"}
                </span>
              )}
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
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 mb-3 text-center min-w-0 w-full">
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
            <div className="apply-font text-base sm:text-xl leading-tight text-center min-w-0 w-full">
              {!isHost ? (
                isEditing ? (
                  <input
                    ref={inputRef}
                    defaultValue={playerName || "PLAYER 2"}
                    maxLength={MAX_NAME_LENGTH}
                    onBlur={(e) => saveName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName(e.currentTarget.value);
                      if (e.key === "Escape") setIsEditing(false);
                    }}
                    className="bg-transparent text-center outline-none border-b-2 border-white w-full apply-font text-base sm:text-xl"
                  />
                ) : (
                  <>
                    <div className="flex flex-col items-center gap-0.5 w-full">
                      <div className="flex items-center gap-1 w-full min-w-0">
                        <span
                          className="apply-font text-base sm:text-xl truncate min-w-0 flex-1 text-center"
                          title={playerName || "PLAYER 2"}
                        >
                          {playerName || "PLAYER 2"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          title="Edit name"
                          className="inline-flex flex-shrink-0 items-center justify-center transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                          style={{
                            background: "#FFD700",
                            border: "2.5px solid var(--dark)",
                            borderRadius: "10px",
                            boxShadow: "3px 3px 0px var(--dark)",
                            cursor: "pointer",
                            padding: "4px 8px",
                            color: "var(--dark)",
                          }}
                        >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                      <span className="text-sm">(YOU)</span>
                    </div>
                  </>
                )
              ) : (
                <span
                  className="apply-font text-base sm:text-xl truncate min-w-0 block w-full"
                  title={opponentName || "PLAYER 2"}
                >
                  {opponentName || "PLAYER 2"}
                </span>
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