import { ScreenId } from "../lib/gameConstants";

interface ScreenRootProps {
  screen: ScreenId;
  createGame: () => void;
  joinGame: () => void;
}

export default function ScreenRoot({
  screen,
  createGame,
  joinGame,
}: ScreenRootProps) {
  return (
    <div
      id="screen-root"
      className={`screen ${screen === "lobby" ? "active" : ""}`}
    >
      <img src="/title.png" alt="Election Showdown" style={{ maxWidth: "680px", width: "90%", height: "auto" }} />

      {/* <div className="character-select">
        <div
          className="char-card"
          style={{
            borderColor: "var(--p1)",
            boxShadow: "8px 8px 0px var(--p1)",
          }}
        >
          <div className="avatar-preview">🦄</div>
          <h3 style={{ color: "var(--p1-dark)" }}>PLAYER 1</h3>
        </div>
        <h1
          style={{
            color: "var(--accent)",
            alignSelf: "center",
            WebkitTextStroke: "3px var(--dark)",
            textShadow: "4px 4px 0 var(--dark)",
          }}
        >
          VS
        </h1>
        <div
          className="char-card"
          style={{
            borderColor: "var(--p2)",
            boxShadow: "8px 8px 0px var(--p2)",
          }}
        >
          <div className="avatar-preview">🦖</div>
          <h3 style={{ color: "var(--p2-dark)" }}>PLAYER 2</h3>
        </div>
      </div> */}

      <div className="flex flex-col justify-center items-center gap-5">
        <button className="btn" onClick={createGame}>
          CREATE GAME
        </button>

        <button className="btn green-color" onClick={joinGame}>
          JOIN GAME
        </button>
      </div>
    </div>
  );
}
