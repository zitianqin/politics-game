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
      className={`screen ${screen === "lobby" ? "active" : ""}`}
      style={{
        padding: "12px",
        overflowY: "auto",
      }}
    >
      <h1
        className="title-text bouncing"
        style={{ fontSize: "64px", marginBottom: "16px" }}
      >
        ELECTION
        <br />
        SHOWDOWN
      </h1>

      {/* Game Code Section */}
      <div className="flex flex-col items-center justify-center mb-10">
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
          GAME CODE
        </div>
        <div
          // className="sub-text"
          style={{
            fontSize: "20px",
            color: "white",
          }}
        >
          Share this code with your opponent to join!
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "900",
            letterSpacing: "12px",
            textTransform: "uppercase",
            textAlign: "center",
            padding: "24px",
            border: "6px solid var(--dark)",
            borderRadius: "16px",
            backgroundColor: "white",
            color: "var(--dark)",
            boxShadow: "12px 12px 0 var(--accent)",
            transition: "all 0.2s ease",
            outline: "none",
            minWidth: "400px",
          }}
        >
          {gameCode || "??????"}
        </div>
      </div>

      {/* Players Connected Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        {/* Player 1 */}
        <div
          className="player-badge flex flex-col justify-center items-center"
          style={{
            background: "var(--p1)",
            width: "280px",
            height: "200px",
            padding: "16px",
            border: "5px solid var(--dark)",
            boxShadow: "6px 6px 0px var(--dark)",
            borderRadius: "16px",
          }}
        >
          <div className="flex justify-center items-center gap-3 mb-2">
            <div
              className="avatar"
              style={{
                fontSize: "32px",
                background: "var(--dark)",
                width: "60px",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: "3px solid #fff",
                flex: "0 0 60px",
              }}
            >
              🦄
            </div>
            <div
              className="score-val apply-font text-2xl"
              style={{ lineHeight: "1.2" }}
            >
              PLAYER 1{isHost && " (YOU)"}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: playersConnected >= 1 ? "#00fc88" : "#ffd500",
              border: "3px solid var(--dark)",
              borderRadius: "24px",
              boxShadow: "4px 4px 0px var(--dark)",
              fontWeight: "bold",
              fontSize: "14px",
              color: "var(--dark)",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "var(--dark)",
                opacity: 0.6,
              }}
            />
            <span>{playersConnected >= 1 ? "READY" : "WAITING"}</span>
          </div>
        </div>

        {/* VS */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: "900",
            color: "var(--accent)",
            WebkitTextStroke: "2px var(--dark)",
            textShadow: "4px 4px 0 var(--dark)",
          }}
        >
          VS
        </div>

        {/* Player 2 */}
        <div
          className="player-badge flex flex-col justify-center items-center"
          style={{
            background: "var(--p2)",
            width: "280px",
            height: "200px",
            padding: "16px",
            border: "5px solid var(--dark)",
            boxShadow: "6px 6px 0px var(--dark)",
            borderRadius: "16px",
          }}
        >
          <div className="flex justify-center items-center gap-3 mb-2">
            <div
              className="avatar"
              style={{
                fontSize: "32px",
                background: "var(--dark)",
                width: "60px",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: "3px solid #fff",
                flex: "0 0 60px",
              }}
            >
              🦖
            </div>
            <div
              className="score-val apply-font text-2xl"
              style={{ lineHeight: "1.2" }}
            >
              PLAYER 2{!isHost && " (YOU)"}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: playersConnected >= 2 ? "#00fc88" : "#ffd500",
              border: "3px solid var(--dark)",
              borderRadius: "24px",
              boxShadow: "4px 4px 0px var(--dark)",
              fontWeight: "bold",
              fontSize: "14px",
              color: "var(--dark)",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "var(--dark)",
                opacity: 0.6,
              }}
            />
            <span>{playersConnected >= 2 ? "READY" : "WAITING"}</span>
          </div>
        </div>
      </div>

      {/* Start Game Button */}
      {isHost && (
        <div>
          <button
            onClick={startGame}
            disabled={!bothPlayersConnected}
            className="btn"
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
        </div>
      )}

      {!isHost && playersConnected === 2 && (
        <div
          className="sub-text"
          style={{
            textAlign: "center",
            animation: "pulse 1.5s ease-in-out infinite",
            marginTop: "16px",
          }}
        >
          Waiting for host to start...
        </div>
      )}
    </div>
  );
}
