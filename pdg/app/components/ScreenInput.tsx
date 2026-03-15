import { useState, useEffect } from "react";
import { ScreenId } from "../lib/gameConstants";

interface ScreenInputProps {
  screen: ScreenId;
  currentPlayer: 1 | 2;
  currentTopic: string;
  submitArgument: (text: string) => void;
}

export default function ScreenInput({
  screen,
  currentPlayer,
  currentTopic,
  submitArgument,
}: ScreenInputProps) {
  const [argText, setArgText] = useState("");

  // When the screen becomes 'input', focus the textarea and clear text
  useEffect(() => {
    if (screen === "input") {
      setArgText("");
      const el = document.getElementById("argument-input");
      if (el) {
        // minor delay to allow CSS transition
        setTimeout(() => el.focus({ preventScroll: true }), 50);
      }
    }
  }, [screen]);

  const handleSubmitArgument = () => {
    submitArgument(argText);
    setArgText("");
  };

  return (
    <div
      id="screen-input"
      className={`screen ${screen === "input" ? "active" : ""}`}
    >
      <h2
        className="title-text"
        style={{
          fontSize: "60px",
          color: currentPlayer === 1 ? "var(--p1)" : "var(--p2)",
        }}
      >
        <img src={currentPlayer === 1 ? "/P1.png" : "/P2.png"} alt={`P${currentPlayer}`} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "10px", verticalAlign: "middle", marginRight: "12px" }} />
        {currentPlayer === 1 ? "PLAYER 1'S TURN" : "PLAYER 2'S TURN"}
      </h2>
      <h3
        className="subtitle"
        style={{
          marginBottom: "20px",
          color: "#FFF",
          WebkitTextStroke: "1px black",
          fontSize: "20px",
        }}
      >
        Topic: {currentTopic}
      </h3>

      <div className="typing-arena">
        <textarea
          id="argument-input"
          className="text-input"
          placeholder="Type your spectacular argument here..."
          style={{
            borderColor: currentPlayer === 1 ? "var(--p1)" : "var(--p2)",
          }}
          value={argText}
          onChange={(e) => setArgText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmitArgument();
            }
          }}
        />
        <button
          className={`btn ${currentPlayer === 1 ? "p1-color" : "p2-color"}`}
          style={{
            alignSelf: "flex-end",
            color: currentPlayer === 1 ? "" : "#FFF",
          }}
          onClick={handleSubmitArgument}
        >
          DEBATE! 🎤
        </button>
      </div>
    </div>
  );
}
