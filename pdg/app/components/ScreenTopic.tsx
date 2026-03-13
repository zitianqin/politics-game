import { ScreenId } from "../lib/gameConstants";

interface ScreenTopicProps {
  screen: ScreenId;
  currentRound: number;
  currentTopic: string;
}

export default function ScreenTopic({
  screen,
  currentRound,
  currentTopic,
}: ScreenTopicProps) {
  return (
    <div
      id="screen-topic"
      className={`screen ${screen === "topic" ? "active" : ""}`}
    >
      <h2 className="title-text">ROUND {currentRound}</h2>
      <div
        className="card"
        style={{ maxWidth: "800px", transform: "rotate(-2deg)" }}
      >
        <h3 className="subtitle" style={{ color: "var(--green)" }}>
          ON THE DOCKET...
        </h3>
        <p id="topic-text">{currentTopic}</p>
      </div>
    </div>
  );
}
