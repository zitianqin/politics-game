import { ScreenId } from "../lib/gameConstants";

interface ScreenJudgingProps {
  screen: ScreenId;
  judgingJoke: string;
}

export default function ScreenJudging({
  screen,
  judgingJoke,
}: ScreenJudgingProps) {
  return (
    <div
      id="screen-judging"
      className={`screen ${screen === "judging" ? "active" : ""}`}
    >
      <div className="spinner">🤖</div>
      <h2 className="title-text" style={{ fontSize: "70px" }}>
        AI AUDIENCE IS VOTING...
      </h2>
      <div id="judging-joke">{judgingJoke}</div>
    </div>
  );
}
