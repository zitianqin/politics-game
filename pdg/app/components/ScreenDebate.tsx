"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ScreenId, formatScorecardName } from "../lib/gameConstants";

const OBJECTION_SOUNDS = [
  "/sound-effects/boom.mp3",
  "/sound-effects/bruh.mp3",
  "/sound-effects/fart.mp3",
  "/sound-effects/oh-hell-nah.mp3",
  "/sound-effects/omg.mp3",
  "/sound-effects/punch.mp3",
  "/sound-effects/alert.mp3",
];
import { TranscriptEntry } from "../hooks/useGameState";
import TimerBar from "./TimerBar";
import { apiUrl } from "../lib/api";

interface ScreenDebateProps {
  screen: ScreenId;
  currentRound: number;
  currentPlayer: 1 | 2;
  activePlayer: 1 | 2;
  p1TimeRemaining: number;
  p2TimeRemaining: number;
  currentTopic: string;
  transcript: TranscriptEntry[];
  roundStartTime: number | null;
  showObjectionVFX: boolean;
  objectionBy: 1 | 2 | null;
  p1Name?: string;
  p2Name?: string;
  onObjection: () => void;
  onYield: () => void;
  setIsRecording: (value: boolean) => void;
  setMediaStream: (stream: MediaStream | null) => void;
  voiceStatus?: "idle" | "connecting" | "connected" | "error";
  voiceError?: string | null;
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
  roundStartTime,
  showObjectionVFX,
  objectionBy,
  p1Name = "Player 1",
  p2Name = "Player 2",
  onObjection,
  onYield,
  setIsRecording: setIsRecordingGlobal,
  setMediaStream,
  voiceStatus = "idle",
  voiceError = null,
}: ScreenDebateProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  // Ref-based flag: set before getUserMedia resolves so stopRecording() can
  // cancel an in-flight startRecording() before it ever opens the mic.
  const shouldRecordRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [screenShake, setScreenShake] = useState(false);

  const isCurrentPlayerActive = activePlayer === currentPlayer;
  const myRemaining = currentPlayer === 1 ? p1TimeRemaining : p2TimeRemaining;
  const canObjection =
    !isCurrentPlayerActive && myRemaining > 15 && screen === "debate";
  const voiceBadgeText = voiceError
    ? "VOICE ERROR"
    : voiceStatus === "connecting"
    ? "VOICE CONNECTING"
    : voiceStatus === "connected"
    ? "VOICE LIVE"
    : null;
  const voiceBadgeColor = voiceError
    ? "var(--red)"
    : voiceStatus === "connected"
    ? "var(--accent)"
    : "var(--p2)";

  useEffect(() => {
    if (showObjectionVFX) {
      setScreenShake(true);
      try {
        const audio = new Audio(
          "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
        );
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {}
      const timer = setTimeout(() => setScreenShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [showObjectionVFX]);

  // Auto-scroll to bottom when transcript grows
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  // stopRecording: no isRecording state dependency — uses refs to avoid stale
  // closures. Safe to call multiple times (idempotent).
  const stopRecording = useCallback(() => {
    shouldRecordRef.current = false;
    mediaStreamRef.current = null;
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // MediaRecorder may already be inactive — that's fine
      }
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    setIsRecordingGlobal(false);
    setMediaStream(null);
  }, [setIsRecordingGlobal, setMediaStream]);

  const startRecording = useCallback(
    async (turnRound: number, turnTopic: string) => {
      // Guard against double-start
      if (shouldRecordRef.current) return;
      shouldRecordRef.current = true;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Floor may have changed while awaiting mic permission — discard
        if (!shouldRecordRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];
        recordingStartTimeRef.current = Date.now();

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          if (audioChunksRef.current.length === 0) return;
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          await sendAudioForTranscription(
            audioBlob,
            recordingStartTimeRef.current,
            turnRound,
            turnTopic
          );
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        mediaStreamRef.current = stream;
        setIsRecording(true);
        setIsRecordingGlobal(true);
        setMediaStream(stream);
      } catch (error) {
        shouldRecordRef.current = false;
        console.error("Failed to access microphone:", error);
      }
    },
    [setIsRecordingGlobal, setMediaStream]
  );

  // Start/stop recording based on active player.
  // Capture round/topic NOW so the onstop closure uses turn-start values even
  // if props change before the upload fires (e.g. round advances quickly).
  useEffect(() => {
    if (screen === "debate" && isCurrentPlayerActive) {
      startRecording(currentRound, currentTopic);
    } else {
      stopRecording();
    }
    return () => stopRecording();
  }, [
    screen,
    isCurrentPlayerActive,
    currentRound,
    currentTopic,
    startRecording,
    stopRecording,
  ]);

  // Waveform visualization when recording
  useEffect(() => {
    if (!isRecording || !mediaStreamRef.current || !waveformCanvasRef.current)
      return;
    const stream = mediaStreamRef.current;
    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    let animationId: number;
    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const w = 50;
      const h = 18;
      const barCount = 8;
      const barWidth = 5;
      const gap = (w - barCount * barWidth) / (barCount - 1);

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex] ?? 0;
        const barHeight = Math.max(3, (value / 255) * h * 0.9);
        const x = i * (barWidth + gap);
        const y = (h - barHeight) / 2;

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
      source.disconnect();
      audioContext.close();
    };
  }, [isRecording]);

  const sendAudioForTranscription = async (
    audioBlob: Blob,
    startTime: number,
    roundNumber: number,
    topic: string
  ) => {
    try {
      const gameCode = sessionStorage.getItem("gameCode") ?? "";
      const playerId = sessionStorage.getItem("playerId") ?? "";
      if (!gameCode || !playerId) return;

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("gameCode", gameCode);
      formData.append("playerId", playerId);
      formData.append("roundNumber", String(roundNumber));
      formData.append("topic", topic);

      const relativeStartTime = roundStartTime
        ? Math.round((startTime - roundStartTime) / 1000)
        : 0;
      formData.append("timestamp", String(relativeStartTime));

      await fetch(apiUrl("/api/transcribe"), {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Transcription error:", error);
    }
  };

  const handleObjection = () => {
    if (canObjection) {
      const src =
        OBJECTION_SOUNDS[Math.floor(Math.random() * OBJECTION_SOUNDS.length)];
      new Audio(src).play();
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

      {/* Topic Banner */}
      <div
        style={{
          background: "linear-gradient(90deg, var(--accent), var(--p2))",
          borderBlock: "4px solid var(--dark)",
          padding: "6px 12px",
          textAlign: "center",
          boxShadow: "0 4px 0 var(--dark)",
          flexShrink: 0,
        }}
        className=""
      >
        <h2
          className="titan"
          style={{
            fontSize: "clamp(16px, 4vw, 22px)",
            color: "white",
            textShadow:
              "2px 2px 0 var(--dark), -2px 2px 0 var(--dark), 2px -2px 0 var(--dark), -2px -2px 0 var(--dark)",
          }}
        >
          TOPIC: {currentTopic}
        </h2>
      </div>

      {/* Mobile-only Timer Bars */}
      <div className="flex md:hidden flex-col gap-1 p-2">
        <TimerBar
          playerLabel={p1Name}
          playerEmoji=" P1 "
          remaining={p1TimeRemaining}
          total={60}
          isActive={activePlayer === 1}
          colorVar="var(--p1)"
        />
        <TimerBar
          playerLabel={p2Name}
          playerEmoji=" P2 "
          remaining={p2TimeRemaining}
          total={60}
          isActive={activePlayer === 2}
          colorVar="var(--p2)"
        />
      </div>

      {/* Container: Stacks vertically on mobile (P1 - P2 - Transcript), columns on desktop (P1 - Transcript - P2) */}
      <div className="gap-2 flex flex-1 flex-col md:flex-row sm:gap-2! min-h-0 p-2 md:p-0 md:pb-2">
        {/* Player 1 Panel (Desktop) */}
        <div
          className="hidden md:flex flex-col items-center justify-center gap-4 p-4"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.4))",
            flex: "0 0 220px",
            borderRight: "4px solid var(--dark)",
            boxShadow: "inset -4px 0 0 var(--dark)",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              background: "var(--p1)",
              border: "4px solid var(--dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "24px",
            }}
          >
            P1
          </div>
          <TimerBar
            playerLabel={p1Name}
            playerEmoji=" P1 "
            remaining={p1TimeRemaining}
            total={60}
            isActive={activePlayer === 1}
            colorVar="var(--p1)"
          />
        </div>

        {/* Transcript (Middle) */}
        <div
          id="transcript-container"
          className="flex-1 flex flex-col min-h-0"
          style={{
            background: "rgba(0,0,0,0.3)",
            borderRadius: "12px",
            border: "4px solid var(--dark)",
            overflow: "hidden",
          }}
        >
          <div
            id="transcript-scroll-area"
            className="flex-1 overflow-y-auto p-3 space-y-3"
          >
            {transcript.map((entry, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  entry.speaker === 1 ? "items-start" : "items-end"
                }`}
              >
                <div
                  className="transcript-bubble"
                  style={{
                    background:
                      entry.speaker === 1
                        ? "linear-gradient(to bottom, var(--p1), var(--p1-dark))"
                        : "linear-gradient(to bottom, var(--p2), var(--p2-dark))",
                    color: entry.speaker === 1 ? "var(--dark)" : "white",
                    border: "3px solid var(--dark)",
                    borderRadius: "12px",
                    padding: "6px 12px",
                    maxWidth: "90%",
                    boxShadow: "4px 4px 0 var(--dark)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 900,
                      fontSize: "16px",
                    }}
                  >
                    {entry.text}
                  </p>
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
          <div
            className="flex items-center justify-center p-2"
            style={{
              borderTop: "4px solid var(--dark)",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            {isRecording ? (
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "var(--red)",
                    animation: "pulse 1s infinite",
                  }}
                />
                <span
                  className="font-bold text-white"
                  style={{
                    fontFamily: "Titan One, cursive",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  Recording
                </span>
                <canvas
                  ref={waveformCanvasRef}
                  width="50"
                  height="18"
                  style={{ marginLeft: "8px" }}
                />
              </div>
            ) : (
              <span
                className="font-bold"
                style={{
                  fontFamily: "Titan One, cursive",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {isCurrentPlayerActive ? "Prepare to Speak..." : "Listening..."}
              </span>
            )}
          </div>
        </div>

        {/* Player 2 Panel (Desktop) */}
        <div
          className="hidden md:flex flex-col items-center justify-center gap-4 p-4"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.4))",
            flex: "0 0 220px",
            borderLeft: "4px solid var(--dark)",
            boxShadow: "inset 4px 0 0 var(--dark)",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              background: "var(--p2)",
              border: "4px solid var(--dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "24px",
            }}
          >
            P2
          </div>
          <TimerBar
            playerLabel={p2Name}
            playerEmoji=" P2 "
            remaining={p2TimeRemaining}
            total={60}
            isActive={activePlayer === 2}
            colorVar="var(--p2)"
          />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div
        style={{
          padding: "6px 8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
          background: "var(--dark)",
          borderTop: "4px solid rgba(255,255,255,0.2)",
        }}
      >
        {isRecording && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "var(--p2)",
              color: "white",
              padding: "6px 20px",
              borderRadius: "24px",
              fontWeight: "900",
              fontSize: "clamp(10px, 2vw, 14px)",
              fontFamily: "Titan One, cursive",
              textTransform: "uppercase",
              letterSpacing: "1px",
              lineHeight: 1,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "white",
                flexShrink: 0,
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            />
            <canvas
              ref={waveformCanvasRef}
              style={{
                width: "50px",
                height: "18px",
                flexShrink: 0,
                display: "block",
              }}
            />
            RECORDING
          </span>
        )}

        {voiceBadgeText && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: voiceBadgeColor,
              color: "white",
              padding: "6px 14px",
              borderRadius: "24px",
              fontWeight: "900",
              fontSize: "clamp(10px, 2vw, 14px)",
              fontFamily: "Titan One, cursive",
              textTransform: "uppercase",
              letterSpacing: "1px",
              lineHeight: 1,
            }}
          >
            {voiceBadgeText}
          </span>
        )}

        <div style={{ display: "flex", width: "100%", gap: "8px" }}>
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
                (e.target as HTMLButtonElement).style.transform =
                  "translate(4px, 4px)";
                (e.target as HTMLButtonElement).style.boxShadow =
                  "2px 2px 0 var(--dark)";
              }
            }}
            onMouseUp={(e) => {
              if (canObjection) {
                (e.target as HTMLButtonElement).style.transform =
                  "translate(0, 0)";
                (e.target as HTMLButtonElement).style.boxShadow =
                  "5px 5px 0 var(--dark)";
              }
            }}
          >
            ⚖️ OBJECTION!
            {!canObjection && myRemaining <= 15 && myRemaining > 0 && (
              <div style={{ fontSize: "9px", opacity: 0.7 }}>NEED &gt;15s</div>
            )}
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
              boxShadow: isCurrentPlayerActive
                ? "5px 5px 0 var(--dark)"
                : "none",
              transition: "transform 0.1s, box-shadow 0.1s, opacity 0.2s",
              opacity: isCurrentPlayerActive ? 1 : 0.5,
              letterSpacing: "1px",
              flex: 1,
            }}
            onMouseDown={(e) => {
              if (isCurrentPlayerActive) {
                (e.target as HTMLButtonElement).style.transform =
                  "translate(4px, 4px)";
                (e.target as HTMLButtonElement).style.boxShadow =
                  "2px 2px 0 var(--dark)";
              }
            }}
            onMouseUp={(e) => {
              if (isCurrentPlayerActive) {
                (e.target as HTMLButtonElement).style.transform =
                  "translate(0, 0)";
                (e.target as HTMLButtonElement).style.boxShadow =
                  "5px 5px 0 var(--dark)";
              }
            }}
          >
            🔄 YIELD
          </button>
        </div>
      </div>

      <style>{`
        @keyframes screenShake {
          0% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-2px, -3px) rotate(-1deg); }
          20% { transform: translate(2px, 3px) rotate(1deg); }
          30% { transform: translate(-2px, 2px) rotate(0deg); }
          40% { transform: translate(2px, -2px) rotate(1deg); }
          50% { transform: translate(-2px, 3px) rotate(-1deg); }
          60% { transform: translate(2px, 2px) rotate(0deg); }
          70% { transform: translate(-2px, -3px) rotate(1deg); }
          80% { transform: translate(2px, -2px) rotate(-1deg); }
          90% { transform: translate(-2px, 3px) rotate(0deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes objectionSlam {
          from { transform: scale(3) rotate(-10deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
