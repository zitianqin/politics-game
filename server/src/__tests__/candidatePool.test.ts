import { getRandomCandidates } from "../lib/candidatePool";

describe("Procedural Candidate Generation Engine", () => {
  test("should generate exactly 2 candidates by default", () => {
    const candidates = getRandomCandidates();
    expect(candidates.length).toBe(2);
  });

  test("should generate candidate profiles with all required PRD fields", () => {
    const [candidate] = getRandomCandidates(1);

    expect(candidate).toHaveProperty("fullName");
    expect(candidate).toHaveProperty("age");
    expect(candidate).toHaveProperty("partyName");
    expect(candidate).toHaveProperty("electorate");
    expect(candidate).toHaveProperty("background");
    expect(candidate).toHaveProperty("profession");
    expect(candidate).toHaveProperty("keyActions");
    expect(candidate).toHaveProperty("policyPositions");
    expect(candidate).toHaveProperty("personalValues");
    expect(candidate).toHaveProperty("flaws");
  });

  test("should enforce age range 35-70", () => {
    const candidates = getRandomCandidates(2);

    candidates.forEach((candidate) => {
      expect(candidate.age).toBeGreaterThanOrEqual(35);
      expect(candidate.age).toBeLessThanOrEqual(70);
    });
  });

  test("should provide 2 positive actions and 1 controversial action", () => {
    const candidates = getRandomCandidates(2);

    candidates.forEach((candidate) => {
      expect(candidate.keyActions.positive).toHaveLength(2);
      expect(typeof candidate.keyActions.controversial).toBe("string");
      expect(candidate.keyActions.controversial.length).toBeGreaterThan(0);
    });
  });

  test("should provide 3 distinct policy positions", () => {
    const candidates = getRandomCandidates(2);

    candidates.forEach((candidate) => {
      expect(candidate.policyPositions).toHaveLength(3);
      expect(new Set(candidate.policyPositions).size).toBe(3);
    });
  });

  test("should return balanced candidate pair using different archetypes", () => {
    const [a, b] = getRandomCandidates(2);

    expect(a.profession).not.toBe(b.profession);
    expect(a.personalValues.join("|")).not.toBe(b.personalValues.join("|"));
  });
});
