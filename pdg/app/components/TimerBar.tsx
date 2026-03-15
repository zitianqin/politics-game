"use client";

interface TimerBarProps {
  playerLabel: string;
  playerEmoji: string;
  remaining: number; // seconds
  total: number; // seconds
  isActive: boolean;
  colorVar: string; // CSS var like 'var(--p1)'
}

export default function TimerBar({
  playerLabel,
  playerEmoji,
  remaining,
  total,
  isActive,
  colorVar,
}: TimerBarProps) {
  const fraction = Math.max(0, remaining / total);
  const widthPercent = fraction * 100;

  const getBarColor = (): string => {
    if (remaining <= 10) return "var(--red)";
    if (remaining <= 20) return "var(--accent)";
    return "var(--green)";
  };

  const barColor = getBarColor();

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      className="timer-bar-container flex flex-row lg:flex-col lg:items-start items-center gap-3 lg:gap-3 p-2 lg:p-6 rounded-lg transition-colors"
      style={{
        background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
      }}
    >
      {/* Player label */}
      <div
        style={{
          fontFamily: "Titan One, cursive",
          fontSize: "clamp(16px, 2vw, 24px)",
          color: "white",
          textShadow: "2px 2px 0 var(--dark)",
          minWidth: "80px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
        className="lg:w-full lg:justify-center"
      >
        <img
          src={playerEmoji}
          alt={playerLabel}
          style={{
            width: "clamp(24px, 3vw, 40px)",
            height: "clamp(24px, 3vw, 40px)",
            objectFit: "cover",
            borderRadius: "6px",
            animation: isActive
              ? "avatarBounce 0.7s ease-in-out infinite"
              : "none",
          }}
        />
        {playerLabel}
      </div>

      {/* Bar track */}
      <div
        style={{
          height: "clamp(24px, 2vh, 40px)",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "12px",
          border: "3px solid var(--dark)",
          overflow: "hidden",
          position: "relative",
        }}
        className="flex-1 lg:flex-none lg:w-full"
      >
        {/* Bar fill */}
        <div
          style={{
            height: "100%",
            width: `${widthPercent}%`,
            background: barColor,
            borderRadius: "9px",
            transition: "width 0.5s linear, background 0.5s ease",
            boxShadow: isActive ? `0 0 10px ${barColor}` : "none",
          }}
        />
      </div>

      {/* Time display */}
      <div
        style={{
          fontFamily: "Titan One, cursive",
          fontSize: "clamp(18px, 2.5vw, 28px)",
          color: barColor,
          textShadow: "2px 2px 0 var(--dark)",
          minWidth: "60px",
          textAlign: "right",
          transition: "color 0.5s ease",
        }}
        className="lg:text-center lg:w-full"
      >
        {timeStr}
      </div>

      {/* Active indicator */}
      {isActive && (
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: barColor,
            animation: "pulse 1s infinite",
            boxShadow: `0 0 8px ${barColor}`,
          }}
          className="lg:hidden"
        />
      )}
      <style>{`
        @keyframes avatarBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
