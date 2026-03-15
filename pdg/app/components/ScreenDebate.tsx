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

        ctx.fillStyle = "#ff4c4c";
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
              fontSize: "clamp(70px, 20vw, 150px)",
              color: "var(--red)",
              textShadow:
                "8px 8px 0 var(--dark), 0 0 40px rgba(255, 76, 76, 0.6)",
              animation: "objectionSlam 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              textTransform: "uppercase",
              letterSpacing: "8px",
              fontWeight: "900",
            }}
          >
            OBJECTION!
          </div>
        </div>
      )}

      {/* Topic Banner */}
      <div
        style={{
          background: "var(--accent)",
          borderBottom: "6px solid var(--dark)",
          padding: "20px 30px",
          textAlign: "center",
          boxShadow: "0 6px 0 var(--dark)",
          flexShrink: 0,
        }}
        className="max-w-3xl rounded-2xl md:mt-8 mt-28 mx-2"
      >
        <h2
          className="titan"
          style={{
            fontSize: "clamp(18px, 5vw, 28px)",
            color: "var(--dark)",
            margin: 0,
            letterSpacing: "1px",
            fontWeight: 900,
          }}
        >
          TOPIC: {currentTopic}
        </h2>
      </div>

      {/* Mobile-only Timer Bars */}
      <div className="flex md:hidden flex-col gap-2 p-3">
        <TimerBar
          playerLabel={p1Name}
          playerSrc="/P1.png"
          remaining={p1TimeRemaining}
          total={60}
          isActive={activePlayer === 1}
          colorVar="var(--p1)"
        />
        <TimerBar
          playerLabel={p2Name}
          playerSrc="/P2.png"
          remaining={p2TimeRemaining}
          total={60}
          isActive={activePlayer === 2}
          colorVar="var(--p2)"
        />
      </div>

      {/* Container: Stacks vertically on mobile (P1 - P2 - Transcript), columns on desktop (P1 - Transcript - P2) */}
      <div className="gap-3 flex flex-1 flex-col md:flex-row sm:gap-3! min-h-0 p-3 md:p-0 md:pb-3 items-center">
        {/* Player 1 Panel (Desktop) */}
        <div
          className="hidden md:flex flex-col items-center justify-start gap-4 p-6"
          style={{
            flex: "0 0 240px",
            borderRadius: "8px 0 0 8px",
          }}
        >
          <TimerBar
            playerLabel={p1Name}
            playerSrc="/P1.png"
            remaining={p1TimeRemaining}
            total={60}
            isActive={activePlayer === 1}
            colorVar="var(--p1)"
          />
        </div>

        {/* Main Transcript (Middle) */}
        <div
          id="transcript-container"
          className="flex-1 flex flex-col min-w-3xl h-150"
          style={{
            background: "white",
            borderRadius: "16px",
            border: "6px solid var(--dark)",
            overflow: "hidden",
          }}
        >
          <div
            id="transcript-scroll-area"
            className="flex-1 overflow-y-auto p-4 space-y-4"
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
                    background: entry.speaker === 1 ? "var(--p1)" : "var(--p2)",
                    color: entry.speaker === 1 ? "var(--dark)" : "white",
                    border: "4px solid var(--dark)",
                    borderRadius: "14px",
                    padding: "12px 16px",
                    maxWidth: "90%",
                    boxShadow: "6px 6px 0 var(--dark)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 900,
                      fontSize: "20px",
                      lineHeight: 1.4,
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
            className="flex items-center justify-center p-4"
            style={{
              borderTop: "4px solid var(--dark)",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            {isRecording ? (
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "var(--red)",
                    animation: "pulse 1s infinite",
                  }}
                />
                Recording
                <canvas
                  ref={waveformCanvasRef}
                  style={{
                    width: "60px",
                    height: "20px",
                    marginLeft: "12px",
                  }}
                />
              </div>
            ) : (
              <span
                className="font-bold"
                style={{
                  fontFamily: "Titan One, cursive",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "13px",
                }}
              >
                {isCurrentPlayerActive
                  ? "🎤 PREPARE TO SPEAK..."
                  : "👂 LISTENING..."}
              </span>
            )}
          </div>
        </div>

        {/* Player 2 Panel (Desktop) */}
        <div
          className="hidden md:flex flex-col items-center justify-start gap-4 p-6"
          style={{
            flex: "0 0 240px",
            borderRadius: "0 8px 8px 0",
          }}
        >
          <TimerBar
            playerLabel={p2Name}
            playerSrc="/P2.png"
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
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        {voiceBadgeText && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: voiceBadgeColor,
              color:
                voiceStatus === "error"
                  ? "white"
                  : voiceStatus === "connected"
                  ? "var(--dark)"
                  : "white",
              padding: "10px 20px",
              borderRadius: "28px",
              fontWeight: "900",
              fontSize: "clamp(11px, 2.5vw, 13px)",
              fontFamily: "Titan One, cursive",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              lineHeight: 1,
              border: "3px solid var(--dark)",
              boxShadow: "4px 4px 0 var(--dark)",
              WebkitTextStroke: "0.5px rgba(0, 0, 0, 0.2)",
            }}
          >
            {voiceBadgeText}
          </span>
        )}

        <div
          style={{ display: "flex", flex: 1, gap: "12px", minHeight: "44px" }}
        >
          {/* Objection Button */}
          <button
            onClick={handleObjection}
            disabled={!canObjection}
            style={{
              background: canObjection ? "var(--red)" : "#ccc",
              color: canObjection ? "white" : "rgba(0, 0, 0, 0.4)",
              border: "4px solid var(--dark)",
              borderRadius: "14px",
              padding: "12px 16px",
              fontFamily: "Titan One, cursive",
              fontSize: "clamp(13px, 3vw, 18px)",
              fontWeight: "900",
              textTransform: "uppercase",
              cursor: canObjection ? "pointer" : "not-allowed",
              boxShadow: canObjection
                ? "6px 6px 0 var(--dark)"
                : "2px 2px 0 rgba(0, 0, 0, 0.2)",
              transition: "transform 0.1s, box-shadow 0.1s, opacity 0.2s",
              opacity: canObjection ? 1 : 0.7,
              letterSpacing: "1px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              minHeight: "44px",
            }}
            onMouseDown={(e) => {
              if (canObjection) {
                (e.target as HTMLButtonElement).style.transform =
                  "translate(5px, 5px)";
                (e.target as HTMLButtonElement).style.boxShadow =
                  "2px 2px 0 var(--dark)";
              }
            }}
            onMouseUp={(e) => {
              if (canObjection) {
                (e.target as HTMLButtonElement).style.transform =
                  "translate(0, 0)";
                (e.target as HTMLButtonElement).style.boxShadow =
                  "6px 6px 0 var(--dark)";
              }
            }}
          >
            ⚖️ OBJECTION!
            {!canObjection && myRemaining <= 15 && myRemaining > 0 && (
              <span>NEED &gt;15s</span>
            )}
          </button>

          {/* Yield Button */}
          <button
            onClick={onYield}
            disabled={!isCurrentPlayerActive}
            style={{
              background: isCurrentPlayerActive ? "var(--p1)" : "#ccc",
              color: isCurrentPlayerActive
                ? "var(--dark)"
                : "rgba(0, 0, 0, 0.4)",
              border: "4px solid var(--dark)",
              borderRadius: "14px",
              padding: "12px 16px",
              fontFamily: "Titan One, cursive",
              fontSize: "clamp(13px, 3vw, 18px)",
              fontWeight: "900",
              textTransform: "uppercase",
              cursor: isCurrentPlayerActive ? "pointer" : "not-allowed",
              boxShadow: isCurrentPlayerActive
                ? "6px 6px 0 var(--dark)"
                : "2px 2px 0 rgba(0, 0, 0, 0.2)",
              transition: "transform 0.1s, box-shadow 0.1s, opacity 0.2s",
              opacity: isCurrentPlayerActive ? 1 : 0.7,
              letterSpacing: "1px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              minHeight: "44px",
            }}
            onMouseDown={(e) => {
              if (isCurrentPlayerActive) {
                (e.target as HTMLButtonElement).style.transform =
                  "translate(5px, 5px)";
                (e.target as HTMLButtonElement).style.boxShadow =
                  "2px 2px 0 var(--dark)";
              }
            }}
            onMouseUp={(e) => {
              if (isCurrentPlayerActive) {
                (e.target as HTMLButtonElement).style.transform =
                  "translate(0, 0)";
                (e.target as HTMLButtonElement).style.boxShadow =
                  "6px 6px 0 var(--dark)";
              }
            }}
          >
            YIELD FLOOR
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
