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
          className="text-xl sm:text-2xl font-black tracking-[8px] sm:tracking-[12px] uppercase text-center px-6 py-5 sm:py-6 rounded-2xl w-full max-w-xs sm:max-w-sm"
          style={{
            border: "6px solid var(--dark)",
            backgroundColor: "white",
            color: "var(--dark)",
            boxShadow: "8px 8px 0 var(--accent)",
          }}
        >
          {gameCode || "??????"}
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
              PLAYER 1{isHost && <span className="text-sm">(YOU)</span> }
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
            <div className="w-2.5 h-2.5 rounded-full opacity-60" style={{ backgroundColor: "var(--dark)" }} />
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
              PLAYER 2{!isHost && <><br /><span className="text-sm">(YOU)</span></>}
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
            <div className="w-2.5 h-2.5 rounded-full opacity-60" style={{ backgroundColor: "var(--dark)" }} />
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