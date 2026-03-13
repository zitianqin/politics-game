import { useState, useEffect } from "react";
import { ScreenId } from "../lib/gameConstants";

export function useRevealAnimation(
  screen: ScreenId,
  p1Earned: number,
  p2Earned: number,
  p1TotalVotes: number,
  p2TotalVotes: number
) {
  const [revealBarsHeight, setRevealBarsHeight] = useState({ p1: 0, p2: 0 });
  const [showNextBtn, setShowNextBtn] = useState(false);

  const [animatingP1Votes, setAnimatingP1Votes] = useState(0);
  const [animatingP2Votes, setAnimatingP2Votes] = useState(0);

  useEffect(() => {
    if (screen === "reveal") {
      const startP1 = p1TotalVotes;
      const startP2 = p2TotalVotes;
      setAnimatingP1Votes(startP1);
      setAnimatingP2Votes(startP2);

      const timer1 = setTimeout(() => {
        const maxCurrent = Math.max(p1Earned, p2Earned, 500);
        setRevealBarsHeight({
          p1: (p1Earned / maxCurrent) * 300,
          p2: (p2Earned / maxCurrent) * 300,
        });

        let startTS: number | null = null;
        const duration = 1000;

        const step = (timestamp: number) => {
          if (!startTS) startTS = timestamp;
          const progress = Math.min((timestamp - startTS) / duration, 1);
          setAnimatingP1Votes(Math.floor(progress * p1Earned + startP1));
          setAnimatingP2Votes(Math.floor(progress * p2Earned + startP2));

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };
        requestAnimationFrame(step);
      }, 1000);

      const timer2 = setTimeout(() => {
        setShowNextBtn(true);
      }, 2500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        setRevealBarsHeight({ p1: 0, p2: 0 });
        setShowNextBtn(false);
      };
    }
  }, [screen, p1Earned, p2Earned, p1TotalVotes, p2TotalVotes]);

  const displayP1Votes = screen === "reveal" ? animatingP1Votes : p1TotalVotes;
  const displayP2Votes = screen === "reveal" ? animatingP2Votes : p2TotalVotes;
  const currentBarsHeight =
    screen === "reveal" ? revealBarsHeight : { p1: 0, p2: 0 };
  const isNextBtnVisible = screen === "reveal" ? showNextBtn : false;

  return {
    displayP1Votes,
    displayP2Votes,
    currentBarsHeight,
    isNextBtnVisible,
  };
}
