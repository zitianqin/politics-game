import React, { useEffect } from "react";
import { ScreenId } from "../../lib/gameConstants";
import { VoterSVG, VoterProfileProps } from "../VoterSVG";

interface ScreenVoterProfileProps {
  screen: ScreenId;
  voterProfiles: VoterProfileProps[];
  startNextRound: () => void;
}

export default function ScreenVoterProfile({
  screen,
  voterProfiles,
  startNextRound,
}: ScreenVoterProfileProps) {
  // Auto-advance after 5 seconds just for demo purposes if desired,
  // or we can rely on Host pressing a button. Let's rely on button for now.

  return (
    <div
      id="screen-voter-profile"
      className={`screen ${
        screen === ("voter-profile" as any) ? "active" : ""
      }`}
      style={{
        overflowY: "auto",
        display: screen === ("voter-profile" as any) ? "flex" : "none",
        flexDirection: "column",
        justifyContent: "flex-start",
        paddingTop: "100px",
      }}
    >
      <h1
        className="title-text"
        style={{ fontSize: "60px", marginBottom: "20px" }}
      >
        MEET THE VOTERS
      </h1>

      <div className="flex flex-wrap justify-center gap-8 w-full max-w-6xl pb-20">
        {voterProfiles.map((voter, idx) => (
          <div
            key={idx}
            className="transform transition-transform hover:scale-105"
          >
            <VoterSVG profile={voter} lean={voter.lean} />
          </div>
        ))}
      </div>

      <button
        className="btn green-color"
        onClick={startNextRound}
        style={{
          position: "fixed",
          bottom: "40px",
          zIndex: 10,
        }}
      >
        START DEBATE
      </button>
    </div>
  );
}
