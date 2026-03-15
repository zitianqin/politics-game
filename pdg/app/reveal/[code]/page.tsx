"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { votersData } from "../../lib/voterData";
import PixelPortrait from "../../components/PixelPortrait";
import { getSocket } from "../../lib/socket";
import { apiUrl } from "../../lib/api";

interface CandidateProfile {
  fullName: string;
  age: number;
  partyName: string;
  electorate: string;
  background: string;
  profession: string;
}

interface GamePlayer {
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
  const [mounted, setMounted] = useState(false);
  const [selectedVoters, setSelectedVoters] = useState<typeof votersData>([]);
  const [myCandidate, setMyCandidate] = useState<CandidateProfile | null>(null);
  const [opponentCandidate, setOpponentCandidate] =
    useState<CandidateProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [otherReadyCount, setOtherReadyCount] = useState(0);

  const applyCandidatesFromPlayers = (players: GamePlayer[]) => {
    const playerId = sessionStorage.getItem("playerId");
    const meById = players.find((p) => p.id === playerId);
    const meBySlot = playerId
      ? undefined
      : players.find(
          (p) =>
            p.slot === (sessionStorage.getItem("isHost") === "true" ? 1 : 2)
        );
    const me = meById ?? meBySlot;

    const opponentById = playerId
      ? players.find((p) => p.id !== playerId)
      : undefined;
    const opponentBySlot = me?.slot
      ? players.find((p) => p.slot !== me.slot)
      : undefined;
    const opponent = opponentById ?? opponentBySlot;

    setMyCandidate(me?.candidate ?? null);
    setOpponentCandidate(opponent?.candidate ?? null);
  };

