import { voterPool, VoterProfile } from '../data/voterData';

const VOTERS_PER_GAME = 21;

/**
 * Randomly draws 21 distinct voter profiles from the 67-profile pool.
 * Uses a Fisher-Yates partial shuffle so every draw is uniform.
 */
export function selectVoters(): VoterProfile[] {
  const indices = Array.from({ length: voterPool.length }, (_, i) => i);

  for (let i = 0; i < VOTERS_PER_GAME; i++) {
    const j = i + Math.floor(Math.random() * (indices.length - i));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices.slice(0, VOTERS_PER_GAME).map((i) => voterPool[i]);
}
