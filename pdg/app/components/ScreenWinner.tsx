import { ScreenId } from "../lib/gameConstants";

interface ScreenWinnerProps {
  screen: ScreenId;
  winnerLabel: string;
  p1TotalVotes: number;
  p2TotalVotes: number;
  resetGame: () => void;
}

export default function ScreenWinner({
  screen,
  winnerLabel,
  p1TotalVotes,
  p2TotalVotes,
  resetGame,
}: ScreenWinnerProps) {
  return (
    <div
      id="screen-winner"
      className={`screen ${screen === "winner" ? "active" : ""}`}
    >
      <h2
        className="subtitle"
        style={{
          fontSize: "50px",
          color: "var(--green)",
          marginBottom: "10px",
        }}
      >
        ELECTION OVER!
      </h2>
      <h1
        className="title-text"
        style={{
          fontSize: "120px",
          color:
            p1TotalVotes > p2TotalVotes
              ? "var(--p1)"
              : p2TotalVotes > p1TotalVotes
              ? "var(--p2)"
              : "var(--accent)",
        }}
      >
        {winnerLabel}
      </h1>

      <div
        className="card"
        style={{ marginBottom: "40px", transform: "rotate(1deg)" }}
      >
        <h3 style={{ fontSize: "30px", marginBottom: "10px" }}>FINAL TALLY</h3>
        <p
          style={{
            fontSize: "24px",
            fontWeight: 900,
            color: "var(--p1-dark)",
          }}
        >
          P1: <span>{p1TotalVotes}</span>
        </p>
        <p
          style={{
            fontSize: "24px",
            fontWeight: 900,
            color: "var(--p2-dark)",
          }}
        >
          P2: <span>{p2TotalVotes}</span>
        </p>
      </div>

      <button className="btn" onClick={resetGame}>
        PLAY AGAIN
      </button>
    </div>
  );
}
