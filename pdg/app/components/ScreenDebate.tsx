"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ScreenId } from "../lib/gameConstants";
import { TranscriptEntry } from "../hooks/useGameState";
import TimerBar from "./TimerBar";

interface ScreenDebateProps {
  screen: ScreenId;
  currentRound: number;
  currentPlayer: 1 | 2;
  activePlayer: 1 | 2;
  p1TimeRemaining: number;
  p2TimeRemaining: number;
  currentTopic: string;
  transcript: TranscriptEntry[];
  showObjectionVFX: boolean;
  objectionBy: 1 | 2 | null;
  onObjection: () => void;
  onYield: () => void;
  onSubmitSpeech: (transcript: string) => void;
  setIsRecording: (value: boolean) => void;
  setMediaStream: (stream: MediaStream | null) => void;
}

export default function ScreenDebate({
  screen,
  currentRound,
  currentPlayer,
  activePlayer,
  p1TimeRemaining,
  p2TimeRemaining,
  currentTopic,
  transcript,
  showObjectionVFX,
  objectionBy,
  onObjection,
  onYield,
  onSubmitSpeech,
  setIsRecording: setIsRecordingGlobal,
  setMediaStream,
}: ScreenDebateProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [displayTranscript, setDisplayTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [screenShake, setScreenShake] = useState(false);

  // Determine if current player can object (server-driven constraints)
  const isCurrentPlayerActive = activePlayer === currentPlayer;
  const myRemaining = currentPlayer === 1 ? p1TimeRemaining : p2TimeRemaining;
  const canObjection =
    !isCurrentPlayerActive && myRemaining > 15 && screen === "debate";

  // Trigger screen shake on objection VFX
  useEffect(() => {
    if (showObjectionVFX) {
      setScreenShake(true);
      // Play gavel SFX
      try {
        const audio = new Audio(
          "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
        );
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {}
      const timer = setTimeout(() => setScreenShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [showObjectionVFX]);

  // Update transcript display
  useEffect(() => {
    const formatted = transcript
      .map((entry) => {
        const playerLabel = entry.speaker === 1 ? "🦄 P1" : "🦖 P2";
        const objectionMarker = entry.isObjection ? " [OBJECTION!]" : "";
        return `${playerLabel}${objectionMarker}: ${entry.text}`;
      })
      .join("\n\n");
    setDisplayTranscript(formatted);

    setTimeout(() => {
      if (transcriptEndRef.current) {
        transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  }, [transcript]);

  // Start/stop recording based on active player
  useEffect(() => {
    if (screen === "debate" && isCurrentPlayerActive && !isRecording) {
      startRecording();
    } else if (screen !== "debate" || !isCurrentPlayerActive) {
      stopRecording();
    }
  }, [screen, isCurrentPlayerActive]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await sendAudioForTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setIsRecordingGlobal(true);
      setMediaStream(stream);
    } catch (error) {
      console.error("Failed to access microphone:", error);
    }
  }, [setIsRecordingGlobal, setMediaStream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsRecordingGlobal(false);
      setMediaStream(null);
    }
  }, [isRecording, setIsRecordingGlobal, setMediaStream]);

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      // Mock transcription for now — returns a placeholder
      const mockText = "[speech captured]";
      onSubmitSpeech(mockText);
    } catch (error) {
      console.error("Transcription error:", error);
    }
  };

  const handleObjection = () => {
    if (canObjection) {
      onObjection();
    }
  };

  return (
    <div
      id="screen-debate"
      className={`screen ${screen === "debate" ? "active" : ""}`}
      style={{
        padding: "0",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        animation: screenShake ? "screenShake 0.5s ease-out" : "none",
      }}
    >
      {/* OBJECTION VFX Overlay */}
      {showObjectionVFX && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "Titan One, cursive",
              fontSize: "120px",
              color: "var(--red)",
              WebkitTextStroke: "4px var(--dark)",
              textShadow:
                "8px 8px 0 var(--dark), 0 0 40px rgba(255, 76, 76, 0.6)",
              animation: "objectionSlam 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              textTransform: "uppercase",
              letterSpacing: "8px",
            }}
          >
            OBJECTION!
          </div>
        </div>
      )}

      {/* Top HUD Bar */}
      <div
        style={{
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Round Badge */}
        <div
          className="flex"
          style={{
            background: "var(--p2)",
            border: "4px solid var(--dark)",
            borderRadius: "12px",
            padding: "10px 20px",
            textAlign: "center",
            boxShadow: "4px 4px 0 var(--dark)",
          }}
        >
          <div
            style={{
              fontFamily: "Titan One, cursive",
              fontSize: "28px",
              fontWeight: "900",
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            ROUND {currentRound}
          </div>
        </div>

        {/* Floor indicator */}
        <div
          style={{
            background: activePlayer === 1 ? "var(--p1)" : "var(--p2)",
            border: "4px solid var(--dark)",
            borderRadius: "12px",
            padding: "10px 20px",
            boxShadow: "4px 4px 0 var(--dark)",
            animation: "pulse 1.5s infinite",
            transition: "background 0.3s",
          }}
        >
          <div
            style={{
              fontFamily: "Titan One, cursive",
              fontSize: "18px",
              color: "white",
              textShadow: "2px 2px 0 var(--dark)",
              textTransform: "uppercase",
            }}
          >
            {activePlayer === 1 ? "🦄" : "🦖"} P{activePlayer} SPEAKING
          </div>
        </div>
      </div>

      {/* Per-Player Timer Bars */}
      <div
        style={{
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <TimerBar
          playerLabel="P1"
          playerEmoji="🦄"
          remaining={p1TimeRemaining}
          total={60}
          isActive={activePlayer === 1}
          colorVar="var(--p1)"
        />
        <TimerBar
          playerLabel="P2"
          playerEmoji="🦖"
          remaining={p2TimeRemaining}
          total={60}
          isActive={activePlayer === 2}
          colorVar="var(--p2)"
        />
      </div>

      {/* Topic Banner */}
      <div
        style={{
          background: "linear-gradient(90deg, var(--accent), var(--p2))",
          border: "4px solid var(--dark)",
          borderTop: "none",
          padding: "12px 24px",
          textAlign: "center",
          boxShadow: "0 4px 0 var(--dark)",
        }}
      >
        <div
          id="topic-text"
          style={{
            fontSize: "22px",
            fontFamily: "Titan One, cursive",
            fontWeight: "900",
            color: "white",
            textShadow: "3px 3px 0 var(--dark)",
            WebkitTextStroke: "1px var(--dark)",
            margin: "0",
            lineHeight: "1.3",
          }}
        >
          &ldquo;{currentTopic}&rdquo;
        </div>
      </div>

      {/* Main Transcript Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "16px 20px",
          minHeight: 0,
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.98)",
            border: "6px solid var(--dark)",
            borderRadius: "16px",
            padding: "20px",
            flex: 1,
            overflowY: "auto",
            boxShadow: "8px 8px 0 var(--dark)",
            fontFamily: "Nunito, sans-serif",
            fontSize: "20px",
            fontWeight: "700",
            lineHeight: "1.8",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            color: "var(--dark)",
          }}
        >
          {displayTranscript || (
            <span
              style={{ color: "#999", fontStyle: "italic", fontSize: "14px" }}
            >
              Waiting for debate to start...
            </span>
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div
            style={{
              marginTop: "12px",
              textAlign: "center",
              animation: "pulse 1s infinite",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: "var(--p2)",
                color: "white",
                padding: "10px 20px",
                borderRadius: "24px",
                fontWeight: "900",
                fontSize: "14px",
                fontFamily: "Titan One, cursive",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              🔴 RECORDING
            </span>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        {/* Objection Button */}
        <button
          onClick={handleObjection}
          disabled={!canObjection}
          style={{
            background: canObjection ? "var(--red)" : "#999",
            color: canObjection ? "black" : "rgba(0, 0, 0, 0.5)",
            border: "6px solid var(--dark)",
            borderRadius: "16px",
            padding: "18px 28px",
            fontFamily: "Titan One, cursive",
            fontSize: "20px",
            fontWeight: "900",
            textTransform: "uppercase",
            cursor: canObjection ? "pointer" : "not-allowed",
            boxShadow: canObjection ? "8px 8px 0 var(--dark)" : "none",
            transition: "transform 0.1s, box-shadow 0.1s, opacity 0.2s",
            opacity: canObjection ? 1 : 0.5,
            letterSpacing: "1px",
            flex: 1,
          }}
          onMouseDown={(e) => {
            if (canObjection) {
              (e.target as HTMLButtonElement).style.transform =
                "translate(6px, 6px)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "2px 2px 0 var(--dark)";
            }
          }}
          onMouseUp={(e) => {
            if (canObjection) {
              (e.target as HTMLButtonElement).style.transform =
                "translate(0, 0)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "8px 8px 0 var(--dark)";
            }
          }}
        >
          ⚖️ OBJECTION!
          {!canObjection && myRemaining <= 15 && myRemaining > 0 && (
            <div style={{ fontSize: "10px", opacity: 0.7 }}>NEED &gt;15s</div>
          )}
        </button>

        {/* Speak/Record Button */}
        <button
          onClick={() => {
            if (isCurrentPlayerActive) {
              if (isRecording) {
                stopRecording();
              } else {
                startRecording();
              }
            }
          }}
          disabled={!isCurrentPlayerActive}
          style={{
            background: isCurrentPlayerActive
              ? isRecording
                ? "var(--p2)"
                : "var(--green)"
              : "#999",
            color: "var(--dark)",
            border: "6px solid var(--dark)",
            borderRadius: "16px",
            padding: "18px 28px",
            fontFamily: "Titan One, cursive",
            fontSize: "20px",
            fontWeight: "900",
            textTransform: "uppercase",
            cursor: isCurrentPlayerActive ? "pointer" : "not-allowed",
            boxShadow:
              isCurrentPlayerActive && !isRecording
                ? "8px 8px 0 var(--dark)"
                : isCurrentPlayerActive && isRecording
                  ? "8px 8px 0 var(--p2)"
                  : "none",
            transition: "transform 0.1s, box-shadow 0.1s, opacity 0.2s",
            opacity: isCurrentPlayerActive ? 1 : 0.5,
            letterSpacing: "1px",
            flex: 1,
          }}
          onMouseDown={(e) => {
            if (isCurrentPlayerActive) {
              (e.target as HTMLButtonElement).style.transform =
                "translate(6px, 6px)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "2px 2px 0 var(--dark)";
            }
          }}
          onMouseUp={(e) => {
            if (isCurrentPlayerActive) {
              (e.target as HTMLButtonElement).style.transform =
                "translate(0, 0)";
              (e.target as HTMLButtonElement).style.boxShadow = isRecording
                ? "8px 8px 0 var(--p2)"
                : "8px 8px 0 var(--dark)";
            }
          }}
        >
          {isRecording ? "🔵 STOP" : "🎤 SPEAK"}
        </button>

        {/* Yield Button */}
        <button
          onClick={onYield}
          disabled={!isCurrentPlayerActive}
          style={{
            background: isCurrentPlayerActive ? "var(--p1)" : "#999",
            color: "var(--dark)",
            border: "6px solid var(--dark)",
            borderRadius: "16px",
            padding: "18px 28px",
            fontFamily: "Titan One, cursive",
            fontSize: "20px",
            fontWeight: "900",
            textTransform: "uppercase",
            cursor: isCurrentPlayerActive ? "pointer" : "not-allowed",
            boxShadow: isCurrentPlayerActive ? "8px 8px 0 var(--dark)" : "none",
            transition: "transform 0.1s, box-shadow 0.1s, opacity 0.2s",
            opacity: isCurrentPlayerActive ? 1 : 0.5,
            letterSpacing: "1px",
            flex: 1,
          }}
          onMouseDown={(e) => {
            if (isCurrentPlayerActive) {
              (e.target as HTMLButtonElement).style.transform =
                "translate(6px, 6px)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "2px 2px 0 var(--dark)";
            }
          }}
          onMouseUp={(e) => {
            if (isCurrentPlayerActive) {
              (e.target as HTMLButtonElement).style.transform =
                "translate(0, 0)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "8px 8px 0 var(--dark)";
            }
          }}
        >
          🔄 YIELD
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes screenShake {
          0%, 100% { transform: translateX(0) translateY(0); }
          10% { transform: translateX(-8px) translateY(-4px); }
          20% { transform: translateX(8px) translateY(2px); }
          30% { transform: translateX(-6px) translateY(-2px); }
          40% { transform: translateX(6px) translateY(4px); }
          50% { transform: translateX(-4px) translateY(-2px); }
          60% { transform: translateX(4px) translateY(2px); }
          70% { transform: translateX(-2px) translateY(-1px); }
          80% { transform: translateX(2px) translateY(1px); }
          90% { transform: translateX(-1px) translateY(0); }
        }
        @keyframes objectionSlam {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.3) rotate(5deg); opacity: 1; }
          70% { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
