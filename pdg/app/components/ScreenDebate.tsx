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

  const isCurrentPlayerActive = activePlayer === currentPlayer;
  const myRemaining = currentPlayer === 1 ? p1TimeRemaining : p2TimeRemaining;
  const canObjection =
    !isCurrentPlayerActive && myRemaining > 15 && screen === "debate";

  useEffect(() => {
    if (showObjectionVFX) {
      setScreenShake(true);
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

  useEffect(() => {
    if (screen === "debate" && isCurrentPlayerActive && !isRecording) {
      startRecording();
    } else if (screen !== "debate" || !isCurrentPlayerActive) {
      stopRecording();
    }
  }, [screen, isCurrentPlayerActive]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
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
      const mockText = "[speech captured]";
      onSubmitSpeech(mockText);
    } catch (error) {
      console.error("Transcription error:", error);
    }
  };

  const handleObjection = () => {
    if (canObjection) {
      new Audio("/objection.mp3").play();
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
              fontSize: "clamp(60px, 15vw, 120px)",
              color: "var(--red)",
              WebkitTextStroke: "4px var(--dark)",
              textShadow: "8px 8px 0 var(--dark), 0 0 40px rgba(255, 76, 76, 0.6)",
              animation: "objectionSlam 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              textTransform: "uppercase",
              letterSpacing: "8px",
            }}
          >
            OBJECTION!
          </div>
        </div>
      )}

      {/* Top HUD Bar — hidden on mobile */}
      <div
        className="hidden sm:flex"
        style={{
          padding: "12px 24px",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
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

      {/* Topic Banner */}
      <div
        style={{
          background: "linear-gradient(90deg, var(--accent), var(--p2))",
          border: "4px solid var(--dark)",
          borderTop: "none",
          padding: "8px 16px",
          textAlign: "center",
          boxShadow: "0 4px 0 var(--dark)",
        }}
      >
        <div
          id="topic-text"
          style={{
            fontSize: "clamp(13px, 3vw, 22px)",
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

      {/* Per-Player Timer Bars — below topic on mobile */}
      <div
        style={{
          padding: "6px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
        className="sm:px-6 sm:py-2"
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

      {/* Main Transcript Area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "8px 10px",
          minHeight: 0,
          height: "clamp(120px, 35vw, 180px)",
        }}
        className="sm:flex-1! sm:h-auto! sm:p-4!"
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.98)",
            border: "4px solid var(--dark)",
            borderRadius: "12px",
            padding: "10px 12px",
            flex: 1,
            overflowY: "auto",
            boxShadow: "6px 6px 0 var(--dark)",
            fontFamily: "Nunito, sans-serif",
            fontSize: "clamp(11px, 2.5vw, 18px)",
            fontWeight: "700",
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            color: "var(--dark)",
          }}
          className="sm:p-5! sm:text-lg! sm:rounded-2xl! sm:border-[6px]! sm:shadow-[8px_8px_0_var(--dark)]!"
        >
          {displayTranscript || (
            <span style={{ color: "#999", fontStyle: "italic", fontSize: "12px" }}>
              Waiting for debate to start...
            </span>
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div
            style={{
              marginTop: "6px",
              textAlign: "center",
              animation: "pulse 1s infinite",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: "var(--p2)",
                color: "white",
                padding: "6px 14px",
                borderRadius: "24px",
                fontWeight: "900",
                fontSize: "clamp(10px, 2vw, 14px)",
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
          padding: "8px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
        className="sm:px-6! sm:py-4! sm:gap-3!"
      >
        {/* Objection Button */}
        <button
          onClick={handleObjection}
          disabled={!canObjection}
          style={{
            background: canObjection ? "var(--red)" : "#999",
            color: canObjection ? "black" : "rgba(0, 0, 0, 0.5)",
            border: "3px solid var(--dark)",
            borderRadius: "12px",
            padding: "10px 8px",
            fontFamily: "Titan One, cursive",
            fontSize: "clamp(11px, 2.8vw, 20px)",
            fontWeight: "900",
            textTransform: "uppercase",
            cursor: canObjection ? "pointer" : "not-allowed",
            boxShadow: canObjection ? "5px 5px 0 var(--dark)" : "none",
            transition: "transform 0.1s, box-shadow 0.1s, opacity 0.2s",
            opacity: canObjection ? 1 : 0.5,
            letterSpacing: "1px",
            flex: 1,
          }}
          onMouseDown={(e) => {
            if (canObjection) {
              (e.target as HTMLButtonElement).style.transform = "translate(4px, 4px)";
              (e.target as HTMLButtonElement).style.boxShadow = "2px 2px 0 var(--dark)";
            }
          }}
          onMouseUp={(e) => {
            if (canObjection) {
              (e.target as HTMLButtonElement).style.transform = "translate(0, 0)";
              (e.target as HTMLButtonElement).style.boxShadow = "5px 5px 0 var(--dark)";
            }
          }}
        >
          ⚖️ OBJECTION!
          {!canObjection && myRemaining <= 15 && myRemaining > 0 && (
            <div style={{ fontSize: "9px", opacity: 0.7 }}>NEED &gt;15s</div>
          )}
        </button>

        {/* Speak/Record Button */}
        <button
          onClick={() => {
            if (isCurrentPlayerActive) {
              if (isRecording) stopRecording();
              else startRecording();
            }
          }}
          disabled={!isCurrentPlayerActive}
          style={{
            background: isCurrentPlayerActive
              ? isRecording ? "var(--p2)" : "var(--green)"
              : "#999",
            color: "var(--dark)",
            border: "3px solid var(--dark)",
            borderRadius: "12px",
            padding: "10px 8px",
            fontFamily: "Titan One, cursive",
            fontSize: "clamp(11px, 2.8vw, 20px)",
            fontWeight: "900",
            textTransform: "uppercase",
            cursor: isCurrentPlayerActive ? "pointer" : "not-allowed",
            boxShadow: isCurrentPlayerActive && !isRecording
              ? "5px 5px 0 var(--dark)"
              : isCurrentPlayerActive && isRecording
                ? "5px 5px 0 var(--p2)"
                : "none",
            transition: "transform 0.1s, box-shadow 0.1s, opacity 0.2s",
            opacity: isCurrentPlayerActive ? 1 : 0.5,
            letterSpacing: "1px",
            flex: 1,
          }}
          onMouseDown={(e) => {
            if (isCurrentPlayerActive) {
              (e.target as HTMLButtonElement).style.transform = "translate(4px, 4px)";
              (e.target as HTMLButtonElement).style.boxShadow = "2px 2px 0 var(--dark)";
            }
          }}
          onMouseUp={(e) => {
            if (isCurrentPlayerActive) {
              (e.target as HTMLButtonElement).style.transform = "translate(0, 0)";
              (e.target as HTMLButtonElement).style.boxShadow = isRecording
                ? "5px 5px 0 var(--p2)"
                : "5px 5px 0 var(--dark)";
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
            border: "3px solid var(--dark)",
            borderRadius: "12px",
            padding: "10px 8px",
            fontFamily: "Titan One, cursive",
            fontSize: "clamp(11px, 2.8vw, 20px)",
            fontWeight: "900",
            textTransform: "uppercase",
            cursor: isCurrentPlayerActive ? "pointer" : "not-allowed",
            boxShadow: isCurrentPlayerActive ? "5px 5px 0 var(--dark)" : "none",
            transition: "transform 0.1s, box-shadow 0.1s, opacity 0.2s",
            opacity: isCurrentPlayerActive ? 1 : 0.5,
            letterSpacing: "1px",
            flex: 1,
          }}
          onMouseDown={(e) => {
            if (isCurrentPlayerActive) {
              (e.target as HTMLButtonElement).style.transform = "translate(4px, 4px)";
              (e.target as HTMLButtonElement).style.boxShadow = "2px 2px 0 var(--dark)";
            }
          }}
          onMouseUp={(e) => {
            if (isCurrentPlayerActive) {
              (e.target as HTMLButtonElement).style.transform = "translate(0, 0)";
              (e.target as HTMLButtonElement).style.boxShadow = "5px 5px 0 var(--dark)";
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