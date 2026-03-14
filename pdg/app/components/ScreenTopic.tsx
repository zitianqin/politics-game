"use client";

import { ScreenId } from "../lib/gameConstants";

interface ScreenTopicProps {
  screen: ScreenId;
  currentRound: number;
  currentTopic: string;
  prepCountdown: number;
}

export default function ScreenTopic({
  screen,
  currentRound,
  currentTopic,
  prepCountdown,
}: ScreenTopicProps) {
  return (
    <div
      id="screen-topic"
      className={`screen ${screen === "topic" ? "active" : ""}`}
    >
      <h2 className="title-text">ROUND {currentRound}</h2>

      {/* Moderator character */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            background: "var(--dark)",
            width: "80px",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "4px solid var(--accent)",
            boxShadow: "6px 6px 0 var(--dark)",
          }}
        >
          🎙️
        </div>
        <div
          style={{
            fontFamily: "Titan One, cursive",
            fontSize: "20px",
            color: "var(--accent)",
            textShadow: "2px 2px 0 var(--dark)",
            textTransform: "uppercase",
          }}
        >
          MODERATOR
        </div>
      </div>

      {/* Topic card */}
      <div
        className="card"
        style={{
          maxWidth: "800px",
          transform: "rotate(-2deg)",
          animation: "topicSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <h3 className="subtitle" style={{ color: "var(--green)" }}>
          ON THE DOCKET...
        </h3>
        <p id="topic-text">{currentTopic}</p>
      </div>

      {/* Prep countdown timer */}
      <div
        style={{
          marginTop: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            fontFamily: "Titan One, cursive",
            fontSize: "18px",
            color: "white",
            textShadow: "2px 2px 0 var(--dark)",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          DEBATE STARTS IN
        </div>
        <div
          style={{
            fontFamily: "Titan One, cursive",
            fontSize: "72px",
            color: prepCountdown <= 3 ? "var(--red)" : "var(--accent)",
            textShadow: "4px 4px 0 var(--dark)",
            WebkitTextStroke: "2px var(--dark)",
            transition: "color 0.3s, transform 0.2s",
            transform: prepCountdown <= 3 ? "scale(1.1)" : "scale(1)",
            animation: "pulse 1s infinite",
          }}
        >
          {prepCountdown}
        </div>
      </div>

      <style>{`
        @keyframes topicSlideIn {
          0% {
            transform: rotate(-2deg) translateY(50px) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: rotate(-2deg) translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
