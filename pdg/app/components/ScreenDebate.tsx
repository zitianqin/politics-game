"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ScreenId } from "../lib/gameConstants";
import { TranscriptEntry } from "../hooks/useGameState";

interface ScreenDebateProps {
  screen: ScreenId;
  currentRound: number;
  currentPlayer: 1 | 2;
  activePlayer: 1 | 2;
  timeLeft: number;
  currentTopic: string;
  transcript: TranscriptEntry[];
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
  timeLeft,
  currentTopic,
  transcript,
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

  // Determine if current player can object
  // They can object if it's opponent's turn AND they have > 15s remaining
  const isCurrentPlayerActive = activePlayer === currentPlayer;
  const canObjection =
    !isCurrentPlayerActive && timeLeft > 15 && screen === "debate";

  // Update transcript display when it changes
  useEffect(() => {
    const formatted = transcript
      .map((entry) => {
        const playerLabel = entry.speaker === 1 ? "🦄 P1" : "🦖 P2";
        const objectionMarker = entry.isObjection ? " [OBJECTION!]" : "";
        return `${playerLabel}${objectionMarker}: ${entry.text}`;
      })
      .join("\n\n");
    setDisplayTranscript(formatted);

    // Scroll to bottom
    setTimeout(() => {
      if (transcriptEndRef.current) {
        transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  }, [transcript]);

  // Start recording when this player's turn begins
  useEffect(() => {
    if (screen === "debate" && isCurrentPlayerActive && !isRecording) {
      startRecording();
    } else if (screen !== "debate" || !isCurrentPlayerActive) {
      stopRecording();
    }
  }, [screen, isCurrentPlayerActive, isRecording]);

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
        // Send to backend for transcription
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
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Transcription failed");

      const { transcript: transcribedText } = await response.json();

      if (transcribedText) {
        onSubmitSpeech(transcribedText);
      }
    } catch (error) {
      console.error("Transcription error:", error);
    }
  };

  const handleObjection = () => {
    if (canObjection) {
      onObjection();
    }
  };

  // Helper to get timer color
  const getTimerColor = (): string => {
    if (timeLeft <= 10) return "var(--p2)"; // Red
    if (timeLeft <= 20) return "var(--accent)"; // Amber
    return "var(--green)"; // Green
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
      }}
    >
      {/* Top HUD Bar */}
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Center: Round & Timer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flex: "0 0 auto",
          }}
        >
          {/* Round Badge */}
          <div
            className="flex"
            style={{
              background: "var(--p2)",
              border: "4px solid var(--dark)",
              borderRadius: "12px",
              padding: "12px 20px",
              textAlign: "center",
              boxShadow: "4px 4px 0 var(--dark)",
            }}
          >
            <div
              style={{
                fontFamily: "Titan One, cursive",
                fontSize: "36px",
                fontWeight: "900",
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              ROUND {currentRound}
            </div>
          </div>

          {/* Timer */}
          <div
            style={{
              background: "var(--dark)",
              border: "4px solid " + getTimerColor(),
              borderRadius: "12px",
              padding: "12px 20px",
              textAlign: "center",
              boxShadow: "4px 4px 0 " + getTimerColor(),
              minWidth: "120px",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
          >
            <div
              style={{
                fontFamily: "Titan One, cursive",
                fontSize: "36px",
                letterSpacing: "2px",
                fontWeight: "900",
                color: getTimerColor(),
                transition: "color 0.3s",
              }}
            >
              {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:
              {String(timeLeft % 60).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      {/* Topic Banner */}
      <div
        style={{
          background: "linear-gradient(90deg, var(--accent), var(--p2))",
          border: "4px solid var(--dark)",
          borderTop: "none",
          padding: "16px 24px",
          textAlign: "center",
          boxShadow: "0 4px 0 var(--dark)",
        }}
      >
        <div
          id="topic-text"
          style={{
            fontSize: "28px",
            fontFamily: "Titan One, cursive",
            fontWeight: "900",
            color: "white",
            textShadow: "3px 3px 0 var(--dark)",
            WebkitTextStroke: "1px var(--dark)",
            margin: "0",
            lineHeight: "1.3",
          }}
        >
          "{currentTopic}"
        </div>
      </div>

      {/* Main Transcript Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          minHeight: 0,
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.98)",
            border: "6px solid var(--dark)",
            borderRadius: "16px",
            padding: "24px",
            flex: 1,
            overflowY: "auto",
            boxShadow: "8px 8px 0 var(--dark)",
            fontFamily: "Nunito, sans-serif",
            fontSize: "24px",
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
              marginTop: "16px",
              textAlign: "center",
              animation: "pulse 1s infinite",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: "var(--p2)",
                color: "white",
                padding: "12px 24px",
                borderRadius: "24px",
                fontWeight: "900",
                fontSize: "16px",
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
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
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
            padding: "20px 32px",
            fontFamily: "Titan One, cursive",
            fontSize: "22px",
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
            padding: "20px 32px",
            fontFamily: "Titan One, cursive",
            fontSize: "22px",
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
            padding: "20px 32px",
            fontFamily: "Titan One, cursive",
            fontSize: "22px",
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
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
