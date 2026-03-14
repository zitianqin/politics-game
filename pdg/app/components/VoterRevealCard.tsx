import { useEffect, useState } from "react";

interface VoterRevealCardProps {
  voterName: string;
  voterAge: number;
  voterLocation: string;
  votedFor: "p1" | "p2";
  p1Name: string;
  p2Name: string;
  rationale: string;
  isAnimating: boolean;
  delayMs?: number;
}

export default function VoterRevealCard({
  voterName,
  voterAge,
  voterLocation,
  votedFor,
  p1Name,
  p2Name,
  rationale,
  isAnimating,
  delayMs = 0,
}: VoterRevealCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isAnimating) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isAnimating, delayMs]);

  const candidateName = votedFor === "p1" ? p1Name : p2Name;
  const voteColor = votedFor === "p1" ? "var(--p1)" : "var(--p2)";

  return (
    <div
      className="voter-reveal-card"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "all 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div className="voter-header">
        <div className="voter-info">
          <h3 className="voter-name">{voterName}</h3>
          <p className="voter-details">
            {voterAge} · {voterLocation}
          </p>
        </div>
        <div
          className="vote-arrow"
          style={{
            color: voteColor,
          }}
        >
          ✓
        </div>
      </div>

      <div className="voter-rationale">
        <p>{rationale}</p>
      </div>

      <div className="voter-candidate" style={{ color: voteColor }}>
        <strong>Voting for: {candidateName}</strong>
      </div>
    </div>
  );
}
