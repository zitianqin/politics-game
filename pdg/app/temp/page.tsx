"use client";

import { useEffect, useRef, useState } from "react";
import { apiUrl } from "../lib/api";
import { getSocket } from "../lib/socket";

interface TranscriptLine {
  speaker: string;
  text: string;
  timestamp: number;
  roundNumber: number;
  isObjectionEnd?: boolean;
  inaudible?: boolean;
}

export default function TempTranscriptTest() {
  // --- game setup state ---
  const [gameCode, setGameCode] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [roundNumber] = useState(1);
  const [topic] = useState("Cost of Living");
  const [joined, setJoined] = useState(false);

  // --- recording state ---
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [isObjectionEnd, setIsObjectionEnd] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chunkStartRef = useRef<number>(0);

  // --- socket ---
  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    socket.on("transcript:update", (data: TranscriptLine) => {
      setTranscript((prev) => [...prev, data]);
    });

    return () => {
      socket.off("transcript:update");
      socket.disconnect();
    };
  }, []);

  function joinRoom() {
    if (!gameCode || !playerId) return;
    const socket = getSocket();
    socket.emit("game:join", { code: gameCode, playerId });
    setJoined(true);
    setStatus(`Joined room ${gameCode}`);
  }

  async function createTestGame() {
    const res = await fetch(apiUrl("/api/game/create"), { method: "POST" });
    const data = await res.json();
    setGameCode(data.code);
    setPlayerId(data.playerId);
    setStatus(`Created game ${data.code} — playerId set`);
  }

  async function sendChunk(blob: Blob) {
    const form = new FormData();
    form.append("audio", blob, "audio.webm");
    form.append("gameCode", gameCode);
    form.append("playerId", playerId);
    form.append("roundNumber", String(roundNumber));
    form.append("topic", topic);
    form.append("timestamp", String(chunkStartRef.current));
    form.append("isObjectionEnd", String(isObjectionEnd));

    setStatus("Transcribing…");
    try {
      const res = await fetch(apiUrl("/api/transcribe"), {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`Error: ${data.error}`);
      } else {
        setStatus(`OK — "${data.entry.text}"`);
      }
    } catch (e) {
      setStatus(`Fetch error: ${(e as Error).message}`);
    }
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    chunkStartRef.current = Date.now();
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      await sendChunk(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    mr.start();
    mediaRef.current = mr;
    setRecording(true);
    setStatus("Recording…");
  }

  function stopRecording() {
    mediaRef.current?.stop();
    mediaRef.current = null;
    setRecording(false);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 font-mono">
      <h1 className="text-2xl font-bold mb-6">
        🎙 Transcript Test — <code>/temp</code>
      </h1>

      {/* Setup */}
      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-semibold text-yellow-400">1. Game Setup</h2>
        <button
          onClick={createTestGame}
          className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm"
        >
          Create test game (auto-fill code + playerId)
        </button>
        <div className="flex gap-3">
          <input
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm w-36"
            placeholder="Game code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          />
          <input
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm flex-1"
            placeholder="Player ID (UUID)"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
          />
          <button
            onClick={joinRoom}
            disabled={joined}
            className="bg-green-700 hover:bg-green-600 disabled:opacity-40 px-4 py-1 rounded text-sm"
          >
            {joined ? "Joined" : "Join Socket Room"}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Round: {roundNumber} | Topic: {topic}
        </p>
      </section>

      {/* Recording */}
      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-semibold text-yellow-400">
          2. Record & Transcribe
        </h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isObjectionEnd}
            onChange={(e) => setIsObjectionEnd(e.target.checked)}
            className="accent-red-500"
          />
          Mark as objection end
        </label>
        <div className="flex gap-3">
          <button
            onClick={startRecording}
            disabled={recording || !joined}
            className="bg-red-700 hover:bg-red-600 disabled:opacity-40 px-5 py-2 rounded font-bold"
          >
            {recording ? "● REC" : "Start Recording"}
          </button>
          <button
            onClick={stopRecording}
            disabled={!recording}
            className="bg-gray-600 hover:bg-gray-500 disabled:opacity-40 px-5 py-2 rounded font-bold"
          >
            Stop & Send
          </button>
        </div>
        <p className="text-sm text-gray-400">
          Status: <span className="text-white">{status}</span>
        </p>
      </section>

      {/* Transcript */}
      <section>
        <h2 className="text-lg font-semibold text-yellow-400 mb-3">
          3. Live Transcript (via socket)
        </h2>
        {transcript.length === 0 ? (
          <p className="text-gray-500 text-sm">No entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {transcript.map((line, i) => (
              <li
                key={i}
                className={`rounded p-3 text-sm border ${
                  line.inaudible
                    ? "border-red-800 bg-red-950 text-red-300"
                    : "border-gray-700 bg-gray-800"
                }`}
              >
                <div className="flex gap-3 items-baseline">
                  <span className="font-bold text-yellow-300">
                    {line.speaker}
                  </span>
                  <span className="text-gray-400 text-xs">
                    t={line.timestamp} | r{line.roundNumber}
                  </span>
                  {line.isObjectionEnd && (
                    <span className="text-xs bg-red-700 px-1 rounded">
                      OBJECTION END
                    </span>
                  )}
                  {line.inaudible && (
                    <span className="text-xs bg-red-900 px-1 rounded">
                      INAUDIBLE
                    </span>
                  )}
                </div>
                <p className="mt-1 text-gray-100">{line.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
