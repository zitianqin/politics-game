"use client";

interface TimerBarProps {
  playerLabel: string;
  playerSrc: string;
  remaining: number; // seconds
  total: number; // seconds
  isActive: boolean;
  colorVar: string; // CSS var like 'var(--p1)'
}

export default function TimerBar({
  playerLabel,
  playerSrc,
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
      className="timer-bar-container flex flex-row lg:flex-col lg:items-start items-center gap-4 lg:gap-3 p-3 lg:p-4 rounded-lg transition-colors w-full"
      style={{
        background: isActive ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)",
        border: isActive
          ? "3px solid var(--accent)"
          : "2px solid rgba(255,255,255,0.3)",
        boxShadow: isActive
          ? "0 0 12px rgba(255, 213, 0, 0.4)"
          : "inset 2px 2px 4px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Player label */}
      <div
        style={{
          fontFamily: "Titan One, cursive",
          fontSize: "clamp(15px, 2.5vw, 18px)",
          color: "white",
          textShadow: "3px 3px 0 var(--dark)",
          WebkitTextStroke: "1px var(--dark)",
          minWidth: "100px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        className="lg:w-full lg:justify-center"
      >
        <img
          src={playerSrc}
          alt={playerLabel}
          style={{
            width: "32px",
            height: "32px",
            objectFit: "cover",
            borderRadius: "6px",
            border: "2px solid white",
            animation: isActive
              ? "avatarBounce 0.7s ease-in-out infinite"
              : "none",
          }}
        />
        <span>{playerLabel}</span>
      </div>

      {/* Bar track */}
      <div
        style={{
          height: "28px",
          width: "200px",
          background: "rgba(0,0,0,0.4)",
          borderRadius: "14px",
          border: "3px solid var(--dark)",
          overflow: "hidden",
          position: "relative",
          boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.5)",
          flexShrink: 0,
          display: "flex",
        }}
      >
        {/* Time passed (dark) */}
        <div
          style={{
            height: "100%",
            width: `${100 - widthPercent}%`,
            background: "rgba(0, 0, 0, 0.6)",
            transition: "width 0.5s linear",
          }}
        />
        {/* Time remaining (colored) */}
        <div
          style={{
            height: "100%",
            width: `${widthPercent}%`,
            background: barColor,
            transition: "width 0.5s linear, background 0.5s ease",
            boxShadow: isActive
              ? `inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 16px ${barColor}`
              : "inset 0 1px 3px rgba(0, 0, 0, 0.2)",
          }}
        />
      </div>

      {/* Time display */}
      <div
        style={{
          fontFamily: "Titan One, cursive",
          fontSize: "clamp(18px, 3vw, 24px)",
          color: barColor,
          textShadow: "3px 3px 0 var(--dark)",
          WebkitTextStroke: "1px var(--dark)",
          minWidth: "70px",
          textAlign: "right",
          transition: "color 0.5s ease",
          fontWeight: "900",
        }}
        className="lg:text-center lg:w-full"
      >
        {timeStr}
      </div>

      {/* Active indicator */}
      {isActive && (
        <div
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: barColor,
            animation: "pulse 1s infinite",
            boxShadow: `0 0 12px ${barColor}, inset 0 0 4px rgba(0, 0, 0, 0.3)`,
            border: "2px solid var(--dark)",
          }}
          className="lg:hidden"
        />
      )}
      <style>{`
        @keyframes avatarBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
