"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { votersData } from "../../lib/voterData";
import PixelPortrait from "../../components/PixelPortrait";
import { getSocket } from "../../lib/socket";

interface CandidateProfile {
  fullName: string;
  age: number;
  partyName: string;
  electorate: string;
  background: string;
  profession: string;
  keyActions: {
    positive: [string, string];
    controversial: string;
  };
  policyPositions: [string, string, string];
  personalValues: [string, string, string];
  flaws: string[];
}

interface RevealPlayer {
  id: string;
  slot: 1 | 2;
  candidate: CandidateProfile | null;
}

export default function RevealPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);
  const [selectedVoters, setSelectedVoters] = useState<typeof votersData>([]);
  const [revealPlayers, setRevealPlayers] = useState<RevealPlayer[]>([]);
  const [mySlot, setMySlot] = useState<1 | 2 | null>(null);

  useEffect(() => {
    const localPlayerId = sessionStorage.getItem("playerId");

    fetch(`/api/game/${code}`)
      .then((res) => res.json())
      .then((data) => {
        const players = (data.players ?? []) as RevealPlayer[];
        const orderedPlayers = players.sort((a, b) => a.slot - b.slot);
        setRevealPlayers(orderedPlayers);

        if (localPlayerId) {
          const self = orderedPlayers.find((p) => p.id === localPlayerId);
          setMySlot(self?.slot ?? null);
        }

        if (data.voters) {
          setSelectedVoters(data.voters.slice(0, 5));
        } else {
          setSelectedVoters(
            [...votersData].sort(() => Math.random() - 0.5).slice(0, 5),
          );
        }
      })
      .catch((err) => {
        console.error("Failed to fetch reveal data", err);
        setSelectedVoters(
          [...votersData].sort(() => Math.random() - 0.5).slice(0, 5),
        );
        setRevealPlayers([]);
      });

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
      const playerId = sessionStorage.getItem("playerId");
      if (playerId) {
        socket.emit("game:join", { code, playerId });
      }
    }

    const onRevealTimer = (data: { countdown: number }) => {
      setCountdown(data.countdown);
    };

    const onRevealEnd = () => {
      setCountdown(0);
      router.push(`/debate/${code}`);
    };

    socket.on("reveal:timer", onRevealTimer);
    socket.on("reveal:end", onRevealEnd);

    // Initial sync if refreshing mid-reveal
    socket.on("game:reconnected", (data: { gameState: any }) => {
      if (data.gameState?.status === "debate") {
        router.push(`/debate/${code}`);
      }
    });

    return () => {
      socket.off("reveal:timer", onRevealTimer);
      socket.off("reveal:end", onRevealEnd);
      socket.off("game:reconnected");
    };
  }, [code, router]);

  useEffect(() => {
    if (countdown === 0) {
      router.push(`/debate/${code}`);
    }
  }, [countdown, code, router]);

  return (
    <div className="min-h-screen bg-[#6149D2] bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px] flex flex-col items-center p-8 overflow-y-auto font-sans">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-7xl flex justify-between items-center mb-6"
      >
        <div className="bg-[#FFEB3B] px-6 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000]">
          <h1 className="font-['Titan_One'] text-3xl text-black">
            ROOM CODE: {code.toUpperCase()}
          </h1>
        </div>
        <div className="bg-white px-6 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000]">
          <h2 className="font-['Titan_One'] text-2xl text-red-600">
            DEBATE STARTS IN: {countdown}s
          </h2>
        </div>
      </motion.div>

      <motion.h2
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-6xl text-white font-['Titan_One'] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] mb-6"
      >
        THE CANDIDATES
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-10"
      >
        {revealPlayers
          .filter((player) => player.candidate !== null)
          .map((player) => {
          const { slot } = player;
          const candidate = player.candidate as CandidateProfile;
          const isYou = mySlot !== null && slot === mySlot;
          const badgeLabel = mySlot === null ? `PLAYER ${slot}` : isYou ? "YOU" : "OPPONENT";
          const badgeClass = isYou
            ? "bg-[#3B9E3A] text-white"
            : "bg-[#FFEB3B] text-black";
          const portraitLean = slot === 1 ? "CONSERVATIVE" : "PROGRESSIVE";
          const portraitStyle = slot === 1 ? "RATIONAL" : "EMOTIONAL";

          return (
            <div
              key={`${candidate.fullName}-${slot}`}
              className="bg-white rounded-xl border-4 border-black p-5 shadow-[4px_4px_0_0_#000]"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <p className="font-['Titan_One'] text-2xl text-black leading-tight">
                    {candidate.fullName}
                  </p>
                  <p className="font-['Nunito'] text-sm font-bold text-gray-600">
                    {candidate.age} • {candidate.electorate}
                  </p>
                </div>

                <div className="w-[60px] h-[60px] bg-gray-200 border-2 border-black rounded shrink-0 relative overflow-hidden">
                  <PixelPortrait
                    lean={portraitLean}
                    style={portraitStyle}
                    age={candidate.age.toString()}
                    variant={slot + 100}
                  />
                </div>

                <div
                  className={`${badgeClass} border-2 border-black rounded px-2 py-1 text-xs font-['Nunito'] font-black shrink-0`}
                >
                  {badgeLabel}
                </div>
              </div>

              <div className="bg-[#1C1C1C] text-white px-3 py-2 rounded mb-3 border-2 border-black">
                <p className="font-['Nunito'] text-sm font-black uppercase">
                  {candidate.partyName}
                </p>
                <p className="font-['Nunito'] text-xs font-bold opacity-90">
                  {candidate.profession}
                </p>
              </div>

              <p className="font-['Georgia'] italic text-sm text-gray-700 leading-snug mb-4">
                &quot;{candidate.background}&quot;
              </p>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-['Nunito'] font-black text-gray-500 mb-1">KEY ACTIONS</p>
                  <ul className="list-disc pl-5 font-['Nunito'] font-bold text-gray-800">
                    <li>{candidate.keyActions.positive[0]}</li>
                    <li>{candidate.keyActions.positive[1]}</li>
                    <li className="text-[#B00020]">{candidate.keyActions.controversial}</li>
                  </ul>
                </div>

                <div>
                  <p className="font-['Nunito'] font-black text-gray-500 mb-1">POLICY POSITIONS</p>
                  <ul className="list-disc pl-5 font-['Nunito'] font-bold text-gray-800">
                    {candidate.policyPositions.map((position, positionIdx) => (
                      <li key={positionIdx}>{position}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  {candidate.personalValues.map((value, valueIdx) => (
                    <span
                      key={valueIdx}
                      className="bg-[#e8f4ff] text-[#005696] px-2 py-1 rounded-full text-xs font-['Nunito'] font-black"
                    >
                      {value}
                    </span>
                  ))}
                  {candidate.flaws.map((flaw, flawIdx) => (
                    <span
                      key={flawIdx}
                      className="bg-[#ffe8e8] text-[#B00020] px-2 py-1 rounded-full text-xs font-['Nunito'] font-black"
                    >
                      {flaw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <motion.h2
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-6xl text-white font-['Titan_One'] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] mb-8"
      >
        THE JURY (5 VOTERS)
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-6 w-full max-w-5xl"
      >
        {selectedVoters.map((voter) => (
          <div
            key={voter.id}
            className="bg-white rounded-xl border-4 border-black p-4 flex flex-col relative shadow-[4px_4px_0_0_#000] overflow-hidden mt-4"
          >
            <div
              className="absolute top-0 left-0 right-0 h-10 border-b-4 border-black flex items-center px-4"
              style={{
                backgroundColor:
                  voter.lean === "CONSERVATIVE"
                    ? "#005696"
                    : voter.lean === "PROGRESSIVE"
                      ? "#3B9E3A"
                      : voter.lean === "CENTRE"
                        ? "#808080"
                        : "#E06B26",
              }}
            >
              <span className="font-['Titan_One'] text-white text-lg drop-shadow-[2px_2px_0_#000]">
                {voter.name.toUpperCase()}
              </span>
            </div>

            <div className="mt-8 flex justify-between items-start gap-4 mb-3">
              <div className="flex-1 pt-2">
                <p className="font-['Nunito'] text-sm font-bold text-gray-500 mb-1">
                  {voter.age} • {voter.location}
                </p>
                <div className="bg-[#008080] inline-block px-2 py-1 rounded text-xs font-['Nunito'] font-black text-white shrink-0 mb-2">
                  {voter.occupation.toUpperCase()}
                </div>
              </div>

              <div className="w-[60px] h-[60px] bg-gray-200 border-2 border-black rounded shrink-0 relative overflow-hidden">
                <PixelPortrait
                  lean={voter.lean}
                  style={voter.reasoningStyle}
                  age={voter.age.toString()}
                  variant={voter.id}
                />
              </div>
            </div>

            <p className="font-['Georgia'] italic text-sm text-gray-700 leading-tight mb-4 flex-1">
              &quot;{voter.background}&quot;
            </p>

            <div className="border-t-2 border-dashed border-gray-300 pt-3">
              <div className="flex flex-wrap gap-2 text-xs font-['Nunito'] font-black">
                <span className="text-gray-500">CARES ABOUT:</span>
                {voter.concerns.map((concern, idx) => (
                  <span
                    key={idx}
                    className="bg-red-100 text-[#E31B23] px-2 py-0.5 rounded-full"
                  >
                    {concern}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