  useEffect(() => {
    setMounted(true);

    fetch(apiUrl(`/api/game/${code}`))
      .then((res) => res.json())
      .then((data) => {
        if (data.voters) {
          setSelectedVoters(data.voters.slice(0, 5));
        } else {
          setSelectedVoters(
            [...votersData].sort(() => Math.random() - 0.5).slice(0, 5)
          );
        }

        const playerId = sessionStorage.getItem("playerId");
        const players: GamePlayer[] = Array.isArray(data.players)
          ? (data.players as GamePlayer[])
          : [];
        if (playerId && players.length > 0) {
          applyCandidatesFromPlayers(players);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch voters", err);
        setSelectedVoters(
          [...votersData].sort(() => Math.random() - 0.5).slice(0, 5)
        );
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

    const onRevealReady = (data: { playerId: string; readyCount: number }) => {
      const myId = sessionStorage.getItem("playerId");
      if (data.playerId === myId) {
        setIsReady(true);
      }
      setOtherReadyCount(data.readyCount);
    };

    const onGameState = (data: { gameState: { players?: GamePlayer[] } }) => {
      const players = data.gameState?.players;
      if (Array.isArray(players) && players.length > 0) {
        applyCandidatesFromPlayers(players);
      }
    };

    socket.on("reveal:timer", onRevealTimer);
    socket.on("reveal:end", onRevealEnd);
    socket.on("reveal:ready", onRevealReady);
    socket.on("game:state", onGameState);

    // Initial sync if refreshing mid-reveal
    socket.on("game:reconnected", (data: { gameState: any }) => {
      if (data.gameState?.status === "debate") {
        router.push(`/debate/${code}`);
      }
      if (data.gameState?.revealReady) {
        setOtherReadyCount(data.gameState.revealReady.length);
        const myId = sessionStorage.getItem("playerId");
        if (data.gameState.revealReady.includes(myId)) {
          setIsReady(true);
        }
      }

      if (Array.isArray(data.gameState?.players)) {
        applyCandidatesFromPlayers(data.gameState.players as GamePlayer[]);
      }
    });

    socket.emit("game:getState", { code });

    return () => {
      socket.off("reveal:timer", onRevealTimer);
      socket.off("reveal:end", onRevealEnd);
      socket.off("reveal:ready", onRevealReady);
      socket.off("game:state", onGameState);
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
        className="w-full max-w-7xl flex justify-between items-stretch mb-12"
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center w-full h-full">
          <div className="bg-[#FFEB3B] px-4 sm:px-6 sm:py-4 rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000] flex items-center justify-center w-full sm:w-auto min-h-[90px] h-full">
            <h2 className="font-['Titan_One'] text-black break-words text-center">
              ROOM CODE: {code.toUpperCase()}
            </h2>
          </div>

          <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000] flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto min-h-[90px] h-full">
            <h2 className="font-['Titan_One'] text-black text-center sm:text-left whitespace-nowrap">
              ⏰ STARTS IN: {countdown}s
            </h2>

            <button
              onClick={() => {
                const playerId = sessionStorage.getItem("playerId");
                getSocket().emit("reveal:done", { code, playerId });
              }}
              disabled={isReady}
              className={`${
                isReady
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
              } 
              text-black font-['Titan_One'] px-6 rounded-lg border-3 border-black 
              shadow-[4px_4px_0_0_#000] transition-all text-base sm:text-lg
              flex items-center justify-center gap-2 whitespace-nowrap sm:h-full min-h-[50px]`}
            >
              {isReady ? `WAITING... (${otherReadyCount}/2)` : "READY!"}
            </button>
          </div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="text-white font-['Titan_One'] mb-6 [-webkit-text-stroke:1px_black]"
      >
        CANDIDATE BRIEFING
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-18 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
      >
        {[myCandidate, opponentCandidate].map((candidate, idx) => (
          <div
            key={idx}
            className="mt-4 bg-white rounded-xl border-4 border-black p-5 shadow-[4px_4px_0_0_#000]"
          >
            <div
              className={`-mx-5 -mt-5 mb-4 px-5 py-3 border-b-4 border-black ${
                idx === 0 ? "bg-[#0AA0FF]" : "bg-[#E31B23]"
              }`}
            >
              <h2 className="font-['Titan_One'] text-3xl text-white [-webkit-text-stroke:1px_black] ">
                {idx === 0 ? "YOUR CANDIDATE" : "OPPONENT CANDIDATE"}
              </h2>
            </div>

            {candidate ? (
              <div className="text-sm text-black font-['Nunito']">
                <div>
                  <p className="font-['Titan_One'] text-2xl leading-tight">
                    {candidate.fullName}
                  </p>
                  <p className="font-bold text-gray-700 text-xl">
                    {candidate.age} • {candidate.profession} •{" "}
                    {candidate.electorate}
                  </p>
                  <div className="inline-block bg-black text-white px-2 py-1 rounded text-lg font-black uppercase">
                    {candidate.partyName}
                  </div>
                </div>
                <p className="text-gray-800 text-lg">{candidate.background}</p>
                {/* 
                <div>
                  <p className="font-black text-gray-600 text-lg mb-1">
                    POLICY POSITIONS
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-lg">
                    {candidate.policyPositions.map((policy, policyIdx) => (
                      <li key={policyIdx}>{policy}</li>
                    ))}
                  </ul>
                </div> */}

                {/* <div className="flex flex-wrap gap-2 pt-1">
                  {candidate.personalValues.map((value, valueIdx) => (
                    <span
                      key={valueIdx}
                      className="bg-[#FFEB3B] border-2 border-black px-2 py-0.5 rounded-full text-lg font-black uppercase"
                    >
                      {value}
                    </span>
                  ))}
                  <span className="bg-[#FFE0E0] border-2 border-black px-2 py-0.5 rounded-full text-lg font-black uppercase text-[#B00020]">
                    {candidate.flaws[0]}
                  </span>
                </div> */}
              </div>
            ) : (
              <p className="font-['Nunito'] text-gray-600">
                Candidate profile unavailable.
              </p>
            )}
          </div>
        ))}
      </motion.div>

      <motion.h1
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-white font-['Titan_One'] mb-6 [-webkit-text-stroke:1px_black]"
      >
        THE JURY (5 VOTERS)
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-6 w-full max-w-5xl"
      >
        {selectedVoters.map((voter) => (
          <div
            key={voter.id}
            className="mt-4 bg-white rounded-xl border-4 border-black p-5 shadow-[4px_4px_0_0_#000]"
          >
            <div
              className="-mx-5 -mt-5 px-5 py-3 border-b-4 border-black"
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
              <h2 className="font-['Titan_One'] text-3xl text-white [-webkit-text-stroke:1px_black] ">
                {voter.lean}
              </h2>
            </div>

            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="flex-1">
                <p className="font-['Titan_One'] text-2xl leading-tight">
                  {voter.name}
                </p>
                <p className="font-['Nunito'] text-xl font-bold text-gray-500 mb-1">
                  {voter.age} • {voter.location}
                </p>
                <div className="bg-[#008080] inline-block px-2 py-1 rounded text-lg font-['Nunito'] font-black text-white shrink-0 mb-2">
                  {voter.occupation.toUpperCase()}
                </div>
              </div>

              <div className="mt-6 w-[60px] h-[60px] bg-gray-200 border-2 border-black rounded shrink-0 relative overflow-hidden">
                <PixelPortrait
                  lean={voter.lean}
                  style={voter.reasoningStyle}
                  age={voter.age.toString()}
                  variant={voter.id}
                />
              </div>
            </div>

            <p className="font-['Georgia'] italic text-lg text-gray-700 leading-tight mb-4 flex-1">
              &quot;{voter.background}&quot;
            </p>

            <div className="border-t-2 border-dashed border-gray-300 pt-3">
              <div className="flex flex-wrap gap-3 text-lg font-['Nunito'] font-black items-center">
                <span className="text-gray-500">CARES ABOUT:</span>
                {voter.concerns.map((concern, idx) => (
                  <span
                    key={idx}
                    className="bg-red-100 border-2 border-black text-[#E31B23] px-2 py-0.5 rounded-full"
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
