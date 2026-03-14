"use client";

import Confetti from "@/app/components/Confetti";
import HUD from "@/app/components/HUD";
import ScreenTopic from "@/app/components/ScreenTopic";
import ScreenDebate from "@/app/components/ScreenDebate";
import ScreenJudging from "@/app/components/ScreenJudging";
import { useGameState } from "@/app/hooks/useGameState";
import { TranscriptEntry } from "@/app/hooks/useDebate";
import { ScreenId } from "@/app/lib/gameConstants";

export default function DebatePage({ params }: { params: { code: string } }) {
  // [MOCK DATA] REMOVE LATER
  // const { ... } = useGameState();
  const mockData = {
    screen: "debate" as ScreenId, // 'lobby' | 'character' | 'topic' | 'debate' | 'judging' | 'reveal' | 'voter-grid' | 'winner'
    currentRound: 1,
    currentPlayer: 2 as const,
    p1RoundTimeRemaining: 45,
    p2RoundTimeRemaining: 60,
    currentSpeaker: 1 as const,
    currentTopic:
      "Should Australia increase spending on renewable energy infrastructure?",
    liveTranscript: [
      {
        speaker: 1,
        text: "Look, we absolutely need to invest in renewable energy. The costs of inaction far outweigh the investment we need to make today.",
        timestamp: 5,
      },
      {
        speaker: 1,
        text: "Our children are going to inherit a planet that's getting hotter every year. We need to act now.",
        timestamp: 15,
      },
    ] as TranscriptEntry[],
    judgingJoke: "Judges are tallying votes... 🤔",
    addTranscriptEntry: (speaker: 1 | 2, text: string) => {
      console.log(`[MOCK] ${speaker} said: ${text}`);
    },
    handleObjection: (player: 1 | 2) => {
      console.log("[MOCK] Objection!");
    },
    handleYield: () => {
      console.log("[MOCK] Yielding floor");
    },
    setIsRecording: (val: boolean) => {
      console.log("[MOCK] setIsRecording:", val);
    },
    setMediaStream: (stream: MediaStream | null) => {
      console.log("[MOCK] setMediaStream:", stream);
    },
  };

  const {
    screen,
    currentRound,
    currentPlayer,
    p1RoundTimeRemaining,
    p2RoundTimeRemaining,
    currentSpeaker,
    currentTopic,
    liveTranscript,
    judgingJoke,
    addTranscriptEntry,
    handleObjection,
    handleYield,
    setIsRecording,
    setMediaStream,
  } = mockData;
  // [MOCK DATA] REMOVE LATER

  // Determine which timer to show in HUD
  const activePlayerTime =
    currentSpeaker === 1 ? p1RoundTimeRemaining : p2RoundTimeRemaining;

  return (
    <>
      <HUD
        screen={screen}
        displayP1Votes={0}
        displayP2Votes={0}
        timeLeft={activePlayerTime}
      />

      {screen == "topic" && (
        <ScreenTopic
          screen={screen}
          currentRound={currentRound}
          currentTopic={currentTopic}
        />
      )}

      {screen == "debate" && (
        <ScreenDebate
          screen={screen}
          currentRound={currentRound}
          currentPlayer={currentPlayer}
          activePlayer={currentSpeaker}
          timeLeft={activePlayerTime}
          currentTopic={currentTopic}
          transcript={liveTranscript}
          onObjection={() => handleObjection(currentPlayer)}
          onYield={handleYield}
          onSubmitSpeech={(text) => addTranscriptEntry(currentPlayer, text)}
          setIsRecording={setIsRecording}
          setMediaStream={setMediaStream}
        />
      )}

      {screen == "judging" && (
        <ScreenJudging screen={screen} judgingJoke={judgingJoke} />
      )}
    </>
  );
}
