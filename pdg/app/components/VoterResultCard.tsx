import { useEffect, useState } from "react";

interface VoterResultCardProps {
  voterName: string;
  voterAge: number;
  voterLocation: string;
  votedFor: "p1" | "p2";
  candidateName: string;
  rationale: string;
  isVisible: boolean;
  tilt?: number; // rotation angle, e.g., -2 or 2
  p1CandidateName?: string;
  p2CandidateName?: string;
}

export default function VoterResultCard({
  voterName,
  voterAge,
  voterLocation,
  votedFor,
  candidateName,
  rationale,
  isVisible,
  tilt = -2,
  p1CandidateName = "Candidate A",
  p2CandidateName = "Candidate B",
}: VoterResultCardProps) {
  const voteColor = votedFor === "p1" ? "var(--p1)" : "var(--p2)";

  // Replace generic candidate names with actual names in the rationale
  const replacedRationale = rationale
    .replace(/Candidate A/g, p1CandidateName)
    .replace(/Candidate B/g, p2CandidateName);

  return (
    <div
      className="voter-result-card"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? `rotate(${tilt}deg) scale(1)`
          : `rotate(${tilt}deg) scale(0.9)`,
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      {/* Voter Info Header */}
      <div className="voter-result-header">
        <h3 className="voter-result-name">{voterName}</h3>
        <p className="voter-result-meta">
          {voterAge} · {voterLocation}
        </p>
      </div>

      {/* Quote/Rationale */}
      <div className="voter-result-quote">
        <p>{replacedRationale}</p>
      </div>

      {/* Vote Indicator */}
      <div className="voter-result-vote" style={{ color: voteColor }}>
        <span className="vote-checkmark">✓</span>
        <span className="vote-for">Voting: {candidateName}</span>
      </div>
    </div>
  );
}
